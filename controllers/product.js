const axios = require('axios')
const { v4 } = require('uuid');

const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
const {generatePayload} = require('../utils/helper')
const {endpoint_debit, endpoint_credit} = require('../config/config')

const Product = require('../models/products')
const Sales = require('../models/sales');
const { findOne } = require('../models/products');

exports.getProducts = asyncHandler(async (req,res,next) =>
{
    const products =await Product.find()
    res.status(200).json({success:true,data:products})
})
exports.getSales = asyncHandler(async (req,res,next) =>
{
    const sales =await Sales.find()
    res.status(200).json({success:true,data:sales})
})

exports.getProduct = asyncHandler(async (req,res,next) =>
{
    const product =await Product.findById(req.params.id)

    if (!product) {
        return next(
          new ErrorResponse(
            `No product found with the id of ${req.params.bootcampId}`
          ),
          404
        );
      }
    res.status(200).json({success:true,data:product})
})
exports.addProduct = asyncHandler(async (req,res,next) =>
{   
    
    const products =await Product.create(req.body)
    res.status(200).json({sucess:true,data:products})
})


/// purchase product
exports.buyProduct = asyncHandler(async (req,res,next) =>
{

    const { mobile_wallet,quantity} = req.body
 console.log(mobile_wallet)
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
      order:{
        product:product.id,
        quantity}
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
  
  
  const sale = await Sales.findOne(req.params)

  if(!sale)
  {
    return next(
      new ErrorResponse(
        `No  Sale entry found with the id of ${req.body.saleId}`)
      )
  }
  if(sale.status === "processed")
  {
    res.status(200).json({sucess:true,status:"proccesed"})
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
    const salesUpdate = await Sales.updateOne({reference:req.body.merchantReference},{status:'processed'})
    const sales = await Sales.findOne({reference:req.body.merchantReference})
    if(salesUpdate)
      {
           // credit the shop owner    
    const encoded_payload = generatePayload(sales.amount,'0963912233',v4());
    //send payload
  
		const results = await axios.post(endpoint_credit, {
			payload: encoded_payload,
    });
    if(results)
    {
      console.log(`money sent to shop owner`.green)
    }     
          console.log(`successful`.magenta)
          console.log(salesUpdate)
      }
  }

})

