'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MaintenancePage({ params }) {
  const { id: carId } = params;
  const [maintenance, setMaintenance] = useState(null);
  const [carMileage, setCarMileage] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [autreEntretien, setAutreEntretien] = useState('');
  const [carName, setCarName] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const response = await fetch(`/api/entretien?carId=${carId}`);
        if (response.ok) {
          const data = await response.json();
          setMaintenance(data);
          setAutreEntretien(data.autreEntretien || '');
        } else if (response.status === 404) {
          setMaintenance(null);
        } else {
          throw new Error("فشل تحميل بيانات الصيانة");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchCarMileage = async () => {
      try {
        const response = await fetch(`/api/cars/${carId}`);
        if (response.ok) {
          const carData = await response.json();
          setCarMileage(carData.mileage || 0);
          setCarName(carData.name || "");
        } else {
          throw new Error('فشل تحميل بيانات الكيلومترات');
        }
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchMaintenance();
    fetchCarMileage();
    setLoading(false);
  }, [carId]);

  const handleUpdateMaintenance = async (task) => {
    try {
      const response = await fetch(`/api/cars/${carId}`);
      if (response.ok) {
        const carData = await response.json();
        const latestMileage = carData.mileage || 0;

        const updateResponse = await fetch(`/api/entretien/${carId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: task, lastMileage: latestMileage }),
        });

        if (updateResponse.ok) {
          setMaintenance((prev) => ({
            ...prev,
            [task]: {
              ...prev[task],
              lastMaintenanceKm: latestMileage,
            },
          }));
          alert(`✅ ${task.toUpperCase()} تم تحديثه بنجاح!`);
        } else {
          throw new Error("فشل تحديث بيانات الصيانة");
        }
      }
    } catch (error) {
      console.error("❌ خطأ أثناء التحديث:", error.message);
    }
  };

  const handleAdd6Months = async (field) => {
    try {
      const currentDate = new Date(maintenance[field]?.next || new Date());
      currentDate.setMonth(currentDate.getMonth() + 6); // Add 6 months
  
      const formattedDate = currentDate.toISOString();
  
      const updateResponse = await fetch(`/api/entretien?id=${carId}`, { // Use query param ?id=
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: field, next: formattedDate }), // Send formatted date
      });
  
      if (updateResponse.ok) {
        const updatedMaintenance = await updateResponse.json(); // Get updated data from backend
        setMaintenance(updatedMaintenance);
        alert(`✅ ${field === "assurance" ? "التأمين" : "الفحص الفني"} تم تحديثه بنجاح (+6 أشهر)`);
      } else {
        throw new Error("فشل التحديث.");
      }
    } catch (error) {
      console.error("❌ خطأ في التحديث:", error.message);
    }
  };
  
  const handleAdd1Year = async (field) => {
    try {
      const currentDate = new Date(maintenance[field]?.next || new Date());
      currentDate.setFullYear(currentDate.getFullYear() + 1); // Add 1 year
  
      const formattedDate = currentDate.toISOString();
  
      const updateResponse = await fetch(`/api/entretien?id=${carId}`, { // Use query param ?id=
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: field, next: formattedDate }), // Send formatted date
      });
  
      if (updateResponse.ok) {
        const updatedMaintenance = await updateResponse.json(); // Get updated data from backend
        setMaintenance(updatedMaintenance);
        alert(`✅ ${field === "assurance" ? "التأمين" : "الفحص الفني"} تم تحديثه بنجاح (+1 سنة)`);
      } else {
        throw new Error("فشل التحديث.");
      }
    } catch (error) {
      console.error("❌ خطأ في التحديث:", error.message);
    }
  };
  
  const handleUpdateDate = async (field, newDate) => {
    try {
      const formattedDate = new Date(newDate).toISOString(); // ✅ Ensure proper date format
  
      const updateResponse = await fetch(`/api/entretien?id=${carId}`, { // ✅ Use query param ?id=
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: field, next: formattedDate }), // ✅ Send formatted date
      });
  
      if (updateResponse.ok) {
        const updatedMaintenance = await updateResponse.json(); // ✅ Get updated data from backend
        setMaintenance(updatedMaintenance);
        alert(`✅ ${field === "assurance" ? "التأمين" : "الفحص الفني"} تم تحديثه بنجاح!`);
      } else {
        throw new Error("فشل التحديث.");
      }
    } catch (error) {
      console.error("❌ خطأ في التحديث:", error.message);
    }
  };
  

  const handleUpdateAutreEntretien = async () => {
    try {
      if (!carId) {
        console.error("❌ carId غير معرف!");
        return;
      }

      const response = await fetch(`/api/entretien?id=${carId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'autreEntretien', value: autreEntretien })
      });

      if (response.ok) {
        const updatedMaintenance = await response.json();
        setMaintenance(updatedMaintenance);
        alert("✅ تم تحديث بيانات الصيانة الأخرى!");
      } else {
        throw new Error("فشل تحديث البيانات");
      }
    } catch (error) {
      console.error("❌ خطأ أثناء التحديث:", error.message);
    }
  };

  

  const handleAddOrUpdate1 = () => {
    router.push(`/ar/cars/${carId}/entretien/add`);
  };
  const getDateClass = (date) => {
    if (!date) return "text-gray-500"; // No Date
    const today = new Date();
    const dueDate = new Date(date);
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  
    if (daysLeft < 0) return "text-red-600 font-bold border-red-500"; // 🚨 Expired
    if (daysLeft <= 10) return "text-yellow-600 font-semibold border-yellow-500"; // ⚠️ Near Due
    return "text-green-600 font-semibold border-green-500"; // ✅ Safe
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500 border-solid"></div>
          <p className="text-gray-600 text-lg mt-3 font-semibold">جار التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 text-right">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
        <span className="flex items-center justify-center gap-2">
          <span className="text-blue-600">🔧</span> 
          صيانة السيارة
        </span>
        {carName && (
          <span className="block text-lg sm:text-xl font-semibold text-black-700 mt-1">
            🚗 {carName}
          </span>
        )}
      </h1>

      {maintenance ? (
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
          {/* 🚗 كيلومترات السيارة */}
          <div className="mb-6 text-center p-4 bg-blue-100 rounded-md">
            <h2 className="text-xl font-semibold text-gray-700">📍 الكيلومترات الحالية</h2>
            <p className="text-2xl font-bold text-blue-700">{carMileage} كم</p>
          </div>

{/* 🔧 الصيانة العامة */}
<h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
  الصيانة العامة
</h2>
<div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
  {[
    { key: "vidange", label: "🛢️ تغيير الزيت" },
    { key: "bougie", label: "⚡ شموع الإشعال" },
    { key: "filtreHuile", label: "🛠️ فلتر الزيت" },
    { key: "filtreAir", label: "🌬️ فلتر الهواء" }
  ].map(({ key, label }) => {
    const task = maintenance?.[key]; // ✅ Ensure key exists
    if (!task) return null; // ✅ Avoid errors if data is missing

    const nextKm = task.lastMaintenanceKm + task.intervalKm;
    const remainingKm = nextKm - carMileage;
    const isOverdue = nextKm <= carMileage;

    return (
      <div key={key} className={`p-4 rounded-md shadow-sm ${remainingKm <= 0 ? 'bg-red-100 border-red-500' :
        remainingKm <= 500 ? 'bg-yellow-100 border-yellow-500' : 'bg-green-100 border-green-500'}`}>
      
        <p className="text-lg font-semibold text-gray-700">{label}</p>
        <p className="text-gray-600">🔹 آخر صيانة: {task.lastMaintenanceKm || "غير متوفر"} كم</p>
        <p className={remainingKm <= 0 ? "text-red-600 font-bold" :
                      remainingKm <= 500 ? "text-yellow-600 font-semibold" :
                      "text-green-600 font-semibold"}>
          ➡ الصيانة القادمة: {nextKm} كم ({remainingKm < 0 ? `🚨 متأخر بـ ${Math.abs(remainingKm)} كم` :
                                              remainingKm <= 500 ? `⚠️ متبقي ${remainingKm} كم` :
                                              `✅ متبقي ${remainingKm} كم`})
        </p>

        <div className="flex justify-center items-center">
          <button
            onClick={() => handleUpdateMaintenance(key)}
            className="mt-2 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded shadow-sm transition-transform duration-150 active:scale-95"
          >
            🔄 تحديث
          </button>
        </div>
      </div>
    );
  })}
</div>

{/* 📅 الفحص الفني */}
<h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">📅 الفحص الفني</h2>
<div className="mb-4 bg-gray-100 p-4 rounded-md shadow-sm">
  <p className="text-lg font-semibold text-gray-700">➡ الفحص الفني القادم :</p>
  <div className="flex items-center gap-2">
    <input 
      type="date" 
      value={maintenance.visiteTechnique?.next ? new Date(maintenance.visiteTechnique.next).toISOString().split('T')[0] : ''} 
      onChange={(e) => handleUpdateDate("visiteTechnique", e.target.value)} 
      className={`w-full p-2 border rounded-md ${getDateClass(maintenance.visiteTechnique?.next)}`} 
    />
    <button 
      onClick={() => handleAdd6Months("visiteTechnique")} 
      className="mt-2 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded shadow-sm transition-transform duration-150 active:scale-95"
  >
      +6M
    </button>
    <button 
      onClick={() => handleAdd1Year("visiteTechnique")} 
      className="mt-2 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded shadow-sm transition-transform duration-150 active:scale-95"
      >
      +1Y
    </button>
  </div>
</div>

{/* 📜 التأمين */}
<h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">🛡 التأمين</h2>
<div className="mb-4 bg-gray-100 p-4 rounded-md shadow-sm">
  <p className="text-lg font-semibold text-gray-700">➡ التأمين القادم :</p>
  <div className="flex items-center gap-2">
    <input 
      type="date" 
      value={maintenance.assurance?.next ? new Date(maintenance.assurance.next).toISOString().split('T')[0] : ''} 
      onChange={(e) => handleUpdateDate("assurance", e.target.value)} 
      className={`w-full p-2 border rounded-md ${getDateClass(maintenance.assurance?.next)}`} 
    />
    <button 
      onClick={() => handleAdd6Months("assurance")} 
      className="mt-2 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded shadow-sm transition-transform duration-150 active:scale-95"
  >
      +6M
    </button>
    <button 
      onClick={() => handleAdd1Year("assurance")} 
      className="mt-2 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded shadow-sm transition-transform duration-150 active:scale-95"
  >
      +1Y
    </button>
  </div>
</div>

          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">📝 ملاحظات أخرى
          </h2>
          <div className="mb-4 bg-gray-100 p-4 rounded-md shadow-sm">
            <textarea
              value={autreEntretien}
              onChange={(e) => setAutreEntretien(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Ajoutez des détails sur l'entretien..."
              rows="3"
            />
            <button
              onClick={handleUpdateAutreEntretien}
              className="mt-2 px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded shadow-sm transition-transform duration-150 active:scale-95"
  >
              ✅ تحديث
            </button>
          </div>

          {/* زر تعديل الصيانة */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleAddOrUpdate1}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 text-lg font-semibold"
            >
              🔧 تعديل إعدادات الصيانة
            </button>
          </div>
        </div>
      ) : (
        <p className="text-lg text-gray-600 text-center">لا يوجد سجل صيانة متاح.</p>
      )}
    </div>
  );
}
