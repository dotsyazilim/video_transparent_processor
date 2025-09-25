import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/shared/header/Header';
import Footer from './components/shared/footer/Footer';
import HomePage from './pages/home/home_page';
import PricingPage from './pages/home/pricing_page';
import VideoPage from './pages/video/video_page';
import ImagePage from './pages/image/image_page';
import SoundPage from './pages/sound/sound_page';
import NotFoundPage from './pages/other/not_found_page';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/video" element={<VideoPage />} />
            <Route path="/image" element={<ImagePage />} />
            <Route path="/sound" element={<SoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
