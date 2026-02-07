// app/layout.tsx
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-screen overflow-hidden">
      <body className="h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
