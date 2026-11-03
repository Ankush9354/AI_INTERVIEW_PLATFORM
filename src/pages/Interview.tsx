import { useState } from "react";
import { Link } from "react-router-dom";
import { generateInterviewQuestions } from "../lib/gemini";

const Interview = () => {
  const [jobRole, setJobRole] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    const role = jobRole.trim();
    const exp = experience.trim();
    const skillSet = skills.trim();

    if (!role || !exp || !skillSet) {
      setError("Please fill in all three fields.");
      return;
    }

    setError("");
    setQuestions([]);
    setLoading(true);

    try {
      const response = await generateInterviewQuestions(
        role,
        exp,
        skillSet
      );

      const cleaned = response
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed: unknown = JSON.parse(cleaned);

      if (!Array.isArray(parsed)) {
        throw new Error("The AI response was not a question list.");
      }

      const generatedQuestions = parsed
        .map((item: unknown) => {
          if (
            typeof item === "string" &&
            item.trim()
          ) {
            return item.trim();
          }

          if (
            typeof item === "object" &&
            item !== null &&
            "question" in item &&
            typeof item.question === "string"
          ) {
            return item.question.trim();
          }

          return "";
        })
        .filter((question: string) => question.length > 0);

      if (generatedQuestions.length === 0) {
        throw new Error("No valid questions were returned.");
      }

      setQuestions(generatedQuestions);
    } catch (err) {
      console.error("Question generation failed:", err);
      setError(
        "Could not generate questions. Please check your AI configuration and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
            AI Interview Generator
          </h1>
          <p className="mt-3 text-slate-600">
            Personalize your interview practice based on your role,
            experience, and technical skills.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="jobRole"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Job Role
              </label>
              <input
                id="jobRole"
                type="text"
                placeholder="e.g. Frontend Developer"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                maxLength={100}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="experience"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Experience
              </label>
              <input
                id="experience"
                type="text"
                placeholder="e.g. Fresher or 2 years"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                maxLength={100}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="skills"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Skills
              </label>
              <textarea
                id="skills"
                placeholder="e.g. React, TypeScript, Node.js, MongoDB"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                maxLength={1000}
                rows={3}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating Questions..." : "Generate Questions"}
            </button>
          </div>
        </section>

        {questions.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-slate-800">
                Generated Questions
              </h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {questions.length} questions
              </span>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <article
                  key={`${index}-${question}`}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="mb-2 font-semibold text-blue-600">
                    Question {index + 1}
                  </h3>
                  <p className="leading-7 text-slate-700">{question}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/mock-interview"
                state={{ questions }}
                className="inline-block rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                Start Mock Interview
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default Interview;