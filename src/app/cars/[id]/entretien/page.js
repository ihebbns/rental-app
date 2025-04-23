'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MaintenancePage({ params }) {
  const { id: carId } = params;
  const [maintenance, setMaintenance] = useState(null);
  const [carMileage, setCarMileage] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [autreEntretien, setAutreEntretien] = useState('');
  const [carName, setCarName] = useState(''); // ✅ Store car name

  const router = useRouter();

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const response = await fetch(`/api/entretien?carId=${carId}`);
        if (response.ok) {
          const data = await response.json();
          setMaintenance(data);
          setAutreEntretien(data.autreEntretien || '');
        } else if (response.status === 404) {
          setMaintenance(null);
        } else {
          throw new Error("Échec du chargement de l&apos;entretien");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchCarMileage = async () => {
      try {
        const response = await fetch(`/api/cars/${carId}`);
        if (response.ok) {
          const carData = await response.json();
          setCarMileage(carData.mileage || 0);
          setCarName(carData.name || "");
        } else {
          throw new Error('Échec du chargement du kilométrage');
        }
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchMaintenance();
    fetchCarMileage();
    setLoading(false);
  }, [carId]);

  const handleUpdateMaintenance = async (task) => {
    try {
      const response = await fetch(`/api/cars/${carId}`);
      if (response.ok) {
        const carData = await response.json();
        const latestMileage = carData.mileage || 0;

        const updateResponse = await fetch(`/api/entretien/${carId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: task, lastMileage: latestMileage }),
        });

        if (updateResponse.ok) {
          setMaintenance((prev) => ({
            ...prev,
            [task]: {
              ...prev[task],
              lastMaintenanceKm: latestMileage,
            },
          }));
          alert(`✅ ${task.toUpperCase()} mis à jour avec succès !`);
        } else {
          throw new Error("Échec de la mise à jour du kilométrage");
        }
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour:", error.message);
    }
  };

  const handleUpdateAutreEntretien = async () => {
    try {
      if (!carId) {
        console.error("❌ carId is undefined!");
        return;
      }
  
      const response = await fetch(`/api/entretien?id=${carId}`, { // ✅ Send ID in query params
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'autreEntretien', value: autreEntretien }) // ✅ Send correct type & value
      });
  
      if (response.ok) {
        const updatedMaintenance = await response.json(); // ✅ Get updated data from backend
        setMaintenance(updatedMaintenance);
        alert("✅ Autre Entretien mis à jour !");
      } else {
        throw new Error("Échec de la mise à jour");
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour:", error.message);
    }
  };
  

  
  const handleAddOrUpdate1 = () => {
    router.push(`/cars/${carId}/entretien/add`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 border-solid"></div>
          <p className="text-gray-600 text-lg mt-3 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  const handleAdd6Months = async (field) => {
    try {
      const currentDate = new Date(maintenance[field]?.next || new Date());
      currentDate.setMonth(currentDate.getMonth() + 6); // Add 6 months
  
      const formattedDate = currentDate.toISOString();
  
      const updateResponse = await fetch(`/api/entretien?id=${carId}`, { // Use query param ?id=
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: field, next: formattedDate }), // Send formatted date
      });
  
      if (updateResponse.ok) {
        const updatedMaintenance = await updateResponse.json(); // Get updated data from backend
        setMaintenance(updatedMaintenance);
        alert(`✅ ${field === "assurance" ? "Assurance" : "Visite Technique"} mise à jour avec succès (+6 mois)`);
      } else {
        throw new Error("Échec de la mise à jour.");
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour:", error.message);
    }
  };
  
  const handleAdd1Year = async (field) => {
    try {
      const currentDate = new Date(maintenance[field]?.next || new Date());
      currentDate.setFullYear(currentDate.getFullYear() + 1); // Add 1 year
  
      const formattedDate = currentDate.toISOString();
  
      const updateResponse = await fetch(`/api/entretien?id=${carId}`, { // Use query param ?id=
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: field, next: formattedDate }), // Send formatted date
      });
  
      if (updateResponse.ok) {
        const updatedMaintenance = await updateResponse.json(); // Get updated data from backend
        setMaintenance(updatedMaintenance);
        alert(`✅ ${field === "assurance" ? "Assurance" : "Visite Technique"} mise à jour avec succès (+1 an)`);
      } else {
        throw new Error("Échec de la mise à jour.");
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour:", error.message);
    }
  };
  

  const handleUpdateDate = async (field, newDate) => {
    try {
      const formattedDate = new Date(newDate).toISOString(); // ✅ Ensure proper date format
  
      const updateResponse = await fetch(`/api/entretien?id=${carId}`, { // ✅ Use query param ?id=
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: field, next: formattedDate }), // ✅ Send formatted date
      });
  
      if (updateResponse.ok) {
        const updatedMaintenance = await updateResponse.json(); // ✅ Get updated data from backend
        setMaintenance(updatedMaintenance);
        alert(`✅ ${field === "assurance" ? "Assurance" : "Visite Technique"} mise à jour avec succès !`);
      } else {
        throw new Error("Échec de la mise à jour.");
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour:", error.message);
    }
  };



  const getDateClass = (date) => {
    if (!date) return "text-gray-500"; // No Date
    const today = new Date();
    const dueDate = new Date(date);
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  
    if (daysLeft < 0) return "text-red-600 font-bold border-red-500"; // 🚨 Expired
    if (daysLeft <= 10) return "text-yellow-600 font-semibold border-yellow-500"; // ⚠️ Near Due
    return "text-green-600 font-semibold border-green-500"; // ✅ Safe
  };
  
  
  
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 border-solid"></div>
          <p className="text-gray-600 text-lg mt-3 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
<h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
  <span className="flex items-center justify-center gap-2">
    <span className="text-blue-600">🔧</span> 
    Entretien de la Voiture
  </span>
  {carName && (
   <span className="block text-lg sm:text-xl font-semibold text-black-700 mt-1">
   🚗 {carName}
 </span>
 
  )}
</h1>


      

      {maintenance ? (
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">

          {/* 🚗 Kilométrage Actuel */}
          <div className="mb-6 text-center p-4 bg-blue-100 rounded-md">
            <h2 className="text-xl font-semibold text-gray-700">📍 Kilométrage Actuel</h2>
            <p className="text-2xl font-bold text-blue-700">{carMileage} km</p>
          </div>
          {/* 🔧 Maintenance Générale */}
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
            Maintenance Générale
          </h2>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {['vidange', 'bougie', 'filtreHuile', 'filtreAir'].map((task) => {
              const nextKm = maintenance[task].lastMaintenanceKm + maintenance[task].intervalKm;
              const remainingKm = nextKm - carMileage;
              const isOverdue = nextKm <= carMileage;

              return (
                <div key={task} className={`p-4 rounded-md shadow-sm ${isOverdue ? 'bg-red-100' : 'bg-gray-100'}`}>
                  <p className="text-lg font-semibold text-gray-700 capitalize">
                  🛠️ {task.replace(/([A-Z])/g, ' $1')}
                  </p>
                  <p className="text-gray-600">🔹 Dernier Entretien : {maintenance[task].lastMaintenanceKm} km</p>
                  <p className={remainingKm <= 0 ? "text-red-600 font-bold" :
              remainingKm <= 500 ? "text-yellow-600 font-semibold" :
              "text-green-600 font-semibold"}>
  ➡ Prochain Entretien : {nextKm} km ({remainingKm < 0 ? `🚨 ${Math.abs(remainingKm)} km en retard` :
                                          remainingKm <= 500 ? `⚠️ ${remainingKm} km restants` :
                                          `✅ ${remainingKm} km restants`})
</p>

                  <div className="flex justify-center items-center">
  <button
    onClick={() => handleUpdateMaintenance(task)}
    className="mt-2 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded shadow-sm transition-transform duration-150 active:scale-95"
  >
    🔄 Mettre à jour
  </button>
</div>

                </div>
              );
            })}
          </div>

{/* 📅 Visite Technique */}
<h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
  <span role="img" aria-label="calendar">📅</span> Visite Technique
</h2>
<div className="mb-4 bg-gray-100 p-4 rounded-lg shadow-sm">
  <p className="text-lg font-semibold text-gray-700">➡ Prochaine Visite :</p>
  <div className="flex items-center gap-2">
    <input 
      type="date" 
      value={maintenance.visiteTechnique?.next ? new Date(maintenance.visiteTechnique.next).toISOString().split('T')[0] : ''} 
      onChange={(e) => handleUpdateDate("visiteTechnique", e.target.value)} 
      className={`w-full p-2 border rounded-md text-gray-700 ${getDateClass(maintenance.visiteTechnique?.next)} focus:outline-none focus:ring-2 focus:ring-blue-400`}
    />
    <button 
      onClick={() => handleAdd6Months("visiteTechnique")} 
      className="mt-2 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded shadow-sm transition-transform duration-150 active:scale-95"
      >
      +6M
    </button>
    <button 
      onClick={() => handleAdd1Year("visiteTechnique")} 
      className="mt-2 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded shadow-sm transition-transform duration-150 active:scale-95"
      >
      +1Y
    </button>
  </div>
</div>

{/* 📜 Assurance */}
<h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
  <span role="img" aria-label="shield">🛡️</span> Assurance
</h2>
<div className="mb-4 bg-gray-100 p-4 rounded-lg shadow-sm">
  <p className="text-lg font-semibold text-gray-700">➡ Prochaine Assurance :</p>
  <div className="flex items-center gap-2">
    <input 
      type="date" 
      value={maintenance.assurance?.next ? new Date(maintenance.assurance.next).toISOString().split('T')[0] : ''} 
      onChange={(e) => handleUpdateDate("assurance", e.target.value)} 
      className={`w-full p-2 border rounded-md text-gray-700 ${getDateClass(maintenance.assurance?.next)} focus:outline-none focus:ring-2 focus:ring-blue-400`}
    />
    <button 
      onClick={() => handleAdd6Months("assurance")} 
      className="mt-2 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded shadow-sm transition-transform duration-150 active:scale-95"
  >
      +6M
    </button>
    <button 
      onClick={() => handleAdd1Year("assurance")} 
      className="mt-2 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded shadow-sm transition-transform duration-150 active:scale-95"
      >
      +1Y
    </button>
  </div>
</div>



<h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Autre Entretien</h2>
          <div className="mb-4 bg-gray-100 p-4 rounded-md shadow-sm">
            <textarea
              value={autreEntretien}
              onChange={(e) => setAutreEntretien(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Ajoutez des détails sur l'entretien..."
              rows="3"
            />
            <button
              onClick={handleUpdateAutreEntretien}
              className="mt-2 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded shadow-sm transition-transform duration-150 active:scale-95"
  >
              ✅ Mettre à Jour
            </button>
          </div>
  
          <div className="flex justify-center mt-6">
          <button
  onClick={handleAddOrUpdate1}
  className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 
             text-sm font-semibold transition duration-300 ease-in-out 
             shadow-sm hover:shadow-md transform hover:scale-105"
>
  🔧 Modifier les paramètres de l&apos;Entretien
</button>

</div>


        </div>
      ) : (
<div className="flex flex-col items-center">
    <p className="text-lg text-gray-600 mb-4 text-center">Aucun entretien enregistré.</p>
    <button
      onClick={() => router.push(`/cars/${carId}/entretien/add`)}
      className="mt-3 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
    >
      Ajouter un entretien
    </button>
  </div>
        
      )}
    </div>
  );
}
