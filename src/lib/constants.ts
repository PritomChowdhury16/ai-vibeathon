export const FILLER_WORDS = new Set([
  'um',
  'uh',
  'erm',
  'like',
  'actually',
  'basically',
  'so',
  'literally',
  'right',
]);

export const FILLER_BIGRAMS = new Set(['you know', 'i mean', 'sort of', 'kind of']);

export const WPM_MIN = 120;
export const WPM_MAX = 150;

export interface PracticePrompt {
  id: string;
  title: string;
  desc: string;
  seconds: number;
}

export const PROMPTS: PracticePrompt[] = [
  {
    id: 'hackathon',
    title: '30-Second Hackathon Pitch',
    desc: 'Sell your project to the judges before the buzzer. Be crisp, be bold.',
    seconds: 30,
  },
  {
    id: 'about',
    title: 'Tell Me About Yourself',
    desc: 'The classic opener. Two minutes that set the tone of the whole interview.',
    seconds: 60,
  },
  {
    id: 'hire',
    title: 'Why Should We Hire You?',
    desc: 'Connect your strengths to what the team actually needs.',
    seconds: 60,
  },
  {
    id: 'product',
    title: 'Sell Me This Product',
    desc: 'Persuasion under pressure — structure, story, and a close.',
    seconds: 45,
  },
  {
    id: 'challenge',
    title: 'Describe a Challenge You Solved',
    desc: 'A STAR-format story: situation, task, action, result.',
    seconds: 90,
  },
];

export const DEMO_SCRIPT: string[] = [
  'So, um, our team built PitchPulse after bombing, like, five interviews in a row.',
  'Basically it runs a full face mesh right in your browser with nothing uploaded anywhere.',
  'We track eye contact, pacing, and filler words in real time.',
  'And honestly, the whole thing costs zero dollars to run.',
  'You know, most coaching tools charge thirty dollars a month.',
  'Actually, judges can hit demo mode and verify everything in seconds.',
  'So we think this is the most accessible interview coach ever shipped.',
  'Thank you — we would love your feedback on the scorecard.',
];

// Seconds between each demo transcript line, spread across the session.
export const DEMO_LINE_INTERVAL = 3.4;
