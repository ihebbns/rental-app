import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import Car from "@/models/Car";
import fs from "fs";
import path from "path";

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

    // ✅ Add return mileage to the existing car mileage (instead of replacing)
    if (returnMileage && returnMileage>car.mileage) {
      car.mileage = returnMileage;
      await car.save(); // Save updated mileage
      contract.returnMileage = returnMileage;
    }

    // ✅ Update contract status
    if (status) {
      contract.status = status;
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ✅ Handle deleted photos
    if (deletedPhotos.length > 0) {
      contract.photos = contract.photos.filter(photo => !deletedPhotos.includes(photo));

      // Delete files from the filesystem
      deletedPhotos.forEach(photo => {
        const filePath = path.join(process.cwd(), "public", photo);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // ✅ Upload contract photo and replace the first photo
    if (contractPhoto && contractPhoto.size > 0) {
      const buffer = Buffer.from(await contractPhoto.arrayBuffer());
      const fileName = `${Date.now()}-${contractPhoto.name}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);
      const contractPhotoUrl = `/uploads/${fileName}`;

      if (contract.photos.length > 0) {
        contract.photos[0] = contractPhotoUrl;
      } else {
        contract.photos.push(contractPhotoUrl);
      }
    }

    // ✅ Upload new additional photos
    if (photos.length > 0) {
      const photoUrls = [];
      for (const photo of photos) {
        if (photo.size > 0) {
          const buffer = Buffer.from(await photo.arrayBuffer());
          const fileName = `${Date.now()}-${photo.name}`;
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, buffer);
          photoUrls.push(`/uploads/${fileName}`);
        }
      }
      contract.photos = [...contract.photos, ...photoUrls];
    }



    await contract.save();
    return new Response(JSON.stringify(contract), { status: 200 });
  } catch (error) {
    console.error("Error updating contract:", error);
    return new Response(JSON.stringify({ error: "Failed to update contract" }), { status: 500 });
  }
}







export async function DELETE(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const contract = await Contract.findById(id);
    if (!contract) {
      return new Response(JSON.stringify({ success: false, message: "Contract not found" }), { status: 404 });
    }

    // Remove contract photo
    if (contract.contractPhoto) {
      const photoPath = path.join(process.cwd(), "public", contract.contractPhoto);
      await fs.unlink(photoPath).catch(() => {}); // Ignore error if file doesn't exist
    }

    // Remove all vehicle photos
    if (contract.photos && contract.photos.length > 0) {
      await Promise.all(
        contract.photos.map(async (photo) => {
          const photoPath = path.join(process.cwd(), "public", photo);
          await fs.promises.unlink(photoPath).catch(() => {});
        })
      );
    }

    await Contract.findByIdAndDelete(id);
    return new Response(JSON.stringify({ success: true, message: "Contract deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting contract:", error);
    return new Response(JSON.stringify({ success: false, message: "Failed to delete contract" }), { status: 500 });
  }
}
