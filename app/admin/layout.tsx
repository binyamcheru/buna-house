import { Domine, Manrope } from "next/font/google";
import "./admin.css";

const domine = Domine({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Buna House — Admin Dashboard",
  description: "Admin panel for Buna House coffee shop",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${domine.variable} ${manrope.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
