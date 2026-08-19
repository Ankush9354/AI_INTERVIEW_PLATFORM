import { useState } from "react";
import { Link } from "react-router-dom";
import { generateInterviewQuestions } from "../lib/gemini";

const Interview = () => {
  const [jobRole, setJobRole] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");

  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!jobRole || !experience || !skills) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await generateInterviewQuestions(
        jobRole,
        experience,
        skills
      );

      const cleaned = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      setQuestions(
        parsed.map((q: { question: string }) => q.question)
      );
    } catch (error) {
      console.error(error);
      alert("Failed to generate interview questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold text-slate-800">
          AI Interview Generator
        </h1>

        {/* Input Form */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Job Role"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              placeholder="Experience (e.g. Fresher, 2 Years)"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              placeholder="Skills (React, TypeScript, Firebase)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
            />

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Questions"}
            </button>
          </div>
        </div>

        {/* Generated Questions */}
        {questions.length > 0 && (
          <>
            <div className="mt-10">
              <h2 className="mb-6 text-2xl font-bold">
                Generated Questions
              </h2>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-white p-5 shadow"
                  >
                    <h3 className="mb-2 font-semibold text-blue-600">
                      Question {index + 1}
                    </h3>

                    <p className="text-slate-700">
                      {question}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Mock Interview */}
            <div className="mt-8 text-center">
              <Link
                to="/mock-interview"
                state={{ questions }}
                className="inline-block rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                🚀 Start Mock Interview
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Interview;