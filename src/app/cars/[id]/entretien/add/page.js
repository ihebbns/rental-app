'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddEditMaintenancePage({ params }) {
  const { id: carId } = params;
  const [formData, setFormData] = useState({
    vidange: { interval: 0, lastMaintenanceKm: 0 },
    bougie: { interval: 0, lastMaintenanceKm: 0 },
    filtreHuile: { interval: 0, lastMaintenanceKm: 0 },
    filtreAir: { interval: 0, lastMaintenanceKm: 0 },
    autreEntretien: '',
    visiteTechnique: { date: '', intervale: '1an', next: '' },
assurance: { date: '', intervale: '1an', next: '' },

  });

  const [error, setError] = useState('');
  const router = useRouter();
  const [carMileage, setCarMileage] = useState(0);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const response = await fetch(`/api/entretien?carId=${carId}`);
        if (response.ok) {
          const data = await response.json();
          setCarMileage(data.carMileage || 0);
          setFormData({
            vidange: { interval: data.vidange?.intervalKm ?? 0, lastMaintenanceKm: data.vidange?.lastMaintenanceKm ?? 0 },
            bougie: { interval: data.bougie?.intervalKm ?? 0, lastMaintenanceKm: data.bougie?.lastMaintenanceKm ?? 0 },
            filtreHuile: { interval: data.filtreHuile?.intervalKm ?? 0, lastMaintenanceKm: data.filtreHuile?.lastMaintenanceKm ?? 0 },
            filtreAir: { interval: data.filtreAir?.intervalKm ?? 0, lastMaintenanceKm: data.filtreAir?.lastMaintenanceKm ?? 0 },
            autreEntretien: data.autreEntretien || '',
            visiteTechnique: {
              date: data.visiteTechnique?.date ? new Date(data.visiteTechnique.date).toISOString().split('T')[0] : '',
              intervale: data.visiteTechnique?.intervale || '1an', // ✅ Load intervale
              next: data.visiteTechnique?.next ? new Date(data.visiteTechnique.next).toISOString().split('T')[0] : '',
            },
            assurance: {
              date: data.assurance?.date ? new Date(data.assurance.date).toISOString().split('T')[0] : '',
              intervale: data.assurance?.intervale || '1an', // ✅ Load intervale
              next: data.assurance?.next ? new Date(data.assurance.next).toISOString().split('T')[0] : '',
            },
          });
        } else {
          throw new Error('Failed to fetch maintenance record');
        }
      } catch (err) {
        console.error("❌ Fetch Error:", err.message);
      }
    };

    fetchMaintenance();
  }, [carId]);

  const handleUpdateLastMaintenance = async (task) => {
    try {
      const response = await fetch(`/api/cars/${carId}`);
      if (response.ok) {
        const data = await response.json();
        const latestMileage = data.mileage || 0;
  
        // Debug: Log the task and latestMileage
        console.log(`Updating ${task} with latest mileage: ${latestMileage}`);
  
        setFormData((prevFormData) => ({
          ...prevFormData,
          [task]: { ...prevFormData[task], lastMaintenanceKm: latestMileage },
        }));
      } else {
        throw new Error("Failed to fetch latest mileage");
      }
    } catch (error) {
      console.error("❌ Error fetching latest mileage:", error.message);
    }
  };



  const handleDateChange = (e, field) => {
    const newDate = e.target.value;
    let nextDate = new Date(newDate);
  
    if (formData[field].intervale === "6mois") {
      nextDate.setMonth(nextDate.getMonth() + 6);
    } else {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
  
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: {
        ...prevFormData[field],
        date: newDate,
        next: nextDate.toISOString().split("T")[0], // ✅ Update next date
      },
    }));
  };
   


const handleChange = (field, value) => {
  // Ensure numeric fields are valid (prevent empty input, negative, and zero values)
  if (typeof value === "number" && (isNaN(value) || value <= 0)) {
    alert("Veuillez entrer une valeur valide (supérieure à 0) !");
    return;
  }

  setFormData((prevFormData) => ({
    ...prevFormData,
    [field]: value,
  }));
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/entretien', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, carId }),
    });

    if (response.ok) {
      router.push(`/cars/${carId}/entretien`);
    } else {
      const data = await response.json();
      setError(data.error || "Failed to save maintenance record");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-700 mb-6 text-center">🛠  Maintenance </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
      {['vidange', 'bougie', 'filtreHuile', 'filtreAir'].map((task) => (
  <div className="mb-4" key={task}>
    <label className="block text-gray-700 mb-2 capitalize">⚙️ Interval de {task}</label>
    <div className="grid grid-cols-2 gap-4">
      {/* Interval Input */}
      <input
  type="number"
  value={formData[task].interval}
  onChange={(e) => {
    const value = Number(e.target.value);
    if (value <= 0) return alert("L'intervalle doit être supérieur à 0 !");
    setFormData((prevFormData) => ({
      ...prevFormData,
      [task]: { ...prevFormData[task], interval: value },
    }));
  }}
  placeholder="Interval (KM)"
  required
  className="w-full px-4 py-2 border rounded-md"
/>

      {/* Last Maintenance KM Input with "Now" Button */}
      <div className="relative flex items-center">
      <input
  type="number"
  value={formData[task].lastMaintenanceKm}
  onChange={(e) => {
    const value = Number(e.target.value);
    if (value < 0) return alert("Le kilométrage ne peut pas être négatif !");
    setFormData((prevFormData) => ({
      ...prevFormData,
      [task]: { ...prevFormData[task], lastMaintenanceKm: value },
    }));
  }}
  placeholder="Last Maintenance KM"
  required
  className="w-full px-4 py-2 border rounded-md"
/>
        <button
          type="button"
          onClick={() => handleUpdateLastMaintenance(task)}
          className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold py-1 px-3 rounded"
        >
          🔄
        </button>
      </div>
    </div>
  </div>
))}

       {/* Section Visite Technique */}
<div className="mb-6">
  <label className="block text-gray-700 font-bold mb-4">📅 Visite Technique</label>
  <input 
    type="date" 
    value={formData.visiteTechnique.next} 
    onChange={(e) => handleDateChange(e, "visiteTechnique")} 
    className="w-full px-4 py-2 border rounded-md" 
  />
 </div>

{/* Section Assurance */}
<div className="mb-6">
  <label className="block text-gray-700 font-bold mb-4">🛡 Assurance</label>
  <input 
    type="date" 
    value={formData.assurance.next} 
    onChange={(e) => handleDateChange(e, "assurance")} 
    className="w-full px-4 py-2 border rounded-md" 
  />


</div>

 {/* 🔹 Section for Other Maintenance Notes */}
 <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-4">📝 Autres Entretiens</label>
          <textarea
            value={formData.autreEntretien}
            onChange={(e) => handleChange("autreEntretien", e.target.value)}
            placeholder="Ajoutez des notes sur d'autres entretiens..."
            className="w-full px-4 py-2 border rounded-md"
            rows="3"
          />
        </div>

        <button type="submit" className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
          ✅ Enregistré les paramètres
        </button>
      </form>
    </div>
  );
}
