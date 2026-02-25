import "./globals.css";
import Providers from "@/components/Providers";
import {
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
} from "@/lib/seo";

export const metadata = {
  title: {
    default: "First Answer — AEO for Local Businesses",
    template: "%s | First Answer — AEO for Local Businesses",
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
  authors: [{ name: "First Answer — AEO for Local Businesses" }],
  metadataBase: new URL("https://firstanswer.co"),
  openGraph: {
    title: "First Answer — AEO for Local Businesses",
    description:
      "Answer Engine Optimization for local businesses. Get recommended by ChatGPT, Perplexity, and AI search engines.",
    url: "https://firstanswer.co",
    siteName: "First Answer — AEO for Local Businesses",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "First Answer — AEO for Local Businesses",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebSiteJsonLd()),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
