import { useState } from 'react';
import { 
  MapPin, Calendar, Edit2, Share, CheckCircle, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileHeader = ({ user, stats, id }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${id}`;
    const shareData = {
      title: `${user.name} on Rafiq`,
      text: `Check out ${user.name}'s travel profile on Rafiq!`,
      url: profileUrl,
    };

    // Use native share sheet if available (mobile browsers, some desktop browsers)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled the share sheet — not an actual error, ignore it
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  };
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative mb-6">
      <div className="h-32 sm:h-48 md:h-64 w-full relative">
        <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>
    
    <div className="px-4 sm:px-6 pb-6 pt-0 relative flex flex-col xl:flex-row xl:items-end justify-between gap-6 -mt-12 sm:-mt-16 md:-mt-12">
      <div className="flex flex-col md:flex-row items-center md:items-end gap-3 sm:gap-5 text-center md:text-left">
        <img 
          src={user.avatarUrl} 
          alt={user.name} 
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-md bg-white z-10"
        />
        <div className="pb-2 text-gray-900 md:mt-16">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
            {user.name} 
            {user.isVerified && <CheckCircle className="w-5 h-5 text-orange-500 fill-orange-500/10" />}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mt-1">{user.tagline}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-xs text-gray-500 mt-2">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {user.location}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {user.joinedDate}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-2 w-full xl:w-auto">
        <div className="flex justify-center gap-4 sm:gap-6 w-full sm:w-auto">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col text-center">
              <span className="text-base sm:text-lg font-bold text-gray-900">{stat.value}</span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={() => navigate(`/profile/edit/${id}`)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button 
            onClick={handleShare}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  </div>
);}

export default ProfileHeader;