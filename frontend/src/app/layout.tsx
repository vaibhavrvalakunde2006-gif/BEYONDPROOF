import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "BEYONDPROOF — Beyond Trust. Beyond Doubt.",
  description: "AI-powered digital forensics and evidence intelligence workspace."
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
