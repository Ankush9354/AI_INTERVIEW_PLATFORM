import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing VITE_GEMINI_API_KEY in .env");
}

export const ai = new GoogleGenAI({
  apiKey,
});

// =====================================================
// 1. GENERATE INTERVIEW QUESTIONS
// =====================================================

export async function generateInterviewQuestions(
  jobRole: string,
  experience: string,
  skills: string
) {
  const prompt = `
You are an expert technical interviewer.

Generate exactly 10 interview questions.

Job Role: ${jobRole}
Experience: ${experience}
Skills: ${skills}

Return ONLY a valid JSON array.

Example:
[
  {
    "question": "What is React?"
  }
]
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}

export interface EvaluationResult {
  score: number;
  technicalAccuracy: number;
  communication: number;
  relevance: number;
  completeness: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export async function evaluateInterviewAnswer(
  question: string,
  answer: string
): Promise<EvaluationResult> {
  const prompt = `
You are an expert technical interviewer.

Evaluate the candidate's answer.

Question:
${question}

Candidate Answer:
${answer}

Evaluate the answer based on:

1. Technical accuracy
2. Communication
3. Relevance
4. Completeness

Return ONLY valid JSON in exactly this format:

{
  "score": 7,
  "technicalAccuracy": 7,
  "communication": 8,
  "relevance": 7,
  "completeness": 6,
  "strengths": [
    "Good understanding of the concept"
  ],
  "weaknesses": [
    "Could provide a more detailed explanation"
  ],
  "suggestions": [
    "Include a practical example"
  ]
}

Rules:
- All scores must be numbers from 0 to 10.
- strengths must be an array of strings.
- weaknesses must be an array of strings.
- suggestions must be an array of strings.
- Return ONLY JSON.
- Do not use markdown.
- Do not use code fences.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  let cleanedText = text.trim();
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanedText = jsonMatch[0];
  } else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  try {
    return JSON.parse(cleanedText) as EvaluationResult;
  } catch (error) {
    console.error(
      "Failed to parse interview evaluation:",
      error
    );

    console.error("Gemini response:", text);

    throw new Error(
      "Gemini returned invalid JSON."
    );
  }
}

// =====================================================
// 3. RESUME ↔ JOB DESCRIPTION ANALYSIS
// =====================================================

export interface ResumeMatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  suggestions: string[];
}

export async function analyzeResumeAgainstJob(
  resumeText: string,
  jobDescription: string
): Promise<ResumeMatchResult> {
  const prompt = `
You are an expert technical recruiter.

Analyze the candidate's resume against the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON in exactly this format:

{
  "matchScore": 75,
  "matchedSkills": [
    "React",
    "JavaScript"
  ],
  "missingSkills": [
    "Node.js"
  ],
  "strengths": [
    "Strong frontend experience"
  ],
  "suggestions": [
    "Add more Node.js projects"
  ]
}

Rules:

1. matchScore must be a number between 0 and 100.
2. matchedSkills must be an array of strings.
3. missingSkills must be an array of strings.
4. strengths must be an array of strings.
5. suggestions must be an array of strings.
6. Do not include markdown.
7. Do not use code fences.
8. Return ONLY JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  const text = response.text;

  if (!text) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  let cleanedText = text.trim();

  if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  try {
    const result = JSON.parse(cleanedText);

    if (
      typeof result.matchScore !== "number" ||
      !Array.isArray(result.matchedSkills) ||
      !Array.isArray(result.missingSkills) ||
      !Array.isArray(result.strengths) ||
      !Array.isArray(result.suggestions)
    ) {
      throw new Error(
        "Gemini returned an unexpected format."
      );
    }

    return result as ResumeMatchResult;
  } catch (error) {
    console.error(
      "Failed to parse resume analysis:",
      error
    );

    console.error("Gemini response:", text);

    throw new Error(
      "Gemini returned invalid JSON."
    );
  }
}