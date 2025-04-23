import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// 📌 Path to the JSON password file
const passwordFile = path.join(process.cwd(), "src/app/api/change-password/password.json");

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    // 🛑 Load current password from the JSON file
    const fileData = await fs.readFile(passwordFile, "utf-8");
    const { password: savedPassword } = JSON.parse(fileData);

    // 🔍 Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, savedPassword);
    if (!isMatch) {
      return new Response(JSON.stringify({ message: "Mot de passe actuel incorrect" }), { status: 400 });
    }

    // 🔄 Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Save the new password to the JSON file
    await fs.writeFile(passwordFile, JSON.stringify({ password: hashedNewPassword }, null, 2));

    return new Response(JSON.stringify({ message: "✅ Mot de passe mis à jour !" }), { status: 200 });

  } catch (error) {
    console.error("❌ Erreur serveur:", error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), { status: 500 });
  }
}
