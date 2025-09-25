import HeroSection from '../../components/home/Hero/HeroSection';
import UploadSection from '../../components/home/UploadSection/UploadSection';
import FeatureHighlights from '../../components/home/FeatureHighlights/FeatureHighlights';
import ApiPromo from '../../components/home/ApiPromo/ApiPromo';
import Testimonials from '../../components/home/Testimonials/Testimonials';
import PricingSection from '../../components/home/PricingSection/PricingSection';
import './styles/home-page.css';

function HomePage() {
  return (
    <div className="home-page">
      <HeroSection />
      <UploadSection />
      <FeatureHighlights />
      <ApiPromo />
      <Testimonials />
      <PricingSection />
    </div>
  );
}

export default HomePage;
