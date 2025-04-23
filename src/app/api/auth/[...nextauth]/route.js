import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";

// 📌 Path to the JSON password file
const passwordFile = path.join(process.cwd(), "src/app/api/change-password/password.json");

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔍 Checking admin email:", credentials.email);

        if (credentials.email !== "admin@gmail.com") {
          console.error("❌ Admin not found!");
          throw new Error("Email incorrect");
        }

        console.log("✅ Admin found!");

        // 📌 Read the password from JSON file
        const fileData = await fs.readFile(passwordFile, "utf-8");
        const { password: storedPassword } = JSON.parse(fileData);

        const passwordMatch = await bcrypt.compare(credentials.password, storedPassword);
        if (!passwordMatch) {
          console.error("❌ Password incorrect!");
          throw new Error("Mot de passe incorrect");
        }

        console.log("✅ Password matched! Logging in...");
        return { email: "admin@gmail.com" };
      }
    })
  ],
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session }) {
      session.user = { email: "admin@gmail.com" };
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
