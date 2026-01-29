
import React from 'react';
import { User } from '../types';

interface ProfileCardProps {
  profile: User;
  revealed: boolean;
  connected: boolean;
  matchScore?: number;
  onRevealClick: () => void;
  onConnectClick: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  revealed, 
  connected, 
  matchScore, 
  onRevealClick, 
  onConnectClick 
}) => {
  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getWhatsAppLink = (phone: string) => {
    const cleanNumber = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}`;
  };

  return (
    <div className="relative w-full h-[620px] bg-white rounded-[3.5rem] shadow-2xl overflow-hidden transition-all duration-700 hover:shadow-orange-300/40 border border-slate-100 group">
      <div className="absolute inset-0 bg-slate-900">
        <img 
          src={profile.humanPhotoUrl} 
          alt="Human Mirror"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] ${revealed ? 'grayscale-0 blur-0' : 'grayscale brightness-50 blur-[20px] scale-110'}`}
        />

        {!revealed && (
          <div className="absolute inset-0 transition-all duration-[1000ms] animate-in fade-in">
            <img src={profile.catPhotoUrl} alt="Feline Proxy" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/20 via-transparent to-red-600/20 mix-blend-screen" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
      </div>

      <div className="absolute top-6 left-6 z-20">
        <div className="bg-orange-600/90 backdrop-blur-xl text-white px-5 py-2.5 rounded-2xl flex flex-col items-center shadow-2xl border border-white/20">
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Resonance</span>
          <span className="text-2xl font-black">{matchScore}%</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-10 text-white z-20">
        <div className="space-y-6">
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-4xl font-black italic tracking-tighter">
                {revealed ? profile.realName : profile.displayName}, {calculateAge(profile.dob)}
              </h2>
              {connected && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                  Matched Frequency
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
               <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10">
                 {profile.location}
               </span>
               <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10">
                 {profile.interests[0] || 'Vibe Seeker'}
               </span>
            </div>

            <p className="text-base font-medium opacity-90 leading-relaxed italic line-clamp-3 mb-6">
              "{profile.bio}"
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            {!revealed ? (
              <button 
                onClick={onRevealClick}
                className="w-full bg-white text-orange-600 py-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
              >
                Establish Protocol
              </button>
            ) : !connected ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-center text-white/60 mb-2">Human Mirror Unlocked. Final Connection Choice?</p>
                 <button 
                  onClick={onConnectClick}
                  className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl border border-white/20"
                >
                  OK to Connect
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <a 
                  href={getWhatsAppLink(profile.phoneNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/10 backdrop-blur-2xl p-6 rounded-3xl border border-white/20 space-y-4 hover:bg-white/20 transition-all active:scale-95"
                >
                   <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase opacity-60 tracking-widest">WhatsApp Secure Path</span>
                        <span className="text-2xl font-black tracking-widest text-white">{profile.phoneNumber}</span>
                      </div>
                      <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-xl animate-bounce">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.825c1.556.925 3.178 1.414 4.85 1.415 5.128 0 9.303-4.175 9.305-9.303 0-2.485-.968-4.822-2.725-6.582-1.756-1.761-4.094-2.729-6.584-2.729-5.129 0-9.303 4.175-9.306 9.303-.001 1.75.475 3.457 1.378 4.927l-.997 3.642 3.729-.978zm11.235-6.014c-.31-.155-1.838-.906-2.122-1.01-.283-.103-.49-.155-.694.155-.205.31-.794 1.01-.973 1.21-.178.205-.357.231-.667.077-.31-.155-1.308-.482-2.492-1.538-.92-.821-1.541-1.835-1.721-2.145-.18-.31-.019-.477.136-.631.14-.139.31-.362.466-.544.155-.181.206-.31.31-.517.103-.207.051-.387-.026-.543-.077-.155-.694-1.675-.951-2.293-.248-.601-.5-.519-.694-.529-.181-.01-.388-.012-.594-.012s-.542.077-.826.388c-.284.31-1.084 1.061-1.084 2.587 0 1.527 1.11 3.003 1.265 3.21.155.207 2.185 3.336 5.291 4.675.738.318 1.315.508 1.763.65.742.236 1.418.203 1.952.123.595-.088 1.838-.751 2.096-1.474.258-.724.258-1.344.181-1.475-.077-.13-.284-.207-.594-.362z"/>
                        </svg>
                      </div>
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-green-400 text-center animate-pulse">Tap to message immediately</p>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
