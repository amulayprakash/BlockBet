import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { HowItWorks } from '../components/HowItWorks';
import { USPSection } from '../components/USPSection';
import { LiveRoomPreview } from '../components/LiveRoomPreview';
import { TrustSection } from '../components/TrustSection';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';

export function Landing() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div id="home">
        <HeroSection />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <div id="features">
        <USPSection />
      </div>
      <div id="live-rooms">
        <LiveRoomPreview />
      </div>
      <div id="trust">
        <TrustSection />
      </div>
      <FinalCTA />
      <Footer />
    </div>
  );
}






