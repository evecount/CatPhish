
import React from 'react';
import { UserProfile } from '../types';

interface ProfileCardProps {
  profile: UserProfile;
  revealed: boolean;
  onRevealClick: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, revealed, onRevealClick }) => {
  return (
    <div className="relative w-full h-[500px] bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-500">
      <div className="absolute inset-0">
        <img 
          src={revealed ? profile.originalPhoto : profile.catPhoto} 
          alt="Profile"
          className="w-full h-full object-cover transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {profile.name}, {profile.age}
              {!revealed && <span className="text-xs bg-orange-500 px-2 py-1 rounded-full uppercase">Catified</span>}
            </h2>
            <p className="text-sm opacity-90 mt-1 line-clamp-2">{profile.bio}</p>
          </div>
          {!revealed && (
            <button 
              onClick={onRevealClick}
              className="bg-white text-orange-600 px-4 py-2 rounded-full font-semibold text-sm hover:bg-orange-50 transition-colors shadow-lg"
            >
              Reveal Face
            </button>
          )}
        </div>
      </div>
      
      {!revealed && (
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full border border-white/20">
          Iris: {profile.eyeColor}
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
