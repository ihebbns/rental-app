import connectDB from '@/lib/db';
import Contract from '@/models/Contract';

export async function GET(req, { params }) {
  await connectDB();

  const { id: carId } = params; // Car ID

  try {
    const activeContract = await Contract.findOne({
      carId,
      rentalEndDate: { $gte: new Date() }, // Ensure the rental end date is in the future or today
      isArchived: false, // Only include non-archived contracts
    }).sort({ rentalStartDate: -1 }); // Get the most recent contract

    if (!activeContract) {
      return new Response(JSON.stringify({ error: 'No active contract found' }), { status: 404 });
    }

    return new Response(JSON.stringify(activeContract), { status: 200 });
  } catch (error) {
    console.error('Error fetching active contract:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch active contract' }), { status: 500 });
  }
}
