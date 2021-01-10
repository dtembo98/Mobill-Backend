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
       product:{type: mongoose.Schema.ObjectId,ref: 'Product',required: true,},
      reference:String,  
       user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true}
        ,  
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