"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BellIcon, XCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [reminders, setReminders] = useState([]);
  const [showNotification, setShowNotification] = useState(true);
  const [alertCounts, setAlertCounts] = useState({ red: 0, yellow: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [carsRes, remindersRes] = await Promise.all([
          fetch("/api/cars"),
          fetch("/api/entretien/all"),
        ]);

        if (carsRes.ok) {
          const carsData = await carsRes.json();
          setCars(carsData);
          setFilteredCars(carsData);
        }

        if (remindersRes.ok) {
          const remindersData = await remindersRes.json();
          setReminders(remindersData);

          const today = new Date();
          const redCount = remindersData.filter(
            (reminder) => Math.ceil((new Date(reminder.nearestDate) - today) / (1000 * 60 * 60 * 24)) <= 5
          ).length;

          const yellowCount = remindersData.filter(
            (reminder) =>
              Math.ceil((new Date(reminder.nearestDate) - today) / (1000 * 60 * 60 * 24)) > 5 &&
              Math.ceil((new Date(reminder.nearestDate) - today) / (1000 * 60 * 60 * 24)) <= 10
          ).length;

          setAlertCounts({ red: redCount, yellow: yellowCount });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredCars(
      cars.filter((car) => car.name.toLowerCase().includes(query) || car.model.toLowerCase().includes(query))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-16 px-4">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mt-4">🚗 Gestion des Voitures</h1>
      <p className="text-sm text-gray-600">Gérez vos voitures & contrats en un clic</p>

      {/* Notification */}
      {showNotification && (alertCounts.red > 0 || alertCounts.yellow > 0) && (
        <div className="fixed top-6 right-6 bg-white shadow-xl rounded-lg p-4 z-50 w-80 border-t-4 border-red-500">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BellIcon className="h-6 w-6 text-red-500" />
              <h2 className="text-lg font-bold text-gray-800 ml-2">Alertes</h2>
            </div>
            <button onClick={() => setShowNotification(false)} className="text-gray-500 hover:text-gray-700">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {`${alertCounts.red} urgents (<5 jours) et ${alertCounts.yellow} à venir (6–10 jours).`}
          </p>

          <button
            onClick={() => router.push("/reminders")}
            className="mt-3 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            Voir les rappels
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative w-full max-w-md mt-4">
        <input
          type="text"
          placeholder="🔍 Rechercher une voiture..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-5 py-3 rounded-full shadow-md border focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-5 top-3 text-gray-400 hover:text-black">
            ✖
          </button>
        )}
      </div>

{/* Cars List */}
<div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
  {filteredCars.length === 0 ? (
    <p className="text-gray-500 text-center text-lg col-span-full">Aucune voiture trouvée.</p>
  ) : (
    filteredCars.map((car) => (
      <div
        key={car._id}
        className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center border hover:shadow-2xl transition-transform duration-300 transform hover:scale-105 cursor-pointer"
        onClick={() => router.push(`/cars/${car._id}`)} // ⬅️ Full Card Clickable
      >
        <h2 className="text-xl font-bold text-gray-900">{car.name}</h2>
        <p className="text-sm text-gray-500">Série: {car.model}</p>
        
        <span
          className={`mt-2 px-4 py-1 rounded-full text-sm font-bold ${
            car.status === "Available" ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
          }`}
        >
          {car.status === "Available" ? "Disponible" : "Loué"}
        </span>

        {/* Buttons Section */}
        <div className="mt-4 flex justify-center gap-2 w-full">
  <button
    onClick={(e) => {
      e.stopPropagation();
      router.push(`/cars/${car._id}/contracts`);
    }}
    className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition text-sm font-semibold"
  >
    Contrats
  </button>
  <button
    onClick={(e) => {
      e.stopPropagation();
      router.push(`/cars/${car._id}/entretien`);
    }}
    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm font-semibold"
  >
    Maintenance
  </button>
</div>

      </div>
    ))
  )}
</div>

    </div>
  );
}
