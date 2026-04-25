import React, { useState, useMemo } from 'react';
import { Search, Plus, Calendar, Image as ImageIcon, QrCode, X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE_URL = 'https://27fvg768-3000.asse.devtunnels.ms/api';

const Home = ({ albums, selectedImages, setSelectedImages }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [showQR, setShowQR] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateSlideshow = async () => {
    if (selectedImages.length === 0) return;
    setCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/slideshows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: selectedImages })
      });
      const data = await response.json();
      setSelectedImages([]); // Reset selection
      navigate(`/slideshow/${data.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Không thể tạo slideshow');
    } finally {
      setCreating(false);
    }
  };

  const allTags = useMemo(() => {
    const tags = new Set(['All']);
    albums.forEach(album => album.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [albums]);

  const filteredAlbums = useMemo(() => {
    return albums.filter(album => {
      const matchesSearch = album.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag === 'All' || album.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [searchTerm, selectedTag, albums]);

  const host = "https://27fvg768-5174.asse.devtunnels.ms";
  const uploadUrl = `${host}/upload`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <header className="mb-10 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pastel-purple-dark to-pastel-mint-dark mb-2"
          >
            My Photo Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-sm md:text-base text-balance"
          >
            Lưu giữ những khoảnh khắc đẹp nhất của bạn
          </motion.p>
        </div>

        <div className="flex justify-center md:justify-end gap-3">
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center px-5 md:px-6 py-3 bg-white text-pastel-purple-dark border-2 border-pastel-purple-light rounded-2xl font-semibold hover:bg-pastel-purple-light transition-all shadow-sm active:scale-95"
          >
            <QrCode className="w-5 h-5 mr-2" />
            QR Upload
          </button>
          <Link
            to="/upload"
            className="flex items-center px-5 md:px-6 py-3 bg-pastel-purple text-white rounded-2xl font-semibold hover:bg-pastel-purple-dark transition-all shadow-lg shadow-pastel-purple/20 active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tạo Album
          </Link>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 md:mb-12">
        <div className="relative flex-grow group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-pastel-purple transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm kiếm album..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-pastel-purple-light outline-none shadow-sm transition-all text-sm md:text-base"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all tap-highlight-none ${
                selectedTag === tag 
                ? 'bg-pastel-purple text-white shadow-lg shadow-pastel-purple/30 scale-105' 
                : 'bg-white text-gray-500 hover:bg-pastel-purple-light hover:text-pastel-purple-dark'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredAlbums.map((album) => (
            <motion.div
              key={album.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Link to={`/album/${album.id}`} className="block h-full">
                <div className="glass-card rounded-3xl overflow-hidden h-full flex flex-col group">
                  <div className={`h-48 flex items-center justify-center text-6xl ${album.gradient} transition-transform duration-500 group-hover:scale-110`}>
                    {album.thumbnail}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-pastel-purple-dark bg-pastel-purple-light px-3 py-1 rounded-full">
                        {album.tags[0]}
                      </span>
                      <div className="flex items-center text-gray-400 text-sm">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        {album.count} ảnh
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pastel-purple-dark transition-colors">
                      {album.title}
                    </h3>

                    <div className="flex items-center text-gray-400 text-xs mt-auto">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(album.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQR(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full md:max-w-md bg-white rounded-t-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-center shadow-2xl safe-bottom"
            >
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hidden md:block"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-xl md:text-2xl font-bold mb-2">Quét mã để Up ảnh</h2>
              <p className="text-gray-500 mb-8 text-sm md:text-base px-4 text-balance">Sử dụng điện thoại để quét mã QR và tải ảnh trực tiếp lên album sự kiện.</p>
              
              <div className="bg-pastel-purple-light/20 p-6 md:p-8 rounded-[2.5rem] inline-block mb-8">
                <QRCodeSVG 
                  value={uploadUrl} 
                  size={180}
                  fgColor="#A855F7"
                  level="H"
                  includeMargin={true}
                  className="max-w-full h-auto"
                />
              </div>
              
              <div className="text-[10px] md:text-xs text-pastel-purple font-medium bg-pastel-purple-light/50 py-2.5 px-6 rounded-full break-all mb-4 md:mb-0">
                {uploadUrl}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Selection Bar */}
      <AnimatePresence>
        {selectedImages.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
          >
            <div className="glass-card bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-4 flex items-center justify-between shadow-2xl border border-pastel-purple/20">
              <div className="flex items-center gap-4 ml-4">
                <div className="w-12 h-12 bg-pastel-purple-light rounded-2xl flex items-center justify-center text-pastel-purple-dark font-bold">
                  {selectedImages.length}
                </div>
                <div>
                  <p className="font-bold text-gray-800">Đã chọn ảnh</p>
                  <p className="text-xs text-gray-400">Tối đa 10 ảnh</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedImages([])}
                  className="px-4 py-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateSlideshow}
                  disabled={creating}
                  className="bg-pastel-purple text-white px-8 py-3 rounded-2xl font-bold hover:bg-pastel-purple-dark transition-all shadow-lg shadow-pastel-purple/20 disabled:opacity-50 flex items-center"
                >
                  {creating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : <Play className="w-5 h-5 mr-2" />}
                  Tạo Slide Động
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
