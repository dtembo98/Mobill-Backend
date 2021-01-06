const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/users')
const asyncHandler = require('../middlewares/async')
const { findById } = require('../models/users')


//register user
exports.register = asyncHandler(async (req,res,next) =>
{
    const {name,phone,password} = req.body
    
    const user = await User.create({
        name,
        phone,
        password
    })
    const token = user.getSignedJwtToken();
   res.status(201).json({success:true,message:"user created",token})


})


//login user
exports.login = asyncHandler(async (req,res,next) =>
{
    const {phone,password} = req.body
    
    //validate email and password

  if (!phone && !password) {
    return next(new ErrorResponse('please provide an email and password',400));
  }
  //check for user

  const user = await User.findOne({ phone }).select('+password');

  if (!user) {
    return next(new ErrorResponse('invalid credetials',400));
  }
  // check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('invalid credetials',400));
  }
  const token = user.getSignedJwtToken();
  res.status(200).json({ success: true, token });


})


//get current looged in user 

exports.getMe = asyncHandler(async (req,res,next) =>
{
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success:true,
        data:user
    })

})