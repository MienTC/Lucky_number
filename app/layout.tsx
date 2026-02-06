import "./globals.css";
import { Playfair_Display, Comforter_Brush } from "next/font/google";

const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-tet",
});

const comforterBrush = Comforter_Brush({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tet-alt",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${comforterBrush.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
