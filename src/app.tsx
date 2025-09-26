import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/shared/header';
import Footer from './components/shared/footer';
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
        <main className="with-side-ads">
          <aside className="side-ad left">
            <a className="ad-slot" href="/sponsor/left" aria-label="Left sidebar ad">
              <div className="ad-tag">Ad</div>
              <p>160x600</p>
            </a>
          </aside>
          <div className="page-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/video" element={<VideoPage />} />
              <Route path="/image" element={<ImagePage />} />
              <Route path="/sound" element={<SoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <aside className="side-ad right">
            <a className="ad-slot" href="/sponsor/right" aria-label="Right sidebar ad">
              <div className="ad-tag">Ad</div>
              <p>160x600</p>
            </a>
          </aside>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
