import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Image as ImageIcon, Check, Play, Upload as UploadIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'https://27fvg768-3000.asse.devtunnels.ms/api';

const AlbumDetail = ({ albums, selectedImages, onToggleSelection, fetchAlbums }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [isUploadingMore, setIsUploadingMore] = useState(false);
  const album = albums.find(a => a.id === parseInt(id));

  const handleUploadMore = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploadingMore(true);
    const files = Array.from(e.target.files);
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));

    try {
      // 1. Upload ảnh lên server
      const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      const newImages = await uploadRes.json();

      // 2. Cập nhật album trên backend
      const updateRes = await fetch(`${API_BASE_URL}/albums/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: newImages })
      });

      if (updateRes.ok) {
        if (fetchAlbums) fetchAlbums(); // Refresh dữ liệu toàn cục
        alert('Đã thêm ảnh thành công!');
      }
    } catch (error) {
      console.error('Lỗi khi thêm ảnh:', error);
      alert('Không thể thêm ảnh');
    } finally {
      setIsUploadingMore(false);
    }
  };

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
      navigate(`/slideshow/${data.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Không thể tạo slideshow');
    } finally {
      setCreating(false);
    }
  };

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Oops! Không tìm thấy album này.</h2>
        <Link to="/" className="text-pastel-purple-dark hover:underline flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Banner */}
      <div className={`h-56 md:h-80 w-full ${album.gradient} relative flex items-center justify-center overflow-hidden`}>
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="absolute top-5 left-5 z-10 p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all active:scale-90"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl md:text-9xl drop-shadow-2xl"
        >
          {album.thumbnail}
        </motion.div>
        
        {/* Decorative Circles */}
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Info Section */}
      <div className="max-w-6xl mx-auto px-4 -mt-12 md:-mt-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-xl"
        >
          <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6">
            {album.tags.map(tag => (
              <span key={tag} className="flex items-center text-[10px] md:text-sm font-medium text-pastel-purple-dark bg-pastel-purple-light px-3 py-1 md:px-4 md:py-1.5 rounded-full">
                <Tag className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1.5" />
                {tag}
              </span>
            ))}
            <span className="flex items-center text-[10px] md:text-sm text-gray-400 bg-gray-50 px-3 py-1 md:px-4 md:py-1.5 rounded-full">
              <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1.5" />
              {new Date(album.date).toLocaleDateString('vi-VN')}
            </span>
            <span className="flex items-center text-[10px] md:text-sm text-gray-400 bg-gray-50 px-3 py-1 md:px-4 md:py-1.5 rounded-full">
              <ImageIcon className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1.5" />
              {album.count} ảnh
            </span>
          </div>

          <h1 className="text-2xl md:text-5xl font-bold text-gray-800 mb-4 md:mb-6">{album.title}</h1>
          <p className="text-gray-500 text-sm md:text-lg leading-relaxed max-w-3xl text-balance">
            {album.description}
          </p>
        </motion.div>

        {/* Photo Grid */}
        <div className="mt-10 md:mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
              <span className="w-6 md:w-8 h-1 bg-pastel-mint-dark rounded-full mr-3"></span>
              Danh sách ảnh
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const imagesToSelect = album.images.slice(0, 10);
                  imagesToSelect.forEach(img => {
                    if (!selectedImages.find(s => s.id === img.id)) {
                      onToggleSelection(img);
                    }
                  });
                }}
                className="flex-1 sm:flex-none text-xs md:text-sm font-medium text-pastel-purple-dark bg-pastel-purple-light/30 hover:bg-pastel-purple-light px-4 py-2.5 rounded-xl transition-all tap-highlight-none"
              >
                Chọn tất cả (Tối đa 10)
              </button>
              <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs md:text-sm font-medium bg-pastel-mint text-pastel-mint-dark hover:bg-pastel-mint-dark hover:text-white px-4 py-2.5 rounded-xl transition-all cursor-pointer tap-highlight-none shadow-sm">
                <UploadIcon className="w-4 h-4" />
                <span>{isUploadingMore ? 'Đang up...' : 'Up thêm ảnh'}</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  disabled={isUploadingMore}
                  onChange={handleUploadMore}
                />
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {album.images.map((image, index) => {
              const isSelected = selectedImages.find(img => img.id === image.id);
              return (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onToggleSelection(image)}
                  className={`group relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden glass-card cursor-pointer border-2 md:border-4 transition-all tap-highlight-none ${
                    isSelected ? 'border-pastel-purple ring-4 ring-pastel-purple/20' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={image.url} 
                    alt={image.caption}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Selection Overlay */}
                  <div className={`absolute top-2 right-2 md:top-4 md:right-4 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                    isSelected ? 'bg-pastel-purple text-white scale-110' : 'bg-white/40 text-transparent'
                  }`}>
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6">
                    <p className="text-white text-xs md:text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 line-clamp-1">
                      {image.caption}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Selection Bar */}
      <AnimatePresence>
        {selectedImages.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl safe-bottom"
          >
            <div className="glass-card bg-white/90 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] p-3 md:p-4 flex items-center justify-between shadow-2xl border border-pastel-purple/20">
              <div className="flex items-center gap-3 md:gap-4 ml-2 md:ml-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-pastel-purple text-white rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-sm md:text-base">
                  {selectedImages.length}
                </div>
                <div className="hidden xs:block">
                  <p className="font-bold text-gray-800 text-sm md:text-base">Đã chọn</p>
                  <p className="text-[10px] md:text-xs text-gray-400">Tối đa 10 ảnh</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  onClick={() => onToggleSelection({ id: 'clear-all' })} // Handled by App.jsx or reset logic
                  className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateSlideshow}
                  disabled={creating}
                  className="bg-pastel-purple text-white px-5 md:px-8 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-sm md:text-base hover:bg-pastel-purple-dark transition-all shadow-lg shadow-pastel-purple/20 disabled:opacity-50 flex items-center active:scale-95"
                >
                  {creating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Play className="w-4 h-4 md:w-5 md:h-5 mr-2 fill-current" />
                      <span className="hidden xs:inline">Tạo Slide</span>
                      <span className="xs:hidden">Slide</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlbumDetail;
