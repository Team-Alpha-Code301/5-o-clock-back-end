const mongoose = require('mongoose');
const { Schema } = mongoose;

const DrinkSchema = new Schema({
  ingredient:{type:String, require:true}
});

module.exports = mongoose.model('User',DrinkSchema);
