"use client";

import { usePathname } from "next/navigation";
import { HomeIcon, BellIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

export default function Footer() {
  const pathname = usePathname();
  const isArabic = pathname.startsWith("/ar");

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white shadow-md border-t">
      <nav className="flex justify-around py-3 max-w-4xl mx-auto text-gray-600">
        {/* Home */}
        <a
          href={isArabic ? "/ar" : "/"}
          className="flex flex-col items-center group hover:text-blue-600 transition"
        >
          <HomeIcon className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-xs font-medium">{isArabic ? "الرئيسية" : "Accueil"}</span>
        </a>

        {/* Reminders */}
        <a
          href={isArabic ? "/ar/reminders" : "/reminders"}
          className="flex flex-col items-center group hover:text-blue-600 transition"
        >
          <BellIcon className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-xs font-medium">{isArabic ? "التذكيرات" : "Rappels"}</span>
        </a>

        {/* Add Car */}
        <a
          href={isArabic ? "/ar/cars/add" : "/cars/add"}
          className="flex flex-col items-center group hover:text-blue-600 transition"
        >
          <PlusCircleIcon className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-xs font-medium">{isArabic ? "إضافة سيارة" : "Ajouter"}</span>
        </a>
      </nav>
    </footer>
  );
}
