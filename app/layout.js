import "./globals.css";

export const metadata = {
  title: "Combine Link",
  description: "Dashboard peribadi untuk simpan dan akses semua link anda",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
