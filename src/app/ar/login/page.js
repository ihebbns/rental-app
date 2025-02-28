"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("❌ البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } else {
      router.refresh();
      router.replace("/ar"); // ✅ توجيه إلى النسخة العربية بعد تسجيل الدخول
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-right">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-xl font-bold text-center">🔐 تسجيل دخول المشرف</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <input
          type="email"
          placeholder="📧 البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded mt-3"
        />
        <input
          type="password"
          placeholder="🔑 كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded mt-3"
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600">
          تسجيل الدخول
        </button>
      </form>
    </div>
  );
}
