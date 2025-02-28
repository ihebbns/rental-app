const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Photo || mongoose.model('Photo', photoSchema);
