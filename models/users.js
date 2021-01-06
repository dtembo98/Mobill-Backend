const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please add a name'],
  },
  phone: {
    type: String,
    required: [true, 'please add a phone number'],
    unique: true,
    
  },
  password: {
    type: String,
    required: [true, 'please add a password'],
    minlength: 6,
    select: false,
    default: true,
  },
  resetPasswordToken: String,
  resetpasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//Encrypt password
UserSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log(this.password)
});

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id,name:this.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// match user entered passord to hashed paswword in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model('User', UserSchema);
