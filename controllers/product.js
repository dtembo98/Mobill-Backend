const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
const Product = require('../models/products')

exports.getProducts = asyncHandler(async (req,res,next) =>
{
    const products =await Product.find()
    res.status(200).json({success:true,data:products})
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