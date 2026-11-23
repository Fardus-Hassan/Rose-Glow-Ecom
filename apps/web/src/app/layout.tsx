import type { ReactNode } from "react";
import {
  Anek_Bangla,
  Cormorant_Garamond,
  Manrope,
  Tiro_Bangla,
} from "next/font/google";
import "./globals.css";

/** Editorial luxury Latin display — BIJOUX-adjacent quiet luxury. */
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

/** Literary Bangla for headings — quiet, high-contrast serif. */
const displayBn = Tiro_Bangla({
  subsets: ["bengali", "latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display-bn",
  display: "swap",
});

/** Contemporary Bangla for body copy and UI. */
const sansBn = Anek_Bangla({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-bn",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${displayBn.variable} ${sansBn.variable} h-full`}
    >
      <body className="min-h-full antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
