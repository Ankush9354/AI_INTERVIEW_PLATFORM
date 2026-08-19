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
    <Footer />
</>
  );
};

export default Home;