const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema({
  carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
  customerName: { type: String, required: true },
  rentalStartDate: { type: Date, required: true },
  rentalEndDate: { type: Date, required: true },
  photos: [{ type: String }], // All photos including contract image
  contractImageIndex: { type: Number, default: 0 }, // Index of contract photo in photos[]
  returnMileage: { type: Number, default: null },
  status: {
    type: String,
    enum: ["active", "pending_return", "archived"],
    default: "active",
  },
  createdAt: { type: Date, default: Date.now },
});

// Middleware to delete only rental photos, keeping the contract image
contractSchema.pre("save", function (next) {
  if (this.status === "archived" && this.photos.length > 0) {
    this.photos = this.photos.filter((_, index) => index === this.contractImageIndex);
  }
  next();
});

module.exports = mongoose.models.Contract || mongoose.model("Contract", contractSchema);
