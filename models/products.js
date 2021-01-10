const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: [true, 'please add a title'],
        unique: true,
        trim: true,
        maxlength: [50, 'title cannot be more than 50 characters'],
      },
      price:{
          type:Number,
          required: [true, 'please add a price'],
         },
       quantity:{
          type:Number,
          required: [true, 'please add a quantity'],
         },
      description: {
        type: String,
        maxlength: [500, 'description cannot be more than 500 characters'],
      },
      image: {
        type: String,
        default: 'no-image.jpg',
      },
      barcode: {
        type:String,
        unique: true,
        required: [true, 'please attach a barcode'],
     },
     user:{
       type: mongoose.Schema.ObjectId,
       ref: 'User',
       required: true,},
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );

  ProductSchema.methods.buyProduct = function (quantity) {
    console.log(this.quantity)
    this.quantity = this.quantity - quantity;
    console.log(this.quantity)
  }
  
  // ProductSchema.virtual('sold',{
  //   ref:'Sales',
  //   localField:'_id',
  //   foreign:''
  // })


  module.exports = mongoose.model('Product', ProductSchema);