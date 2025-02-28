const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  mileage: { type: Number, required: true },
  status: { type: String, default: 'Available' }, 
  isAvailable: { type: Boolean, default: true }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Car || mongoose.model('Car', carSchema);
