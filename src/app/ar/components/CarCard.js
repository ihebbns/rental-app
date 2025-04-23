// src/components/CarCard.js
import Image from "next/image";

export default function CarCard({ car }) {
    const handleDelete = async () => {
      try {
        const response = await fetch(`/api/cars?carId=${car.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          alert("Car deleted successfully");
          window.location.reload(); // Reload to fetch updated data
        } else {
          alert("Failed to delete car");
        }
      } catch (error) {
        console.error("Error deleting car:", error);
      }
    };
  
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
  <Image
        src={car.image}
        alt={car.name}
        width={300} // ✅ Set width
        height={160} // ✅ Set height
        className="w-full h-40 object-cover rounded-lg"
        priority // ✅ Ensures faster loading for important images
      />
        <div className="p-4">
          <h2 className="text-lg font-bold">{car.name}</h2>
          <p className="text-gray-600">Year: {car.year}</p>
          <p
            className={`text-sm font-semibold ${
              car.status === "Available" ? "text-green-500" : "text-red-500"
            }`}
          >
            Status: {car.status}
          </p>
          <div className="flex justify-between mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Contract
            </button>
          </div>
        </div>
      </div>
    );
  }
  