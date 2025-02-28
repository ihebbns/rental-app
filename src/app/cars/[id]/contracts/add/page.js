"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AddContractPage({ params }) {
  const { id: carId } = params;
  const [formData, setFormData] = useState({
    customerName: "",
    rentalStartDate: null,
    rentalEndDate: null,
  });
  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [blockedIntervals, setBlockedIntervals] = useState([]);
  const [maxEndDate, setMaxEndDate] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch(`/api/contracts?carId=${carId}`);
        if (!response.ok) throw new Error("Échec du chargement des contrats");

        const contracts = await response.json();
        const intervals = [];

        contracts.forEach((contract) => {
          const startDate = new Date(contract.rentalStartDate);
          const endDate = new Date(contract.rentalEndDate);

          // Store intervals excluding first and last day
          const blockStart = new Date(startDate);
          blockStart.setDate(blockStart.getDate() + 1);

          const blockEnd = new Date(endDate);
          blockEnd.setDate(blockEnd.getDate() - 1);

          if (blockStart <= blockEnd) {
            intervals.push([blockStart, blockEnd]);
          }
        });

        setBlockedIntervals(intervals);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchContracts();
  }, [carId]);

  const isDateBlocked = (date) => {
    return blockedIntervals.some(([start, end]) => date >= start && date <= end);
  };

  const handleStartDateChange = (date) => {
    setFormData((prev) => ({ ...prev, rentalStartDate: date, rentalEndDate: null }));

    let maxDate = null;
    for (let [blockStart, blockEnd] of blockedIntervals) {
      if (date < blockStart) {
        maxDate = blockStart; // End date cannot go beyond this blocked start date
        break;
      }
    }

    setMaxEndDate(maxDate);
  };

  const handleEndDateChange = (date) => {
    setFormData((prev) => ({ ...prev, rentalEndDate: date }));
  };

  const handlePhotoChange = (e) => {
    const newFiles = Array.from(e.target.files);
  
    if (newFiles.length === 0) return;
  
    // Merge new files with existing ones
    setPhotos((prevPhotos) => [...prevPhotos, ...newFiles]);
  
    // Update preview URLs
    setPreviewUrls((prevUrls) => [
      ...prevUrls,
      ...newFiles.map((file) => URL.createObjectURL(file))
    ]);
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
    setPreviewUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { rentalStartDate, rentalEndDate } = formData;

    if (!rentalStartDate || !rentalEndDate) {
      setError("Veuillez sélectionner les dates de début et de fin.");
      return;
    }

    if (rentalStartDate > rentalEndDate) {
      setError("La date de début ne peut pas être après la date de fin.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("customerName", formData.customerName);
    formDataToSend.append("rentalStartDate", rentalStartDate.toISOString());
    formDataToSend.append("rentalEndDate", rentalEndDate.toISOString());
    formDataToSend.append("carId", carId);

    photos.forEach((photo) => {
      formDataToSend.append("photos", photo);
    });

    const response = await fetch("/api/contracts", {
      method: "POST",
      body: formDataToSend,
    });

    if (response.ok) {
      console.log("Contrat ajouté avec succès");
      router.push(`/cars/${carId}/contracts`);
    } else {
      const data = await response.json();
      setError(data.error || "Échec de l'ajout du contrat.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">📜 Ajouter un Contrat</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
        
        {/* Nom du Client */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nom du Client</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Date de début */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Date de début</label>
          <DatePicker
            selected={formData.rentalStartDate}
            onChange={handleStartDateChange}
            filterDate={(date) => !isDateBlocked(date)}
            minDate={new Date()}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Date de fin */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Date de fin</label>
          <DatePicker
            selected={formData.rentalEndDate}
            onChange={handleEndDateChange}
            filterDate={(date) => !isDateBlocked(date)}
            minDate={formData.rentalStartDate || new Date()}
            maxDate={maxEndDate} // Prevents selecting inside existing contracts
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

       

        {/* Bouton d'ajout */}
        <button type="submit" className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
          Ajouter le Contrat
        </button>
      </form>
    </div>
  );
}
