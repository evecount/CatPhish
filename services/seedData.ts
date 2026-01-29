
import { User, Question } from "../types";

export interface SeedUser {
  user: User;
  answers: Record<string, string>; // questionId -> choiceId
  coreResponse: string;
}

export const CORE_VIBE_TRUTHS = [
  { id: "v1", text: "Seeking a partner in absolute chaos", trait: "Chaotic" },
  { id: "v2", text: "Looking for a warm lap and zero drama", trait: "Peaceful" },
  { id: "v3", text: "Need someone to hunt the red dot with", trait: "Ambitious" },
  { id: "v4", text: "Searching for domestic silence", trait: "Introverted" },
  { id: "v5", text: "I am the main character in this house", trait: "Egotistical" },
  { id: "v6", text: "Exploring the void, one meow at a time", trait: "Mystical" },
  { id: "v7", text: "Just here for the premium salmon snacks", trait: "Materialistic" },
  { id: "v8", text: "A protector of the perimeter", trait: "Guardian" }
];

const HUMAN_IMAGES = [
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d", "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce", "https://images.unsplash.com/photo-1531123897727-8f129e1688ce",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e", "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1",
  "https://images.unsplash.com/photo-1542156822-6924d1a71ace", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
  "https://images.unsplash.com/photo-1504257432389-52343af06ae3", "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
  "https://images.unsplash.com/photo-1463453091185-61582044d556", "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04",
  "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f", "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a", "https://images.unsplash.com/photo-1554151228-14d9def656e4",
  "https://images.unsplash.com/photo-1595152772835-219674b2a8a6", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6"
];

const CAT_IMAGES = [
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba", "https://images.unsplash.com/photo-1573865526739-10659fec78a5",
  "https://images.unsplash.com/photo-1548247416-ec66f4900b2e", "https://images.unsplash.com/photo-1533738363-b7f9aef128ce",
  "https://images.unsplash.com/photo-1513245543132-31f507417b26", "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13",
  "https://images.unsplash.com/photo-1511497584788-876760111969", "https://images.unsplash.com/photo-1516733968668-dbdce39c46ef",
  "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec", "https://images.unsplash.com/photo-1543852786-1cf6624b9987",
  "https://images.unsplash.com/photo-1519052537078-e6302a4968d4", "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
  "https://images.unsplash.com/photo-1472491235688-bdc81a63246e", "https://images.unsplash.com/photo-1517331156700-3c241d2b4d83",
  "https://images.unsplash.com/photo-1561948955-570b270e7c36", "https://images.unsplash.com/photo-1574158622645-3142416f007e",
  "https://images.unsplash.com/photo-1592194996308-7b43878e84a6", "https://images.unsplash.com/photo-1577023311546-cdc07a8454d9"
];

const CAT_NAMES = [
  "Shadow", "Luna", "Mochi", "Oliver", "Simba", "Chloe", "Milo", "Whiskers", "Coco", "Bella",
  "Charlie", "Toby", "Sophie", "Max", "Lucy", "Leo", "Jasper", "Daisy", "Felix", "Nala",
  "Pumpkin", "Midnight", "Gizmo", "Cleo", "Buster", "Ziggy", "Pepper", "Frankie", "Blue", "Smokey",
  "Boots", "Oreo", "Patches", "Sassy", "Zoe", "Misty", "Tiger", "Gracie", "Lily", "Millie",
  "Rosie", "Ruby", "Willow", "Abby", "Angel", "Annie", "Baby", "Bear", "Duke", "Gus",
  "Harley", "Koda", "Murphy", "Otis", "Riley"
];

const CORE_QUESTIONS: Question[] = [
  { id: "q1", text: "If you could share a silver platter of salmon with anyone, who would it be?", type: "cat-based", options: [
    { id: "q1a", text: "The Dalai Lama", trait: "Spiritual" }, { id: "q1b", text: "Garfield", trait: "Gluttonous" }, { id: "q1c", text: "My Reflection", trait: "Narcissistic" }, { id: "q1d", text: "A stray kitten", trait: "Altruistic" }
  ]},
  { id: "q2", text: "Your scratching post is on fire. You save one item:", type: "cat-based", options: [
    { id: "q2a", text: "My favorite toy mouse", trait: "Sentimental" }, { id: "q2b", text: "The bag of catnip", trait: "Hedonistic" }, { id: "q2c", text: "The human's laptop", trait: "Chaotic" }, { id: "q2d", text: "Nothing, I watch it burn", trait: "Nihilistic" }
  ]},
  { id: "q3", text: "A red laser dot appears on the wall. It is the secret to the universe. Do you:", type: "cat-based", options: [
    { id: "q3a", text: "Chase it until I collapse", trait: "Driven" }, { id: "q3b", text: "Stare at it with judgment", trait: "Analytical" }, { id: "q3c", text: "Meow for help", trait: "Dependent" }, { id: "q3d", text: "Ignore it, I am the laser", trait: "Enlightened" }
  ]},
  { id: "q4", text: "A mirror is placed in your path. What do you see behind the eyes?", type: "cat-based", options: [
    { id: "q4a", text: "An ancient predator", trait: "Primal" }, { id: "q4b", text: "A lost child", trait: "Vulnerable" }, { id: "q4c", text: "Infinite static", trait: "Complex" }, { id: "q4d", text: "Just a fluffy cat", trait: "Grounded" }
  ]},
  { id: "q5", text: "The human stops speaking. They only listen to your purr. What is your message?", type: "cat-based", options: [
    { id: "q5a", text: "Everything is okay", trait: "Comforting" }, { id: "q5b", text: "Feed me now", trait: "Practical" }, { id: "q5c", text: "We are all energy", trait: "Mystical" }, { id: "q5d", text: "The silence is enough", trait: "Stoic" }
  ]},
  { id: "q6", text: "A door is left slightly ajar. Beyond it is total darkness. Do you:", type: "cat-based", options: [
    { id: "q6a", text: "Sprint inside immediately", trait: "Impulsive" }, { id: "q6b", text: "Paw at the air cautiously", trait: "Wary" }, { id: "q6c", text: "Wait for the human to go first", trait: "Submissive" }, { id: "q6d", text: "Close it with my nose", trait: "Controlling" }
  ]},
  { id: "q7", text: "You find yourself on the highest shelf in the room. You look down at the world and feel:", type: "cat-based", options: [
    { id: "q7a", text: "Pure, divine superiority", trait: "Egotistical" }, { id: "q7b", text: "A dizzying fear of falling", trait: "Anxious" }, { id: "q7c", text: "A duty to protect the floor", trait: "Guardian" }, { id: "q7d", text: "Nothing, I'm going to napping here", trait: "Indifferent" }
  ]},
  { id: "q8", text: "A cardboard box appears. It is empty, yet perfect. Why?", type: "cat-based", options: [
    { id: "q8a", text: "It defines my boundaries", trait: "Structured" }, { id: "q8b", text: "It hides my true form", trait: "Secretive" }, { id: "q8c", text: "It smells of potential", trait: "Optimistic" }, { id: "q8d", text: "It is a trap I choose to enter", trait: "Self-aware" }
  ]},
  { id: "q9", text: "Rain begins to tap on the window pane. The sound is:", type: "cat-based", options: [
    { id: "q9a", text: "A rhythm for my sorrow", trait: "Melancholic" }, { id: "q9b", text: "A reminder of my safety", trait: "Security-focused" }, { id: "q9c", text: "An annoying distraction", trait: "Irritable" }, { id: "q9d", text: "A song I must dance to", trait: "Playful" }
  ]},
  { id: "q10", text: "A neighborhood stray watches you from the fence. You respond with:", type: "cat-based", options: [
    { id: "q10a", text: "A hiss of territorial pride", trait: "Aggressive" }, { id: "q10b", text: "A curious tilt of the head", trait: "Open" }, { id: "q10c", text: "A slow blink of empathy", trait: "Compassionate" }, { id: "q10d", text: "Complete, icy silence", trait: "Distant" }
  ]},
  { id: "q11", text: "Moonlight spills across the floor. You choose to:", type: "cat-based", options: [
    { id: "q11a", text: "Bat at the dust motes", trait: "Dreamy" }, { id: "q11b", text: "Hunt the shadows within it", trait: "Determined" }, { id: "q11c", text: "Sleep in its cold glow", trait: "Lonely" }, { id: "q11d", text: "Ignore it for the kitchen light", trait: "Materialistic" }
  ]},
  { id: "q12", text: "The human turns on a loud vacuum. Your soul reacts by:", type: "cat-based", options: [
    { id: "q12a", text: "Vanishing into the void", trait: "Avoidant" }, { id: "q12b", text: "Attacking the beast", trait: "Courageous" }, { id: "q12c", text: "Cowering under a chair", trait: "Fearful" }, { id: "q12d", text: "Judging from a distance", trait: "Superior" }
  ]},
  { id: "q13", text: "The catnip garden is in full bloom. You partake because:", type: "cat-based", options: [
    { id: "q13a", text: "I need to escape reality", trait: "Escapist" }, { id: "q13b", text: "It makes me more myself", trait: "Authentic" }, { id: "q13c", text: "Everyone else is doing it", trait: "Conformist" }, { id: "q13d", text: "It reveals the hidden colors", trait: "Visionary" }
  ]},
  { id: "q14", text: "You give a slow blink to a stranger. It means:", type: "cat-based", options: [
    { id: "q14a", text: "I trust you with my life", trait: "Trusting" }, { id: "q14b", text: "I am bored of this interaction", trait: "Dismissive" }, { id: "q14c", text: "You are allowed to exist", trait: "Tolerant" }, { id: "q14d", text: "Help me", trait: "Desperate" }
  ]},
  { id: "q15", text: "A ceramic vase sits on the edge of a table. You:", type: "cat-based", options: [
    { id: "q15a", text: "Push it just to hear it break", trait: "Destructive" }, { id: "q15b", text: "Move it to the center", trait: "Harmonious" }, { id: "q15c", text: "Watch it fall and do nothing", trait: "Passive" }, { id: "q15d", text: "Pretend it was never there", trait: "Denialist" }
  ]},
  { id: "q16", text: "The midnight zoomies arrive. You are running from:", type: "cat-based", options: [
    { id: "q16a", text: "My own shadow", trait: "Insecure" }, { id: "q16b", text: "The ghost of my past", trait: "Haunted" }, { id: "q16c", text: "Nothing, I am the wind", trait: "Free-spirited" }, { id: "q16d", text: "The crushing weight of silence", trait: "Sensitive" }
  ]},
  { id: "q17", text: "A warm pile of laundry is fresh from the dryer. It is:", type: "cat-based", options: [
    { id: "q17a", text: "My new throne", trait: "Arrogant" }, { id: "q17b", text: "A hug from the universe", trait: "Soft-hearted" }, { id: "q17c", text: "A mess I must organize", trait: "Ordered" }, { id: "q17d", text: "Temporarily acceptable", trait: "Fickle" }
  ]},
  { id: "q18", text: "A bird chirps outside the window. Your jaw chattered because:", type: "cat-based", options: [
    { id: "q18a", text: "I desire what I cannot have", trait: "Aspirational" }, { id: "q18b", text: "I am reciting a death poem", trait: "Poetic" }, { id: "q18c", text: "My instincts are misfiring", trait: "Confused" }, { id: "q18d", text: "I am speaking to the sky", trait: "Religious" }
  ]},
  { id: "q19", text: "You have soft paws and sharp claws. When do you use the latter?", type: "cat-based", options: [
    { id: "q19a", text: "When I feel unheard", trait: "Expressive" }, { id: "q19b", text: "When I am being teased", trait: "Boundaried" }, { id: "q19c", text: "Only when I hunt for food", trait: "Utilitarian" }, { id: "q19d", text: "Never, I've forgotten how", trait: "Suppressed" }
  ]},
  { id: "q20", text: "Your food bowl is half-empty. To you, it is:", type: "cat-based", options: [
    { id: "q20a", text: "A tragedy in progress", trait: "Dramatic" }, { id: "q20b", text: "Enough for the moment", trait: "Content" }, { id: "q20c", text: "A sign I am being punished", trait: "Paranoid" }, { id: "q20d", text: "An invitation to find more", trait: "Resourceful" }
  ]},
  { id: "q21", text: "A long nap in a sunbeam feels like:", type: "cat-based", options: [
    { id: "q21a", text: "Wasted potential", trait: "Workaholic" }, { id: "q21b", text: "The true meaning of life", trait: "Philosophical" }, { id: "q21c", text: "A temporary truce with time", trait: "Patient" }, { id: "q21d", text: "The only place I'm safe", trait: "Fearful" }
  ]}
];

export const seedPool: SeedUser[] = Array.from({ length: 55 }).map((_, i) => {
  const catName = CAT_NAMES[i % CAT_NAMES.length];
  const humanImg = HUMAN_IMAGES[i % HUMAN_IMAGES.length] + `?auto=format&fit=crop&w=800&q=80&sig=${i}`;
  const catImg = CAT_IMAGES[i % CAT_IMAGES.length] + `?auto=format&fit=crop&w=800&q=80&sig=${i}`;
  
  const phoneSuffix = (1000 + i).toString();
  const phone = i % 2 === 0 ? `+65 8608 ${phoneSuffix}` : `+1 415 555 ${phoneSuffix}`;

  const answers: Record<string, string> = {};
  CORE_QUESTIONS.forEach((q, qIndex) => {
    const choiceIndex = (i + qIndex) % q.options.length;
    answers[q.id] = q.options[choiceIndex].id;
  });

  const truthIdx = i % CORE_VIBE_TRUTHS.length;

  return {
    user: {
      id: `u_seed_${i}`,
      displayName: catName,
      realName: `Seed User ${i + 1}`,
      dob: "1995-05-15",
      gender: i % 2 === 0 ? "Female" : "Male",
      location: i % 2 === 0 ? "Singapore" : "San Francisco, CA",
      bio: `Frequency broadcasting from a ${CORE_QUESTIONS[i % 21].options[i % 4].trait} perspective.`,
      interests: [CORE_QUESTIONS[i % 21].options[i % 4].trait, "Resonance Experiment"],
      religion: i % 3 === 0 ? "Spiritual" : "Atheist",
      sexualOrientation: "Fluid",
      wantsKids: "No",
      smokingStatus: "No",
      phoneNumber: phone,
      humanPhotoUrl: humanImg,
      catPhotoUrl: catImg,
      irisColor: "Prismatic",
      dailyStreak: 3,
      questions: [],
      coreTruth: CORE_VIBE_TRUTHS[truthIdx].text,
      traitAnswers: CORE_QUESTIONS.map(q => ({
        questionId: q.id,
        choiceId: answers[q.id],
        trait: q.options.find(o => o.id === answers[q.id])?.trait || ""
      }))
    },
    answers,
    coreResponse: "Protocol accepted. Broadcast active."
  };
});

export const getCoreQuestions = () => CORE_QUESTIONS;
