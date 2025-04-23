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

// Middleware to ensure time is included in rentalStartDate and rentalEndDate
contractSchema.pre("save", function (next) {
  if (this.rentalStartDate && !(this.rentalStartDate instanceof Date)) {
    this.rentalStartDate = new Date(this.rentalStartDate);
  }
  if (this.rentalEndDate && !(this.rentalEndDate instanceof Date)) {
    this.rentalEndDate = new Date(this.rentalEndDate);
  }
  next();
});

// Middleware to ensure archived contracts remain archived
contractSchema.pre("save", function (next) {
  if (this.status === "archived") {
    return next(); // Skip further status updates for archived contracts
  }

  const now = new Date();

  if (this.rentalEndDate < now && this.status === "active") {
    this.status = "pending_return";
  }

  next();
});

module.exports = mongoose.models.Contract || mongoose.model("Contract", contractSchema);
