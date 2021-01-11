const path = require('path')
const axios = require('axios')
const { v4 } = require('uuid');

const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
const {generatePayload} = require('../utils/helper')
const {endpoint_debit, endpoint_credit} = require('../config/config')


const Product = require('../models/products')
const Sales = require('../models/sales');
const { find } = require('../models/products');

//fetch all products from db
exports.getProducts = asyncHandler(async (req,res,next) =>
{
    const products =await Product.find({user:req.user.id})
    res.status(200).json({success:true,data:products})
})
exports.getSales = asyncHandler(async (req,res,next) =>
{
    const sales =await Sales.find({user:req.user.id})
    res.status(200).json({success:true,data:sales})
})

//fetch sales data from db 
exports.getSold = asyncHandler(async (req,res,next) =>
{
  let query
  let queryStr = JSON.stringify(req.query)
  
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match =>`$${match}`)
  query = await Sales.find({user:req.user.id}).distinct('product',{status:'processed'})
  
  const sales = await Product.find({_id:{$in:query}})

  // const sales =await query
  res.status(200).json({success:true,data:sales})
})

// fetch single product
exports.getProduct = asyncHandler(async (req,res,next) =>
{   
    const product =await Product.findOne({_id:req.params.id,user:req.user.id})
    const sold = await Sales.countDocuments({product:req.params.id,user:req.user.id,status:'processed'})
    const totalAmountSold = sold * product.price

    if (!product) {
        return next(
          new ErrorResponse(
            `No product found with the id of ${req.params.id}`
          ),
          404
        );
      }
      const productDetails = 
      {
         product,
        totalAmountSold,
        sold
      }
    res.status(200).json({success:true,data:productDetails})
})
exports.getProductByCode = asyncHandler(async (req,res,next) =>
{
    req.params.user = req.user.id
    const product =await Product.findOne(req.params)

    if (!product) {
        return next(
          new ErrorResponse(
            `No product found with the barcode of ${req.params.barcode}`
          ),
          404
        );
      }
    res.status(200).json({success:true,data:product})
})
//add product to db
exports.addProduct = asyncHandler(async (req,res,next) =>
{   
    
  if(!req.files)
  {
    return next(
      new ErrorResponse("Please upload a product image",400)
      )
  }

  const file = req.files.file
  // make sure the image is a photo

  if(!file.mimetype.startsWith('image'))
  {
    return next(
      new ErrorResponse("Please upload an image",400)
      )
  }

  //check file size

  if(file.size > process.env.MAX_FILE_UPLOAD)
  {
    return next(
      new ErrorResponse("Please upload an image less than 2mbs",400)
      )
  } 

   //upload form fields to db
    req.body.user = req.user.id
    const product =await Product.create(req.body)
    if(!product)
    {
      return next(
        new ErrorResponse("Error creating product",500)
        )
    }
   
     //create custom file name
     file.name = `product_${product.id}${path.parse(file.name).ext}`
     
     file.mv(`${process.env.PRODUCT_FILE_UPLOAD_PATH}/${file.name}`,async err =>
     {
       if(err)
       {
         console.log(err)
         product.delete()
         product.save()
         return next(
          new ErrorResponse("problem with file upload",500)
          )
       }
       product.image = file.name
       product.save()
       res.status(200).json({message:"success",data:product})
  
     })
})


/// purchase product
exports.buyProduct = asyncHandler(async (req,res,next) =>
{

    const { mobile_wallet,quantity} = req.body
 
    const product = await Product.findOne(req.params)

 
    if(!product) {
      return next(
        new ErrorResponse(
          `No product found with the barcode of ${req.params.barcode}`)
        )
    }

     const totalAmount = quantity * product.price 
     const reference = v4()  
 
    const encoded_payload = generatePayload(totalAmount,mobile_wallet,reference);
    //send payload
  
		const results = await axios.post(endpoint_debit, {
			payload: encoded_payload,
    });
   
		if (results.data.isError) {
     
			return next(new ErrorResponse(`${results.data.message}`, 500));
    }
   
    
    const saleEntry = {
      amount:totalAmount,
      buyer:mobile_wallet,
      status:'pending',
      reference:reference,
       product:product.id,
      user:req.user.id
    }
    const sales = await Sales.create(saleEntry)
    if(!sales)
    {
      return next(new ErrorResponse(`Error trying to create a sale entry`, 500));
    }
    res.status(200).json({sucess:true,data:sales})
})

exports.productImageUpload = asyncHandler(async(req,res,next) =>
{
  
    
  
})



//check sale status
exports.salesStatus = asyncHandler(async(req,res,next) =>
{ 
  
  
  const sale = await Sales.findOne({_id:req.params.saleId,user:req.user.id})

  if(!sale)
  {
    return next(
      new ErrorResponse(
        `No  Sale entry found with the id of ${req.params.saleId}`)
      )
  }
  if(sale.status === "processed")
  {
    res.status(200).json({sucess:true,status:"processed"})
  } 
  else if(sale.status ==="failed") {
    res.status(200).json({sucess:true,status:"failed"})
  }
  else {
    res.status(200).json({sucess:true,status:"pending"})
  }

  
})

  /// web hook
exports.productHook = asyncHandler(async(req,res,next) =>
{
  console.log("here")
 

  if(req.body.status === 'TXN_AUTH_UNSUCCESSFUL')
  {
      const salesUpdate = await Sales.updateOne({reference:req.body.merchantReference},{status:'failed'})
      if(salesUpdate)
        { 
         
            console.log(`updated`.yellow.bold)
            console.log(salesUpdate)
        }
  }
  // if transaction is successful
  if(req.body.status ==='TXN_AUTH_SUCCESSFUL')
  {  

    const sales = await Sales.findOne({reference:req.body.merchantReference}).populate({path:'user',select:'phone'})
    if(sales)
    {
      const salesUpdate = await Sales.updateOne({reference:req.body.merchantReference,},{status:'processed'})

      if(salesUpdate)
        {
             // credit the shop owner  
       console.log(sales.user.phone)        
      const encoded_payload = generatePayload(sales.amount,sales.user.phone,v4());
      //send payload
    
      const results = await axios.post(endpoint_credit, {
        payload: encoded_payload,
      });
      if(results)
      {
        console.log(`money sent to shop owner ${sales.user.phone}`.green)
      }     
            console.log(`successful`.magenta)
            console.log(salesUpdate)
        }
    }
    }
   

})

