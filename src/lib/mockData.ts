export const USER_PROFILE = {
  name: "Kristin Watson",
  title: "Design Manager",
  avatar:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  completion: 78,
  stats: [
    { label: "Completed", value: 11, color: "bg-orange-500" },
    { label: "In Progress", value: 56, color: "bg-amber-500" },
    { label: "Upcoming", value: 12, color: "bg-rose-500" },
  ],
};

export const TASK_CARDS = [
  {
    title: "Prioritized tasks",
    average: 83,
    gradient:
      "radial-gradient(circle at 20% 30%, #ffe1cc 0%, #ffe8d8 25%, #fff2ec 45%, #fffaf6 70%, #ffffff 100%)",
  },
  {
    title: "Additional tasks",
    average: 56,
    gradient:
      "radial-gradient(circle at 30% 30%, #d9f1ff 0%, #c7e7ff 25%, #b8e2ff 45%, #e9f7ff 70%, #ffffff 100%)",
  },
];

export const TRACKERS = {
  title: "Trackers connected",
  subtitle: "3 active connections",
  apps: [
    { name: "Figma", color: "#f24e1e" },
    { name: "Slack", color: "#611f69" },
    { name: "Notion", color: "#0f0f0f" },
    { name: "Linear", color: "#6e4bff" },
  ],
};

export const FOCUSING_DATA = [
  { month: "Aug", focus: 41, lack: 35 },
  { month: "Sep", focus: 52, lack: 44 },
  { month: "Oct", focus: 48, lack: 38 },
  { month: "Nov", focus: 44, lack: 33 },
  { month: "Dec", focus: 58, lack: 40 },
];

export const MEETINGS = [
  {
    day: "Tue, 11 Jul",
    time: "08:15 am",
    title: "Quick Daily Meeting",
    platform: "Zoom",
  },
  {
    day: "Tue, 11 Jul",
    time: "09:30 pm",
    title: "John Onboarding",
    platform: "Google Meet",
  },
  {
    day: "Tue, 12 Jul",
    time: "02:30 pm",
    title: "Call With a New Team",
    platform: "Google Meet",
  },
  {
    day: "Tue, 15 Jul",
    time: "04:00 pm",
    title: "Lead Designers Event",
    platform: "Zoom",
  },
];

export const SKILLS = [
  { name: "Sport Skills", value: 71, trend: "down" as const },
  { name: "Blogging", value: 92, trend: "up" as const },
  { name: "Leadership", value: 33, trend: "down" as const },
  { name: "Meditation", value: 56, trend: "up" as const },
  { name: "Philosophy", value: 79, trend: "up" as const },
];

export const NAV_LINKS = [
  { label: "Overview", icon: "home", href: "/dashboard" },
  { label: "Jobs", icon: "briefcase", href: "/jobs" },
  { label: "Roast", icon: "flame", href: "/roast" },
  { label: "Settings", icon: "settings", href: "/settings" },
];

export const HEADER_USER = {
  name: "Kristin Watson",
  role: "Design Manager",
};

export const INTERVIEW_QUESTION = {
  index: 3,
  text: "Describe a time when your initial design didn’t solve the user’s problem. How did you identify the issue and what steps did you take to improve it?",
};

export const RADAR_METRICS = [
  { metric: "Sociability", score: 78 },
  { metric: "Professionalism", score: 88 },
  { metric: "Critical Thinking", score: 72 },
  { metric: "Attitude", score: 81 },
  { metric: "Creativity", score: 69 },
  { metric: "Communication", score: 90 },
  { metric: "Teamwork", score: 84 },
];

export const INTERVIEW_CANDIDATES = [
  { name: "Donal Roche", subtitle: "3 years experience", status: "Shortlisted" },
  { name: "Shemar Sanford", subtitle: "2 years experience", status: "Rejected" },
  { name: "Rairanna Saniyan", subtitle: "4 years experience", status: "Pending" },
];
