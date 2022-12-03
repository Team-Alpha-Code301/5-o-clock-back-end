const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, require: true },
  barCartItems: { type: Array, require: true }
});

module.exports = mongoose.model('User', userSchema);
