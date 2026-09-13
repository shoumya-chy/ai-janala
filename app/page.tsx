import DemoSection from "@/components/DemoSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import ProofStrip from "@/components/ProofStrip";
import SolutionSection from "@/components/SolutionSection";

export default function Home() {
  return (
    <main>
      <Header />
      <DemoSection />
      <ProofStrip />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <Footer />
    </main>
  );
}
