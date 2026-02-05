import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "Time Tracker - RBLabs",
  description: "Enterprise time tracking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
