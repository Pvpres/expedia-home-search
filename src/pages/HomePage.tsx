import GlobalNav from '../components/navigation/GlobalNav';
import HeroSection from '../components/hero/HeroSection';
import PromoSection from '../components/hero/PromoSection';
import Footer from '../components/common/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <GlobalNav />
      <HeroSection />
      <PromoSection />
      <Footer />
    </div>
  );
}
