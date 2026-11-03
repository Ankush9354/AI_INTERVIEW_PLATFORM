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

function validateEvaluation(data: unknown): Evaluation {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid evaluation response.");
  }

  const item = data as Record<string, unknown>;

  const scoreFields = [
    "score",
    "technicalAccuracy",
    "communication",
    "relevance",
    "completeness",
  ];

  for (const field of scoreFields) {
    const value = item[field];

    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 10
    ) {
      throw new Error(`Invalid evaluation score: ${field}`);
    }
  }

  const listFields = ["strengths", "weaknesses", "suggestions"];

  for (const field of listFields) {
    const value = item[field];

    if (
      !Array.isArray(value) ||
      !value.every((entry) => typeof entry === "string")
    ) {
      throw new Error(`Invalid evaluation list: ${field}`);
    }
  }

  return item as unknown as Evaluation;
}

const MockInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const questions: string[] = Array.isArray(location.state?.questions)
    ? location.state.questions.filter(
        (question: unknown): question is string =>
          typeof question === "string" && question.trim().length > 0
      )
    : [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evaluations, setEvaluations] = useState<
    (SavedEvaluation | undefined)[]
  >([]);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const currentQuestion = questions[currentQuestionIndex];

  const completedCount = evaluations.filter(
    (item) => item !== undefined
  ).length;

  const handleStartRecording = async () => {
    if (evaluating) return;

    setError("");
    setSubmittedAnswer("");
    setEvaluation(null);
    resetTranscript();

    try {
      await SpeechRecognition.startListening({
        continuous: true,
        language: "en-US",
      });
    } catch (err) {
      console.error("Could not start recording:", err);
      setError(
        "Could not start recording. Please check your microphone permissions."
      );
    }
  };

  const handleStopRecording = () => {
    SpeechRecognition.stopListening();
  };

  const handleRetry = () => {
    SpeechRecognition.stopListening();
    resetTranscript();
    setSubmittedAnswer("");
    setEvaluation(null);
    setError("");
  };

  const handleSubmitAnswer = async () => {
    if (listening) {
      setError("Please stop recording before submitting your answer.");
      return;
    }

    const answer = transcript.trim() || submittedAnswer.trim();

    if (!answer) {
      setError("Please record your answer before submitting.");
      return;
    }

    if (evaluating || !currentQuestion) return;

    setError("");
    setEvaluating(true);

    try {
      const response = await evaluateInterviewAnswer(
        currentQuestion,
        answer
      );

      const parsed = validateEvaluation(response);

      const newEvaluation: SavedEvaluation = {
        question: currentQuestion,
        answer,
        ...parsed,
      };

      setSubmittedAnswer(answer);
      setEvaluation(parsed);

      setEvaluations((previous) => {
        const updated = [...previous];
        updated[currentQuestionIndex] = newEvaluation;
        return updated;
      });
    } catch (err) {
      console.error("Answer evaluation failed:", err);
      setError(
        "Failed to evaluate your answer. Please try again and check your AI configuration if the problem continues."
      );
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (evaluating || listening) {
      setError("Please stop recording and wait for evaluation to finish.");
      return;
    }

    if (!evaluation) {
      setError("Please submit and evaluate your answer before continuing.");
      return;
    }

    if (currentQuestionIndex >= questions.length - 1) return;

    const nextIndex = currentQuestionIndex + 1;
    const saved = evaluations[nextIndex];

    setCurrentQuestionIndex(nextIndex);
    resetTranscript();
    setError("");

    if (saved) {
      setSubmittedAnswer(saved.answer);
      setEvaluation(saved);
    } else {
      setSubmittedAnswer("");
      setEvaluation(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (evaluating || listening || currentQuestionIndex === 0) return;

    const previousIndex = currentQuestionIndex - 1;
    const saved = evaluations[previousIndex];

    setCurrentQuestionIndex(previousIndex);
    resetTranscript();
    setError("");

    if (saved) {
      setSubmittedAnswer(saved.answer);
      setEvaluation(saved);
    } else {
      setSubmittedAnswer("");
      setEvaluation(null);
    }
  };

  const handleFinishInterview = () => {
    if (evaluating || listening) {
      setError("Please stop recording and wait for evaluation to finish.");
      return;
    }

    const allCompleted = questions.every(
      (question, index) =>
        evaluations[index]?.question === question
    );

    if (!allCompleted) {
      setError(
        `Please complete every question before finishing. You have completed ${completedCount} of ${questions.length}.`
      );
      return;
    }

    const completedEvaluations = evaluations as SavedEvaluation[];
    const count = completedEvaluations.length;

    if (count === 0) {
      setError("There are no completed evaluations to submit.");
      return;
    }

    const average = (field: keyof Evaluation) =>
      Number(
        (
          completedEvaluations.reduce(
            (sum, item) => sum + (item[field] as number),
            0
          ) / count
        ).toFixed(1)
      );

    const result = {
      evaluations: completedEvaluations,
      totalQuestions: questions.length,
      overallScore: average("score"),
      technicalAccuracy: average("technicalAccuracy"),
      communication: average("communication"),
      relevance: average("relevance"),
      completeness: average("completeness"),
    };

    navigate("/interview-result", {
      state: result,
    });
  };

  if (questions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <section className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-red-600">
            No interview questions found
          </h1>
          <p className="mt-3 text-slate-600">
            Generate interview questions before starting your mock interview.
          </p>
          <button
            onClick={() => navigate("/interview")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Go to Interview Generator
          </button>
        </section>
      </main>
    );
  }

  if (!browserSupportsSpeechRecognition) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <section className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-red-600">
            Speech Recognition Not Supported
          </h1>
          <p className="mt-3 text-slate-600">
            Please use a supported browser, such as Google Chrome, and allow
            microphone access. Browser speech recognition may require an
            internet connection.
          </p>
          <button
            onClick={() => navigate("/interview")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Interview Generator
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
            AI Mock Interview
          </h1>
          <p className="mt-2 text-slate-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {completedCount} of {questions.length} questions evaluated
          </p>
        </header>

        <div
          className="mb-6 h-3 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label="Interview progress"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={completedCount}
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${(completedCount / questions.length) * 100}%`,
            }}
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            Question {currentQuestionIndex + 1}
          </span>
          <h2 className="mt-6 text-2xl font-semibold text-slate-800">
            Interview Question
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            {currentQuestion}
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-xl font-semibold text-slate-800">
            Your Answer
          </h2>

          {listening ? (
            <p className="mb-5 font-medium text-red-600">
              🔴 Listening... Speak your answer.
            </p>
          ) : (
            <p className="mb-5 text-slate-500">
              🎤 Start recording, speak clearly, then stop recording.
            </p>
          )}

          <div
            className="min-h-32 whitespace-pre-wrap rounded-lg border border-slate-300 bg-slate-50 p-5"
            aria-live="polite"
          >
            {transcript || submittedAnswer ? (
              <p className="leading-7 text-slate-700">
                {transcript || submittedAnswer}
              </p>
            ) : (
              <p className="text-slate-400">
                Your spoken answer will appear here...
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {!listening ? (
              <button
                onClick={handleStartRecording}
                disabled={evaluating}
                className="rounded-lg bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🎤 Start Recording
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="rounded-lg bg-slate-700 px-5 py-3 font-semibold text-white hover:bg-slate-800"
              >
                ⏹ Stop Recording
              </button>
            )}

            <button
              onClick={handleRetry}
              disabled={evaluating}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              🔄 Retry
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={
                (!transcript.trim() && !submittedAnswer.trim()) ||
                listening ||
                evaluating
              }
              className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {evaluating ? "🤖 Evaluating..." : "Submit Answer"}
            </button>
          </div>
        </section>

        {evaluation && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-2xl font-bold text-slate-800">
              🤖 AI Evaluation
            </h2>

            <div className="mb-6 rounded-xl bg-blue-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-500">
                Overall Score
              </p>
              <p className="mt-2 text-5xl font-bold text-blue-600">
                {evaluation.score}/10
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["Technical Accuracy", evaluation.technicalAccuracy],
                  ["Communication", evaluation.communication],
                  ["Relevance", evaluation.relevance],
                  ["Completeness", evaluation.completeness],
                ] as [string, number][]
              ).map(([label, score]) => (
                <div key={label} className="rounded-lg border p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-800">
                    {score}/10
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="mb-3 text-xl font-semibold text-green-600">
                💪 Strengths
              </h3>
              {evaluation.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {evaluation.strengths.map((item, index) => (
                    <li
                      key={`${index}-${item}`}
                      className="rounded-lg bg-green-50 p-3 text-slate-700"
                    >
                      ✅ {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500">No strengths provided.</p>
              )}
            </div>

            <div className="mt-8">
              <h3 className="mb-3 text-xl font-semibold text-red-600">
                ⚠️ Areas to Improve
              </h3>
              {evaluation.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {evaluation.weaknesses.map((item, index) => (
                    <li
                      key={`${index}-${item}`}
                      className="rounded-lg bg-red-50 p-3 text-slate-700"
                    >
                      ⚠️ {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500">No weaknesses provided.</p>
              )}
            </div>

            <div className="mt-8">
              <h3 className="mb-3 text-xl font-semibold text-blue-600">
                💡 Suggestions
              </h3>
              {evaluation.suggestions.length > 0 ? (
                <ul className="space-y-2">
                  {evaluation.suggestions.map((item, index) => (
                    <li
                      key={`${index}-${item}`}
                      className="rounded-lg bg-blue-50 p-3 text-slate-700"
                    >
                      💡 {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500">No suggestions provided.</p>
              )}
            </div>

            <div className="mt-10 flex flex-wrap justify-between gap-3">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0 || evaluating || listening}
                className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  disabled={evaluating || listening}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  onClick={handleFinishInterview}
                  disabled={evaluating || listening}
                  className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  🎉 Finish Interview
                </button>
              )}
            </div>
          </section>
        )}

        <div className="mt-6 flex justify-between gap-3">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0 || evaluating || listening}
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous Question
          </button>

          <button
            onClick={() => navigate("/interview")}
            disabled={evaluating}
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Exit Interview
          </button>
        </div>
      </div>
    </main>
  );
};

export default MockInterview;