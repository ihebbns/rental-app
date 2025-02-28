'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddCarPage() {
  const [formData, setFormData] = useState({
    name: '',
    model: '', // Store the series in the model field
    year: '',
    mileage: '',
  });
  const [error, setError] = useState('');
  const [seriesError, setSeriesError] = useState('');
  const router = useRouter();

  // Function to check if the model (series) exists
  const checkModelExists = async (model) => {
    const response = await fetch(`/api/cars?model=${model}`);
    const data = await response.json();
    return data.exists;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateSeries = async (series) => {
    const seriesRegex = /^\d+-\d+$/; // Ensure format "1234-5678"
    if (!seriesRegex.test(series)) {
      setSeriesError("La série de la voiture doit être au format numéros-numéros (ex: 1234-5678)");
      return false;
    }

    try {
      // Check if model (series) exists in the database
      const exists = await checkModelExists(series);

      if (exists) {
        setSeriesError("Cette série existe déjà");
        return false;
      }

      setSeriesError('');
      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification de la série:", error);
      setSeriesError("Erreur de vérification, réessayez plus tard.");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validSeries = await validateSeries(formData.model);
    if (!validSeries) return;

    try {
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/'); // Redirect to cars list
      } else {
        const data = await response.json();
        setError(data.error || "Échec de l'ajout de la voiture");
      }
    } catch (error) {
      console.error("Erreur d'ajout de la voiture:", error);
      setError("Erreur lors de l'ajout de la voiture.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center gap-2">
        🚗 Ajouter une Nouvelle Voiture
      </h1>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {seriesError && <p className="text-red-500 text-center mb-4">{seriesError}</p>} 

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
        {/* Nom de la Voiture */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">📌 Nom de la Voiture</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Série (Stocked in Model) */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">🚗 Série</label>
          <input
            type="text"
            name="model" // Store the series in "model" field
            value={formData.model}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Année */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">📅 Année</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            min="1900"
            max={new Date().getFullYear()}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Kilométrage */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">📏 Kilométrage (km)</label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 text-lg font-semibold flex items-center justify-center gap-2"
        >
          ✅ Ajouter la Voiture
        </button>
      </form>
    </div>
  );
}
