import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: {
    default: "First Answer — Get Recommended by AI",
    template: "%s | First Answer",
  },
  description:
    "Answer Engine Optimization for local businesses. Get your business recommended by ChatGPT, Perplexity, and every AI assistant your customers use.",
  keywords: [
    "answer engine optimization",
    "AEO",
    "AI search optimization",
    "ChatGPT recommendations",
    "local business AI",
  ],
  authors: [{ name: "First Answer" }],
  metadataBase: new URL("https://firstanswer.co"),
  openGraph: {
    title: "First Answer — Get Recommended by AI",
    description:
      "Answer Engine Optimization for local businesses. Get recommended by ChatGPT, Perplexity, and AI search engines.",
    url: "https://firstanswer.co",
    siteName: "First Answer",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "First Answer — Get Recommended by AI",
    description:
      "Answer Engine Optimization for local businesses. Get recommended by ChatGPT, Perplexity, and AI search engines.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
