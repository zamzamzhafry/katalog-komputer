import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Katalog Komputer & Laptop",
  description: "Portfolio display katalog komputer dan laptop"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
