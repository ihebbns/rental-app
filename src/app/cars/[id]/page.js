'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CarDetailsPage({ params }) {
  const { id } = params;
  const [car, setCar] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`/api/cars/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCar(data);
        } else {
          throw new Error("Échec du chargement des détails de la voiture");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCarDetails();
  }, [id]);

  const handleDelete = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette voiture ?")) {
      try {
        const response = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
        if (response.ok) {
          alert("Voiture supprimée avec succès");
          router.push('/'); // Redirection vers la liste des voitures
        } else {
          throw new Error("Échec de la suppression de la voiture");
        }
      } catch (err) {
        console.error(err.message);
        alert("Erreur lors de la suppression de la voiture");
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500 text-xl">Erreur : {error}</p>
      </div>
    );
  }

  if (!car)  {
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center gap-2">
        🚗 Détails de la Voiture
      </h1>

      <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
        {/* Informations Générales */}
        <div className="mb-4">
          <p className="text-lg font-semibold">
            <span className="text-gray-700">🔹 Nom :</span> {car.name}
          </p>
          <p className="text-lg font-semibold">
            <span className="text-gray-700">📌 Série :</span> {car.model}
          </p>
        </div>

        {/* Informations Supplémentaires */}
        <div className="grid grid-cols-1 gap-4">
          <p className="text-lg">
            <strong className="text-gray-700">📅 Année :</strong> {car.year}
          </p>
          <p className="text-lg">
            <strong className="text-gray-700">📏 Kilométrage :</strong> {car.mileage} km
          </p>
          <p className="text-lg">
          <span className={`mt-2 px-4 py-1 rounded-full text-sm font-bold ${
                car.status === 'Available' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
              }`}>
                {car.status === 'Available' ? 'Disponible' : 'Loué'}
              </span>
          </p>
        </div>

        {/* Boutons d'Action (Full Width) */}
        <div className="mt-6 space-y-3">
          <a
            href={`/cars/${id}/contracts`}
            className="w-full block bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 text-center font-semibold flex items-center justify-center gap-2"
          >
            📜 Voir les Contrats
          </a>
          <a
            href={`/cars/${id}/entretien`}
            className="w-full block bg-green-500 text-white px-4 py-3 rounded-md hover:bg-green-600 text-center font-semibold flex items-center justify-center gap-2"
          >
            🔧 Voir l&apos;Entretien
          </a>
          <button
            onClick={() => router.push(`/cars/${id}/edit`)}
            className="w-full block bg-yellow-500 text-white px-4 py-3 rounded-md hover:bg-yellow-600 text-center font-semibold flex items-center justify-center gap-2"
          >
            ✏️ Modifier la Voiture
          </button>
          <button
            onClick={handleDelete}
            className="w-full block bg-red-500 text-white px-4 py-3 rounded-md hover:bg-red-600 text-center font-semibold flex items-center justify-center gap-2"
          >
            🗑️ Supprimer la Voiture
          </button>
        </div>
      </div>
    </div>
  );
}
