import connectDB from '@/lib/db'; // Your database connection helper
import Entretien from '@/models/Entretien'; // The Entretien model
import Car from '@/models/Car'; // The Car model
import { NextResponse } from 'next/server';

// Handle GET requests for fetching all maintenance records or a specific car's maintenance


export async function POST(req) {
  await connectDB();

  try {
    const { carId, vidange, bougie, filtreHuile, filtreAir, autreEntretien, visiteTechnique, assurance } = await req.json();

    console.log(`📥 Received Data:`, { carId, vidange, bougie, filtreHuile, filtreAir });

    if (!carId || !vidange || !bougie || !filtreHuile || !filtreAir) {
      console.log('❌ Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const car = await Car.findById(carId);
    if (!car || car.mileage == null) {
      console.log(`❌ Car not found or mileage is missing: ${carId}`);
      return new Response(JSON.stringify({ error: 'Car not found or missing mileage' }), { status: 404 });
    }

    console.log(`🚗 Car Mileage: ${car.mileage}`);

    const maintenanceData = {
      carId,
      vidange: {
        intervalKm: vidange?.interval || 0,
        lastMaintenanceKm: vidange?.lastMaintenanceKm || car.mileage,
        nextDueKm: Math.max(car.mileage + (vidange?.interval || 0), car.mileage)
      },
      bougie: {
        intervalKm: bougie?.interval || 0,
        lastMaintenanceKm: bougie?.lastMaintenanceKm || car.mileage,
        nextDueKm: Math.max(car.mileage + (bougie?.interval || 0), car.mileage)
      },
      filtreHuile: {
        intervalKm: filtreHuile?.interval || 0,
        lastMaintenanceKm: filtreHuile?.lastMaintenanceKm || car.mileage,
        nextDueKm: Math.max(car.mileage + (filtreHuile?.interval || 0), car.mileage)
      },
      filtreAir: {
        intervalKm: filtreAir?.interval || 0,
        lastMaintenanceKm: filtreAir?.lastMaintenanceKm || car.mileage,
        nextDueKm: Math.max(car.mileage + (filtreAir?.interval || 0), car.mileage)
      },
      autreEntretien,
      visiteTechnique: {
        date: visiteTechnique?.date || new Date(),
        next: visiteTechnique?.next || new Date(),
        intervale: visiteTechnique?.intervale || '1an',
      },
      assurance: {
        date: assurance?.date || new Date(),
        next: assurance?.next || new Date(),
        intervale: assurance?.intervale || '1an',
      },
      
    };

    console.log(`📤 Sending Data to Database:`, maintenanceData);

    const maintenance = await Entretien.findOneAndUpdate(
      { carId },
      maintenanceData,
      { upsert: true, new: true }
    );

    console.log(`✅ Maintenance record saved successfully:`, maintenance);
    return new Response(JSON.stringify(maintenance), { status: 201 });
  } catch (error) {
    console.error('❌ Error saving maintenance record:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save maintenance record' }),
      { status: 500 }
    );
  }
}
export async function GET(req) {
  await connectDB(); // Connect to the database

  const { searchParams } = new URL(req.url);
  const carId = searchParams.get('carId');  // Check for carId in query params

  try {
    if (carId) {
      // If carId is provided, fetch a single maintenance record for that car
      const maintenance = await Entretien.findOne({ carId });

      if (!maintenance) {
        return new NextResponse(JSON.stringify({ error: 'Maintenance record not found for this car' }), { status: 404 });
      }

      return new NextResponse(JSON.stringify(maintenance), { status: 200 });
    } else {
      // If no carId is provided, fetch all maintenance records
      const maintenance = await Entretien.find().populate('carId');  // Populate to include car details

      // If no records are found, return a 404 response
      if (!maintenance || maintenance.length === 0) {
        return new NextResponse(JSON.stringify({ error: 'No maintenance records found' }), { status: 404 });
      }

      // Map the data to add the required fields to the response
      const maintenanceData = maintenance.map((entretien) => {
        const car = entretien.carId;
        const nextVisiteDate = entretien.visiteTechnique?.next || null;
        const nextAssuranceDate = entretien.assurance?.next || null;
        
        // Calculate days until the next maintenance or insurance date
        const daysUntilVisite = nextVisiteDate ? Math.ceil((new Date(nextVisiteDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
        const daysUntilAssurance = nextAssuranceDate ? Math.ceil((new Date(nextAssuranceDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;

        // Calculate remaining kilometers for each task
        const calculateRemainingKm = (lastMaintenanceKm, intervalKm) => {
          return lastMaintenanceKm + intervalKm - car.mileage;
        };

        // Return the formatted data for the frontend
        return {
          id: car._id,  // Car ID
          name: car.name,  // Car name
          mileage: car.mileage,  // Car mileage
          vidange: {
            remaining: calculateRemainingKm(entretien.vidange.lastMaintenanceKm, entretien.vidange.intervalKm),
            nextMaintenanceKm: entretien.vidange.lastMaintenanceKm + entretien.vidange.intervalKm,
          },  // Vidange maintenance info
          bougie: {
            remaining: calculateRemainingKm(entretien.bougie.lastMaintenanceKm, entretien.bougie.intervalKm),
            nextMaintenanceKm: entretien.bougie.lastMaintenanceKm + entretien.bougie.intervalKm,
          },  // Bougie maintenance info
          filtreHuile: {
            remaining: calculateRemainingKm(entretien.filtreHuile.lastMaintenanceKm, entretien.filtreHuile.intervalKm),
            nextMaintenanceKm: entretien.filtreHuile.lastMaintenanceKm + entretien.filtreHuile.intervalKm,
          },  // FiltreHuile maintenance info
          filtreAir: {
            remaining: calculateRemainingKm(entretien.filtreAir.lastMaintenanceKm, entretien.filtreAir.intervalKm),
            nextMaintenanceKm: entretien.filtreAir.lastMaintenanceKm + entretien.filtreAir.intervalKm,
          },  // FiltreAir maintenance info
          autreEntretien: entretien.autreEntretien,  // Other maintenance
          nextVisiteDate,  // Next Visite Date
          nextAssuranceDate,  // Next Assurance Date
          daysUntilVisite,
          daysUntilAssurance,
        };
      });

      return new NextResponse(JSON.stringify(maintenanceData), { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching entretien:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch entretien records' }), { status: 500 });
  }
}





// Handle PUT requests to update a maintenance record
export async function PUT(req) {
  await connectDB(); // Establish the database connection

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id'); // Get `id` from query params

  if (!id) {
    return new NextResponse(JSON.stringify({ error: 'Car ID is required' }), { status: 400 });
  }

  const { type, value, next } = await req.json(); // Get the fields to update

  try {
    const car = await Car.findById(id);
    if (!car) {
      return new NextResponse(JSON.stringify({ error: 'Car not found' }), { status: 404 });
    }

    let entretien = await Entretien.findOne({ carId: id });
    if (!entretien) {
      return new NextResponse(JSON.stringify({ error: 'Maintenance record not found' }), { status: 404 });
    }

    if (type === 'autreEntretien') {
      entretien.autreEntretien = value;
    }

    if (type === 'visiteTechnique' || type === 'assurance') {
      const nextDate = next ? new Date(next) : new Date();
      entretien[type].next = nextDate;
    }

    await entretien.save();

    return new NextResponse(JSON.stringify(entretien), { status: 200 });
  } catch (error) {
    console.error('Error updating entretien:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update entretien' }), { status: 500 });
  }
}
