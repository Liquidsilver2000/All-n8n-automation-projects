import GraphCanvas from '../sections/GraphCanvas';
import Navigation from '../sections/Navigation';
import Hero from '../sections/Hero';
import FeaturesSection from '../sections/FeaturesSection';
import ProjectGrid from '../sections/ProjectGrid';
import CTAFooter from '../sections/CTAFooter';

export default function Home() {
  return (
    <>
      <GraphCanvas />
      <Navigation />
      <Hero />
      <FeaturesSection />
      <ProjectGrid />
      <CTAFooter />
    </>
  );
}
