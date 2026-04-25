import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, ChevronLeft, ChevronRight, Share2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'https://27fvg768-3000.asse.devtunnels.ms/api';

const SlideshowView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slideshow, setSlideshow] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSlideshow = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/slideshows/${id}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setSlideshow(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlideshow();
  }, [id]);

  useEffect(() => {
    let timer;
    if (isPlaying && slideshow) {
      timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % slideshow.images.length);
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, slideshow]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!slideshow) return <div className="text-center py-20">Slideshow không tồn tại</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="font-bold">Dynamic Slideshow</h2>
          <p className="text-xs text-gray-400">{currentIndex + 1} / {slideshow.images.length}</p>
        </div>
        <button onClick={handleCopyLink} className="p-2 hover:bg-white/10 rounded-full flex items-center gap-2">
          {copied ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
          <span className="text-sm hidden md:inline">{copied ? 'Đã copy' : 'Chia sẻ'}</span>
        </button>
      </div>

      {/* Main Slide */}
      <div className="flex-grow flex items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center p-4 md:p-20"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={slideshow.images[currentIndex].url} 
                alt="" 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              />
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-10 left-0 right-0 text-center px-4"
              >
                <span className="bg-black/50 backdrop-blur-md px-6 py-2 rounded-full text-lg">
                  {slideshow.images[currentIndex].caption}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-8 flex items-center justify-center gap-8 bg-gradient-to-t from-black/80 to-transparent">
          <button 
            onClick={() => setCurrentIndex(prev => (prev - 1 + slideshow.images.length) % slideshow.images.length)}
            className="p-4 hover:bg-white/10 rounded-full transition-all"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-6 bg-white text-black rounded-full hover:scale-110 transition-all shadow-xl"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </button>
          <button 
            onClick={() => setCurrentIndex(prev => (prev + 1) % slideshow.images.length)}
            className="p-4 hover:bg-white/10 rounded-full transition-all"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideshowView;
