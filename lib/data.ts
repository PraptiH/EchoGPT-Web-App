export const FREE_QUOTA = 20;

export type Capability = "text" | "vision" | "code" | "tools";

export type Model = {
  id: string;
  name: string;
  provider: string;
  tier: "free" | "pro";
  blurb: string;
  caps: Capability[];
};

export const models: Model[] = [
  {
    id: "gpt-5.5",
    name: "GPT-5.5",
    provider: "OpenAI",
    tier: "free",
    blurb: "General reasoning, writing, and everyday work.",
    caps: ["text", "vision", "code", "tools"],
  },
  {
    id: "grok-4.5",
    name: "Grok 4.5",
    provider: "xAI",
    tier: "free",
    blurb: "Direct answers with a current-events tone.",
    caps: ["text", "code"],
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    provider: "Google",
    tier: "free",
    blurb: "Fast replies, including images you attach.",
    caps: ["text", "vision", "code"],
  },
  {
    id: "deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    provider: "DeepSeek",
    tier: "free",
    blurb: "Quick coding help and structured output.",
    caps: ["text", "code"],
  },
  {
    id: "glm-5.3",
    name: "GLM-5.3",
    provider: "Zhipu",
    tier: "free",
    blurb: "Balanced chat for short tasks.",
    caps: ["text"],
  },
  {
    id: "mimo-v2.5",
    name: "MiMo V2.5",
    provider: "Xiaomi",
    tier: "free",
    blurb: "Concise answers and translation.",
    caps: ["text"],
  },
  {
    id: "muse-spark-1.2",
    name: "Muse Spark 1.2",
    provider: "Muse",
    tier: "pro",
    blurb: "Longer creative drafts and tone control.",
    caps: ["text"],
  },
  {
    id: "qwen-3.8-max",
    name: "Qwen 3.8 Max",
    provider: "Alibaba",
    tier: "pro",
    blurb: "Multilingual writing and analysis.",
    caps: ["text", "code", "vision"],
  },
  {
    id: "kimi-k3",
    name: "Kimi K3",
    provider: "Moonshot",
    tier: "pro",
    blurb: "Long documents and careful summaries.",
    caps: ["text", "vision"],
  },
  {
    id: "longcat-2.0",
    name: "LongCat 2.0",
    provider: "LongCat",
    tier: "pro",
    blurb: "Extended context for research threads.",
    caps: ["text"],
  },
];

export const defaultModelId = models[0].id;

export function modelById(id: string) {
  return models.find((model) => model.id === id) ?? models[0];
}

export const navItems = [
  { href: "/", label: "Chat", icon: "chat" },
  { href: "/compare", label: "Compare", icon: "columns" },
  { href: "/image", label: "Images", icon: "image" },
  { href: "/video", label: "Video", icon: "video" },
  { href: "/jobs", label: "Job insight", icon: "brief" },
  { href: "/sop", label: "Statement of purpose", icon: "doc" },
  { href: "/tasks", label: "Tasks", icon: "tasks" },
  { href: "/store", label: "Store", icon: "grid" },
  { href: "/connectors", label: "Connectors", icon: "plug" },
] as const;

export const suggestions = [
  {
    title: "Plan my day",
    prompt: "Build a realistic schedule from my priorities and time.",
  },
  {
    title: "Think through a decision",
    prompt: "Compare options, risks, and what evidence would change my mind.",
  },
  {
    title: "Polish my writing",
    prompt: "Rewrite for clarity while keeping my tone and intent intact.",
  },
  {
    title: "Explore with multiple models",
    prompt: "Ask several leading models and synthesize the strongest answer.",
  },
];

export const taskCategories = ["Writing", "Coding", "Research", "Career"] as const;

export const tasks = [
  {
    category: "Writing",
    title: "Tighten a paragraph",
    description: "Rewrite text so it is shorter and easier to scan.",
    prompt: "Rewrite the following so it is clearer and about half as long:\n\n",
  },
  {
    category: "Writing",
    title: "Email a decision",
    description: "A short email that states the decision and the ask.",
    prompt: "Write a short email that states a decision, the reason, and what I need from the reader. Topic:\n\n",
  },
  {
    category: "Coding",
    title: "Review a function",
    description: "Look for bugs, naming, and missing edge cases.",
    prompt: "Review this function. Point out bugs, unclear names, and missing edge cases:\n\n",
  },
  {
    category: "Coding",
    title: "Explain an error",
    description: "Say what failed and the first fix to try.",
    prompt: "Explain this error in plain language and give the first fix to try:\n\n",
  },
  {
    category: "Research",
    title: "Brief a topic",
    description: "A one-page brief with open questions.",
    prompt: "Give me a one-page brief on this topic, then list what is still uncertain:\n\n",
  },
  {
    category: "Research",
    title: "Compare sources",
    description: "Where two explanations agree and disagree.",
    prompt: "Compare these two explanations. Say where they agree, where they differ, and which questions they leave open:\n\n",
  },
  {
    category: "Career",
    title: "Interview answers",
    description: "Practice answers with a follow-up question.",
    prompt: "Ask me one behavioral interview question for this role, then wait. Role:\n\n",
  },
  {
    category: "Career",
    title: "Resume bullets",
    description: "Turn duties into outcome-focused bullets.",
    prompt: "Turn these duties into resume bullets that lead with outcomes:\n\n",
  },
] as const;

export const storeApps = [
  {
    slug: "resume-coach",
    title: "Resume coach",
    description: "Rewrites experience so it matches a job post.",
    starter: "Help me tailor my resume. I will paste the job post, then my current bullets.",
  },
  {
    slug: "interview-prep",
    title: "Interview prep",
    description: "Practices questions for a specific role.",
    starter: "Run a short interview practice. Ask one question at a time for this role: ",
  },
  {
    slug: "code-reviewer",
    title: "Code reviewer",
    description: "Flags risk, tests, and naming before you ship.",
    starter: "Review the code I paste. Lead with the highest-risk issue.",
  },
  {
    slug: "research-brief",
    title: "Research brief",
    description: "Summarizes a topic with open questions.",
    starter: "Build a research brief. Separate what is known from what we still need to check. Topic: ",
  },
  {
    slug: "meeting-notes",
    title: "Meeting notes",
    description: "Pulls decisions, owners, and dates out of notes.",
    starter: "Turn my notes into decisions, owners, and open questions.",
  },
  {
    slug: "sop-editor",
    title: "SOP editor",
    description: "Shapes a statement of purpose without stock phrases.",
    starter: "Help me revise a statement of purpose. Keep my voice and remove clichés.",
  },
] as const;

export const plans = [
  {
    id: "free",
    name: "Free",
    cadence: "Resets every 5 hours",
    points: [
      `${FREE_QUOTA} messages each window`,
      "Free-tier models",
      "Chat, compare, tasks, and connectors",
      "History stored in this browser",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    cadence: "Monthly, quarterly, semiannual, or annual",
    points: [
      "Higher message allowance",
      "Advanced models",
      "Image studio and video studio",
      "Same account on more than one device",
    ],
  },
] as const;

export const faqs = [
  {
    q: "Where can I use EchoGPT?",
    a: "EchoGPT is a web app today. Android, iOS, and a plug-in are in progress.",
  },
  {
    q: "What happens to my data in this preview?",
    a: "Chats, connectors, and studio items stay in local storage on this device. This build does not send them to a model provider.",
  },
  {
    q: "How do I get help?",
    a: "Use Support in the sidebar or email appifydevs@gmail.com. The team aims to reply within 48 hours.",
  },
  {
    q: "Can I cancel Plus?",
    a: "You can cancel a subscription, and EchoGPT does not refund the current period. That policy is restated before you upgrade.",
  },
  {
    q: "What is the difference between free and advanced models?",
    a: "Free models cover everyday chat and code. Advanced models are marked Plus and are meant for longer, more careful work.",
  },
  {
    q: "Can I share my account?",
    a: "No. Sharing a login is a security risk and conflicts with the terms of use.",
  },
];

export const imageRatios = ["1:1", "4:5", "16:9", "9:16"] as const;
export const videoLengths = [4, 6, 8] as const;
