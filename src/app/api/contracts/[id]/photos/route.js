import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import cloudinary from "@/lib/cloudinary"; // 📌 Import de Cloudinary

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

    if (contract.status === "archived") {
      return new Response(JSON.stringify({ error: "Cannot add photos to an archived contract." }), { status: 400 });
    }

    // ✅ Met à jour la photo principale (Cloudinary)
    const contractPhoto = formData.get("contractPhoto");
    if (contractPhoto) {
      const uploadedPhoto = await uploadToCloudinary(contractPhoto);
      if (uploadedPhoto) {
        contract.photos[0] = uploadedPhoto;
      }
    }

    // ✅ Ajoute de nouvelles photos (Cloudinary)
    const newPhotos = formData.getAll("photos");
    if (newPhotos.length > 0) {
      const uploadedPhotos = await Promise.all(newPhotos.map(uploadToCloudinary));
      contract.photos = [...contract.photos, ...uploadedPhotos.filter(Boolean)];
    }

    // ✅ Supprime les photos demandées (Cloudinary)
    const deletedPhotos = JSON.parse(formData.get("deletedPhotos") || "[]");
    if (deletedPhotos.length > 0) {
      await Promise.all(deletedPhotos.map(deleteFromCloudinary));
      contract.photos = contract.photos.filter((photo) => !deletedPhotos.includes(photo));
    }

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
  const photos = formData.getAll("photos");

  try {
    const contract = await Contract.findById(id);
    if (!contract) {
      return new Response(JSON.stringify({ error: "Contract not found" }), { status: 404 });
    }

    if (contract.status === "archived") {
      return new Response(JSON.stringify({ error: "Cannot add photos to an archived contract." }), { status: 400 });
    }

    if (contract.status !== "active" && contract.status !== "pending_return") {
      return new Response(JSON.stringify({ error: "Only active or pending_return contracts can add photos." }), { status: 403 });
    }

    const uploadedPhotos = await Promise.all(photos.map(uploadToCloudinary));
    contract.photos = contract.photos ? [...contract.photos, ...uploadedPhotos.filter(Boolean)] : uploadedPhotos;

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

    if (contract.status === "archived") {
      // Keep only the contract photo
      contract.photos = contract.photos.filter((_, index) => index === contract.contractImageIndex);
      await contract.save();
      return new Response(JSON.stringify({ message: "Archived contract photos updated", photos: contract.photos }), { status: 200 });
    }

    await deleteFromCloudinary(photoUrl);
    contract.photos = contract.photos.filter((photo) => photo !== photoUrl);
    await contract.save();

    return new Response(JSON.stringify({ message: "Photo deleted successfully", photos: contract.photos }), { status: 200 });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return new Response(JSON.stringify({ error: "Failed to delete photo" }), { status: 500 });
  }
}

// ✅ Fonction d'upload vers Cloudinary
async function uploadToCloudinary(photo) {
  try {
    const buffer = Buffer.from(await photo.arrayBuffer());
    const result = await cloudinary.v2.uploader.upload_stream(
      { folder: "contracts" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return null;
        }
        return result.secure_url;
      }
    );
    result.end(buffer);
    return new Promise((resolve) => result.on("finish", () => resolve(result.secure_url)));
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
}

// ✅ Fonction de suppression de Cloudinary
async function deleteFromCloudinary(url) {
  try {
    const publicId = extractPublicId(url);
    if (publicId) {
      await cloudinary.v2.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }
}


