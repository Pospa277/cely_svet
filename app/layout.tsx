import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cestovní Zpravodaj – AI analýza bezpečnosti destinací",
  description: "Okamžitá AI analýza bezpečnosti vaší cestovní destinace. Poháněno Google Gemini a RSS zpravodajstvím v reálném čase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
