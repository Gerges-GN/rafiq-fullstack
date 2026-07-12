import { useState } from 'react';
import { 
  MapPin, Heart, MessageCircle, Bookmark
} from 'lucide-react';

const PostCard = ({ post, onToggleSave, onOpenPost }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleSave = async (e) => {
    e.stopPropagation();
    if (isSaving) return;

    const previousState = post.saved;
    onToggleSave(post.id, !previousState);
    setIsSaving(true);

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${post.id}/save`, {
        method: 'PATCH',
      });

      if (!res.ok) throw new Error('Failed to update saved status');

      const data = await res.json();
      onToggleSave(post.id, data.saved);
    } catch (err) {
      console.error('Save toggle failed:', err);
      onToggleSave(post.id, previousState);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onOpenPost(post)}
    >
      <div className="relative h-48 sm:h-56 lg:h-48 w-full overflow-hidden bg-gray-100">
        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <MapPin className="w-3 h-3" /> {post.location}
        </div>
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
          {post.imageCount}
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="font-bold text-gray-900 truncate hover:text-orange-500 transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{post.date}</p>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.description}</p>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 text-gray-500">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-xs hover:text-orange-500 transition-colors">
              <Heart className="w-4 h-4" /> {post.likes}
            </button>
          </div>
          <button 
            onClick={handleToggleSave}
            disabled={isSaving}
            className="hover:text-orange-500 transition-colors disabled:opacity-50"
          >
            <Bookmark 
              className={`w-4 h-4 transition-colors ${post.saved ? 'fill-orange-500 text-orange-500' : ''}`} 
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;