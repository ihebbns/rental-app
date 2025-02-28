"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MaintenanceRemindersPage() {
  const [entretienList, setEntretienList] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [contractList, setContractList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("entretien"); // "entretien" or "contracts"

  useEffect(() => {
    fetchAllMaintenance();
    fetchFutureContracts();
  }, []);

  const fetchFutureContracts = async () => {
    try {
      const response = await fetch("/api/contracts?future=true");
      if (!response.ok) throw new Error("خطأ أثناء تحميل العقود");
  
      const data = await response.json();
  
      const contractsWithCarDetails = await Promise.all(
        data.map(async (contract) => {
          try {
            const carResponse = await fetch(`/api/cars/${contract.carId}`);
            if (!carResponse.ok) throw new Error("خطأ أثناء تحميل السيارة");
  
            const carData = await carResponse.json();
            return {
              ...contract,
              carName: carData.name || "غير معروف",
              carModel: carData.model || "N/A",
            };
          } catch (error) {
            console.error("خطأ أثناء تحميل تفاصيل السيارة:", error.message);
            return { ...contract, carName: "غير معروف", carModel: "N/A" };
          }
        })
      );
  
      setContractList(contractsWithCarDetails);
    } catch (error) {
      console.error("❌ خطأ:", error.message);
    }
  };

  const fetchAllMaintenance = async () => {
    try {
      const response = await fetch("/api/entretien");
      if (!response.ok) throw new Error("خطأ أثناء تحميل الصيانة");

      const data = await response.json();
      setEntretienList(data);
    } catch (error) {
      console.error("❌ خطأ:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCardStyle = (car) => {
    let hasOverdue = false; // 🚨 Any overdue maintenance
    let hasDueSoon = false; // ⚠️ Any near-due maintenance
    let allSafe = true; // ✅ Assume everything is safe, unless found otherwise
  
    // Check Maintenance Tasks
    ["vidange", "bougie", "filtreHuile", "filtreAir"].forEach((task) => {
      if (car[task]?.remaining <= 0) hasOverdue = true; // 🚨 Overdue
      else if (car[task]?.remaining <= 500) hasDueSoon = true; // ⚠️ Near due
    });
  
    // Check Date-Based Maintenance
    if (car.daysUntilVisite <= 0 || car.daysUntilAssurance <= 0) hasOverdue = true; // 🚨 Expired
    else if (car.daysUntilVisite <= 10 || car.daysUntilAssurance <= 10) hasDueSoon = true; // ⚠️ Near due
  
    // If everything is safe ✅, then make the card green
    if (!hasOverdue && !hasDueSoon) return "bg-green-100 border-green-500";
  
    // If there is at least one overdue field, make the card red 🚨
    if (hasOverdue) return "bg-red-100 border-red-500";
  
    // If there is at least one "due soon" field, make the card yellow ⚠️
    return "bg-yellow-100 border-yellow-500";
  };
  
  
// 🔧 تنسيق حالة الصيانة
const formatRemainingKm = (remainingKm, nextKm) => {
  if (remainingKm <= 0) return { text: `⚠️ تأخر بـ ${Math.abs(remainingKm)} كم`, class: "text-red-600 font-bold" };
  if (remainingKm <= 500) return { text: `⚠️ ${remainingKm} كم متبقي`, class: "text-yellow-600 font-semibold" };
  return { text: `✅ ${remainingKm} كم متبقي`, class: "text-green-600 font-semibold" };
};

// 📅 تنسيق حالة التاريخ
const getDateStyle = (daysUntil, date) => {
  if (daysUntil === null) return { text: "غير متوفر", class: "text-gray-500" };
  if (daysUntil <= 0) return { text: `⚠️ منتهي (${new Date(date).toLocaleDateString()})`, class: "text-red-600 font-bold" };
  if (daysUntil <= 10) return { text: `⚠️ خلال ${daysUntil} أيام`, class: "text-yellow-600 font-semibold" };
  return { text: `✅ ${daysUntil} يوم متبقي`, class: "text-green-600 font-semibold" };
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
    <div className="min-h-screen bg-gray-100 py-6 px-4 flex flex-col items-center">
      <header className="w-full max-w-3xl text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">⏳ التذكيرات</h1>
      </header>
  
      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={() => setView("entretien")}
          className={`px-4 py-2 rounded-md ${view === "entretien" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"}`}
        >
          🔧 الصيانة
        </button>
        <button
          onClick={() => setView("contracts")}
          className={`px-4 py-2 rounded-md ${view === "contracts" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"}`}
        >
          📜 العقود المستقبلية
        </button>
      </div>
  
      {view === "entretien" && (
  <div className="w-full max-w-3xl space-y-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="🔍 البحث عن السيارة"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border rounded-md shadow-md focus:outline-none focus:ring focus:ring-blue-300"
            />
        </div>
    {entretienList.filter(car => 
      car.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      car.mileage.toString().includes(searchQuery)
    ).length === 0 ? (
      <p className="text-gray-500 text-center text-lg">📭 لا توجد تذكيرات حالياً.</p>
    ) : (
      entretienList.filter(car => 
        car.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        car.mileage.toString().includes(searchQuery)
      ).map((car) => (
        <div
          key={car.id}
          onClick={() => router.push(`/ar/cars/${car.id}/entretien`)}
          className={`p-4 rounded-lg shadow-md border-l-4 cursor-pointer transition-all hover:shadow-lg active:scale-95 ${getCardStyle(car)}`}
        >
          {/* 🚗 معلومات السيارة */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">{car.name || "🚘 سيارة غير معروفة"}</h2>
            <span className="text-sm text-gray-500">📏 {car.mileage} كم</span>
          </div>

          {/* 🔧 مهام الصيانة */}
          <div className="mt-3 text-sm space-y-2">
            {["vidange", "bougie", "filtreHuile", "filtreAir"].map((task) =>
              car[task] ? (
                <div key={task} className="flex justify-between items-center">
                  <span>
                    {task === "vidange" ? "🛢️ تغيير الزيت" :
                      task === "bougie" ? "⚡ شموع الإشعال" :
                      task === "filtreHuile" ? "🛠️ فلتر الزيت" :
                      "🌬️ فلتر الهواء"}
                  </span>
                  <span className={formatRemainingKm(car[task].remaining, car[task].nextMaintenanceKm).class}>
                    {formatRemainingKm(car[task].remaining, car[task].nextMaintenanceKm).text}
                  </span>
                </div>
              ) : null
            )}
          </div>

          {/* 📅 صيانة تستند إلى التاريخ */}
          <div className="mt-3 border-t pt-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span>📅 الفحص الفني</span>
              <span className={getDateStyle(car.daysUntilVisite, car.nextVisiteDate).class}>
                {getDateStyle(car.daysUntilVisite, car.nextVisiteDate).text}
              </span>
            </div>
            <div className="flex justify-between">
              <span>🛡 التأمين</span>
              <span className={getDateStyle(car.daysUntilAssurance, car.nextAssuranceDate).class}>
                {getDateStyle(car.daysUntilAssurance, car.nextAssuranceDate).text}
              </span>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
)}


  
{view === "contracts" && (
  <div className="w-full max-w-3xl space-y-4 mt-6">

    {/* بحث */}
    <div className="flex justify-center mb-4">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="🔍 ابحث عن عقد"
        className="w-full max-w-xs px-4 py-2 border rounded-md shadow-md focus:outline-none focus:ring focus:ring-blue-300"
      />
    </div>

    {contractList.length === 0 ? (
      <p className="text-gray-500 text-center text-lg">📭 لا توجد عقود مستقبلية.</p>
    ) : (
      contractList
        .filter((contract) =>
          contract.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contract.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contract.carModel.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((contract) => (
          <div
            key={contract._id}
            onClick={() => router.push(`/ar/cars/${contract.carId}/contracts/${contract._id}`)} // ✅ Navigate on click
            className="p-4 rounded-lg shadow-md border-l-4 border-blue-500 bg-blue-100 transition-all hover:shadow-lg cursor-pointer active:scale-95"
          >
            <h2 className="text-lg font-semibold text-gray-900">{contract.customerName}</h2>
            <p className="text-gray-700">🚗 السيارة: <strong>{contract.carName || "غير معروف"}</strong></p>
            <p className="text-gray-700">🚘 الموديل: <strong>{contract.carModel || "N/A"}</strong></p>
            <p className="text-gray-700">📅 البداية: <strong>{new Date(contract.rentalStartDate).toLocaleDateString("fr-FR")}</strong></p>
            <p className="text-gray-700">📅 النهاية: <strong>{new Date(contract.rentalEndDate).toLocaleDateString("fr-FR")}</strong></p>
          </div>
        ))
    )}
  </div>
)}

    </div>
  );
}
