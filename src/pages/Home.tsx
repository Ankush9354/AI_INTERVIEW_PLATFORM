
import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import TrustedBy from "../components/home/TrustedBy";
import Features from "../components/home/Features";
import HowItWorks from "../components/home/HowItWorks";
import Testimonials from "../components/home/Testimonials";
import FAQ from "../components/home/FAQ";
import Footer from "../components/layout/Footer";

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />

      <section id="pricing" className="scroll-mt-20 bg-blue-50 px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900">
          Simple & Transparent Pricing
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Enjoy all AI Interview Platform features for free.
        </p>
        <p className="mt-2 font-semibold text-blue-600">
          Premium plans coming soon!
        </p>
      </section>

      <Footer />
    </>
  );
};

export default Home;
