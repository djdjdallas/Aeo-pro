import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "First Answer — Get Recommended by AI",
  description:
    "Answer Engine Optimization for local businesses. Get your business recommended by ChatGPT, Perplexity, and every AI assistant your customers use.",
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
