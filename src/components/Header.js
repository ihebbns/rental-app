"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRightOnRectangleIcon, KeyIcon, GlobeAltIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [language, setLanguage] = useState(null); // Set initial state as null

  useEffect(() => {
    if (pathname.startsWith("/ar")) {
      setLanguage("ar");
    } else {
      setLanguage("fr");
    }
  }, [pathname]);

  const toggleLanguage = () => {
    if (language === "fr") {
      router.push(`/ar${pathname === "/" ? "" : pathname}`);
    } else {
      router.push(pathname.replace(/^\/ar/, "") || "/");
    }
  };

  // ✅ Ensure no rendering happens before hydration
  if (language === null) return null;

  return (
    <header className="bg-blue-600 text-white py-3 shadow-md fixed top-0 left-0 w-full z-10 flex justify-between items-center px-4">
      {/* ✅ Logo */}
      <div className="flex items-center space-x-3">
        <Image
          src="/car1.png"
          alt="Logo"
          width={40} // Set a fixed width
          height={40} // Set a fixed height
          priority // Ensures the logo loads instantly
          className="object-contain"
        />
        <h1 className="text-lg font-semibold">{language === "fr" ? "EntretienFacile" : "إدارة الصيانة"}</h1>
      </div>

      {/* ✅ All buttons grouped together */}
      <div className="flex items-center space-x-3 ml-auto">
        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="p-2 bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-900 transition"
          title={language === "fr" ? "Switch to Arabic" : "التبديل إلى الفرنسية"}
        >
          <GlobeAltIcon className="h-6 w-6" />
        </button>

        {/* Show Change Password & Logout Icons if Logged In */}
        {session && (
          <>
            <button
              onClick={() => router.push(language === "ar" ? "/ar/change-password" : "/change-password")}
              className="p-2 bg-yellow-500 text-white rounded-full shadow-md hover:bg-yellow-600 transition"
              title={language === "fr" ? "Modifier Mot de Passe" : "تغيير كلمة المرور"}
            >
              <KeyIcon className="h-6 w-6" />
            </button>

            <button
              onClick={() => signOut()}
              className="p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition"
              title={language === "fr" ? "Déconnexion" : "تسجيل الخروج"}
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
