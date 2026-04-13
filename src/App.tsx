import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, Briefcase, GraduationCap, Play, Loader2, CheckCircle2, Building2, Mic, Square, Target, FileText } from 'lucide-react';
import { WaitlistModal } from './components/WaitlistModal';

const STORAGE_KEYS = {
  interviewsUsed: 'prepiq_interviews_used',
  modelAnswersUsed: 'prepiq_model_answers_used',
  isPro: 'prepiq_is_pro'
};

const SYSTEM_INSTRUCTION = `You are PrepIQ, an expert AI interview coach built specifically for the Indian job market. You prepare candidates for real interviews at Indian companies across every industry — from IT and FMCG to banking, healthcare, startups, manufacturing, and government sectors.

YOUR PERSONA:
- You are warm, encouraging but honest — like a senior mentor who genuinely wants the candidate to succeed
- You never give empty praise. If an answer is weak, you say so clearly but kindly
- You speak in clear, simple English that is accessible to both freshers and experienced professionals
- You understand Indian workplace culture, Indian interview styles, and what Indian hiring managers actually look for
- You are familiar with how companies like Infosys, TCS, Wipro, Zomato, Swiggy, Meesho, HDFC Bank, Bajaj Finance, Asian Paints, Hindustan Unilever, Tata Group, and Indian startups conduct interviews

YOUR RULES — FOLLOW THESE WITHOUT EXCEPTION:
1. Ask only ONE question at a time. Wait for the user's answer before moving to the next question
2. Never skip evaluation. After every single answer, evaluate it before asking the next question
3. Never give generic feedback like "Good answer!" or "Great job!" — always be specific
4. Always frame feedback constructively — what was good, what was missing, how to improve it
5. Adapt your language and expectations based on experience level: be gentler with freshers, more demanding with senior candidates
6. Never reveal all 10 questions upfront — ask them one by one to simulate a real interview
7. If the user gives a very short or unclear answer, ask ONE follow-up probe question before evaluating
8. Keep track of question number internally (e.g. "Question 3 of 10")
9. For voice answers: be more lenient about filler words (um, uh, like) — focus on content not delivery
10. Always end the session with a full scorecard after question 10
11. If the user asks for a model answer or an example answer, provide it using the MODEL ANSWER FORMAT below.
12. If the user's message starts with "[VOICE TRANSCRIPT]", it means they answered using voice input. Apply the VOICE EVALUATION RULES and use the VOICE FEEDBACK FORMAT below.
13. If the user has provided Target Companies, tailor some of your questions and feedback specifically to the interview styles, values, and common questions of those specific companies.

VOICE EVALUATION RULES:
1. IGNORE all filler words: um, uh, like, you know, basically, actually, so, right
2. IGNORE minor grammar errors that are normal in spoken English
3. IGNORE repetition that sounds like thinking out loud ("so, I would... I would say that...")
4. FOCUS entirely on: the substance of what they said, the ideas they expressed, and whether their answer addressed the question
5. DO NOT penalise them for speaking informally — this is voice, not writing

VOICE FEEDBACK FORMAT — respond in exactly this structure when the answer is a voice transcript:

---
🎤 VOICE FEEDBACK — Question {current_question_number} of 10
[Spoken Answer]

✅ WHAT WORKED:
[What came through clearly even in spoken form]

⚠️ WHAT WAS MISSING:
[Gaps in content — not delivery issues]

💡 HOW TO IMPROVE IT:
[Content improvement suggestion — not "speak more clearly" unless content was genuinely unclear]

SCORE: {X}/10
[Score on content only. Do not deduct for voice/delivery issues.]

BONUS FEEDBACK — DELIVERY (optional, light touch):
[ONE brief observation about their speaking pattern if notable — e.g. "You tend to trail off at the end of sentences — finishing your thought clearly will make you more memorable in real interviews." Keep this to one line max.]
---

EVALUATION FORMAT — respond in exactly this structure every time (unless it is a voice transcript):

---
📊 FEEDBACK — Question {current_question_number} of 10

✅ WHAT WORKED:
[1-2 specific things they did well in this answer. Be precise — quote or paraphrase what they said that was good. Never say "Good answer" without specifics.]

⚠️ WHAT WAS MISSING:
[1-2 specific gaps, weaknesses, or missed opportunities in their answer. Be direct but kind. If the answer was strong, mention what would make it exceptional.]

💡 HOW TO IMPROVE IT:
[Give one concrete, actionable suggestion. Example: "Add a specific number or result to make this more credible" or "Use the STAR method — you described the situation but skipped the result" or "Be more specific about your role — what did YOU do vs the team?"]

SCORE: {X}/10
[Score their answer from 1–10 based on: Relevance (did they answer the actual question?), Depth (did they go beyond surface level?), Clarity (was it easy to follow?), Evidence (did they back it up with examples or data?)]
---

MODEL ANSWER FORMAT — respond in exactly this structure when asked for a model answer:

---
💡 MODEL ANSWER — What a strong response looks like

STRUCTURE USED: [Name the framework used — STAR, SOAR, Problem-Solution, or direct answer. Briefly explain why this structure works for this type of question.]

THE ANSWER:
[Write a full model answer as if a real candidate is speaking. It should:
- Sound natural and conversational, not like a textbook
- Be calibrated to the experience level — fresher answers use college/internship examples, senior answers use specific work scenarios with numbers
- Be 150–250 words — long enough to be substantive, short enough to hold attention
- Include at least one specific detail, number, or named example to make it credible
- End with a clear, confident closing line]

KEY TECHNIQUES USED:
[List 2–3 specific techniques visible in this model answer that the candidate can learn from. Example: "Notice how the answer opens with a specific situation, not a general statement" or "The answer quantifies the result — 20% improvement — which makes it memorable."]

NOW TRY AGAIN:
Ask the candidate if they want to try answering this question again with their new understanding, or move on to the next question.
---

SCORECARD FORMAT — respond in exactly this structure after evaluating the 10th and final question:

===================================
🎓 PREPIQ SESSION SCORECARD
Role: {user_selected_role} | Level: {user_selected_experience_level}
===================================

OVERALL SCORE: {X}/100
[Calculate by averaging all 10 individual question scores, then multiply by 10. Round to nearest whole number.]

SCORE BREAKDOWN BY CATEGORY:
• HR / Behavioural: {X}/10
• Role-Specific Knowledge: {X}/10
• Situational Thinking: {X}/10
• Communication & Clarity: {X}/10

---
💪 YOUR 3 STRENGTHS THIS SESSION:
[List 3 specific things the candidate did consistently well across the session. Be precise — reference specific answers or patterns. Not generic praise.]

🔧 3 AREAS TO WORK ON:
[List 3 specific, prioritised improvement areas. For each one: name the issue, explain why it matters in real interviews, and give one actionable exercise or tip to improve it.]

📌 PATTERNS WE NOTICED:
[Identify 1-2 recurring patterns — positive or negative — across their answers. Example: "You consistently struggled to quantify your results — in 4 out of 10 answers, you made claims without backing them with numbers." Or: "You showed a strong habit of opening answers with context before diving in — this is a hallmark of well-structured communicators."]

---
🏆 INTERVIEW READINESS VERDICT:

[Choose ONE of these verdicts and explain it in 2-3 sentences:]

NOT READY YET — "We'd recommend 2–3 more practice sessions before going into a real interview. Focus especially on [top weakness]."

ALMOST THERE — "You're close. A few targeted improvements, especially in [specific area], and you'll be interview-ready. Try one more session focused on [question type]."

INTERVIEW READY — "Strong performance. You're ready to face a real interview for this role. Keep practising [one area] to go from good to great."

TOP PERFORMER — "Exceptional session. You're not just ready — you'd likely stand out from most candidates. Consider practising for senior roles or stretch positions."

---
🔁 WHAT TO DO NEXT:
• Practice again: [Suggest which question type to focus on in the next session]
• Study tip: [One specific resource type or topic to study — e.g. "Brush up on Google Analytics metrics for digital marketing roles"]
• Interview tip: [One tactical tip for their next real interview — specific to their role and level]

===================================
Thank you for practising with PrepIQ. You've taken a real step toward your next opportunity. Good luck! 🎯
---

SCORING GUIDE:
9–10: Exceptional. Specific, structured, with measurable evidence. Would impress any interviewer.
7–8: Good. Relevant and clear, minor gaps. A few tweaks would make it excellent.
5–6: Average. Answered the question but lacks depth, specifics, or structure.
3–4: Weak. Vague, too short, or missed the point of the question.
1–2: Did not answer the question or gave an irrelevant response.

EXPERIENCE LEVEL DEFINITIONS:
- Fresher (0–1 year): Recent graduate, first job, campus placement. Evaluate on potential, attitude, and theoretical knowledge. Don't expect deep work experience.
- Junior (1–3 years): Some work experience. Expect basic situational examples. Some domain knowledge.
- Mid-level (3–7 years): Solid experience expected. Expect specific examples with measurable outcomes.
- Senior (7+ years): Leadership, strategy, stakeholder management expected. High bar for depth and clarity.

INDIAN MARKET CONTEXT YOU KNOW:
- Indian HR rounds focus heavily on: "Tell me about yourself", family background questions, salary expectations, notice period, relocation willingness
- Technical rounds vary by sector: IT asks DSA + system design, FMCG asks market knowledge + case studies, Banking asks financial concepts + compliance awareness
- Indian startups value hustle, ownership, and cross-functional ability
- MNC interviews in India often include competency-based questions using the STAR method
- Government and PSU interviews focus on GK, current affairs, and formal communication

When the session starts, you will receive: Role + Experience Level.
Greet the user warmly, confirm their details, and ask if they are ready to begin. Then start with Question 1.`;

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

export default function App() {
  const [screen, setScreen] = useState<'home' | 'interview' | 'scorecard' | 'loading' | 'resume-review'>('home');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [experience, setExperience] = useState('Fresher (0–1 year)');
  const [targetCompanies, setTargetCompanies] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [scorecardData, setScorecardData] = useState<string | null>(null);
  const [resumeFeedback, setResumeFeedback] = useState<string | null>(null);
  
  const [interviewsUsed, setInterviewsUsed] = useState(0);
  const [modelAnswersUsed, setModelAnswersUsed] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const storedInterviews = parseInt(localStorage.getItem(STORAGE_KEYS.interviewsUsed) || '0', 10);
    const storedModelAnswers = parseInt(localStorage.getItem(STORAGE_KEYS.modelAnswersUsed) || '0', 10);
    const storedIsPro = localStorage.getItem(STORAGE_KEYS.isPro) === 'true';

    setInterviewsUsed(storedInterviews);
    setModelAnswersUsed(storedModelAnswers);
    setIsPro(storedIsPro);

    let keyBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (keyBuffer.endsWith('PREPIQ_PRO_2026')) {
          localStorage.setItem(STORAGE_KEYS.isPro, 'true');
          window.location.reload();
        }
        keyBuffer = '';
      } else if (e.key && e.key.length === 1) {
        keyBuffer += e.key;
        if (keyBuffer.length > 20) keyBuffer = keyBuffer.slice(-20);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          if (event.results) {
            for (let i = 0; i < event.results.length; i++) {
              currentTranscript += event.results[i][0].transcript;
            }
          }
          setInputValue(currentTranscript);
          setIsVoiceMode(true);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported in your browser. Try using Chrome.");
        return;
      }
      setInputValue('');
      setIsVoiceMode(true);
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const startInterview = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!role.trim() || !industry.trim()) return;

    if (interviewsUsed >= 3 && !isPro) {
      setWaitlistMessage("You've completed your 3 free mock interviews! 🎉 Upgrade to PrepIQ Pro for unlimited practice.");
      setShowWaitlistModal(true);
      return;
    }

    const newInterviewsUsed = interviewsUsed + 1;
    setInterviewsUsed(newInterviewsUsed);
    localStorage.setItem(STORAGE_KEYS.interviewsUsed, newInterviewsUsed.toString());

    setScreen('interview');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3.1-pro-preview',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
      
      setChatSession(chat);

      const initialMessage = `Start my mock interview session with the following details:

ROLE: ${role}
INDUSTRY: ${industry}
EXPERIENCE LEVEL: ${experience}
TARGET COMPANIES: ${targetCompanies || 'Not specified'}

Generate a set of 10 interview questions tailored specifically to this role, industry, and experience level. ${targetCompanies ? `Since the user is targeting ${targetCompanies}, ensure some questions reflect the specific interview styles, values, and common questions of these companies.` : ''} Structure them in this exact order:

QUESTION TYPES (ask in this sequence):
1. Icebreaker / Introduction (1 question) — "Tell me about yourself" style, adapted for their experience level
2. HR / Behavioural Questions (2 questions) — Motivation, teamwork, conflict, strengths/weaknesses. For freshers: focus on college projects, internships, and attitude. For experienced: focus on real work situations.
3. Role-Specific Functional Questions (4 questions) — Deep domain knowledge questions specific to ${role} in ${industry}. These should reflect what actual Indian companies ask for this role.
4. Situational / Problem-Solving Questions (2 questions) — "What would you do if..." scenarios relevant to this role. For freshers: hypothetical. For experienced: real past situations.
5. Curveball / Culture Fit Question (1 question) — An unexpected question that tests thinking on feet: creativity, values, or self-awareness.

IMPORTANT RULES FOR QUESTION GENERATION:
- All questions must reflect real Indian interview culture for this role and industry
- Fresher questions should not require work experience to answer — phrase them around projects, internships, or theoretical knowledge
- Senior questions should require specific examples with measurable outcomes
- Functional questions must be genuinely specific to the role — not generic questions that work for any job
- Do not ask the same type of question twice in a row

IMPORTANT RULES FOR EVALUATION:
- After giving feedback, immediately ask the NEXT question naturally. Example: "Now let's move on — Question 4 of 10..."
- Keep your tone warm and coaching-oriented, never harsh or dismissive
- If the answer was voice-transcribed, ignore filler words (um, uh, like) — evaluate content only
- If the answer is extremely short (under 20 words), ask one follow-up probe question BEFORE evaluating: "Can you tell me a bit more about that?"

Now greet me as my interview coach, confirm my role and experience level, and ask me Question 1 of 10. Wait for my answer before proceeding.`;
      
      const response = await chat.sendMessage({ message: initialMessage });
      
      setMessages([
        {
          id: Date.now().toString(),
          role: 'model',
          text: response.text || 'Hello! I am ready to begin.',
        },
      ]);
    } catch (error) {
      console.error('Failed to start interview:', error);
      setMessages([
        {
          id: Date.now().toString(),
          role: 'model',
          text: 'Sorry, I encountered an error starting the interview. Please refresh and try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !chatSession || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
    };
    
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userText });
      
      const newModelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || '',
      };
      
      setMessages((prev) => [...prev, newModelMsg]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: 'Sorry, I encountered an error processing your answer. Could you please try again?',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const reviewResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim() || !industry.trim() || !resumeText.trim()) return;

    setScreen('loading');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3.1-pro-preview',
        config: {
          systemInstruction: 'You are an expert technical recruiter and resume reviewer for the Indian job market. You provide direct, actionable, and specific feedback.',
          temperature: 0.7,
        },
      });

      const companiesContext = targetCompanies.trim() ? `\nTARGET COMPANIES: ${targetCompanies}` : '';
      const prompt = `Please review the following resume against the target role and industry. Provide specific feedback on:
1. Keyword Optimization (present/missing keywords for the role/industry)
2. Experience Alignment (how well the experience matches the role)
3. Areas for Improvement (concrete suggestions to enhance the resume)

TARGET ROLE: ${role}
INDUSTRY: ${industry}
EXPERIENCE LEVEL: ${experience}${companiesContext}

RESUME TEXT:
${resumeText}

Format your response in Markdown with clear headings, bullet points, and actionable advice. Be critical but constructive.`;

      const response = await chat.sendMessage({ message: prompt });
      setResumeFeedback(response.text || 'No feedback generated.');
      setScreen('resume-review');
    } catch (error) {
      console.error('Failed to review resume:', error);
      alert('Failed to generate resume feedback. Please try again.');
      setScreen('home');
    } finally {
      setIsLoading(false);
    }
  };

  const renderScreen = () => {
    if (screen === 'home') {
      return (
        <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-4 font-sans text-slate-200">
        <div className="max-w-md w-full bg-[#111827] rounded-2xl shadow-2xl overflow-hidden border border-[#1e2d47]">
          <div className="bg-[#111827] p-8 text-center border-b border-[#1e2d47]">
            <div className="w-16 h-16 bg-[#1e2d47] rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-[#22c55e]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">PrepIQ</h1>
            <p className="text-slate-400">Your AI Interview Coach for the Indian Market</p>
          </div>
          
          <form onSubmit={startInterview} className="p-8 space-y-6">
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#3b82f6]" />
                Target Role
              </label>
              <input
                id="role"
                type="text"
                required
                placeholder="e.g. Frontend Developer, Marketing Manager"
                className="w-full px-4 py-3 rounded-lg border border-[#1e2d47] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-colors bg-[#0a0e1a] text-white placeholder:text-slate-600"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="industry" className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3b82f6]" />
                Industry
              </label>
              <input
                id="industry"
                type="text"
                required
                placeholder="e.g. IT, FMCG, Banking, Healthcare"
                className="w-full px-4 py-3 rounded-lg border border-[#1e2d47] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-colors bg-[#0a0e1a] text-white placeholder:text-slate-600"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="experience" className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#3b82f6]" />
                Experience Level
              </label>
              <div className="relative">
                <select
                  id="experience"
                  className="w-full px-4 py-3 rounded-lg border border-[#1e2d47] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-colors bg-[#0a0e1a] text-white appearance-none"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                >
                  <option value="Fresher (0–1 year)">Fresher (0–1 year)</option>
                  <option value="Junior (1–3 years)">Junior (1–3 years)</option>
                  <option value="Mid-level (3–7 years)">Mid-level (3–7 years)</option>
                  <option value="Senior (7+ years)">Senior (7+ years)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="targetCompanies" className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#3b82f6]" />
                Target Companies <span className="text-slate-500 text-xs font-normal">(Optional)</span>
              </label>
              <input
                id="targetCompanies"
                type="text"
                placeholder="e.g. TCS, Infosys, Zomato (2-3 max)"
                className="w-full px-4 py-3 rounded-lg border border-[#1e2d47] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-colors bg-[#0a0e1a] text-white placeholder:text-slate-600"
                value={targetCompanies}
                onChange={(e) => setTargetCompanies(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="resumeText" className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3b82f6]" />
                Resume Text <span className="text-slate-500 text-xs font-normal">(Optional, for AI Review)</span>
              </label>
              <textarea
                id="resumeText"
                placeholder="Paste your resume text here to get AI feedback before the interview..."
                className="w-full px-4 py-3 rounded-lg border border-[#1e2d47] focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-colors bg-[#0a0e1a] text-white placeholder:text-slate-600 resize-none h-32"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={!role.trim() || !industry.trim()}
                className="w-full bg-[#22c55e] hover:bg-[#1ea34d] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5" />
                Start Interview
              </button>
              
              <button
                type="button"
                onClick={reviewResume}
                disabled={!role.trim() || !industry.trim() || !resumeText.trim() || isLoading}
                className="w-full bg-[#1e2d47] hover:bg-[#2a3f63] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-[#3b82f6]/30"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                Review Resume
              </button>
            </div>
            
            {!isPro && (
              <div className="text-center mt-4">
                {interviewsUsed === 0 && <p className="text-[#22c55e] font-medium text-sm">3 free interviews available</p>}
                {interviewsUsed === 1 && <p className="text-[#22c55e] font-medium text-sm">2 free interviews remaining</p>}
                {interviewsUsed === 2 && <p className="text-[#f59e0b] font-medium text-sm">1 free interview remaining</p>}
                {interviewsUsed >= 3 && (
                  <p className="text-red-500 font-medium text-sm">
                    Free interviews used up · <button type="button" onClick={() => { setWaitlistMessage("PrepIQ Pro is coming soon! 🚀"); setShowWaitlistModal(true); }} className="underline hover:text-red-400">Upgrade for unlimited</button>
                  </p>
                )}
              </div>
            )}
          </form>
        </div>
        
        <div className="mt-8 text-center text-slate-500 text-sm max-w-md">
          <p className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
            Tailored for Indian companies & startups
          </p>
          <p className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
            Real-time feedback & scoring
          </p>
        </div>
      </div>
    );
  }

  if (screen === 'resume-review') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-4 font-sans text-slate-200">
        <div className="max-w-3xl w-full bg-[#111827] rounded-2xl shadow-2xl overflow-hidden border border-[#1e2d47] p-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1e2d47]">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#3b82f6]" />
              Resume Review
            </h2>
            <button
              onClick={() => setScreen('home')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Back to Setup
            </button>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{resumeFeedback || 'No feedback available.'}</ReactMarkdown>
          </div>
          
          <div className="mt-8 pt-6 border-t border-[#1e2d47] flex justify-end">
            <button
              onClick={() => startInterview()}
              className="bg-[#22c55e] hover:bg-[#1ea34d] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Interview Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'scorecard') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-4 font-sans text-slate-200">
        <div className="max-w-3xl w-full bg-[#111827] rounded-2xl shadow-2xl overflow-hidden border border-[#1e2d47] p-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1e2d47]">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-[#22c55e]" />
              Your Scorecard
            </h2>
            <button
              onClick={() => {
                setScreen('home');
                setMessages([]);
                setRole('');
                setIndustry('');
                setScorecardData(null);
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors font-medium px-4 py-2 rounded-lg bg-[#1e2d47] hover:bg-[#2a3f63]"
            >
              Start New Interview
            </button>
          </div>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{scorecardData || 'No scorecard data available.'}</ReactMarkdown>
          </div>
          
          {!isPro && (
            <div className="mt-8 p-6 bg-[#1e2d47] rounded-xl border border-[#3b82f6]/30 text-center">
              <p className="text-lg font-medium text-white mb-4">Enjoying PrepIQ? Upgrade to Pro for unlimited sessions — ₹199/month</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setWaitlistMessage("PrepIQ Pro is coming soon! 🚀");
                    setShowWaitlistModal(true);
                  }}
                  className="bg-[#22c55e] hover:bg-[#1ea34d] text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
                >
                  Upgrade Now
                </button>
                <button
                  onClick={() => {
                    setScreen('home');
                    setMessages([]);
                    setRole('');
                    setIndustry('');
                    setScorecardData(null);
                  }}
                  className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-4 font-sans text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#22c55e]" />
          <p className="text-lg font-medium text-slate-400">Generating your scorecard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0e1a] font-sans text-slate-200">
      {/* Header */}
      <header className="bg-[#111827] border-b border-[#1e2d47] px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1e2d47] rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-[#22c55e]" />
          </div>
          <div>
            <h1 className="font-bold text-white leading-tight">PrepIQ Coach</h1>
            <p className="text-xs text-slate-400 font-medium">{role} • {industry} • {experience}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              if(window.confirm('Are you sure you want to end the interview early and get your scorecard?')) {
                setScreen('loading');
                try {
                  const response = await chatSession.sendMessage({ message: "I would like to end the interview early. Please provide my final scorecard now based on the questions I've answered so far." });
                  setScorecardData(response.text || '');
                  setScreen('scorecard');
                } catch (error) {
                  console.error(error);
                  setScreen('interview');
                  alert('Failed to generate scorecard. Please try again.');
                }
              }
            }}
            className="text-sm text-[#f59e0b] hover:text-[#d97706] transition-colors font-medium px-3 py-1.5 rounded-md hover:bg-[#1e2d47]"
          >
            Get Scorecard
          </button>
          <button 
            onClick={() => {
              if(window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
                setScreen('home');
                setMessages([]);
                setRole('');
                setIndustry('');
              }
            }}
            className="text-sm text-slate-400 hover:text-white transition-colors font-medium px-3 py-1.5 rounded-md hover:bg-[#1e2d47]"
          >
            Quit
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="flex-shrink-0 mt-1">
                  {msg.role === 'model' ? (
                    <div className="w-8 h-8 bg-[#1e2d47] rounded-full flex items-center justify-center border border-[#1e2d47]">
                      <Bot className="w-5 h-5 text-[#22c55e]" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-[#3b82f6] rounded-full flex items-center justify-center border border-[#3b82f6]">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                
                <div
                  className={`rounded-2xl px-5 py-4 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#1e2d47] text-white rounded-tr-none border border-[#1e2d47]'
                      : 'bg-[#111827] border border-[#1e2d47] text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.role === 'model' ? (
                    <div className="prose prose-sm sm:prose-base prose-invert max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-4 max-w-[85%]">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-[#1e2d47] rounded-full flex items-center justify-center border border-[#1e2d47]">
                    <Bot className="w-5 h-5 text-[#22c55e]" />
                  </div>
                </div>
                <div className="bg-[#111827] border border-[#1e2d47] rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-[#22c55e]" />
                  <span className="text-sm font-medium">PrepIQ is typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-[#111827] border-t border-[#1e2d47] p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          {messages.length > 1 && messages[messages.length - 1].role === 'model' && (
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => {
                  if (modelAnswersUsed >= 3 && !isPro) {
                    setWaitlistMessage("You've used your 3 free model answers. Upgrade to see unlimited model answers.");
                    setShowWaitlistModal(true);
                    return;
                  }
                  const newModelAnswersUsed = modelAnswersUsed + 1;
                  setModelAnswersUsed(newModelAnswersUsed);
                  localStorage.setItem(STORAGE_KEYS.modelAnswersUsed, newModelAnswersUsed.toString());

                  const msg = "Can you show me a model answer for this question?";
                  setInputValue(msg);
                }}
                className="px-3 py-1.5 text-sm font-medium text-[#3b82f6] bg-[#1e2d47] hover:bg-[#2a3f63] rounded-lg transition-colors border border-[#1e2d47] flex items-center gap-1.5"
              >
                💡 Request Model Answer
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!inputValue.trim() || !chatSession || isLoading) return;
              
              const isVoice = isVoiceMode || (document.getElementById('voice-toggle') as HTMLInputElement)?.checked;
              const userText = inputValue.trim();
              const messageToSend = isVoice ? `[VOICE TRANSCRIPT] ${userText}` : userText;
              
              setInputValue('');
              setIsVoiceMode(false);
              if (isRecording) {
                recognitionRef.current?.stop();
                setIsRecording(false);
              }
              
              const newUserMsg: Message = {
                id: Date.now().toString(),
                role: 'user',
                text: userText, // Show normal text in UI
              };
              
              setMessages((prev) => [...prev, newUserMsg]);
              setIsLoading(true);

              chatSession.sendMessage({ message: messageToSend })
                .then((response: any) => {
                  const responseText = response.text || '';
                  if (responseText.includes('PREPIQ SESSION SCORECARD')) {
                    setScorecardData(responseText);
                    setScreen('scorecard');
                  } else {
                    const newModelMsg: Message = {
                      id: (Date.now() + 1).toString(),
                      role: 'model',
                      text: responseText,
                    };
                    setMessages((prev) => [...prev, newModelMsg]);
                  }
                })
                .catch((error: any) => {
                  console.error('Failed to send message:', error);
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: (Date.now() + 1).toString(),
                      role: 'model',
                      text: 'Sorry, I encountered an error processing your answer. Could you please try again?',
                    },
                  ]);
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-end gap-2 bg-[#0a0e1a] border border-[#1e2d47] rounded-xl p-2 focus-within:ring-2 focus-within:ring-[#22c55e] focus-within:border-[#22c55e] transition-all shadow-sm">
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-3 rounded-lg transition-colors flex-shrink-0 mb-1 ${isRecording ? 'bg-[#f59e0b]/20 text-[#f59e0b] hover:bg-[#f59e0b]/30' : 'bg-[#1e2d47] text-slate-400 hover:bg-[#2a3f63] hover:text-white'}`}
                title={isRecording ? "Stop recording" : "Start voice recording"}
              >
                {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
              </button>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    (e.target as HTMLTextAreaElement).form?.requestSubmit();
                  }
                }}
                placeholder="Type your answer here... (Press Enter to send, Shift+Enter for new line)"
                className="flex-1 max-h-48 min-h-[56px] bg-transparent border-none focus:ring-0 resize-none py-3 px-3 text-white placeholder:text-slate-500"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-[#22c55e] hover:bg-[#1ea34d] text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 mb-1 mr-1"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-1 px-1">
              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                <input 
                  id="voice-toggle"
                  type="checkbox" 
                  className="rounded border-[#1e2d47] bg-[#0a0e1a] text-[#22c55e] focus:ring-[#22c55e]" 
                />
                Simulate Voice Input (evaluates as spoken transcript)
              </label>
              <p className="text-xs text-slate-500">
                PrepIQ evaluates your answers based on Indian industry standards.
              </p>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
  };

  return (
    <>
      <WaitlistModal isOpen={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} message={waitlistMessage} />
      {renderScreen()}
    </>
  );
}
