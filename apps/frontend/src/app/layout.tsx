import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Matiks | Mental Math Duels",
  description: "Fast mental duels against real players.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <div className="grain-overlay" aria-hidden>
          <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <filter id="matiks-grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.58"
                numOctaves="4"
                stitchTiles="stitch"
                seed="7"
                result="fine"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.22"
                numOctaves="3"
                stitchTiles="stitch"
                seed="11"
                result="coarse"
              />
              <feBlend in="fine" in2="coarse" mode="overlay" result="mix" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncR type="linear" slope="1.7" intercept="-0.35" />
                <feFuncG type="linear" slope="1.7" intercept="-0.35" />
                <feFuncB type="linear" slope="1.7" intercept="-0.35" />
              </feComponentTransfer>
            </filter>
            <rect width="100%" height="100%" filter="url(#matiks-grain)" />
          </svg>
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
