import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestor de Propiedades",
  description: "Gestiona tus propiedades de alquiler temporal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1 w-full">{children}</main>
          <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
            <p className="text-center text-sm text-gray-500">
              Hecho con amor para mama. -F
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
