import connectDB from '@/lib/db';
import Car from '@/models/Car';
import Contract from '@/models/Contract';


export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const model = searchParams.get('model'); // Extract the model from query params

  try {
    if (model) {
      // Check if the model exists in the database
      const existingCar = await Car.findOne({ model });

      return new Response(JSON.stringify({ exists: !!existingCar }), { status: 200 });
    }

    // Existing logic to fetch all cars
    const cars = await Car.find();
    const now = new Date();

    const updatedCars = await Promise.all(
      cars.map(async (car) => {
        const activeContract = await Contract.findOne({
          carId: car._id,
          rentalStartDate: { $lte: now },
          rentalEndDate: { $gte: now },
        });

        const isAvailable = !activeContract;
        const status = isAvailable ? 'Available' : 'Rented';

        await Car.findByIdAndUpdate(car._id, { isAvailable, status });

        return {
          ...car._doc,
          isAvailable,
          status,
        };
      })
    );

    return new Response(JSON.stringify(updatedCars), { status: 200 });
  } catch (error) {
    console.error('Error fetching cars:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch cars' }), { status: 500 });
  }
}


export async function POST(req) {
  await connectDB();

  const carData = await req.json();

  try {
    // Set default status and isAvailable if not provided
    carData.status = carData.status || 'Available';
    carData.isAvailable = carData.isAvailable ?? true;

    const newCar = await Car.create(carData); // Create a new car
    return new Response(JSON.stringify(newCar), { status: 201 });
  } catch (error) {
    console.error('Error adding car:', error);
    return new Response(JSON.stringify({ error: 'Failed to add car' }), { status: 500 });
  }
}
