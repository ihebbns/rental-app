"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

export default function CarContractsPage({ params }) {
  const { id: carId } = params;
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch(`/api/contracts?carId=${carId}`);
        if (!response.ok) {
          throw new Error("فشل تحميل العقود");
        }
        const data = await response.json();

        // ترتيب العقود حسب تاريخ بدء الإيجار (الأحدث أولاً)
        data.sort((a, b) => new Date(b.rentalStartDate) - new Date(a.rentalStartDate));

        setContracts(data);
        setFilteredContracts(data);
      } catch (err) {
        console.error(err.message);
        setError(err.message || "تعذر تحميل العقود.");
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [carId]);

  // 🔹 تصفية العقود ديناميكياً
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    let updatedContracts = [...contracts];

    if (newFilter === "active") {
      updatedContracts = updatedContracts.filter((contract) => contract.status === "active");
    } else if (newFilter === "pending_return") {
      updatedContracts = updatedContracts.filter((contract) => contract.status === "pending_return");
    } else if (newFilter === "archived") {
      updatedContracts = updatedContracts.filter((contract) => contract.status === "archived");
    }

    if (searchQuery) {
      updatedContracts = updatedContracts.filter((contract) =>
        contract.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredContracts(updatedContracts);
  };

  // 🔹 البحث في العقود
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    let updatedContracts = contracts.filter((contract) =>
      contract.customerName.toLowerCase().includes(query)
    );

    if (filter === "active") {
      updatedContracts = updatedContracts.filter((contract) => contract.status === "active");
    } else if (filter === "pending_return") {
      updatedContracts = updatedContracts.filter((contract) => contract.status === "pending_return");
    } else if (filter === "archived") {
      updatedContracts = updatedContracts.filter((contract) => contract.status === "archived");
    }

    setFilteredContracts(updatedContracts);
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
    <div className="min-h-screen bg-gray-100 p-6 text-right">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">📜 عقود الإيجار</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* زر إضافة عقد */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => router.push(`/ar/cars/${carId}/contracts/add`)}
          className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-600 transition"
        >
          <PlusCircleIcon className="h-5 w-5" />
          إضافة عقد
        </button>
      </div>

      {/* الفلاتر والبحث */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex gap-2">
          <button onClick={() => handleFilterChange("all")} className={`px-3 py-1 rounded-md text-xs sm:text-sm ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
            الكل
          </button>
          <button onClick={() => handleFilterChange("active")} className={`px-3 py-1 rounded-md text-xs sm:text-sm ${filter === "active" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800"}`}>
            نشط
          </button>
          <button onClick={() => handleFilterChange("pending_return")} className={`px-3 py-1 rounded-md text-xs sm:text-sm ${filter === "pending_return" ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-800"}`}>
            في انتظار الإرجاع
          </button>
          <button onClick={() => handleFilterChange("archived")} className={`px-3 py-1 rounded-md text-xs sm:text-sm ${filter === "archived" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"}`}>
            مؤرشف
          </button>
        </div>
        <input
          type="text"
          placeholder="🔍 البحث عن عميل..."
          value={searchQuery}
          onChange={handleSearch}
          className="px-3 py-1 border rounded-md text-sm w-full sm:w-auto text-right"
        />
      </div>

      {/* قائمة العقود */}
      {filteredContracts.length === 0 ? (
        <p className="text-gray-600 text-lg text-center">لم يتم العثور على أي عقود.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContracts.map((contract) => (
            <div 
              key={contract._id} 
              className="bg-white shadow-lg rounded-lg p-4 hover:shadow-xl transition cursor-pointer"
              onClick={() => router.push(`/ar/cars/${carId}/contracts/${contract._id}`)}
            >
              <h2 className="text-lg font-semibold text-gray-800">{contract.customerName}</h2>
              <p>
                تاريخ ووقت البداية: {new Date(contract.rentalStartDate).toLocaleString("ar")}
              </p>
              <p>
                تاريخ ووقت النهاية: {new Date(contract.rentalEndDate).toLocaleString("ar")}
              </p>

              <div className="mt-4 flex justify-center">
                <span className={`px-3 py-1 text-xs font-semibold rounded-md ${
                  contract.status === "archived" ? "bg-red-500 text-white" :
                  contract.status === "pending_return" ? "bg-yellow-500 text-white" : "bg-green-500 text-white"
                }`}>
                  {contract.status === "archived" ? "مؤرشف" : contract.status === "pending_return" ? "في انتظار الإرجاع" : "نشط"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
