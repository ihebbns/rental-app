import connectDB from "@/lib/db";
import Contract from "@/models/Contract";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = params; // Contract ID

  try {
    const contract = await Contract.findById(id);
    if (!contract) {
      return new Response(JSON.stringify({ error: "Contract not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ photos: contract.photos || [] }), { status: 200 });
  } catch (error) {
    console.error("Error fetching contract photos:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch photos" }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;
  const formData = await req.formData();

  try {
    const contract = await Contract.findById(id);
    if (!contract) {
      return new Response(JSON.stringify({ error: "Contract not found" }), { status: 404 });
    }

    // Met à jour la photo principale
    const contractPhoto = formData.get("contractPhoto");
    if (contractPhoto) {
      contract.photos[0] = `/uploads/${contractPhoto.name}`; // Assure-toi que c'est bien stocké dans /uploads/
    }

    // Ajoute de nouvelles photos
    const newPhotos = formData.getAll("photos");
    if (newPhotos.length > 0) {
      const newPhotoUrls = newPhotos.map((photo) => `/uploads/${photo.name}`);
      contract.photos = [...contract.photos, ...newPhotoUrls];
    }

    // Supprime les photos demandées
    const deletedPhotos = JSON.parse(formData.get("deletedPhotos") || "[]");
    contract.photos = contract.photos.filter((photo) => !deletedPhotos.includes(photo));

    await contract.save();

    return new Response(JSON.stringify({ message: "Contract updated", photos: contract.photos }), { status: 200 });
  } catch (error) {
    console.error("Update error:", error);
    return new Response(JSON.stringify({ error: "Failed to update contract" }), { status: 500 });
  }
}



export async function POST(req, { params }) {
  await connectDB();
  const { id } = params;
  const formData = await req.formData();
  const photos = formData.getAll("photos"); // Get uploaded photos

  try {
    const contract = await Contract.findById(id);
    if (!contract) {
      return new Response(JSON.stringify({ error: "Contract not found" }), { status: 404 });
    }

    if (contract.status !== "active") {
      return new Response(JSON.stringify({ error: "Only active contracts can add photos." }), { status: 403 });
    }

    const photoUrls = photos.map(photo => `/uploads/${photo.name}`); // Replace with actual storage logic
    contract.photos = contract.photos ? [...contract.photos, ...photoUrls] : photoUrls;
    await contract.save();

    return new Response(JSON.stringify({ message: "Photos added successfully", photos: contract.photos }), { status: 200 });
  } catch (error) {
    console.error("Error adding photos:", error);
    return new Response(JSON.stringify({ error: "Failed to add photos" }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  const { id } = params;
  const { photoUrl } = await req.json(); // Extract photo URL from request body

  try {
    const contract = await Contract.findById(id);
    if (!contract) {
      return new Response(JSON.stringify({ error: "Contract not found" }), { status: 404 });
    }

    contract.photos = contract.photos.filter((photo) => photo !== photoUrl);
    await contract.save();

    return new Response(JSON.stringify({ message: "Photo deleted successfully", photos: contract.photos }), { status: 200 });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return new Response(JSON.stringify({ error: "Failed to delete photo" }), { status: 500 });
  }
}
