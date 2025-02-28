"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Mot de passe mis à jour !");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } else {
      setMessage(`❌ ${data.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-xl font-bold text-center">🔒 Modifier le Mot de Passe</h2>
        {message && <p className="text-center text-red-500">{message}</p>}
        <input
          type="password"
          placeholder="Mot de passe actuel"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded mt-3"
        />
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded mt-3"
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600">
          Changer le mot de passe
        </button>
      </form>
    </div>
  );
}
