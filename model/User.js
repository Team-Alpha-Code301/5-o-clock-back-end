const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name:{type:String, require:true},
  email:{type:String, require:true},
  profileSrc:{type:String}
});

module.exports = mongoose.model('User',userSchema);
