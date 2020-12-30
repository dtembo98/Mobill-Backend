const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
const Product = require('../models/products')

exports.getProducts = asyncHandler(async (req,res,next) =>
{
    const products =await Product.find()
    res.status(200).json({success:true,data:products})
})

exports.addProduct = asyncHandler(async (req,res,next) =>
{
    const products =await Product.create(req.body)
    res.status(200).json({sucess:true,data:products})
})