"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const EditContractPage = () => {
  const params = useParams();
  const router = useRouter();
  const { contractId } = params;

  const [contract, setContract] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [deletedPhotos, setDeletedPhotos] = useState([]);
  const [contractPhoto, setContractPhoto] = useState(null);
  const [contractPhotoUrl, setContractPhotoUrl] = useState(null);

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        const response = await fetch(`/api/contracts/${contractId}`);
        if (!response.ok) throw new Error("Échec du chargement des détails du contrat");

        const data = await response.json();
        setContract(data);

        if (data.photos && data.photos.length > 0) {
          setContractPhoto(data.photos[0] || null); // ✅ Keep it NULL if no contract photo
          setContractPhotoUrl(data.photos[0] || null);
          setPhotos(data.photos.slice(1));
          setPreviewUrls(data.photos.slice(1));
        } else {
          setContractPhoto(null); // ✅ Forcing NULL if no photo is available
          setContractPhotoUrl("/images/contract.jpg"); // تعيين صورة افتراضية إذا لم تكن هناك صورة
          setPhotos([]);
          setPreviewUrls([]);
        }
      } catch (err) {
        setError(err.message || "Impossible de charger les détails du contrat.");
      } finally {
        setLoading(false);
      }
    };

    fetchContractDetails();
  }, [contractId]);

  const handlePhotoChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;
    setPhotos((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newFiles.map((file) => URL.createObjectURL(file))]);
  };

  const handleContractPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setContractPhoto(file);
      setContractPhotoUrl(URL.createObjectURL(file));
    } else {
      setContractPhoto(null); // Ensure contract photo is null if no file is selected
      setContractPhotoUrl(null);
    }
  };

  const handleRemovePhoto = (index) => {
    const removedPhoto = previewUrls[index];

    if (!removedPhoto.startsWith("blob:")) {
      setDeletedPhotos((prev) => [...prev, removedPhoto]);
    }

    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Only append contract photo if it's selected, otherwise append "null"
    if (contractPhoto instanceof File) {
      formData.append("contractPhoto", contractPhoto);
    } else {
      formData.append("contractPhoto", "null"); // Ensure null is sent if no contract photo
    }

    // Append other vehicle photos
    photos.forEach((photo) => {
      if (photo instanceof File) {
        formData.append("photos", photo);
      }
    });

    formData.append("deletedPhotos", JSON.stringify(deletedPhotos));

    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour.");

      const updatedContract = await response.json();

      // Handle updated contract photos
      if (updatedContract.photos && updatedContract.photos.length > 0) {
        const updatedContractPhoto = updatedContract.photos[0] || null;
        const updatedPhotos = updatedContract.photos.slice(1) || [];

        setContractPhoto(updatedContractPhoto); // Ensure it’s null if no new photo
        setContractPhotoUrl(updatedContractPhoto);
        setPhotos(updatedPhotos);
        setPreviewUrls(updatedPhotos);
      } else {
        setContractPhoto(null); // Ensure it stays null if no primary photo
        setContractPhotoUrl(null);
        setPhotos([]);
        setPreviewUrls([]);
      }

      setDeletedPhotos([]);
    } catch (err) {
      setError("Erreur lors de la mise à jour.");
    }
  };

  if (loading) return <p className="text-center text-lg">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!contract) return <p className="text-center">Aucun contrat trouvé.</p>;

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-center mb-4">Ajouter les photos</h2>

      <div className="mb-6">
  <label className="block text-sm font-medium mb-2">Photo du Contrat</label>
  {contractPhotoUrl && (
    <img
      src={contractPhotoUrl}
      alt="Contract Photo"
      className="w-full object-contain rounded-md mb-2" // 'object-contain' ensures the full image is shown without cropping
    />
  )}
  <input
    type="file"
    onChange={handleContractPhotoChange}
    className="w-full border p-2 rounded-lg"
  />
</div>


      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Photos du Véhicule</label>
        <div className="grid grid-cols-3 gap-2">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img src={url} alt={`Photo ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Ajouter de nouvelles photos</label>
        <input type="file" multiple onChange={handlePhotoChange} className="w-full border p-2 rounded-lg mb-4" />
      </div>

      <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition">
        Enregistrer
      </button>
    </form>
  );
};

export default EditContractPage;
