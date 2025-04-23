"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ContractDetailsPage({ params }) {
  const { id: carId, contractId } = params;
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returnMileage, setReturnMileage] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        const response = await fetch(`/api/contracts/${contractId}`);
        if (!response.ok) {
          throw new Error("فشل في تحميل تفاصيل العقد");
        }
        const data = await response.json();
        data.photos = data.photos || [];
        setContract(data);
      } catch (err) {
        console.error("خطأ أثناء تحميل العقد:", err.message);
        setError(err.message || "تعذر تحميل تفاصيل العقد.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchContractDetails();
  }, [contractId]);
  
  // Updated to validate return mileage against car mileage
  const handleReturnSubmit = async () => {
    if (!returnMileage || isNaN(returnMileage) || returnMileage <= 0) {
      alert("Veuillez entrer un kilométrage valide.");
      return;
    }
  
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnMileage,
          status: "archived",
        }),
      });
  
      if (!response.ok) {
        const data = await response.json();
        if (data.error) {
          alert(data.error);
          return;
        }
        throw new Error("Échec de l'envoi du retour de la voiture.");
      }
  
      alert("Retour de la voiture enregistré avec succès. Le contrat a été archivé.");
      router.push(`/ar/cars/${carId}/contracts`);
    } catch (error) {
      console.error("Erreur lors du retour de la voiture:", error);
      alert("Échec de l'envoi du retour.");
    }
  };
  
  const handleDeleteContract = async () => {
    const confirmDelete = confirm("❌ هل أنت متأكد أنك تريد حذف هذا العقد؟");
    if (!confirmDelete) return;
  
    try {
      const response = await fetch(`/api/contracts/${contractId}`, { method: "DELETE" });
  
      if (!response.ok) {
        throw new Error("فشل في حذف العقد.");
      }
  
      alert("✅ تم حذف العقد بنجاح!");
      router.push(`/ar/cars/${carId}/contracts`); // Redirect to contract list
    } catch (error) {
      console.error("❌ خطأ أثناء حذف العقد:", error);
      alert("❌ فشل في حذف العقد.");
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-xl">جارٍ تحميل تفاصيل العقد...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">📄 تفاصيل العقد</h1>
  
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800">{contract.customerName}</h2>
        <p className="text-gray-600 mt-2">
          📆 فترة الإيجار: <strong>{new Date(contract.rentalStartDate).toLocaleDateString()}</strong> - <strong>{new Date(contract.rentalEndDate).toLocaleDateString()}</strong>
        </p>
  
        <h3 className="text-gray-700 font-semibold">📷 صورة العقد:</h3>
  
        {contract.photos.length > 0 && (
          <img
            src={contract.photos[0]}
            alt="عقد الإيجار"
            className="w-full h-32 object-cover rounded-md shadow cursor-pointer transition-transform transform hover:scale-105"
            onClick={() => setSelectedPhoto(contract.photos[0])}
          />
        )}
  
        {/* 🔹 معرض الصور */}
        {contract.photos.length > 1 && ( // تأكد من وجود أكثر من صورة واحدة
          <div className="mt-6">
            <h3 className="text-gray-700 font-semibold">📷 صور السيارة:</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {contract.photos.slice(1).map((photo, index) => ( // بدء من الصورة الثانية
                <img
                  key={index + 1} // الحفاظ على المفاتيح فريدة
                  src={photo}
                  alt={`صورة ${index + 1}`} // تبدأ الصورة الأولى للسيارة من "صورة 1"
                  className="w-full h-32 object-cover rounded-md shadow cursor-pointer transition-transform transform hover:scale-105"
                  onClick={() => setSelectedPhoto(photo)}
                />
              ))}
            </div>
          </div>
        )}
  
        {/* 🔹 عارض الصور المنبثق */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative">
              <img src={selectedPhoto} alt="معاينة" className="max-w-full max-h-[90vh] rounded-lg shadow-lg" />
              <button
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg text-black text-lg"
                onClick={() => setSelectedPhoto(null)}
              >
                ❌
              </button>
            </div>
          </div>
        )}
  
        {/* 🚗 عداد الكيلومترات عند العودة */}
        {contract.returnMileage ? (
          <p className="mt-4 text-gray-600 font-semibold">
            🚗 كيلومترات العودة: {contract.returnMileage} كم
          </p>
        ) : (
          <p className="mt-4 text-yellow-500 font-semibold">
            🚧 السيارة لم تُعاد بعد
          </p>
        )}
  
        {/* 📂 حالة العقد */}
        <p
          className={`mt-4 font-semibold ${
            contract.status === "archived"
              ? "text-red-500"
              : contract.status === "pending_return"
              ? "text-yellow-500"
              : "text-green-500"
          }`}
        >
          {contract.status === "archived"
            ? "📂 العقد مؤرشف"
            : contract.status === "pending_return"
            ? "⏳ العودة قيد الانتظار"
            : "✅ العقد نشط"}
        </p>
  
        {/* نموذج إرجاع السيارة */}
        {contract.status === "pending_return" && (
          <div className="mt-6">
            <label className="block text-gray-700 font-semibold mb-2">🔄 كيلومترات العودة (كم)</label>
            <input
              type="number"
              value={returnMileage}
              onChange={(e) => setReturnMileage(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-right"
              placeholder="أدخل الكيلومترات"
            />
            <button
              onClick={handleReturnSubmit}
              className="mt-4 w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition"
            >
              📌 تأكيد الإرجاع وأرشفة العقد
            </button>
          </div>
        )}
  <br></br>
  <div className="flex flex-col items-center justify-center space-y-4">
  {/* 🗑️ تحديث صور العقد */}
  {contract.status !== "archived" && (
    <button
      onClick={() => router.push(`/ar/cars/${carId}/contracts/${contractId}/edit`)}
      className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all w-full max-w-xs"
    >
      إضافة صور
    </button>
  )}

  {/* 🗑️ حذف العقد */}
  <button
    onClick={handleDeleteContract}
    className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all w-full max-w-xs"
  >
    🗑️ حذف العقد
  </button>

  {/* 🔙 العودة إلى قائمة العقود */}
  <button
    onClick={() => router.push(`/ar/cars/${carId}/contracts`)}
    className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all w-full max-w-xs"
  >
    🔙 العودة إلى العقود
  </button>
</div>

      </div>
    </div>
  );
}
