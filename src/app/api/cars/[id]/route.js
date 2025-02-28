import connectDB from '@/lib/db';
import Car from '@/models/Car';
import Contract from '@/models/Contract';
import Entretien from '@/models/Entretien';


export async function GET(req, { params }) {
  await connectDB();

  const { id } = params; // Get the car ID from the URL

  try {
    const car = await Car.findById(id); // Fetch car by ID
    if (!car) {
      return new Response(JSON.stringify({ error: 'Car not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(car), { status: 200 });
  } catch (error) {
    console.error('Error fetching car:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch car' }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await connectDB();

  const { id } = params; // Get the car ID from the URL
  const updatedData = await req.json(); // Get updated data from the request body

  try {
    const updatedCar = await Car.findByIdAndUpdate(id, updatedData, { new: true }); // Update car
    if (!updatedCar) {
      return new Response(JSON.stringify({ error: 'Car not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedCar), { status: 200 });
  } catch (error) {
    console.error('Error updating car:', error);
    return new Response(JSON.stringify({ error: 'Failed to update car' }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();

  const { id } = params; // Get the car ID from the URL

  try {
    // ✅ Check if the car exists before deleting
    const car = await Car.findById(id);
    if (!car) {
      return new Response(JSON.stringify({ error: 'Car not found' }), { status: 404 });
    }

    // ✅ Delete all contracts linked to this car FIRST
    await Contract.deleteMany({ carId: id });

    // ✅ Delete all entretien (maintenance records) linked to this car SECOND
    await Entretien.deleteMany({ carId: id });

    // ✅ Now delete the car LAST
    await Car.findByIdAndDelete(id);

    return new Response(JSON.stringify({ success: true, message: 'Car and related data deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting car:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete car' }), { status: 500 });
  }
}
