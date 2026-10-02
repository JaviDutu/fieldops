import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FieldOps — Climate Hack-tion MVP",
  description: "Action-first farm operations dashboard for small farmers",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
