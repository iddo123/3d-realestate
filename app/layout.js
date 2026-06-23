import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata = {
  title: "3D – נדל\"ן, דירות למכירה ולהשכרה ומחירון",
  description:
    "מצאו דירות למכירה ולהשכרה, פרויקטים חדשים, מחירון נדל\"ן ומידע על שכונות וערכים בכל רחבי הארץ.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
