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
        if (!response.ok) throw new Error("فشل تحميل العقود");

        const contracts = await response.json();
        const intervals = [];

        contracts.forEach((contract) => {
          const startDate = new Date(contract.rentalStartDate);
          const endDate = new Date(contract.rentalEndDate);

          // تخزين الفترات باستثناء اليوم الأول والأخير
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
        maxDate = blockStart; // لا يمكن أن يتجاوز تاريخ النهاية هذا التاريخ المحجوز
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

    // دمج الصور الجديدة مع الموجودة
    setPhotos((prevPhotos) => [...prevPhotos, ...newFiles]);

    // تحديث روابط المعاينة
    setPreviewUrls((prevUrls) => [
      ...prevUrls,
      ...newFiles.map((file) => URL.createObjectURL(file)),
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
      setError("الرجاء تحديد تواريخ البداية والنهاية.");
      return;
    }

    if (rentalStartDate > rentalEndDate) {
      setError("لا يمكن أن يكون تاريخ البداية بعد تاريخ النهاية.");
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
      console.log("تمت إضافة العقد بنجاح");
      router.push(`/cars/${carId}/contracts`);
    } else {
      const data = await response.json();
      setError(data.error || "فشل في إضافة العقد.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">📜 إضافة عقد</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
        
        {/* اسم العميل */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">اسم العميل</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* تاريخ ووقت البداية */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">تاريخ ووقت البداية</label>
          <input
            type="datetime-local"
            value={formData.rentalStartDate ? formData.rentalStartDate.toISOString().slice(0, 16) : ""}
            onChange={(e) => handleStartDateChange(new Date(e.target.value))}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* تاريخ ووقت النهاية */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">تاريخ ووقت النهاية</label>
          <input
            type="datetime-local"
            value={formData.rentalEndDate ? formData.rentalEndDate.toISOString().slice(0, 16) : ""}
            onChange={(e) => handleEndDateChange(new Date(e.target.value))}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* تحميل الصور */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">تحميل الصور</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* عرض الصور */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img src={url} alt={`معاينة ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
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
        )}

        {/* زر الإضافة */}
        <button type="submit" className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
          إضافة العقد
        </button>
      </form>
    </div>
  );
}
