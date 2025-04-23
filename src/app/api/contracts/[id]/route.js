import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import Car from "@/models/Car";
import fs from "fs";
import path from "path";
import cloudinary from "@/lib/cloudinary"; // 📌 Import de Cloudinary


export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const contract = await Contract.findById(id);
    if (!contract) {
      return new Response(JSON.stringify({ error: "Contract not found" }), { status: 404 });
    }
    return new Response(JSON.stringify(contract), { status: 200 });
  } catch (error) {
    console.error("Error fetching contract:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch contract" }), { status: 500 });
  }
}


export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params; // Contract ID

  try {
    let returnMileage, status, contractPhoto, photos, deletedPhotos;
    
    // ✅ Detect content type and parse correctly
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      returnMileage = formData.get("returnMileage");
      status = formData.get("status");
      contractPhoto = formData.get("contractPhoto");
      photos = formData.getAll("photos");
      deletedPhotos = JSON.parse(formData.get("deletedPhotos") || "[]");
    } else {
      const body = await req.json();
      returnMileage = body.returnMileage;
      status = body.status;
      deletedPhotos = body.deletedPhotos || [];
      photos = [];
    }

    const contract = await Contract.findById(id);
    if (!contract) {
      return new Response(JSON.stringify({ error: "Contract not found" }), { status: 404 });
    }

    // Fetch the associated car
    const car = await Car.findById(contract.carId);
    if (!car) {
      return new Response(JSON.stringify({ error: "Car not found" }), { status: 404 });
    }

    // Validate return mileage against car mileage
    if (returnMileage && returnMileage < car.mileage) {
      return new Response(
        JSON.stringify({ error: "Return mileage must be greater than or equal to the car's current mileage." }),
        { status: 400 }
      );
    }

    // Proceed with updating mileage if valid
    if (returnMileage && returnMileage >= car.mileage) {
      car.mileage = returnMileage;
      await car.save();
      contract.returnMileage = returnMileage;
    }

    // ✅ Update contract status
    if (status) {
      contract.status = status;
    }

    // ✅ Supprimer les photos supprimées de Cloudinary
    if (deletedPhotos.length > 0) {
      contract.photos = contract.photos.filter(photo => !deletedPhotos.includes(photo));

      await Promise.all(deletedPhotos.map(async (photoUrl) => {
        const publicId = extractPublicId(photoUrl);
        if (publicId) {
          await cloudinary.v2.uploader.destroy(publicId);
        }
      }));
    }

    // ✅ Upload contract photo and replace the first photo
    if (contractPhoto && contractPhoto.size > 0) {
      const contractPhotoUrl = await uploadToCloudinary(contractPhoto);

      if (contract.photos.length > 0) {
        contract.photos[0] = contractPhotoUrl;
      } else {
        contract.photos.push(contractPhotoUrl);
      }
    }

    // ✅ Upload new additional photos
    if (photos.length > 0) {
      const photoUrls = await Promise.all(photos.map(uploadToCloudinary));
      contract.photos = [...contract.photos, ...photoUrls];
    }

    await contract.save();
    return new Response(JSON.stringify(contract), { status: 200 });
  } catch (error) {
    console.error("Error updating contract:", error);
    return new Response(JSON.stringify({ error: "Failed to update contract" }), { status: 500 });
  }
}

async function uploadToCloudinary(file) {
  try {
    // Convertir le fichier en base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload sur Cloudinary avec optimisation
    const response = await cloudinary.v2.uploader.upload(base64String, {
      folder: "contracts",
      resource_type: "auto", // Supporte images + PDF
      quality: "auto", // Compression automatique
      fetch_format: "auto", // Convertit en format optimal (ex: WebP pour iPhone)
    });

    return response.secure_url;
  } catch (error) {
    console.error("Erreur Cloudinary:", error);
    throw new Error("Upload échoué");
  }
}

// ✅ Fonction pour extraire le `public_id` depuis une URL Cloudinary
function extractPublicId(url) {
  const match = url.match(/\/contracts\/([^/]+)\.[a-z]+$/);
  return match ? `contracts/${match[1]}` : null;
}







export async function DELETE(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const contract = await Contract.findById(id);
    if (!contract) {
      return new Response(JSON.stringify({ success: false, message: "Contract not found" }), { status: 404 });
    }

    // ✅ Supprimer la photo du contrat (s'il y en a une)
    if (contract.photos && contract.photos.length > 0) {
      await Promise.all(
        contract.photos.map(async (photoUrl) => {
          const publicId = extractPublicId(photoUrl);
          if (publicId) {
            await cloudinary.v2.uploader.destroy(publicId);
          }
        })
      );
    }

    // ✅ Supprimer le contrat après suppression des photos
    await Contract.findByIdAndDelete(id);

    return new Response(JSON.stringify({ success: true, message: "Contract deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting contract:", error);
    return new Response(JSON.stringify({ success: false, message: "Failed to delete contract" }), { status: 500 });
  }
}


