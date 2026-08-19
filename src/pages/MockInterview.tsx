import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import { evaluateInterviewAnswer } from "../lib/gemini";

interface Evaluation {
  score: number;
  technicalAccuracy: number;
  communication: number;
  relevance: number;
  completeness: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface SavedEvaluation extends Evaluation {
  question: string;
  answer: string;
}

const MockInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const questions = (location.state?.questions || []) as string[];

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [submittedAnswer, setSubmittedAnswer] = useState("");

  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  // Stores evaluation of every completed question
  const [evaluations, setEvaluations] = useState<
    SavedEvaluation[]
  >([]);

  const [evaluating, setEvaluating] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-red-600">
            No interview questions found.
          </h1>

          <p className="mt-3 text-slate-600">
            Please generate interview questions first.
          </p>

          <button
            onClick={() => navigate("/interview")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Go to Interview Generator
          </button>
        </div>
      </div>
    );
  }

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-red-600">
            Speech Recognition Not Supported
          </h1>

          <p className="mt-3 text-slate-600">
            Please use Google Chrome or another supported browser.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleStartRecording = () => {
    resetTranscript();

    setSubmittedAnswer("");
    setEvaluation(null);

    SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
    });
  };

  const handleStopRecording = () => {
    SpeechRecognition.stopListening();
  };

  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) {
      alert("Please record your answer first.");
      return;
    }

    try {
      setEvaluating(true);

      setSubmittedAnswer(transcript);

      const response = await evaluateInterviewAnswer(
        currentQuestion,
        transcript
      );

      const cleaned = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed: Evaluation = JSON.parse(cleaned);

      setEvaluation(parsed);

      // Save this question's complete evaluation
      setEvaluations((previous) => {
        const newEvaluation: SavedEvaluation = {
          question: currentQuestion,
          answer: transcript,
          ...parsed,
        };

        // Prevent duplicate evaluation for the same question
        const filtered = previous.filter(
          (_, index) => index !== currentQuestionIndex
        );

        filtered.splice(
          currentQuestionIndex,
          0,
          newEvaluation
        );

        return filtered;
      });
    } catch (error) {
      console.error(error);
      alert("Failed to evaluate your answer.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(
        currentQuestionIndex + 1
      );

      resetTranscript();
      setSubmittedAnswer("");
      setEvaluation(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const previousIndex = currentQuestionIndex - 1;

      setCurrentQuestionIndex(previousIndex);

      resetTranscript();

      // Restore previous answer/evaluation if it exists
      const previousEvaluation =
        evaluations[previousIndex];

      if (previousEvaluation) {
        setSubmittedAnswer(previousEvaluation.answer);
        setEvaluation(previousEvaluation);
      } else {
        setSubmittedAnswer("");
        setEvaluation(null);
      }
    }
  };

  const handleFinishInterview = () => {
    if (evaluations.length !== questions.length) {
      alert(
        `Please complete all questions before finishing. You have completed ${evaluations.length} of ${questions.length}.`
      );
      return;
    }

    // Calculate final averages
    const totalScore = evaluations.reduce(
      (sum, item) => sum + item.score,
      0
    );

    const totalTechnical = evaluations.reduce(
      (sum, item) => sum + item.technicalAccuracy,
      0
    );

    const totalCommunication = evaluations.reduce(
      (sum, item) => sum + item.communication,
      0
    );

    const totalRelevance = evaluations.reduce(
      (sum, item) => sum + item.relevance,
      0
    );

    const totalCompleteness = evaluations.reduce(
      (sum, item) => sum + item.completeness,
      0
    );

    const count = evaluations.length;

    const result = {
      evaluations,

      overallScore: Number(
        (totalScore / count).toFixed(1)
      ),

      technicalAccuracy: Number(
        (totalTechnical / count).toFixed(1)
      ),

      communication: Number(
        (totalCommunication / count).toFixed(1)
      ),

      relevance: Number(
        (totalRelevance / count).toFixed(1)
      ),

      completeness: Number(
        (totalCompleteness / count).toFixed(1)
      ),
    };

    navigate("/interview-result", {
      state: result,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">
            AI Mock Interview
          </h1>

          <p className="mt-2 text-slate-500">
            Question {currentQuestionIndex + 1} of{" "}
            {questions.length}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{
              width: `${
                ((currentQuestionIndex + 1) /
                  questions.length) *
                100
              }%`,
            }}
          />
        </div>

        {/* Question */}
        <div className="rounded-xl bg-white p-8 shadow-lg">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600">
            Question {currentQuestionIndex + 1}
          </span>

          <h2 className="mt-6 text-2xl font-semibold">
            Interview Question
          </h2>

          <p className="mt-4 text-lg leading-8 text-slate-700">
            {currentQuestion}
          </p>
        </div>

        {/* Answer */}
        <div className="mt-6 rounded-xl bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">
            Your Answer
          </h2>

          {listening ? (
            <p className="mb-5 font-medium text-red-600">
              🔴 Listening... Speak your answer
            </p>
          ) : (
            <p className="mb-5 text-slate-500">
              🎤 Click Start Recording and speak your answer.
            </p>
          )}

          {/* Transcript */}
          <div className="min-h-32 rounded-lg border border-slate-300 bg-slate-50 p-5">
            {transcript ? (
              <p className="leading-7 text-slate-700">
                {transcript}
              </p>
            ) : submittedAnswer ? (
              <p className="leading-7 text-slate-700">
                {submittedAnswer}
              </p>
            ) : (
              <p className="text-slate-400">
                Your spoken answer will appear here...
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-wrap gap-4">
            {!listening ? (
              <button
                onClick={handleStartRecording}
                className="rounded-lg bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-600"
              >
                🎤 Start Recording
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="rounded-lg bg-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-800"
              >
                ⏹ Stop Recording
              </button>
            )}

            <button
              onClick={() => {
                resetTranscript();
                setSubmittedAnswer("");
                setEvaluation(null);
              }}
              className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100"
            >
              🔄 Retry
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={
                !transcript.trim() ||
                listening ||
                evaluating
              }
              className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {evaluating
                ? "🤖 Evaluating..."
                : "Submit Answer"}
            </button>
          </div>
        </div>

        {/* Evaluation */}
        {evaluation && (
          <div className="mt-6 rounded-xl bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold">
              🤖 AI Evaluation
            </h2>

            {/* Overall Score */}
            <div className="mb-6 rounded-xl bg-blue-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-500">
                Overall Score
              </p>

              <p className="mt-2 text-5xl font-bold text-blue-600">
                {evaluation.score}/10
              </p>
            </div>

            {/* Scores */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-slate-500">
                  Technical Accuracy
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {evaluation.technicalAccuracy}/10
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-slate-500">
                  Communication
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {evaluation.communication}/10
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-slate-500">
                  Relevance
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {evaluation.relevance}/10
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-slate-500">
                  Completeness
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {evaluation.completeness}/10
                </p>
              </div>
            </div>

            {/* Strengths */}
            <div className="mt-8">
              <h3 className="mb-3 text-xl font-semibold text-green-600">
                💪 Strengths
              </h3>

              <ul className="space-y-2">
                {evaluation.strengths.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="rounded-lg bg-green-50 p-3"
                    >
                      ✅ {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="mt-8">
              <h3 className="mb-3 text-xl font-semibold text-red-600">
                ⚠️ Areas to Improve
              </h3>

              <ul className="space-y-2">
                {evaluation.weaknesses.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="rounded-lg bg-red-50 p-3"
                    >
                      ⚠️ {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="mt-8">
              <h3 className="mb-3 text-xl font-semibold text-blue-600">
                💡 Suggestions
              </h3>

              <ul className="space-y-2">
                {evaluation.suggestions.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="rounded-lg bg-blue-50 p-3"
                    >
                      💡 {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Navigation */}
            <div className="mt-10 flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              {currentQuestionIndex <
              questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  onClick={handleFinishInterview}
                  className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                >
                  🎉 Finish Interview
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterview;