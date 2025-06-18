import type { Metadata } from "next";
import "./globals.css";
import "../styles/override-dark-mode.css";

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
    <html lang="en" className="light" style={{colorScheme: 'light'}}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <meta name="color-scheme" content="light" />
        <style dangerouslySetInnerHTML={{__html: `
          html, body {
            background-color: white !important;
            color-scheme: light !important;
          }
          @media (prefers-color-scheme: dark) {
            html, body {
              background-color: white !important;
              color-scheme: light !important;
            }
          }
        `}} />
        <script dangerouslySetInnerHTML={{__html: `
          // Force light mode
          document.documentElement.style.colorScheme = 'light';
          localStorage.setItem('theme', 'light');
        `}} />
      </head>
      <body className="bg-white font-sans">
        {children}
      </body>
    </html>
  );
}
