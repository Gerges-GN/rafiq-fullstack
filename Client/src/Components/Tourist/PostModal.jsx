import { useState, useEffect } from 'react';
import { 
  X, MapPin, Heart, ChevronLeft, ChevronRight
} from 'lucide-react';

const PostModal = ({ post, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = post.images && post.images.length > 0 ? post.images : [post.imageUrl];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const nextImage = () => setCurrentImageIndex((i) => (i + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button — floats top-right of the whole modal, above the image */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 z-10 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto">
          {/* Image — fixed height, cropped to fill without distortion */}
          <div className="relative w-full h-72 sm:h-80 bg-gray-900">
            <img 
              src={images[currentImageIndex]} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Details below the image */}
          <div className="flex flex-col">
            <div className="flex items-center p-4 border-b border-gray-100">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-orange-500" /> {post.location}
              </div>
            </div>

            <div className="p-4">
              <h2 className="text-lg font-bold text-gray-900">{post.title}</h2>
              <p className="text-xs text-gray-400 mt-1">{post.date}</p>
              <p className="text-sm text-gray-600 mt-3">{post.description}</p>
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center gap-1.5 text-gray-500">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">{post.likes} likes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;