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
        if (!response.ok) throw new Error("فشل تحميل تفاصيل العقد");

        const data = await response.json();
        setContract(data);

        if (data.photos && data.photos.length > 0) {
          setContractPhoto(data.photos[0] || null); // ✅ احتفظ بـ NULL إذا لم تكن هناك صورة
          setContractPhotoUrl(data.photos[0] || null);
          setPhotos(data.photos.slice(1));
          setPreviewUrls(data.photos.slice(1));
        } else {
          setContractPhoto(null); // ✅ اجعلها NULL إذا لم تكن هناك صورة
          setContractPhotoUrl("/images/contract.jpg"); // تعيين صورة افتراضية إذا لم تكن هناك صورة

          setPhotos([]);
          setPreviewUrls([]);
        }
      } catch (err) {
        setError(err.message || "تعذر تحميل تفاصيل العقد.");
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
      setContractPhoto(null); // تأكد من أن صورة العقد ستكون null إذا لم يتم اختيار ملف
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

    // أضف صورة العقد فقط إذا تم اختيارها، وإلا أضف "null"
    if (contractPhoto instanceof File) {
      formData.append("contractPhoto", contractPhoto);
    } else {
      formData.append("contractPhoto", "null"); // تأكد من إرسال null إذا لم يتم اختيار صورة عقد
    }

    // أضف الصور الأخرى للسيارة
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

      if (!response.ok) throw new Error("حدث خطأ أثناء التحديث.");

      const updatedContract = await response.json();

      // التعامل مع الصور المحدثة للعقد
      if (updatedContract.photos && updatedContract.photos.length > 0) {
        const updatedContractPhoto = updatedContract.photos[0] || null;
        const updatedPhotos = updatedContract.photos.slice(1) || [];

        setContractPhoto(updatedContractPhoto); // تأكد من أنه NULL إذا لم تكن هناك صورة جديدة
        setContractPhotoUrl(updatedContractPhoto);
        setPhotos(updatedPhotos);
        setPreviewUrls(updatedPhotos);
      } else {
        setContractPhoto(null); // تأكد من أنها تظل NULL إذا لم توجد صورة أساسية
        setContractPhotoUrl(null);
        setPhotos([]);
        setPreviewUrls([]);
      }

      setDeletedPhotos([]);
    } catch (err) {
      setError("حدث خطأ أثناء التحديث.");
    }
  };

  if (loading) return <p className="text-center text-lg">جار التحميل...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!contract) return <p className="text-center">لم يتم العثور على العقد.</p>;

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-center mb-4">إضافة الصور</h2>

      <div className="mb-6">
  <label className="block text-sm font-medium mb-2">صورة العقد</label>
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
        <label className="block text-sm font-medium mb-2">صور السيارة</label>
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
        <label className="block text-sm font-medium mb-2">إضافة صور جديدة</label>
        <input type="file" multiple onChange={handlePhotoChange} className="w-full border p-2 rounded-lg mb-4" />
      </div>

      <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition">
        حفظ
      </button>
    </form>
  );
};

export default EditContractPage;
