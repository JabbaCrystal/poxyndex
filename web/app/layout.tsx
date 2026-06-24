import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Poxyndex — a price index for one very rare DVD",
  description:
    "A Big Mac Index for Mr. Poxycat & Co., the out-of-print Danish DVD. Tracking the second-hand price of Denmark's least liquid asset.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
