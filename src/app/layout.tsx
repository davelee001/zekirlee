import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Zekirlee", template: "%s | Zekirlee" },
  description: "An AI workspace with lasting memory.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

