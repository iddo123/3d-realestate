import Header from "../components/Header";
import Hero from "../components/Hero";
import Cities from "../components/Cities";
import PropertyMap from "../components/PropertyMap";
import Listings from "../components/Listings";
import Tools from "../components/Tools";
import CtaBand from "../components/CtaBand";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Cities />
      <PropertyMap />
      <Listings />
      <Tools />
      <CtaBand />
      <Footer />
    </main>
  );
}
