import connectDB from "@/lib/db";
import Entretien from "@/models/Entretien";
import Car from "@/models/Car";

export async function GET(req) {
    await connectDB();
  
    const { searchParams } = new URL(req.url);
    const carId = searchParams.get('carId');
  
    try {
      const maintenance = await Entretien.find({ carId }); // Fetch all records for carId
  
      if (!maintenance || maintenance.length === 0) {
        return new Response(JSON.stringify({ error: 'Maintenance record not found' }), { status: 404 });
      }
  
      return new Response(JSON.stringify(maintenance), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch maintenance records' }), { status: 500 });
    }
  }
  
