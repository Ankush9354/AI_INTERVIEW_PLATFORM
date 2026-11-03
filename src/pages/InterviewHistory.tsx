
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

interface InterviewRecord {
  _id: string;
  overallScore: number;
  totalQuestions: number;
  createdAt?: string | null;
}

const InterviewHistory = () => {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError("");

      if (!user) {
        setInterviews([]);
        setError("Please log in to view your interview history.");
        setLoading(false);
        return;
      }

      try {
        // Get Firebase ID token
        const token = await user.getIdToken();

        // Fetch interview history from MongoDB backend
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/interviews/${encodeURIComponent(user.uid)}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch interview history."
          );
        }

        setInterviews(data.interviews || []);
      } catch (err) {
        console.error("Failed to load interview history:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load interview history. Please try again."
        );
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Interview History
            </h1>
            <p className="mt-2 text-slate-500">
              Review your previous interview attempts and scores.
            </p>
          </div>

          <button
            onClick={() => navigate("/interview")}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Start Interview
          </button>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            Loading your interview history...
          </div>
        ) : error ? (
          <div role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
            {error}
          </div>
        ) : interviews.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">
              No interviews yet
            </h2>
            <p className="mt-3 text-slate-500">
              Complete your first interview to see your results here.
            </p>
            <button
              onClick={() => navigate("/interview")}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Start Your First Interview
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total completed interviews
              </p>
              <p className="mt-1 text-3xl font-bold text-blue-600">
                {interviews.length}
              </p>
            </div>

            {interviews.map((interview) => (
              <article
                key={interview._id}
                className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <h2 className="font-semibold text-slate-800">
                    Interview Attempt
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {interview.createdAt
                      ? new Date(interview.createdAt).toLocaleString()
                      : "Date unavailable"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {interview.totalQuestions} questions
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-500">Overall Score</p>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {interview.overallScore}/10
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default InterviewHistory;
