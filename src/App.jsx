import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AlbumDetail from './pages/AlbumDetail';
import Upload from './pages/Upload';
import SlideshowView from './pages/SlideshowView';
import { ALBUMS as INITIAL_ALBUMS } from './data/mockData';

const API_BASE_URL = 'https://27fvg768-3000.asse.devtunnels.ms/api';

function App() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/albums`);
      const data = await response.json();

      if (data && data.length > 0) {
        setAlbums(data);
      } else {
        setAlbums(INITIAL_ALBUMS);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
      setAlbums(INITIAL_ALBUMS);
    } finally {
      setLoading(false);
    }
  };

  const addAlbum = (newAlbum) => {
    setAlbums([newAlbum, ...albums]);
  };

  const toggleImageSelection = (image) => {
    if (image.id === 'clear-all') {
      setSelectedImages([]);
      return;
    }
    setSelectedImages(prev => {
      const isSelected = prev.find(img => img.id === image.id);
      if (isSelected) {
        return prev.filter(img => img.id !== image.id);
      }
      if (prev.length >= 10) {
        alert('Chỉ được chọn tối đa 10 ảnh cho slideshow!');
        return prev;
      }
      return [...prev, image];
    });
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#FDFCFE] text-gray-800 selection:bg-pastel-purple/30">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-12 h-12 border-4 border-pastel-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home albums={albums} selectedImages={selectedImages} onToggleSelection={toggleImageSelection} setSelectedImages={setSelectedImages} />} />
            <Route path="/album/:id" element={<AlbumDetail albums={albums} selectedImages={selectedImages} onToggleSelection={toggleImageSelection} fetchAlbums={fetchAlbums} />} />
            <Route path="/upload" element={<Upload onUploadSuccess={addAlbum} />} />
            <Route path="/slideshow/:id" element={<SlideshowView />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
