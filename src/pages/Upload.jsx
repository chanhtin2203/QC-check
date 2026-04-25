import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload as UploadIcon, X, CheckCircle2, Tag, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ["Du lịch", "Sự kiện", "Gia đình", "Ẩm thực", "Nhiếp ảnh", "Công việc", "Khác"];
const API_BASE_URL = 'https://27fvg768-3000.asse.devtunnels.ms/api';

const Upload = ({ onUploadSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => ({
        id: Math.random(),
        url: URL.createObjectURL(file),
        name: file.name
      }));
      setPreviewImages(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (id, index) => {
    setPreviewImages(prev => prev.filter(img => img.id !== id));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(20);

    try {
      // 1. Upload ảnh lên Node.js Backend
      const uploadFormData = new FormData();
      selectedFiles.forEach(file => {
        uploadFormData.append('photos', file);
      });

      const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: uploadFormData
      });

      if (!uploadResponse.ok) throw new Error('Upload ảnh thất bại');
      const uploadedImages = await uploadResponse.json();
      
      setUploadProgress(70);

      // 2. Lưu thông tin Album vào Backend
      const newAlbum = {
        title: formData.title,
        description: formData.description || `Album được tạo từ sự kiện ${formData.title}`,
        date: formData.date,
        count: uploadedImages.length,
        tags: [formData.category],
        thumbnail: getEmojiForCategory(formData.category),
        gradient: getGradientForCategory(formData.category),
        images: uploadedImages
      };

      const dbResponse = await fetch(`${API_BASE_URL}/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlbum)
      });

      if (!dbResponse.ok) throw new Error('Lưu album thất bại');
      const savedAlbum = await dbResponse.json();

      setUploadProgress(100);
      onUploadSuccess(savedAlbum);
      setStep(3);
    } catch (error) {
      console.error('Lỗi khi tải lên:', error.message);
      alert('Có lỗi xảy ra: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const getEmojiForCategory = (cat) => {
    const map = {
      "Du lịch": "✈️",
      "Sự kiện": "🎉",
      "Gia đình": "🏠",
      "Ẩm thực": "🍜",
      "Nhiếp ảnh": "📸",
      "Công việc": "💼",
      "Khác": "📁"
    };
    return map[cat] || "✨";
  };

  const getGradientForCategory = (cat) => {
    if (cat === "Du lịch" || cat === "Sự kiện") return "gradient-mixed";
    if (cat === "Gia đình" || cat === "Ẩm thực") return "gradient-mint";
    return "gradient-purple";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 min-h-screen safe-bottom">
      <div className="mb-8 flex items-center">
        <button 
          onClick={() => navigate('/')}
          className="p-2.5 hover:bg-gray-100 rounded-full transition-colors mr-3 active:scale-90"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Tạo Album Mới</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-10 md:mb-12 relative px-4 md:px-8">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>
        {[1, 2, 3].map(s => (
          <div 
            key={s} 
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all text-sm md:text-base ${
              step >= s ? 'bg-pastel-purple text-white shadow-lg shadow-pastel-purple/20' : 'bg-white text-gray-400 border-2 border-gray-100'
            }`}
          >
            {s === 3 && step === 3 ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : s}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-xl"
          >
            <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-3 text-pastel-purple" />
              Thông tin sự kiện
            </h2>
            
            <form className="space-y-6">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-400 mb-2 ml-1">Tên sự kiện / Album</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ví dụ: Đám cưới My & Tuấn..."
                  className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-pastel-purple-light focus:bg-white outline-none transition-all text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-400 mb-3 ml-1">Phân loại ảnh</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({...formData, category: cat})}
                      className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all tap-highlight-none ${
                        formData.category === cat 
                        ? 'bg-pastel-purple text-white shadow-md' 
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-400 mb-2 ml-1">Mô tả ngắn (không bắt buộc)</label>
                <textarea 
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-pastel-purple-light focus:bg-white outline-none transition-all text-sm md:text-base"
                ></textarea>
              </div>

              <button 
                type="button"
                disabled={!formData.title || !formData.category}
                onClick={() => setStep(2)}
                className="w-full py-4 bg-pastel-purple text-white rounded-xl md:rounded-2xl font-bold shadow-lg shadow-pastel-purple/20 hover:bg-pastel-purple-dark transition-all disabled:opacity-50 active:scale-95 mt-4"
              >
                Tiếp tục: Chọn ảnh
              </button>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-xl"
          >
            <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center">
              <UploadIcon className="w-5 h-5 mr-3 text-pastel-purple" />
              Tải ảnh lên
            </h2>

            <div className="mb-8">
              <label className="group block border-2 border-dashed border-gray-100 hover:border-pastel-purple rounded-[2rem] p-8 md:p-12 text-center cursor-pointer transition-all bg-gray-50/30 hover:bg-pastel-purple-light/5 tap-highlight-none">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="hidden" 
                />
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UploadIcon className="w-6 h-6 md:w-8 md:h-8 text-pastel-purple" />
                </div>
                <p className="font-bold text-gray-700 text-sm md:text-base">Nhấn để chọn ảnh</p>
                <p className="text-gray-400 text-[10px] md:text-xs mt-1">Hỗ trợ tải lên nhiều ảnh cùng lúc</p>
              </label>
            </div>

            {previewImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-4 mb-8">
                {previewImages.map((img, index) => (
                  <div key={img.id} className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden group shadow-sm border border-gray-100">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(img.id, index)}
                      className="absolute top-1.5 right-1.5 p-1 bg-white/90 rounded-full text-red-500 shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 md:gap-4">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-4 bg-gray-50 text-gray-500 rounded-xl md:rounded-2xl font-bold hover:bg-gray-100 transition-all text-sm md:text-base active:scale-95"
              >
                Lại
              </button>
              <button 
                type="button"
                disabled={selectedFiles.length === 0 || isUploading}
                onClick={handleSubmit}
                className="flex-grow py-4 bg-pastel-purple text-white rounded-xl md:rounded-2xl font-bold shadow-lg shadow-pastel-purple/20 hover:bg-pastel-purple-dark transition-all disabled:opacity-50 flex flex-col items-center justify-center relative overflow-hidden active:scale-[0.98] text-sm md:text-base"
              >
                {isUploading && (
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                )}
                {isUploading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Đang tải ({Math.floor(uploadProgress)}%)
                  </div>
                ) : (
                  `Tạo Album (${selectedFiles.length})`
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-16 text-center shadow-xl"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-pastel-mint-light/50 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 text-pastel-mint-dark">
              <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-800">Thành công!</h2>
            <p className="text-gray-400 mb-8 md:mb-10 max-w-xs mx-auto text-sm md:text-base text-balance">
              Album <span className="font-bold text-gray-800">"{formData.title}"</span> đã được tạo xong.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="w-full md:w-auto px-12 py-4 bg-pastel-purple text-white rounded-xl md:rounded-2xl font-bold shadow-lg shadow-pastel-purple/20 hover:bg-pastel-purple-dark transition-all active:scale-95"
            >
              Về trang chủ
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Upload;
