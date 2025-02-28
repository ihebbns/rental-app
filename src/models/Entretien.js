const mongoose = require('mongoose');

const entretienSchema = new mongoose.Schema({
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },

  // Maintenance tracking with last recorded mileage
  vidange: {
    intervalKm: { type: Number, required: true }, 
    lastMaintenanceKm: { type: Number, default: 0 }, // ✅ Allow updates
  },
  bougie: {
    intervalKm: { type: Number, required: true },
    lastMaintenanceKm: { type: Number, default: 0 },
  },
  filtreHuile: {
    intervalKm: { type: Number, required: true },
    lastMaintenanceKm: { type: Number, default: 0 },
  },
  filtreAir: {
    intervalKm: { type: Number, required: true },
    lastMaintenanceKm: { type: Number, default: 0 },
  },

  autreEntretien: { type: String, default: "" }, 

 // Date-based maintenance
visiteTechnique: {
  date: { type: Date, required: true }, 
  next: { type: Date, required: true }, 
  intervale: { type: String, enum: ['6mois', '1an'], required: true } // ✅ New Field
},

assurance: {
  date: { type: Date, required: true }, 
  next: { type: Date, required: true }, 
  intervale: { type: String, enum: ['6mois', '1an'], required: true } // ✅ New Field
},


  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Entretien || mongoose.model('Entretien', entretienSchema);
