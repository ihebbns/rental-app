import connectDB from '@/lib/db';
import Entretien from '@/models/Entretien';
import { NextResponse } from "next/server";

export async function GET(req, context) {
  await connectDB();

  // ✅ Correct way to extract `id` from dynamic params in Next.js App Router
  const { params } = context;
  const id = params?.id;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Car ID is required' }), { status: 400 });
  }

  try {
    const entretien = await Entretien.findOne({ carId: id }).select('vidange bougie filtreHuile filtreAir autreEntretien visiteTechnique assurance');
    if (!entretien) {
      return new Response(JSON.stringify({ error: 'Maintenance record not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(entretien), { status: 200 });
  } catch (error) {
    console.error('Error fetching entretien:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch entretien' }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await connectDB();

  if (!params || !params.id) {
    return NextResponse.json({ error: 'Car ID is required' }, { status: 400 });
  }

  const { id: carId } = params;
  const { type, lastMileage, duration } = await req.json(); // ✅ Get `lastMileage` and `duration`

  try {
    const entretien = await Entretien.findOne({ carId });

    if (!entretien) {
      return NextResponse.json({ error: 'Entretien record not found' }, { status: 404 });
    }

    console.log(`🔄 Updating ${type} for carId: ${carId} with lastMileage: ${lastMileage} or duration: ${duration}`);

    // 🚗 **Update Kilometer-Based Maintenance**
    if (['vidange', 'bougie', 'filtreHuile', 'filtreAir'].includes(type) && lastMileage) {
      entretien[type].lastMaintenanceKm = lastMileage;
      entretien[type].nextDueKm = lastMileage + (entretien[type].intervalKm || 0);
    } 

    // 📅 **Update Date-Based Maintenance**
    if (type === 'assurance' || type === 'visiteTechnique') {
      let nextDate = new Date();
      
      // Use stored intervale instead of manually passing `duration`
      const intervale = entretien[type]?.intervale || '1an';
    
      if (intervale === '6mois') {
        nextDate.setMonth(nextDate.getMonth() + 6);
      } else {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    
      entretien[type].date = new Date();
      entretien[type].next = nextDate;
    }
    
    await entretien.save();
    console.log(`✅ Updated ${type}:`, entretien[type]);
    
    return NextResponse.json(entretien, { status: 200 });

  } catch (error) {
    console.error('❌ Error updating entretien:', error);
    return NextResponse.json({ error: 'Failed to update entretien' }, { status: 500 });
  }
}
export async function DELETE(req, context) {
  await connectDB();

  const { params } = context;
  const id = params?.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Maintenance ID is required' }), { status: 400 });
  }

  try {
    const deletedEntretien = await Entretien.findByIdAndDelete(id);
    if (!deletedEntretien) {
      return new Response(JSON.stringify({ error: 'Maintenance record not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Maintenance record deleted' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting entretien:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete entretien' }), { status: 500 });
  }
}
