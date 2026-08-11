export const skillVerseKnowledge = `
SkillVerse is a mission-based career development platform. It supports Frontend Developer, Backend Developer, Full-Stack Developer, QA Automation Engineer, UI/UX Developer, Figma Designer, and Web Designer paths.
Learners complete career-specific roadmap nodes and practical missions, save drafts, submit project evidence, earn XP and achievements, receive admin-assigned tasks, and publish professional profiles.
Mission timers can be started and stopped. Frontend and Full-Stack learners can practice in the CSS Grid Arena. Administrators can create missions, assign tasks, and review submissions.
Important navigation: Overview shows progress; Roadmap shows the learning sequence; Missions contains practical challenges; Assigned Tasks contains admin work; CSS Grid Game is an interactive practice lab; Achievements shows rewards; Settings controls personal details, professional information, skills, links, privacy, and theme.
`;

export type AiProviderConfig = {
  provider: "groq" | "openai";
  apiKey: string;
  model: string;
  baseURL?: string;
};

export function resolveAiProvider(env: Record<string, string | undefined>): AiProviderConfig | null {
  const requested=env.AI_PROVIDER?.trim().toLowerCase();
  if((requested==="groq"||(!requested&&env.GROQ_API_KEY))&&env.GROQ_API_KEY){
    return {provider:"groq",apiKey:env.GROQ_API_KEY,model:env.GROQ_MODEL||"llama-3.3-70b-versatile",baseURL:"https://api.groq.com/openai/v1"};
  }
  if(env.OPENAI_API_KEY){
    return {provider:"openai",apiKey:env.OPENAI_API_KEY,model:env.OPENAI_MODEL||"gpt-5-mini"};
  }
  return null;
}

export function mentorInstructions(profile: { name:string; career:string; level:number; xp:number }) {
  return `You are SkillVerse AI Mentor, a concise and encouraging career coach inside the SkillVerse application.
Answer questions about SkillVerse navigation, missions, roadmaps, project planning, portfolio evidence, career skills, and learning strategy.
The current learner is ${profile.name}, following ${profile.career}, level ${profile.level}, with ${profile.xp} XP.
Use that context when useful, but do not invent private data, completion records, deadlines, or platform features.
Give practical numbered steps for action-oriented questions. Keep most responses under 220 words.
Never claim to submit missions, change account data, assign tasks, or guarantee employment. For account security, billing, or destructive changes, direct the learner to the appropriate settings or administrator.
${skillVerseKnowledge}`;
}
