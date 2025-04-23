"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MaintenanceRemindersPage() {
  const [entretienList, setEntretienList] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [contractList, setContractList] = useState([]);
  const [view, setView] = useState("entretien"); // "entretien" or "contracts"
  const [searchQuery, setSearchQuery] = useState("");
const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);


  useEffect(() => {
    fetchAllMaintenance();
    fetchFutureContracts(); 

  }, []);

  const fetchFutureContracts = async () => {
    try {
      const response = await fetch("/api/contracts?future=true");
      if (!response.ok) throw new Error("Erreur lors du chargement des contrats");
  
      const data = await response.json();
  
      // Fetch car details for each contract
      const contractsWithCarDetails = await Promise.all(
        data.map(async (contract) => {
          try {
            const carResponse = await fetch(`/api/cars/${contract.carId}`);
            if (!carResponse.ok) throw new Error("Erreur lors du chargement de la voiture");
  
            const carData = await carResponse.json();
            return {
              ...contract,
              carName: carData.name || "Inconnue",
              carModel: carData.model || "N/A",
            };
          } catch (error) {
            console.error("Erreur lors du chargement des détails de la voiture:", error.message);
            return { ...contract, carName: "Inconnue", carModel: "N/A" };
          }
        })
      );
  
      setContractList(contractsWithCarDetails);
    } catch (error) {
      console.error("❌ Erreur:", error.message);
    }
  };

  const fetchAllMaintenance = async () => {
    try {
      const response = await fetch("/api/entretien");
      if (!response.ok) throw new Error("Erreur lors du chargement des entretiens");

      const data = await response.json();
      setEntretienList(data);
    } catch (error) {
      console.error("❌ Erreur:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Card Background Color Based on Most Urgent Issue
  // 🎨 Determine Card Background Color Based on All Fields
const getCardStyle = (car) => {
  let hasOverdue = false; // 🚨 Any overdue maintenance
  let hasDueSoon = false; // ⚠️ Any near-due maintenance
  let allSafe = true; // ✅ Assume everything is safe, unless found otherwise

  // Check Maintenance Tasks
  ["vidange", "bougie", "filtreHuile", "filtreAir"].forEach((task) => {
    if (car[task]?.remaining <= 0) hasOverdue = true; // 🚨 Overdue
    else if (car[task]?.remaining <= 500) hasDueSoon = true; // ⚠️ Near due
  });

  // Check Date-Based Maintenance
  if (car.daysUntilVisite <= 0 || car.daysUntilAssurance <= 0) hasOverdue = true; // 🚨 Expired
  else if (car.daysUntilVisite <= 10 || car.daysUntilAssurance <= 10) hasDueSoon = true; // ⚠️ Near due

  // If everything is safe ✅, then make the card green
  if (!hasOverdue && !hasDueSoon) return "bg-green-100 border-green-500";

  // If there is at least one overdue field, make the card red 🚨
  if (hasOverdue) return "bg-red-100 border-red-500";

  // If there is at least one "due soon" field, make the card yellow ⚠️
  return "bg-yellow-100 border-yellow-500";
};


  // 🔧 Maintenance Status Formatting
  const formatRemainingKm = (remainingKm, nextKm) => {
    if (remainingKm <= 0) return { text: `⚠️ ${Math.abs(remainingKm)} km en retard`, class: "text-red-600 font-bold" };
    if (remainingKm <= 500) return { text: `⚠️ ${remainingKm} km restants`, class: "text-yellow-600 font-semibold" };
    return { text: `✅ ${remainingKm} km restants`, class: "text-green-600 font-semibold" };
  };

  // 📅 Date Status Formatting
  const getDateStyle = (daysUntil, date) => {
    if (daysUntil === null) return { text: "N/A", class: "text-gray-500" };
    if (daysUntil <= 0) return { text: `⚠️ Expiré (${new Date(date).toLocaleDateString()})`, class: "text-red-600 font-bold" };
    if (daysUntil <= 10) return { text: `⚠️ Dans ${daysUntil} jours`, class: "text-yellow-600 font-semibold" };
    return { text: `✅ ${daysUntil} jours restants`, class: "text-green-600 font-semibold" };
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
    <div className="min-h-screen bg-gray-100 py-6 px-4 flex flex-col items-center">
      <header className="w-full max-w-3xl text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">⏳ Rappels</h1>
      </header>
  
      {/* Search Bar */}
      <div className="w-full max-w-3xl mb-6">
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          placeholder="Rechercher par nom de voiture ou contrat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
  
      {/* Toggle Between Maintenance & Contracts */}
      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={() => setView("entretien")}
          className={`px-4 py-2 rounded-md ${view === "entretien" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"}`}
        >
          🔧 Maintenance
        </button>
        <button
          onClick={() => setView("contracts")}
          className={`px-4 py-2 rounded-md ${view === "contracts" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"}`}
        >
          📜 Contrats Futurs
        </button>
      </div>
  
      {/* 🛠 Maintenance Reminders Section */}
      {view === "entretien" && (
        <div className="w-full max-w-3xl space-y-4 mt-6">
          {entretienList.length === 0 ? (
            <p className="text-gray-500 text-center text-lg">📭 Aucun rappel à venir.</p>
          ) : (
            entretienList
              .filter((car) =>
                car.name.toLowerCase().includes(searchQuery.toLowerCase()) // Filter based on search query
              )
              .map((car) => (
                <div
                  key={car.id}
                  onClick={() => router.push(`/cars/${car.id}/entretien`)}
                  className={`p-4 rounded-lg shadow-md border-l-4 cursor-pointer transition-all hover:shadow-lg active:scale-95 ${getCardStyle(car)}`}
                >
                  {/* 🚗 Car Info */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">{car.name || "🚘 Voiture Inconnue"}</h2>
                    <span className="text-sm text-gray-500">📏 {car.mileage} km</span>
                  </div>
  
                  {/* 🔧 Maintenance Tasks */}
                  <div className="mt-3 text-sm space-y-2">
                    {["vidange", "bougie", "filtreHuile", "filtreAir"].map((task) => (
                      car[task] ? (
                        <div key={task} className="flex justify-between items-center">
                          <span>
                            {task === "vidange" ? "🛢️ Vidange" :
                              task === "bougie" ? "⚡ Bougie" :
                              task === "filtreHuile" ? "🛠️ Filtre Huile" :
                              "🌬️ Filtre Air"}
                          </span>
                          <span className={formatRemainingKm(car[task].remaining, car[task].nextMaintenanceKm).class}>
                            {formatRemainingKm(car[task].remaining, car[task].nextMaintenanceKm).text}
                          </span>
                        </div>
                      ) : null
                    ))}
                  </div>
  
                  {/* 📅 Date-based Maintenance */}
                  <div className="mt-3 border-t pt-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>📅 Visite Technique</span>
                      <span className={getDateStyle(car.daysUntilVisite, car.nextVisiteDate).class}>
                        {getDateStyle(car.daysUntilVisite, car.nextVisiteDate).text}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>🛡 Assurance</span>
                      <span className={getDateStyle(car.daysUntilAssurance, car.nextAssuranceDate).class}>
                        {getDateStyle(car.daysUntilAssurance, car.nextAssuranceDate).text}
                      </span>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      )}
  
      {/* 📜 Future Contract Reminders Section */}
      {view === "contracts" && (
        <div className="w-full max-w-3xl space-y-4 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">📅 Rappels des Contrats</h2>
  
          {contractList.length === 0 ? (
            <p className="text-gray-500 text-center text-lg">📭 Aucun contrat futur.</p>
          ) : (
            contractList
              .filter((contract) =>
                contract.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                contract.carName.toLowerCase().includes(searchQuery.toLowerCase()) // Filter based on search query
              )
              .map((contract) => (
                <div
                  key={contract._id}
                  onClick={() => router.push(`/cars/${contract.carId}/contracts/${contract._id}`)} // ✅ Navigate on click
                  className="p-4 rounded-lg shadow-md border-l-4 border-blue-500 bg-blue-100 transition-all hover:shadow-lg cursor-pointer active:scale-95"
                >
                  <h2 className="text-lg font-semibold text-gray-900">{contract.customerName}</h2>
                  <p className="text-gray-700">🚗 Voiture: <strong>{contract.carName || "Inconnue"}</strong></p>
                  <p className="text-gray-700">🚘 Modèle: <strong>{contract.carModel || "N/A"}</strong></p>
                  <p className="text-gray-700">
                    📅 Début: <strong>{new Date(contract.rentalStartDate).toLocaleDateString("fr-FR")}</strong>
                  </p>
                  <p className="text-gray-700">
                    📅 Fin: <strong>{new Date(contract.rentalEndDate).toLocaleDateString("fr-FR")}</strong>
                  </p>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}  