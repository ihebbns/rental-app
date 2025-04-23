"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const EditarContractPage = () => {
  const params = useParams();
  const router = useRouter();
  const { id: carId, contractId } = params;

  const [contract, setContract] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [deletedPhotos, setDeletedPhotos] = useState([]);
  const [contractPhoto, setContractPhoto] = useState(null);
  const [contractPhotoUrl, setContractPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false); // Upload state
  const [progress, setProgress] = useState(0); // Upload progress

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        const response = await fetch(`/api/contracts/${contractId}`);
        if (!response.ok) throw new Error("Échec du chargement des détails du contrat");

        const data = await response.json();
        setContract(data);

        if (data.photos?.length > 0) {
          setContractPhotoUrl(data.photos[0]);
          setPhotos(data.photos.slice(1));
          setPreviewUrls(data.photos.slice(1));
        } else {
          setContractPhotoUrl("/images/contract.jpg"); // Default image
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
 
  

  // Handle contract photo change




  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
  
          // Détecter la rotation EXIF (spécial iPhone)
          let width = img.width;
          let height = img.height;
          if (width > height) {
            canvas.width = 800;
            canvas.height = (height / width) * 800;
          } else {
            canvas.width = (width / height) * 800;
            canvas.height = 800;
          }
  
          // Corriger l'orientation (certaines photos iPhone sont retournées)
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
          ctx.restore();
  
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name.replace(/\.heic$/, ".jpg"), { type: "image/jpeg" }));
            },
            "image/jpeg",
            0.6 // 60% qualité pour réduire la taille
          );
        };
      };
    });
  };
  

  // Handle contract photo change
  const handleContractPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const compressedFile = await compressImage(file);
    setContractPhoto(compressedFile);
    setContractPhotoUrl(URL.createObjectURL(compressedFile));
  };

  // Handle multiple image selection & compression
  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const compressedFiles = await Promise.all(files.map(compressImage));

    setPhotos((prev) => [...prev, ...compressedFiles]);
    setPreviewUrls((prev) => [...prev, ...compressedFiles.map((file) => URL.createObjectURL(file))]);
  };
  // Handle multiple photos upload
  

  // Handle removing photos
  const handleRemovePhoto = (index) => {
    const removedPhoto = previewUrls[index];

    if (!removedPhoto.startsWith("blob:")) {
      setDeletedPhotos((prev) => [...prev, removedPhoto]);
    }

    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    if (contractPhoto instanceof File) {
      formData.append("contractPhoto", contractPhoto);
    }
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

      if (updatedContract.photos?.length > 0) {
        setContractPhotoUrl(updatedContract.photos[0]);
        setPhotos(updatedContract.photos.slice(1));
        setPreviewUrls(updatedContract.photos.slice(1));
      } else {
        setContractPhotoUrl(null);
        setPhotos([]);
        setPreviewUrls([]);
      }

      setDeletedPhotos([]);
      router.push(`/ar/cars/${carId}/contracts/${contractId}`);
    } catch (err) {
      setError("Erreur lors de la mise à jour.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p className="text-center text-lg">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!contract) return <p className="text-center">Aucun contrat trouvé.</p>;

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-center mb-4">Ajouter les photos</h2>

      {/* Contract Photo */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Photo du Contrat</label>
        {contractPhotoUrl && (
          <img
            src={contractPhotoUrl}
            alt="Contract Photo"
            className="w-full object-contain rounded-md mb-2"
          />
        )}
        <input type="file" onChange={handleContractPhotoChange} className="w-full border p-2 rounded-lg" />
      </div>

      {/* Vehicle Photos */}
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

      {/* Upload New Photos */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Ajouter de nouvelles photos</label>
        <input type="file" multiple onChange={handlePhotoChange} className="w-full border p-2 rounded-lg mb-4" />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition">
        {uploading ? "Uploading..." : "Enregistrer"}
      </button>
    </form>
  );
};

export default EditarContractPage;
