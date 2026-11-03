
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";

interface Interview {
  overallScore?: number;
  totalQuestions?: number;
}

const StatsCards = () => {
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (!user) {
        setTotalInterviews(0);
        setAverageScore(0);
        setBestScore(0);
        setTotalQuestions(0);
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();

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
            data.message || "Failed to fetch dashboard statistics."
          );
        }

        const interviews: Interview[] = data.interviews || [];

        if (interviews.length === 0) {
          setTotalInterviews(0);
          setAverageScore(0);
          setBestScore(0);
          setTotalQuestions(0);
          return;
        }

        const scores = interviews.map(
          (interview) => Number(interview.overallScore) || 0
        );

        const questions = interviews.reduce(
          (total, interview) =>
            total + (Number(interview.totalQuestions) || 0),
          0
        );

        const totalScore = scores.reduce(
          (sum, score) => sum + score,
          0
        );

        setTotalInterviews(interviews.length);
        setAverageScore(
          Number((totalScore / interviews.length).toFixed(1))
        );
        setBestScore(Math.max(...scores));
        setTotalQuestions(questions);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-xl bg-white shadow"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-medium text-slate-500">
          Total Interviews
        </p>
        <p className="mt-3 text-3xl font-bold text-blue-600">
          {totalInterviews}
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-medium text-slate-500">
          Average Score
        </p>
        <p className="mt-3 text-3xl font-bold text-green-600">
          {averageScore}/10
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-medium text-slate-500">
          Best Score
        </p>
        <p className="mt-3 text-3xl font-bold text-purple-600">
          {bestScore}/10
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-medium text-slate-500">
          Questions Answered
        </p>
        <p className="mt-3 text-3xl font-bold text-orange-500">
          {totalQuestions}
        </p>
      </div>
    </div>
  );
};

export default StatsCards;
