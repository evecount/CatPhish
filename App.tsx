
import React, { useState, useEffect, useMemo } from 'react';
import { AppScreen, User, Match, Question, FrequencyInsight } from './types';
import { transformToCat, generateFrequencyInsight } from './services/geminiService';
import { seedPool, getCoreQuestions, CORE_VIBE_TRUTHS } from './services/seedData';
import ProfileCard from './components/ProfileCard';

// Firebase Imports
import { doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from './services/firebase';

const STORAGE_KEY = 'CATPHISH_V1_STATE';

const LoadingOverlay: React.FC<{ 
  text: string; 
  subtext?: string; 
  progress?: number; 
  cyclePhotos?: string[] 
}> = ({ text, subtext, progress, cyclePhotos }) => {
  const [photoIdx, setPhotoIdx] = useState(0);
  useEffect(() => {
    if (cyclePhotos && cyclePhotos.length > 0) {
      const interval = setInterval(() => setPhotoIdx((prev) => (prev + 1) % cyclePhotos.length), 1000);
      return () => clearInterval(interval);
    }
  }, [cyclePhotos]);

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-900/80 backdrop-blur-2xl flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
      <div className="relative mb-12">
        {cyclePhotos && cyclePhotos.length > 0 ? (
          <div className="w-40 h-40 rounded-[3rem] overflow-hidden border-4 border-orange-500 shadow-2xl animate-pulse">
            <img src={cyclePhotos[photoIdx]} className="w-full h-full object-cover" alt="Loading..." />
          </div>
        ) : (
          <div className="w-24 h-24 border-8 border-orange-500/20 border-t-orange-500 rounded-full animate-spin shadow-2xl" />
        )}
        {progress !== undefined && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-black">{Math.round(progress)}%</div>
        )}
      </div>
      <h2 className="text-3xl font-black italic text-white mb-3 tracking-tighter">{text}</h2>
      {subtext && <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em]">{subtext}</p>}
    </div>
  );
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.LANDING);
  const [dashTab, setDashTab] = useState<'pool' | 'methodology'>('pool');
  const [currentDay, setCurrentDay] = useState(1);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [analysisHistory, setAnalysisHistory] = useState<FrequencyInsight[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformProgress, setTransformProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuestionInDayIndex, setCurrentQuestionInDayIndex] = useState(0);
  const QUESTIONS_PER_DAY = 5;

  const [setupData, setSetupData] = useState({
    catName: '', realName: '', dob: '1995-01-01', phoneNumber: '',
    photos: ['', '', ''] as string[], catCandidates: [] as { image: string, iris: string }[],
    catPhoto: '', irisColor: '', coreTruth: ''
  });

  // --- PERSISTENCE: HYBRID FIREBASE + LOCALSTORAGE ---
  useEffect(() => {
    const restoreState = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.currentUser?.id) {
            const docRef = doc(db, "users", data.currentUser.id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const cloudData = docSnap.data();
              setCurrentUser(cloudData.profile);
              setUserAnswers(cloudData.answers || {});
              setAnalysisHistory(cloudData.analysis || []);
              setCurrentDay(cloudData.currentDay || 1);
              setRevealedIds(new Set(cloudData.revealedIds || []));
              setConnectedIds(new Set(cloudData.connectedIds || []));
              setScreen(AppScreen.DAILY_DASHBOARD);
            } else {
              setCurrentUser(data.currentUser);
              setUserAnswers(data.userAnswers || {});
              setAnalysisHistory(data.analysisHistory || []);
              setCurrentDay(data.currentDay || 1);
              setScreen(AppScreen.DAILY_DASHBOARD);
            }
          }
        } catch (e) { console.error("Restore Failed", e); }
      }
    };
    restoreState();
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      const syncToCloud = async () => {
        try {
          await setDoc(doc(db, "users", currentUser.id), {
            profile: currentUser,
            answers: userAnswers,
            analysis: analysisHistory,
            currentDay,
            revealedIds: Array.from(revealedIds),
            connectedIds: Array.from(connectedIds),
            lastActive: new Date().toISOString()
          }, { merge: true });
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            currentUser, userAnswers, analysisHistory, currentDay
          }));
        } catch (e) { console.error("Cloud Sync Failed", e); }
      };
      syncToCloud();
    }
  }, [currentUser, userAnswers, analysisHistory, currentDay, revealedIds, connectedIds]);

  const coreQuestions = useMemo(() => getCoreQuestions(), []);

  const questionOffset = useMemo(() => {
    const idStr = currentUser?.id || 'temp';
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
      hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % coreQuestions.length;
  }, [currentUser, coreQuestions.length]);

  const dailyQuestions = useMemo(() => {
    const dayOffset = (currentDay - 1) * QUESTIONS_PER_DAY;
    const questions = [];
    for (let i = 0; i < QUESTIONS_PER_DAY; i++) {
      const idx = (questionOffset + dayOffset + i) % coreQuestions.length;
      questions.push(coreQuestions[idx]);
    }
    return questions;
  }, [currentDay, coreQuestions, questionOffset]);

  const currentQuestion = dailyQuestions[currentQuestionInDayIndex];

  const currentMatches = useMemo(() => {
    if (!currentUser) return [];
    return seedPool.map(seed => {
      let score = 0;
      const totalAnswered = Object.keys(userAnswers).length;
      if (totalAnswered === 0) {
        score = 0.5;
      } else {
        let matchCount = 0;
        Object.keys(userAnswers).forEach(qId => {
          if (seed.answers[qId] === userAnswers[qId]) matchCount++;
        });
        score = (matchCount / totalAnswered) * 0.85 + (Math.random() * 0.1);
      }
      return {
        id: `match-${seed.user.id}`,
        users: [currentUser.id, seed.user.id] as [string, string],
        compatibilityScore: Math.min(0.99, score),
        sharedTraits: [],
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        targetUser: seed.user
      };
    }).sort((a, b) => b.compatibilityScore - a.compatibilityScore).slice(0, 15);
  }, [currentUser, userAnswers]);

  const handleEnter = async () => {
    if (typeof (window as any).aistudio !== 'undefined') {
       if (!(await (window as any).aistudio.hasSelectedApiKey())) await (window as any).aistudio.openSelectKey();
    }
    setScreen(AppScreen.SETUP_BASICS);
  };

  const generateProxies = async () => {
    const validPhotos = setupData.photos.filter(p => !!p);
    if (validPhotos.length === 0) return;
    setIsTransforming(true);
    setTransformProgress(0);
    const candidates: { image: string, iris: string }[] = [];
    try {
      for (let i = 0; i < validPhotos.length; i++) {
        const result = await transformToCat(validPhotos[i]);
        candidates.push({ image: result.catImage, iris: result.eyeColor });
        setTransformProgress(((i + 1) / validPhotos.length) * 100);
      }
      setSetupData(prev => ({ ...prev, catCandidates: candidates }));
      setScreen(AppScreen.SETUP_PICK_CAT);
    } catch (e: any) {
      setError("Transformation failed. Check your API key.");
    } finally { setIsTransforming(false); }
  };

  const handleChoice = async (choiceId: string) => {
    const qId = currentQuestion.id;
    const newAnswers = { ...userAnswers, [qId]: choiceId };
    setUserAnswers(newAnswers);

    if (currentQuestionInDayIndex < dailyQuestions.length - 1) {
      setCurrentQuestionInDayIndex(prev => prev + 1);
    } else {
      setLoading(true);
      try {
        const dayAnswers = dailyQuestions.map(q => `Q: ${q.text} A: ${q.options.find(o => o.id === newAnswers[q.id])?.text}`);
        const insight = await generateFrequencyInsight(currentDay, dayAnswers, setupData.coreTruth || currentUser?.coreTruth || "");
        setAnalysisHistory(prev => [...prev, insight]);
        setScreen(AppScreen.FREQUENCY_REPORT);
      } catch (e: any) {
        setError("Analysis protocol failed.");
      } finally { setLoading(false); }
    }
  };

  const advanceDay = () => {
    if (currentDay < 3) {
      setCurrentDay(prev => prev + 1);
      setCurrentQuestionInDayIndex(0);
      setDashTab('pool');
      setScreen(AppScreen.DAILY_DASHBOARD);
    }
  };

  const startOnboarding = async () => {
    if (!setupData.catPhoto || !setupData.catName || !setupData.coreTruth) return;
    setLoading(true);
    try {
      const user: User = {
        id: 'u_' + Date.now(),
        displayName: setupData.catName, realName: setupData.realName, dob: setupData.dob, phoneNumber: setupData.phoneNumber,
        gender: 'Not Specified', location: 'Global', bio: "Broadcasting frequency", interests: [],
        religion: "Experimental", sexualOrientation: "Fluid", wantsKids: "Open", smokingStatus: "No",
        humanPhotoUrl: setupData.photos[0], catPhotoUrl: setupData.catPhoto, irisColor: setupData.irisColor,
        dailyStreak: 0, questions: [], coreTruth: setupData.coreTruth, traitAnswers: []
      };
      setCurrentUser(user);
      setDashTab('pool');
      setScreen(AppScreen.DAILY_DASHBOARD);
    } finally { setLoading(false); }
  };

  const updateProfile = () => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      realName: setupData.realName || currentUser.realName,
      phoneNumber: setupData.phoneNumber || currentUser.phoneNumber
    });
    setScreen(AppScreen.DAILY_DASHBOARD);
  };

  const getStats = (qId: string) => {
    const dist: Record<string, number> = {};
    seedPool.forEach(s => {
      const cId = s.answers[qId];
      dist[cId] = (dist[cId] || 0) + 1;
    });
    return dist;
  };

  const renderMethodology = () => (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      <div className="bg-orange-600 rounded-[3rem] p-8 text-white shadow-2xl space-y-2">
         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Experiment Pool</span>
         <h3 className="text-5xl font-black italic">55 Pioneers</h3>
         <p className="text-sm font-medium opacity-80 leading-relaxed italic">The baseline frequency map of CatPhish.</p>
      </div>

      <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-8">
        <h3 className="text-xl font-black uppercase tracking-[0.2em] text-slate-900 italic">The Methodology</h3>
        <div className="space-y-8 text-sm leading-relaxed text-slate-600 font-medium">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">01. The Human Mirror</p>
            <p>We strip away visual bias. By transforming you into a Feline Proxy, we force a connection through semantic vibe first. Your human face is only revealed to those who align with your frequency.</p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">02. Locked Protocol</p>
            <p>Your answers are permanent. We value thoughtfulness over performance. In a world of infinite editing, CatPhish captures your first, truest resonance.</p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">03. Subconscious Matching</p>
            <p>Using Gemini 3, we analyze the "why" behind your choices, matching you with others on a similar psychological wavelength, not just similar interests.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen bg-slate-50 p-6 pb-32 overflow-y-auto">
      <header className="flex justify-between items-center py-6 mb-8 shrink-0">
        <h1 className="text-4xl font-black italic text-orange-600 tracking-tighter">CatPhish</h1>
        <div className="flex items-center gap-3">
           <button onClick={() => setDashTab(prev => prev === 'pool' ? 'methodology' : 'pool')} className={`p-2.5 rounded-2xl shadow-sm border transition-all ${dashTab === 'methodology' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-orange-600 border-slate-100'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
           </button>
           <button onClick={() => setScreen(AppScreen.EDIT_PROFILE)} className="w-10 h-10 rounded-xl overflow-hidden border-2 border-orange-500 active:scale-95 transition-transform">{currentUser?.catPhotoUrl && <img src={currentUser.catPhotoUrl} className="w-full h-full object-cover" />}</button>
        </div>
      </header>

      {/* Dash Tabs Control */}
      <div className="flex bg-white p-2 rounded-3xl mb-10 shadow-sm border border-slate-100">
         <button onClick={() => setDashTab('pool')} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${dashTab === 'pool' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}>The Pool</button>
         <button onClick={() => setDashTab('methodology')} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${dashTab === 'methodology' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}>The About</button>
      </div>

      {dashTab === 'methodology' ? renderMethodology() : (
        <>
          {analysisHistory.length < currentDay ? (
            <div className="bg-white p-10 rounded-[4rem] shadow-xl border-t-8 border-orange-500 space-y-12 animate-in zoom-in-95 duration-500 text-center">
              <div className="space-y-4">
                 <span className="bg-orange-100 text-orange-600 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">Protocol Day {currentDay}</span>
                 <h2 className="text-4xl font-black italic leading-tight text-slate-900 tracking-tight">Stage {currentDay} Probes Await.</h2>
                 <p className="text-slate-400 font-medium">Complete the next 5 points of resonance to refine your pool.</p>
              </div>
              <button onClick={() => setScreen(AppScreen.SETUP_QUESTIONS)} className="w-full bg-slate-900 text-white py-7 rounded-[2.5rem] font-black text-2xl shadow-2xl uppercase tracking-tighter active:scale-95 transition-all">Begin Day {currentDay} Probe</button>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="flex justify-between items-center px-2">
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300">Resonant Pool</h3>
                  <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Day {currentDay} Broadcast Active</p>
                </div>
                {currentDay < 3 && (
                  <button onClick={advanceDay} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Next Phase</button>
                )}
              </div>
              <div className="grid gap-16 pb-24">
                {currentMatches.map(m => m.targetUser && (
                  <ProfileCard 
                    key={m.id} profile={m.targetUser} 
                    revealed={revealedIds.has(m.targetUser.id) || currentDay === 3} 
                    connected={connectedIds.has(m.targetUser.id)}
                    matchScore={Math.round(m.compatibilityScore * 100)} 
                    onRevealClick={() => setRevealedIds(prev => new Set(prev).add(m.targetUser!.id))} 
                    onConnectClick={() => setConnectedIds(prev => new Set(prev).add(m.targetUser!.id))}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] bg-slate-900/95 backdrop-blur-3xl rounded-[3rem] p-5 flex justify-around shadow-2xl border border-white/10 z-50">
         <button onClick={() => { setScreen(AppScreen.DAILY_DASHBOARD); setDashTab('pool'); }} className="text-orange-500 p-2"><svg className="w-9 h-9" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 00-1.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001 1h2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg></button>
         <button onClick={() => setScreen(AppScreen.STATS_BOARD)} className="text-slate-400 p-2"><svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg></button>
      </nav>
    </div>
  );

  return (
    <div className="max-w-[450px] mx-auto min-h-screen bg-white shadow-2xl relative overflow-hidden flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        {screen === AppScreen.LANDING && (
          <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-orange-500 to-red-600 text-white text-center">
            <div className="mb-10 p-8 bg-white/20 backdrop-blur-3xl rounded-[3.5rem] animate-bounce shadow-2xl">
              <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21c-5.007 0-9-3.993-9-9s3.993-9 9-9 9 3.993 9 9-3.993 9-9 9zm0-16.5c-4.142 0-7.5 3.358-7.5 7.5s3.358 7.5 7.5 7.5 7.5-3.358 7.5-7.5-3.358-7.5-7.5-7.5zM12 9a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" /></svg>
            </div>
            <h1 className="text-8xl font-black mb-6 tracking-tighter italic leading-none text-white">CatPhish</h1>
            <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/20 mb-14 max-w-sm"><p className="text-xl font-black italic leading-tight text-white">No swiping. Complete the 21-point protocol over 3 days to reveal your subconscious frequency.</p></div>
            <button onClick={handleEnter} className="bg-white text-orange-600 w-full max-w-xs py-7 rounded-full font-black text-2xl shadow-2xl hover:scale-105 transition-all mb-4 uppercase active:scale-95">Enter Experiment</button>
            <button onClick={() => setScreen(AppScreen.ABOUT)} className="text-white/60 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">About the Protocol</button>
          </div>
        )}

        {screen === AppScreen.ABOUT && (
          <div className="min-h-screen bg-white p-8 overflow-y-auto">
             <header className="flex justify-between items-center mb-10">
                <button onClick={() => setScreen(AppScreen.LANDING)} className="p-3 bg-slate-50 rounded-2xl text-slate-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg></button>
                <h2 className="text-2xl font-black italic tracking-tighter">The About</h2>
                <div className="w-12" />
             </header>
             {renderMethodology()}
             <div className="fixed bottom-10 left-8 right-8">
                <button onClick={() => setScreen(AppScreen.SETUP_BASICS)} className="w-full bg-slate-900 text-white py-7 rounded-[2.5rem] font-black text-2xl shadow-2xl uppercase tracking-tighter active:scale-95">Begin Onboarding</button>
             </div>
          </div>
        )}
        
        {screen === AppScreen.EDIT_PROFILE && (
          <div className="min-h-screen bg-white p-8 pb-32 flex flex-col items-center overflow-y-auto">
             <header className="w-full flex justify-between items-center mb-12">
                <button onClick={() => setScreen(AppScreen.DAILY_DASHBOARD)} className="p-3 bg-slate-50 rounded-2xl text-slate-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg></button>
                <h2 className="text-2xl font-black italic text-slate-900">Logistical Update</h2>
                <div className="w-12" />
             </header>
             <div className="w-full space-y-8">
                <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white space-y-2 mb-4 shadow-xl">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Feline Proxy (Locked)</p>
                   <h3 className="text-2xl font-black italic">{currentUser?.displayName}</h3>
                   <p className="text-[9px] font-bold text-orange-400 italic">Frequency Identity and Protocol Answers are permanent to ensure thoughtfulness.</p>
                </div>
                
                <div className="space-y-4">
                   <label className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Real Name</label>
                   <input type="text" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] font-black text-xl text-slate-900 outline-none focus:border-orange-200 transition-colors" defaultValue={currentUser?.realName} onChange={e => setSetupData(s => ({...s, realName: e.target.value}))} />
                </div>
                
                <div className="space-y-4">
                   <label className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Path</label>
                   <input type="tel" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] font-black text-xl text-slate-900 outline-none focus:border-orange-200 transition-colors" defaultValue={currentUser?.phoneNumber} onChange={e => setSetupData(p => ({...p, phoneNumber: e.target.value}))} />
                </div>
             </div>
             <button onClick={updateProfile} className="w-full bg-slate-900 text-white py-7 rounded-[2.5rem] font-black text-2xl shadow-2xl mt-12 transition-all active:scale-95">Sync Profile</button>
          </div>
        )}

        {screen === AppScreen.SETUP_BASICS && (
          <div className="min-h-screen bg-white p-8 pb-32 flex flex-col items-center overflow-y-auto text-slate-900">
            {isTransforming && <LoadingOverlay text="Generating Proxy..." subtext="Syncing Feline Layer" progress={transformProgress} cyclePhotos={setupData.photos} />}
            <div className="w-full flex justify-between items-center mb-8 shrink-0">
              <button onClick={() => setScreen(AppScreen.LANDING)} className="p-3 bg-slate-50 rounded-2xl text-slate-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg></button>
              <h2 className="text-2xl font-black italic">Create Profile</h2>
              <div className="w-12" />
            </div>
            <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center italic">Upload 3 selfies for your Feline Layer</p>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map(i => (
                    <label key={i} className={`aspect-square rounded-3xl border-4 flex items-center justify-center overflow-hidden cursor-pointer shadow-xl transition-all ${setupData.photos[i] ? 'border-orange-500' : 'border-slate-100 bg-slate-50'}`}>
                      {setupData.photos[i] ? <img src={setupData.photos[i]} className="w-full h-full object-cover" /> : <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>}
                      <input type="file" className="hidden" accept="image/*" onChange={e => {
                        const file = e.target.files?.[0]; if (file) {
                          const r = new FileReader(); r.onload = () => { const np = [...setupData.photos]; np[i] = r.result as string; setSetupData(prev => ({...prev, photos: np})); }; r.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                 <input type="text" placeholder="Cat Name" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] font-black text-xl text-slate-900 outline-none" value={setupData.catName} onChange={e => setSetupData(p => ({...p, catName: e.target.value}))} />
                 <input type="text" placeholder="Real Name (Private)" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] font-black text-xl text-slate-900 outline-none" value={setupData.realName} onChange={e => setSetupData(p => ({...p, realName: e.target.value}))} />
                 <div className="space-y-2">
                   <input type="tel" placeholder="WhatsApp (e.g. +65 8123 4567)" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] font-black text-xl text-slate-900 outline-none" value={setupData.phoneNumber} onChange={e => setSetupData(p => ({...p, phoneNumber: e.target.value}))} />
                   <p className="px-6 text-[10px] font-black text-orange-600 uppercase tracking-tighter italic text-center">Country Code Required</p>
                 </div>
              </div>
            </div>
            <button onClick={generateProxies} disabled={!setupData.catName || !setupData.realName || !setupData.photos[0] || !setupData.phoneNumber} className="w-full bg-slate-900 text-white py-7 rounded-[2.5rem] font-black text-2xl shadow-2xl mt-12 mb-10 transition-all active:scale-95 disabled:opacity-50">Transform Me</button>
          </div>
        )}

        {screen === AppScreen.SETUP_PICK_CAT && (
          <div className="min-h-screen bg-white p-8 flex flex-col items-center overflow-y-auto text-slate-900">
            <h2 className="text-2xl font-black italic mb-10">Select Mask</h2>
            <div className="grid gap-8 w-full pb-20">
              {setupData.catCandidates.map((c, i) => (
                <button key={i} onClick={() => { setSetupData(prev => ({ ...prev, catPhoto: c.image, irisColor: c.iris })); setScreen(AppScreen.SETUP_DETAILS); }} className="relative w-full aspect-video rounded-[3rem] overflow-hidden border-4 border-slate-100 hover:border-orange-500 transition-all shadow-xl group">
                  <img src={c.image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-black uppercase tracking-widest">Select Protocol Layer</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === AppScreen.SETUP_DETAILS && (
          <div className="min-h-screen bg-white p-8 pb-32 flex flex-col items-center overflow-y-auto text-slate-900">
            <h2 className="text-2xl font-black italic mb-12">Final Details</h2>
            <div className="w-full space-y-12">
               <div className="space-y-6">
                  <div className="flex flex-col gap-1 text-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-orange-600">Protocol Entry Truth</label>
                    <p className="text-[9px] font-bold text-slate-400 italic">This initial choice is permanent.</p>
                  </div>
                  <div className="grid gap-3">
                    {CORE_VIBE_TRUTHS.map(truth => (
                      <button 
                        key={truth.id} 
                        onClick={() => setSetupData(p => ({...p, coreTruth: truth.text}))} 
                        className={`w-full p-6 text-left rounded-[2rem] font-black text-sm border-2 transition-all active:scale-[0.98] ${setupData.coreTruth === truth.text ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 text-slate-900 border-slate-100'}`}
                      >
                        {truth.text}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
            <button onClick={startOnboarding} disabled={!setupData.coreTruth} className="w-full bg-slate-900 text-white py-7 rounded-[2.5rem] font-black text-2xl shadow-2xl mt-12 transition-all active:scale-95 disabled:opacity-30">Finish Setup</button>
          </div>
        )}

        {screen === AppScreen.SETUP_QUESTIONS && (
          <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center overflow-hidden">
             <header className="absolute top-8 left-8 right-8 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Day {currentDay} Protocol {currentQuestionInDayIndex + 1}/5</span>
                <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-orange-600 transition-all duration-500" style={{ width: `${((currentQuestionInDayIndex + 1) / 5) * 100}%` }} /></div>
             </header>
             <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                <h3 className="text-4xl font-black italic tracking-tighter leading-tight text-center px-4 text-white">"{currentQuestion?.text}"</h3>
                <div className="grid gap-4 w-full">
                  {currentQuestion?.options.map(opt => (
                    <button key={opt.id} onClick={() => handleChoice(opt.id)} className="w-full p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-orange-500 text-left font-bold transition-all active:scale-95 hover:bg-white/10 text-white">
                      {opt.text}
                    </button>
                  ))}
                </div>
             </div>
             {loading && <LoadingOverlay text="Analyzing Protocol..." subtext="Syncing Population Data" />}
          </div>
        )}

        {screen === AppScreen.DAILY_DASHBOARD && renderDashboard()}

        {screen === AppScreen.FREQUENCY_REPORT && (
          <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col overflow-y-auto">
            <header className="flex justify-between items-center mb-10">
               <h2 className="text-2xl font-black italic text-orange-600">Day {currentDay} Report</h2>
               <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full border border-white/10 text-white">Synchronized</span>
            </header>
            <div className="flex-1 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
               <div className="space-y-4 text-white">
                  <span className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em]">Subconscious Archetype</span>
                  <h3 className="text-5xl font-black italic tracking-tighter leading-none text-white">{analysisHistory[currentDay-1]?.archetype}</h3>
                  <p className="text-white/60 text-lg leading-relaxed">{analysisHistory[currentDay-1]?.summary}</p>
               </div>
               <div className="grid gap-6">
                  <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 space-y-4">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-white">Subconscious Search</span>
                     <p className="font-bold text-xl leading-tight text-white">"{analysisHistory[currentDay-1]?.seeking}"</p>
                  </div>
                  <div className="bg-orange-600/10 p-8 rounded-[3rem] border border-orange-600/20 space-y-4">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-white">Dating Shadow</span>
                     <p className="font-bold text-xl leading-tight italic text-white">"{analysisHistory[currentDay-1]?.shadow}"</p>
                  </div>
               </div>
            </div>
            <button onClick={() => setScreen(AppScreen.DAILY_DASHBOARD)} className="w-full bg-orange-600 text-white py-7 rounded-[2.5rem] font-black text-2xl shadow-2xl mt-12 mb-8 uppercase tracking-tighter active:scale-95 transition-all">View Resonant Pool</button>
          </div>
        )}
        
        {screen === AppScreen.STATS_BOARD && (
          <div className="min-h-screen bg-white p-8 pb-32 overflow-y-auto">
             <header className="flex justify-between items-center mb-12">
                <button onClick={() => setScreen(AppScreen.DAILY_DASHBOARD)} className="p-3 bg-slate-50 rounded-2xl text-slate-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg></button>
                <h2 className="text-2xl font-black italic tracking-tighter">Population Map</h2>
                <div className="w-12" />
             </header>
             <div className="space-y-12">
                <div className="bg-orange-600 rounded-[3rem] p-8 text-white shadow-2xl space-y-2">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Experiment Pool</span>
                   <h3 className="text-5xl font-black italic">55 Pioneers</h3>
                   <p className="text-sm font-medium opacity-80 leading-relaxed italic">The baseline frequency map of CatPhish.</p>
                </div>
                <div className="space-y-10">
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-300 px-2">Live Protocol Distribution</h3>
                   {coreQuestions.filter(q => !!userAnswers[q.id]).map(q => {
                      const stats = getStats(q.id);
                      const userChoiceId = userAnswers[q.id];
                      return (
                        <div key={q.id} className="space-y-4">
                           <h4 className="text-sm font-black text-slate-900 pr-10">"{q.text}"</h4>
                           <div className="space-y-3">
                              {q.options.map(o => {
                                 const count = stats[o.id] || 0;
                                 const percent = Math.round((count / 55) * 100);
                                 const isUser = userChoiceId === o.id;
                                 return (
                                   <div key={o.id} className="relative h-12 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                                      <div className={`absolute inset-y-0 left-0 transition-all duration-[1500ms] ${isUser ? 'bg-orange-500' : 'bg-slate-200'}`} style={{ width: `${percent}%` }} />
                                      <div className="absolute inset-0 px-5 flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                                         <span className={percent > 40 || isUser ? 'text-white' : 'text-slate-500'}>{o.text} {isUser && '(You)'}</span>
                                         <span className={percent > 40 || isUser ? 'text-white' : 'text-slate-500'}>{percent}%</span>
                                      </div>
                                   </div>
                                 );
                              })}
                           </div>
                        </div>
                      );
                   })}
                </div>
             </div>
          </div>
        )}
      </div>
      {error && (<div className="fixed top-8 left-1/2 -translate-x-1/2 z-[300] bg-red-600 text-white px-8 py-4 rounded-full text-xs font-black shadow-2xl border-2 border-white/20">{error}</div>)}
    </div>
  );
};

export default App;
