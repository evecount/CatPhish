
import React, { useState } from 'react';
import { AppScreen, UserProfile, UserAnswer } from './types';
import { transformToCat, generateQuizFromAnswers } from './services/geminiService';
import ProfileCard from './components/ProfileCard';

const THIRTY_SIX_QUESTIONS = [
  "If you could share a silver platter of salmon with anyone in the world, who would it be?",
  "Do you dream of becoming an internet-famous feline? In what way?",
  "Before meowing at someone, do you ever rehearse your purr? Why?",
  "What would be a “perfect” day in your cardboard box?",
  "When did you last sing to the moon? Or to another stray?",
  "If you lived 9 lives, would you rather keep a sharp kitten mind or a sleek predator body for the last 6?",
  "Do you have a secret hunch about how you'll lose your 9th life?",
  "Name three things you and your future pride-mate appear to have in common.",
  "For what in your territory do you feel most grateful?",
  "If you could change anything about the litter box you were raised in, what would it be?",
  "If you could wake up tomorrow having gained any one feline ability (like always landing on your feet), what would it be?",
  "What is the greatest catch of your life?",
  "What do you value most in a fellow alley cat?",
  "What is your most treasured memory of a warm sunbeam?",
  "What is your most terrible memory of a cold bath?",
  "What does being part of a pride mean to you?",
  "What roles do grooming and affection play in your life?",
  "How do you feel about your relationship with the Mother of your litter?",
  "Complete this sentence: “I wish I had a human with whom I could share ... “",
  "If you were to die this evening with no opportunity to communicate with anyone, what would you most regret not having meowed to someone?",
  "Your scratching post is on fire. You have time to save one item. What is it?"
];

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.LANDING);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);

  // Setup State
  const [setupName, setSetupName] = useState('');
  const [setupAge, setSetupAge] = useState<string>('24');
  const [setupPhoto, setSetupPhoto] = useState('');
  const [setupAnswers, setSetupAnswers] = useState<UserAnswer[]>([]);
  const [coreTruth, setCoreTruth] = useState('');
  const [currentDraftAnswer, setCurrentDraftAnswer] = useState('');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

  const [activeQuiz, setActiveQuiz] = useState<{ profile: UserProfile, questionIndex: number } | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSetupPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEnterLitterBox = async () => {
    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }
    setScreen(AppScreen.SETUP_BASICS);
  };

  const addAnswer = () => {
    if (selectedQuestionIndex === null || !currentDraftAnswer) return;
    const q = THIRTY_SIX_QUESTIONS[selectedQuestionIndex];
    setSetupAnswers(prev => [...prev, { question: q, answer: currentDraftAnswer }]);
    setCurrentDraftAnswer('');
    setSelectedQuestionIndex(null);
  };

  const startOnboarding = async () => {
    if (!coreTruth) return alert("Please answer the core truth question!");
    if (!setupPhoto) return alert("A selfie is required for Cat-ification!");
    if (!setupName) return alert("Please enter a name.");

    setLoading(true);
    setError(null);
    try {
      const { catImage, description, eyeColor } = await transformToCat(setupPhoto);
      const questions = await generateQuizFromAnswers(setupName, setupAnswers, coreTruth);

      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        name: setupName,
        age: parseInt(setupAge) || 24,
        bio: setupAnswers[0]?.answer.substring(0, 100) + "...",
        originalPhoto: setupPhoto,
        catPhoto: catImage,
        catDescription: description,
        eyeColor: eyeColor || 'Mystery',
        questions: questions,
        deepAnswers: setupAnswers,
        coreTruth: coreTruth
      };

      setProfiles(prev => [newUser, ...prev]);
      setScreen(AppScreen.SWIPE);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key error. Please re-select your key.");
        await (window as any).aistudio.openSelectKey();
      } else {
        setError("Protocol failure. Ensure your API Key is valid and billing is active.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    if (!activeQuiz) return;
    const { profile, questionIndex } = activeQuiz;
    const isCorrect = answerIndex === profile.questions[questionIndex].correctIndex;

    if (isCorrect) {
      if (questionIndex === profile.questions.length - 1) {
        setRevealedIds(prev => new Set(prev).add(profile.id));
        setScreen(AppScreen.SWIPE);
        setActiveQuiz(null);
      } else {
        setActiveQuiz({ ...activeQuiz, questionIndex: questionIndex + 1 });
      }
    } else {
      alert("Semantic mismatch detected. Verification failed.");
    }
  };

  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-orange-500 to-red-600 text-white text-center">
      <div className="mb-8 p-4 bg-white/20 backdrop-blur-xl rounded-full animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21c-5.007 0-9-3.993-9-9s3.993-9 9-9 9 3.993 9 9-3.993 9-9 9zm0-16.5c-4.142 0-7.5 3.358-7.5 7.5s3.358 7.5 7.5 7.5 7.5-3.358 7.5-7.5-3.358-7.5-7.5-7.5zM12 9a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10a1 1 0 110-2 1 1 0 010 2zm8 0a1 1 0 110-2 1 1 0 010 2zm-4 7s1.5-1.5 3-1.5S15 17 15 17M9 17s1.5-1.5 3-1.5" />
        </svg>
      </div>
      <h1 className="text-7xl font-black mb-4 tracking-tighter italic">CatPhish</h1>
      <p className="text-xl mb-12 opacity-90 max-w-md font-medium">The only place where getting cat-phished is exactly the point. Unmask your matches.</p>
      
      <button onClick={handleEnterLitterBox} className="bg-white text-orange-600 px-12 py-5 rounded-full font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all mb-8 uppercase tracking-tight">
        Enter the Litter Box
      </button>
      
      <button onClick={() => setShowAbout(true)} className="text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors border-b border-white/20 pb-1">
        Security Architecture
      </button>

      {showAbout && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-md bg-white text-slate-900 rounded-[2.5rem] p-10 shadow-2xl relative text-left my-auto">
            <button onClick={() => setShowAbout(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h2 className="text-3xl font-black text-orange-600 mb-6 italic tracking-tight">Zero Trust Social</h2>
            <div className="space-y-6 text-sm leading-relaxed text-slate-500">
              <p><strong className="text-slate-900">The Problem:</strong> Traditional visual identity is a vulnerability. 1-in-4 dating profiles are non-human scripts.</p>
              <p><strong className="text-slate-900">The Action:</strong> Using Gemini 3's native multimodality, we generate consistent Cat Personas that mirror your pose, clothing, and environment (Privacy-by-Design).</p>
              <p><strong className="text-slate-900">The Tech:</strong> Seekers must pass 'Logic Traps'—AI-generated semantic verification—to unmask original images. Provenance through personality.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSetupBasics = () => (
    <div className="min-h-screen bg-white p-8 pb-32 overflow-y-auto flex flex-col relative z-10">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 italic tracking-tight">1. The Face</h2>
        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Step 1</span>
      </div>
      
      <div className="space-y-8 flex-1">
        <div className="flex flex-col items-center gap-6">
          <label className="relative group cursor-pointer block">
            <div className="w-56 h-56 rounded-[3rem] bg-slate-50 border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-orange-400 transition-colors">
              {setupPhoto ? <img src={setupPhoto} className="w-full h-full object-cover" alt="Selfie" /> : (
                <div className="text-center p-6 space-y-2">
                  <svg className="w-12 h-12 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Capture Persona</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Public Alias</label>
            <input 
              type="text" 
              value={setupName} 
              onChange={(e) => setSetupName(e.target.value)} 
              className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:border-orange-500 font-bold text-slate-800 text-lg"
              placeholder="e.g. Neon Whiskers"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Earth Years</label>
            <input 
              type="number" 
              value={setupAge} 
              onChange={(e) => setSetupAge(e.target.value)} 
              className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:border-orange-500 font-bold text-slate-800 text-lg"
            />
          </div>
        </div>
      </div>

      <div className="pt-10">
        <button 
          onClick={() => setScreen(AppScreen.SETUP_QUESTIONS)} 
          disabled={!setupName || !setupPhoto}
          className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl shadow-xl disabled:bg-slate-100 disabled:text-slate-300"
        >
          Proceed to Verification
        </button>
      </div>
    </div>
  );

  const renderSetupQuestions = () => (
    <div className="min-h-screen bg-white p-8 pb-32 overflow-y-auto flex flex-col relative">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 italic tracking-tight">2. The Soul</h2>
        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Step 2</span>
      </div>
      
      <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">Select 3 anchors for your Logic Trap. These ensure only genuine humans can unmask your identity.</p>
      
      <div className="space-y-6 mb-12 flex-1">
        {setupAnswers.map((a, i) => (
          <div key={i} className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 animate-in slide-in-from-right duration-300">
            <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-2 opacity-60">{a.question}</p>
            <p className="text-sm text-slate-700 font-bold">{a.answer}</p>
          </div>
        ))}

        {setupAnswers.length < 3 && selectedQuestionIndex === null && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Semantic Anchors</p>
            <div className="flex flex-col gap-3">
              {THIRTY_SIX_QUESTIONS.filter(q => !setupAnswers.find(a => a.question === q)).slice(0, 5).map((q, i) => (
                <button key={i} onClick={() => setSelectedQuestionIndex(THIRTY_SIX_QUESTIONS.indexOf(q))} className="text-left p-5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-sm font-black text-slate-600">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedQuestionIndex !== null && (
          <div className="bg-white border-4 border-orange-500 p-6 rounded-[2.5rem] shadow-2xl space-y-4 mb-32">
             <p className="font-black text-slate-800 text-lg italic leading-tight">{THIRTY_SIX_QUESTIONS[selectedQuestionIndex]}</p>
             <textarea 
               autoFocus
               className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-700 font-bold min-h-[140px]" 
               placeholder="Your honest meow..." 
               value={currentDraftAnswer}
               onChange={(e) => setCurrentDraftAnswer(e.target.value)}
             />
             <div className="flex gap-3">
               <button onClick={addAnswer} className="flex-1 bg-orange-500 text-white py-4 rounded-xl font-black">Secure Answer</button>
               <button onClick={() => setSelectedQuestionIndex(null)} className="px-6 bg-slate-100 text-slate-400 py-4 rounded-xl font-black">Drop</button>
             </div>
          </div>
        )}
      </div>

      <div className="pt-10">
        <button 
          disabled={setupAnswers.length < 3}
          onClick={() => setScreen(AppScreen.SETUP_CORE)}
          className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl shadow-xl disabled:bg-slate-50 disabled:text-slate-200"
        >
          Final Truth Check
        </button>
      </div>
    </div>
  );

  const renderSetupCore = () => (
    <div className="min-h-screen bg-orange-600 p-10 flex flex-col text-white overflow-y-auto">
      <div className="flex justify-between items-center mb-16">
        <h2 className="text-4xl font-black italic tracking-tighter">3. The Core</h2>
        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Step 3</span>
      </div>
      
      <div className="space-y-10 flex-1">
        <div className="space-y-4">
          <p className="text-2xl font-black leading-tight italic">
            Do you care more about physical aesthetics or internal semantics? And what is your objective here: a flash or a flame?
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Zero Trust Verification Active</p>
        </div>

        <textarea 
          value={coreTruth}
          onChange={(e) => setCoreTruth(e.target.value)}
          placeholder="Enter the deep truth..."
          className="w-full p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] outline-none placeholder:text-white/30 font-bold text-lg min-h-[250px] focus:bg-white/20 transition-all"
        />
      </div>

      <div className="py-10">
        <button 
          onClick={startOnboarding}
          disabled={!coreTruth || loading}
          className="w-full bg-white text-orange-600 py-6 rounded-3xl font-black text-2xl shadow-2xl disabled:bg-white/20 disabled:text-white/30"
        >
          {loading ? 'Propagating Purr...' : 'Execute Protocol'}
        </button>
        {error && <p className="text-white text-center text-xs font-black bg-black/40 p-4 rounded-2xl mt-6 uppercase tracking-widest border border-white/10">{error}</p>}
      </div>
    </div>
  );

  const renderSwipe = () => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center animate-spin mb-6">
          <svg className="w-10 h-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 11v1m8-5h-1M4 11H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" /></svg>
        </div>
        <p className="font-black text-slate-300 uppercase tracking-widest">Searching the Litter...</p>
      </div>
    );
    
    const isRevealed = revealedIds.has(currentProfile.id);
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6">
        <header className="w-full flex justify-between items-center py-6 mb-4">
          <div className="text-4xl font-black text-orange-600 tracking-tighter italic">CatPhish</div>
        </header>
        <div className="w-full max-w-sm flex-1 flex flex-col gap-8">
          <ProfileCard profile={currentProfile} revealed={isRevealed} onRevealClick={() => { setActiveQuiz({ profile: currentProfile, questionIndex: 0 }); setScreen(AppScreen.QUIZ); }} />
          <div className="flex justify-around items-center pt-4">
            <button onClick={() => setCurrentIndex((currentIndex + 1) % profiles.length)} className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-300 hover:text-red-500 border border-slate-100 active:scale-90 transition-all">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button onClick={() => setCurrentIndex((currentIndex + 1) % profiles.length)} className="w-24 h-24 bg-orange-600 rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-all">
              <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!activeQuiz) return null;
    const { profile, questionIndex } = activeQuiz;
    const q = profile.questions[questionIndex];
    return (
      <div className="min-h-screen bg-orange-600 p-8 flex flex-col justify-center items-center">
        <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl w-full max-w-sm">
          <div className="flex justify-between mb-10 items-center">
             <h3 className="text-orange-600 font-black uppercase tracking-widest text-[9px] italic">Logic Trap {questionIndex + 1} of 3</h3>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-10 leading-tight italic">"{q.question}"</h2>
          <div className="space-y-4">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => handleQuizAnswer(i)} className="w-full text-left p-6 rounded-[2rem] border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 font-bold text-slate-700 transition-all">
                {opt}
              </button>
            ))}
          </div>
          <button onClick={() => { setScreen(AppScreen.SWIPE); setActiveQuiz(null); }} className="mt-12 text-slate-300 w-full text-[10px] font-black uppercase tracking-widest">Abandon Unmasking</button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[450px] mx-auto min-h-screen relative bg-white shadow-2xl overflow-x-hidden">
      {screen === AppScreen.LANDING && renderLanding()}
      {screen === AppScreen.SETUP_BASICS && renderSetupBasics()}
      {screen === AppScreen.SETUP_QUESTIONS && renderSetupQuestions()}
      {screen === AppScreen.SETUP_CORE && renderSetupCore()}
      {screen === AppScreen.SWIPE && renderSwipe()}
      {screen === AppScreen.QUIZ && renderQuiz()}
    </div>
  );
};

export default App;
