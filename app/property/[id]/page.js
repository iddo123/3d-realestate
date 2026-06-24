import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import PropertyDetail from "../../../components/PropertyDetail";
import { properties, getProperty } from "../../../lib/properties";

export function generateStaticParams() {
  return properties.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }) {
  const property = getProperty(params.id);
  if (!property) return { title: "נכס לא נמצא · רגבים" };
  return { title: `${property.address} · רגבים` };
}

export default function PropertyPage({ params }) {
  const property = getProperty(params.id);
  if (!property) notFound();

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PropertyDetail property={property} />
      <Footer />
    </main>
  );
}
