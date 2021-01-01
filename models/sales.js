const mongoose = require('mongoose');

const SalesSchema = new mongoose.Schema(
    {
      amount:{
          type:Number,
          required: [true, 'please add a price'],
         },
       buyer:{
          type:String,
         
         },
       status:{
            type:String,
           },
       order:{
            product:{type: mongoose.Schema.ObjectId,ref: 'Product',required: true,},
             quantity:{type:Number,required:true},},

       reference:String,    
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

  
  module.exports = mongoose.model('Sales', SalesSchema);