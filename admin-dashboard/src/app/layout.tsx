import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auction Admin Dashboard",
  description: "Auction management admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="bg-gray-50 font-sans">
        {children}
      </body>
    </html>
  );
}
