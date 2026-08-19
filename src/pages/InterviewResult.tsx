import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

interface Evaluation {
  score: number;
  technicalAccuracy: number;
  communication: number;
  relevance: number;
  completeness: number;

  strengths: string[];
  weaknesses: string[];
  suggestions: string[];

  question: string;
  answer: string;
}

interface InterviewResultData {
  evaluations: Evaluation[];

  overallScore: number;
  technicalAccuracy: number;
  communication: number;
  relevance: number;
  completeness: number;

  // true when opening an existing result
  // from Dashboard
  isSavedResult?: boolean;
}

const InterviewResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const result =
    location.state as InterviewResultData | null;

  // Prevent multiple saves during the same page session
  const savedRef = useRef(false);

  useEffect(() => {
    const saveInterview = async () => {

      // No result
      if (!result || !result.evaluations) {
        return;
      }

      // ==================================================
      // IMPORTANT
      // If this result already exists in Firestore,
      // DO NOT save it again.
      // ==================================================
      if (result.isSavedResult === true) {
        console.log(
          "Existing interview opened. Not saving again."
        );

        return;
      }

      // Prevent duplicate execution
      if (savedRef.current) {
        return;
      }

      const user = auth.currentUser;

      if (!user) {
        console.error(
          "No logged-in user found."
        );

        return;
      }

      try {
        savedRef.current = true;

        await addDoc(
          collection(
            db,
            "users",
            user.uid,
            "interviews"
          ),
          {
            userId: user.uid,

            overallScore:
              result.overallScore,

            technicalAccuracy:
              result.technicalAccuracy,

            communication:
              result.communication,

            relevance:
              result.relevance,

            completeness:
              result.completeness,

            totalQuestions:
              result.evaluations.length,

            evaluations:
              result.evaluations,

            createdAt:
              serverTimestamp(),
          }
        );

        console.log(
          "Interview result saved successfully."
        );

      } catch (error) {
        // Allow retry if saving failed
        savedRef.current = false;

        console.error(
          "Failed to save interview:",
          error
        );
      }
    };

    saveInterview();
  }, [result]);

  // ==================================================
  // No result
  // ==================================================

  if (!result || !result.evaluations) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 text-center shadow-lg">

          <h1 className="text-2xl font-bold text-red-600">
            No Interview Result Found
          </h1>

          <p className="mt-3 text-slate-600">
            Please complete an interview first.
          </p>

          <button
            onClick={() =>
              navigate("/interview")
            }
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Start New Interview
          </button>

        </div>
      </div>
    );
  }

  // ==================================================
  // Score Label
  // ==================================================

  const getScoreLabel = (score: number) => {
    if (score >= 9) {
      return "Excellent";
    }

    if (score >= 8) {
      return "Very Good";
    }

    if (score >= 6) {
      return "Good";
    }

    if (score >= 4) {
      return "Needs Improvement";
    }

    return "Needs Significant Improvement";
  };

  // ==================================================
  // Collect strengths / weaknesses / suggestions
  // ==================================================

  const allStrengths =
    result.evaluations.flatMap(
      (item) => item.strengths || []
    );

  const allWeaknesses =
    result.evaluations.flatMap(
      (item) => item.weaknesses || []
    );

  const allSuggestions =
    result.evaluations.flatMap(
      (item) => item.suggestions || []
    );

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 text-center">

          <h1 className="text-4xl font-bold text-slate-800">
            🎉 Interview Completed
          </h1>

          <p className="mt-3 text-slate-500">
            Here is your AI-powered interview
            performance report.
          </p>

        </div>

        {/* Overall Score */}
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">

          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Overall Score
          </p>

          <div className="mt-4">

            <span className="text-6xl font-bold text-blue-600">
              {result.overallScore}
            </span>

            <span className="text-2xl text-slate-400">
              /10
            </span>

          </div>

          <p className="mt-3 text-xl font-semibold text-slate-700">
            {getScoreLabel(
              result.overallScore
            )}
          </p>

          <p className="mt-2 text-slate-500">
            {result.evaluations.length} questions completed
          </p>

        </div>

        {/* Score Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Technical */}
          <div className="rounded-xl bg-white p-6 shadow">

            <p className="text-sm text-slate-500">
              Technical Accuracy
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {result.technicalAccuracy}/10
            </p>

          </div>

          {/* Communication */}
          <div className="rounded-xl bg-white p-6 shadow">

            <p className="text-sm text-slate-500">
              Communication
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {result.communication}/10
            </p>

          </div>

          {/* Relevance */}
          <div className="rounded-xl bg-white p-6 shadow">

            <p className="text-sm text-slate-500">
              Relevance
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {result.relevance}/10
            </p>

          </div>

          {/* Completeness */}
          <div className="rounded-xl bg-white p-6 shadow">

            <p className="text-sm text-slate-500">
              Completeness
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              {result.completeness}/10
            </p>

          </div>

        </div>

        {/* Strengths */}
        <div className="mt-6 rounded-xl bg-white p-8 shadow-lg">

          <h2 className="text-2xl font-bold text-green-600">
            💪 Your Strengths
          </h2>

          <div className="mt-5 space-y-3">

            {allStrengths.length > 0 ? (
              allStrengths.map(
                (strength, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-green-50 p-4 text-slate-700"
                  >
                    ✅ {strength}
                  </div>
                )
              )
            ) : (
              <p className="text-slate-500">
                No strengths recorded.
              </p>
            )}

          </div>
        </div>

        {/* Weaknesses */}
        <div className="mt-6 rounded-xl bg-white p-8 shadow-lg">

          <h2 className="text-2xl font-bold text-red-600">
            ⚠️ Areas to Improve
          </h2>

          <div className="mt-5 space-y-3">

            {allWeaknesses.length > 0 ? (
              allWeaknesses.map(
                (weakness, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-red-50 p-4 text-slate-700"
                  >
                    ⚠️ {weakness}
                  </div>
                )
              )
            ) : (
              <p className="text-slate-500">
                No weaknesses recorded.
              </p>
            )}

          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-6 rounded-xl bg-white p-8 shadow-lg">

          <h2 className="text-2xl font-bold text-blue-600">
            💡 AI Suggestions
          </h2>

          <div className="mt-5 space-y-3">

            {allSuggestions.length > 0 ? (
              allSuggestions.map(
                (suggestion, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-blue-50 p-4 text-slate-700"
                  >
                    💡 {suggestion}
                  </div>
                )
              )
            ) : (
              <p className="text-slate-500">
                No suggestions available.
              </p>
            )}

          </div>
        </div>

        {/* Question Results */}
        <div className="mt-6 rounded-xl bg-white p-8 shadow-lg">

          <h2 className="text-2xl font-bold">
            📋 Question-by-Question Results
          </h2>

          <div className="mt-6 space-y-5">

            {result.evaluations.map(
              (evaluation, index) => (

                <div
                  key={index}
                  className="rounded-xl border border-slate-200 p-6"
                >

                  <div className="flex items-center justify-between gap-4">

                    <h3 className="font-semibold">
                      Question {index + 1}
                    </h3>

                    <span className="rounded-full bg-blue-100 px-4 py-2 font-bold text-blue-600">
                      {evaluation.score}/10
                    </span>

                  </div>

                  <p className="mt-4 text-slate-700">
                    {evaluation.question}
                  </p>

                  <div className="mt-4 rounded-lg bg-slate-50 p-4">

                    <p className="text-sm font-medium text-slate-500">
                      Your Answer
                    </p>

                    <p className="mt-2 text-slate-700">
                      {evaluation.answer}
                    </p>

                  </div>

                </div>
              )
            )}

          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 pb-10">

          <button
            onClick={() =>
              navigate("/interview")
            }
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
          >
            🚀 New Interview
          </button>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="rounded-lg border border-slate-300 bg-white px-8 py-3 font-semibold text-slate-700 hover:bg-slate-100"
          >
            🏠 Dashboard
          </button>

        </div>

      </div>
    </div>
  );
};

export default InterviewResult;