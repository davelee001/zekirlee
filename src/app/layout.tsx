import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Zekirlee", template: "%s | Zekirlee" },
  description: "Your thoughtful interface to the Sui blockchain.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(() => { let theme; try { theme = localStorage.getItem('zekirlee.theme'); } catch {} const dark = theme === 'dark' || (theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.classList.toggle('dark', dark); })();` }} /></head><body>{children}</body></html>;
}
