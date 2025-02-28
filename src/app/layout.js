import "../styles/globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import Header from "@/components/Header";
import Footer from "@/components/Footer1";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export const metadata = {
  title: "Cars Rental App",
  description: "Manage your car rentals efficiently",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/car1.png" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/car1.png" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>

      <body className="bg-gray-50 text-gray-800 flex flex-col min-h-screen">
        <SessionWrapper>
          <Header />
        
            <main className="mt-16 mb-16 px-4 py-6 flex-grow max-w-4xl mx-auto">
              {children}
            </main>
          
          {session && <Footer />}
        </SessionWrapper>
      </body>
    </html>
  );
}
