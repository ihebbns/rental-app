import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Contract from '@/models/Contract';
import Car from '@/models/Car';

// ✅ Helper Function to Convert File to Base64
const fileToBase64 = async (file) => {
  const buffer = await file.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
};

// ✅ Automatically move expired contracts to "pending_return"
const updatePendingContracts = async () => {
  await Contract.updateMany(
    { rentalEndDate: { $lt: new Date() }, status: 'active' },
    { $set: { status: 'pending_return' } }
  );
};

export async function GET(req) {
  await connectDB();
  await updatePendingContracts(); // ✅ Automatically update expired contracts

  try {
    const url = new URL(req.url);
    const carId = url.searchParams.get('carId');
    const future = url.searchParams.get('future'); // Check if the request is for future contracts

    if (future === "true") {
      // ✅ Return only future contracts (reminder API)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const futureContracts = await Contract.find({
        rentalStartDate: { $gte: today } // ✅ Get only future contracts
      }).sort({ rentalStartDate: 1 });

      // ✅ Fetch car details for each contract
      const contractsWithCarDetails = await Promise.all(
        futureContracts.map(async (contract) => {
          try {
            const car = await Car.findById(contract.carId);
            return {
              ...contract.toObject(),
              carName: car ? car.name : "Inconnue",
              carModel: car ? car.carModel : "N/A"
            };
          } catch (error) {
            console.error(`Erreur lors du chargement de la voiture (${contract.carId}):`, error);
            return { ...contract.toObject(), carName: "Inconnue", carModel: "N/A" };
          }
        })
      );

      return new Response(JSON.stringify(contractsWithCarDetails), { status: 200 });
    }

    if (!carId) {
      return new Response(JSON.stringify({ error: 'carId is required' }), { status: 400 });
    }

    // ✅ Fetch contracts for a specific car
    const contracts = await Contract.find({ carId }).sort({ rentalStartDate: -1 });
    return new Response(JSON.stringify(contracts), { status: 200 });

  } catch (error) {
    console.error('Error fetching contracts:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch contracts' }), { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();

  try {
    const formData = await req.formData();
    const customerName = formData.get('customerName');
    const rentalStartDate = new Date(formData.get('rentalStartDate'));
    const rentalEndDate = new Date(formData.get('rentalEndDate'));
    const carId = formData.get('carId');

    if (!customerName || !rentalStartDate || !rentalEndDate || !carId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // ✅ Convert Uploaded Photos to Base64
    const uploadedFiles = formData.getAll('photos');
    let base64Photos = [];

    for (const file of uploadedFiles) {
      const base64String = await fileToBase64(file);
      base64Photos.push(`data:${file.type};base64,${base64String}`);
    }

    // ✅ Determine contract status
    let status = rentalEndDate < new Date() ? 'pending_return' : 'active';

    // ✅ Save contract in MongoDB
    const contract = new Contract({
      carId,
      customerName,
      rentalStartDate,
      rentalEndDate,
      photos: base64Photos,
      status
    });

    await contract.save();

    return new Response(JSON.stringify(contract), { status: 201 });
  } catch (error) {
    console.error('Error creating contract:', error);
    return new Response(JSON.stringify({ error: 'Failed to create contract' }), { status: 500 });
  }
}

export async function DELETE(req) {
  await connectDB();

  try {
    const contractId = new URL(req.url).searchParams.get('contractId');
    if (!contractId) {
      return new Response(JSON.stringify({ error: 'contractId is required' }), { status: 400 });
    }

    await Contract.findByIdAndDelete(contractId);
    return new Response(JSON.stringify({ message: 'Contract deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete contract' }), { status: 500 });
  }
}

export async function PUT(req) {
  await connectDB();

  try {
    const contractId = new URL(req.url).searchParams.get('contractId');
    const { returnMileage, status } = await req.json();

    if (!contractId) {
      return new Response(JSON.stringify({ error: 'Contract ID is required' }), { status: 400 });
    }

    // Fetch the contract
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return new Response(JSON.stringify({ error: 'Contract not found' }), { status: 404 });
    }

    // Fetch the related car
    const car = await Car.findById(contract.carId);
    if (!car) {
      return new Response(JSON.stringify({ error: 'Car not found' }), { status: 404 });
    }

    // ✅ Add return mileage to existing car mileage
    if (returnMileage) {
      car.mileage = returnMileage ; 
      await car.save();
      contract.returnMileage = returnMileage;
    }

 // ✅ Update contract status to "archived"
 if (status) {
  contract.status = status;
}

    await contract.save();

    return new Response(JSON.stringify(contract), { status: 200 });
  } catch (error) {
    console.error('Error updating contract:', error);
    return new Response(JSON.stringify({ error: 'Failed to update contract' }), { status: 500 });
  }
}
