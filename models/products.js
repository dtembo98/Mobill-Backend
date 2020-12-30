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
      barcode: {
         type:String,
         unique: true,
         required: [true, 'please attach a barcode'],
      },
      description: {
        type: String,
        maxlength: [500, 'description cannot be more than 500 characters'],
      },
      image: {
        type: String,
        default: 'no-image.jpg',
      },
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

  module.exports = mongoose.model('Product', ProductSchema);