import About from "@/components/custom/About";
import ContactUs from "@/components/custom/ContactUs";
import FAQ from "@/components/custom/FAQ";
import Footer from "@/components/custom/Footer";
import Header from "@/components/custom/Header";
import { Hero } from "@/components/custom/Hero";
import Services from "@/components/custom/Services";

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <About />
        <FAQ />
        <ContactUs />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
