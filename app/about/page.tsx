import type { Metadata } from "next";
import Header from "@/components/Header";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About | AI Janala",
  description:
    "AI Janala is built by Shoumya Chowdhury and Anmita Das, AI governance researchers at the University of Melbourne, alongside their published research and conference work.",
};

export default function AboutPage() {
  return (
    <main>
      <Header />
      <AboutSection />
      <Footer />
    </main>
  );
}
