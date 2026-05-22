import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rush Medical College Case Chatbot",
  description: "AI patient simulator prototype for Rush medical education."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
