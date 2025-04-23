const bcrypt = require("bcryptjs");
const connectDB = require("../../lib/mongodb"); // ✅ Adjusted path
const Admin = require("../../models/Admin"); // ✅ Adjusted path

async function addAdmin() {
  await connectDB();

  const existingAdmin = await Admin.findOne({ email: "admin@example.com" });

  if (existingAdmin) {
    console.log("⚠️ Admin already exists!");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  await Admin.create({
    email: "admin@example.com",
    password: hashedPassword,
  });

  console.log("✅ Admin ajouté avec succès !");
  process.exit(); // ✅ Exit script after execution
}

addAdmin().catch((err) => {
  console.error("❌ Erreur:", err);
  process.exit(1);
});
