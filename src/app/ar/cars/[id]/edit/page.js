"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditCarPage({ params }) {
  const { id } = params;
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    year: "",
    mileage: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await fetch(`/api/cars/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || "",
            model: data.model || "",
            year: data.year || "",
            mileage: data.mileage || "",
          });
        } else {
          setError("فشل تحميل تفاصيل السيارة.");
        }
      } catch (err) {
        setError("حدث خطأ أثناء تحميل تفاصيل السيارة.");
      }
    };

    fetchCar();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/cars/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/ar"); // ✅ إعادة التوجيه إلى قائمة السيارات
      } else {
        setError("فشل تحديث بيانات السيارة.");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تحديث بيانات السيارة.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-6">
        ✏️ تعديل بيانات السيارة
      </h1>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg"
      >
        {/* اسم السيارة */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            📌 اسم السيارة
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-right"
          />
        </div>

        {/* الموديل */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            🚘 السلسلة
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-right"
          />
        </div>

        {/* السنة */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            📅 سنة الصنع
          </label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            min="1900"
            max={new Date().getFullYear()}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-right"
          />
        </div>

        {/* المسافة المقطوعة */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            📏 المسافة المقطوعة (كم)
          </label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-right"
          />
        </div>

        {/* زر الحفظ */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition"
        >
          💾 حفظ التعديلات
        </button>
      </form>
    </div>
  );
}
