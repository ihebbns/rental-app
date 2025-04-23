'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddEditMaintenancePage({ params }) {
  const { id: carId } = params;
  const [formData, setFormData] = useState({
    vidange: { interval: 0, lastMaintenanceKm: 0 },
    bougie: { interval: 0, lastMaintenanceKm: 0 },
    filtreHuile: { interval: 0, lastMaintenanceKm: 0 },
    filtreAir: { interval: 0, lastMaintenanceKm: 0 },
    autreEntretien: '',
    visiteTechnique: {  next: '' },
    assurance: { next: '' },
  });

  const [error, setError] = useState('');
  const router = useRouter();
  const [carMileage, setCarMileage] = useState(0);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const response = await fetch(`/api/entretien?carId=${carId}`);
        if (response.ok) {
          const data = await response.json();
          setCarMileage(data.carMileage || 0);
          setFormData({
            vidange: { interval: data.vidange?.intervalKm ?? 0, lastMaintenanceKm: data.vidange?.lastMaintenanceKm ?? 0 },
            bougie: { interval: data.bougie?.intervalKm ?? 0, lastMaintenanceKm: data.bougie?.lastMaintenanceKm ?? 0 },
            filtreHuile: { interval: data.filtreHuile?.intervalKm ?? 0, lastMaintenanceKm: data.filtreHuile?.lastMaintenanceKm ?? 0 },
            filtreAir: { interval: data.filtreAir?.intervalKm ?? 0, lastMaintenanceKm: data.filtreAir?.lastMaintenanceKm ?? 0 },
            autreEntretien: data.autreEntretien || '',
            visiteTechnique: {
 
              next: data.visiteTechnique?.next ? new Date(data.visiteTechnique.next).toISOString().split('T')[0] : '',
            },
            assurance: {
              next: data.assurance?.next ? new Date(data.assurance.next).toISOString().split('T')[0] : '',
            },
          });
        } else {
          throw new Error('فشل في جلب بيانات الصيانة');
        }
      } catch (err) {
        console.error("❌ خطأ أثناء الجلب:", err.message);
      }
    };

    fetchMaintenance();
  }, [carId]);

  const handleUpdateLastMaintenance = async (task) => {
    try {
      const response = await fetch(`/api/cars/${carId}`);
      if (response.ok) {
        const data = await response.json();
        const latestMileage = data.mileage || 0;
  
        // Debug: Log the task and latestMileage
        console.log(`Updating ${task} with latest mileage: ${latestMileage}`);
  
        setFormData((prevFormData) => ({
          ...prevFormData,
          [task]: { ...prevFormData[task], lastMaintenanceKm: latestMileage },
        }));
      } else {
        throw new Error("Failed to fetch latest mileage");
      }
    } catch (error) {
      console.error("❌ Error fetching latest mileage:", error.message);
    }
  };

  const handleDateChange = (e, field) => {
    const newDate = e.target.value;
    let nextDate = new Date(newDate);

    if (formData[field].intervale === "6mois") {
      nextDate.setMonth(nextDate.getMonth() + 6);
    } else {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: {
        ...prevFormData[field],
        date: newDate,
        next: nextDate.toISOString().split("T")[0],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/entretien', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, carId }),
    });

    if (response.ok) {
      router.push(`/ar/cars/${carId}/entretien`);
    } else {
      const data = await response.json();
      setError(data.error || "فشل في حفظ بيانات الصيانة");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right">
      <h1 className="text-2xl font-bold text-gray-700 mb-6 text-center">🛠 صيانة السيارة</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
  {['vidange', 'bougie', 'filtreHuile', 'filtreAir'].map((task) => {
    let emoji;
    let taskName;

    // Define emojis and task names based on the task type
    switch (task) {
      case 'vidange':
        emoji = "🛢️"; // Vidange emoji
        taskName = "تغيير الزيت";
        break;
      case 'bougie':
        emoji = "⚡"; // Bougie (Spark Plugs) emoji
        taskName = "شموع الإشعال";
        break;
      case 'filtreHuile':
        emoji = "🛠️"; // Filtre Huile (Oil Filter) emoji
        taskName = "فلتر الزيت";
        break;
      case 'filtreAir':
        emoji = "🌬️"; // Filtre Air (Air Filter) emoji
        taskName = "فلتر الهواء";
        break;
      default:
        emoji = "⚙️"; // Default emoji if not found
        taskName = "صيانة غير محددة";
    }

    return (
      <div className="mb-4" key={task}>
        <label className="text-gray-700 mb-2 flex items-center gap-2">
          <span role="img" aria-label={taskName}>{emoji}</span> {taskName}
        </label>
        <div className="grid grid-cols-2 gap-4">
          {/* إدخال الفاصل الزمني */}
          <input
            type="number"
            value={formData[task].interval}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              [task]: { ...prev[task], interval: Number(e.target.value) },
            }))}
            placeholder="الفاصل الزمني (KM)"
            required
            className="w-full px-4 py-2 border rounded-md text-right"
          />

          {/* إدخال الكيلومترات الأخيرة للصيانة */}
          <div className="flex items-center">
            <input
              type="number"
              value={formData[task].lastMaintenanceKm}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                [task]: { ...prev[task], lastMaintenanceKm: Number(e.target.value) },
              }))}
              placeholder="آخر صيانة (KM)"
              required
              className="w-full px-4 py-2 border rounded-md text-right"
            />

            {/* Update button */}
            <button
              type="button"
              onClick={() => handleUpdateLastMaintenance(task)}
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold py-1 px-3 rounded"
            >
              🔄
            </button>
          </div>
        </div>
      </div>
    );
  })}


        {/* قسم الفحص الفني */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-4">📅 الفحص الفني</label>
          <input
            type="date"
            value={formData.visiteTechnique.next}
            onChange={(e) => handleDateChange(e, "visiteTechnique")}
            className="w-full px-4 py-2 border rounded-md text-right"
          />
        </div>

        {/* قسم التأمين */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-4">🛡 التأمين</label>
          <input
            type="date"
            value={formData.assurance.next}
            onChange={(e) => handleDateChange(e, "assurance")}
            className="w-full px-4 py-2 border rounded-md text-right"
          />
        </div>

        {/* قسم ملاحظات أخرى */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-4">📝 ملاحظات أخرى</label>
          <textarea
            value={formData.autreEntretien}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              autreEntretien: e.target.value,
            }))}
            placeholder="أضف ملاحظات حول صيانة أخرى..."
            className="w-full px-4 py-2 border rounded-md text-right"
            rows="3"
          />
        </div>

        <button type="submit" className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600">
          ✅ حفظ الإعدادات
        </button>
      </form>
    </div>
  );
}
