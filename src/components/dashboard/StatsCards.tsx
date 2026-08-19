import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "../../firebase/firebase";

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
    const fetchStats = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setLoading(false);
          return;
        }

        const interviewsRef = collection(
          db,
          "users",
          user.uid,
          "interviews"
        );

        const snapshot = await getDocs(interviewsRef);

        const interviews = snapshot.docs.map(
          (doc) => doc.data() as Interview
        );

        if (interviews.length === 0) {
          setTotalInterviews(0);
          setAverageScore(0);
          setBestScore(0);
          setTotalQuestions(0);
          setLoading(false);
          return;
        }

        const scores = interviews.map(
          (interview) =>
            Number(interview.overallScore) || 0
        );

        const questions = interviews.reduce(
          (total, interview) =>
            total +
            (Number(interview.totalQuestions) || 0),
          0
        );

        const totalScore = scores.reduce(
          (sum, score) => sum + score,
          0
        );

        const average =
          totalScore / interviews.length;

        setTotalInterviews(interviews.length);
        setAverageScore(
          Number(average.toFixed(1))
        );
        setBestScore(Math.max(...scores));
        setTotalQuestions(questions);
      } catch (error) {
        console.error(
          "Failed to fetch dashboard stats:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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

      {/* Total Interviews */}
      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-medium text-slate-500">
          Total Interviews
        </p>

        <p className="mt-3 text-3xl font-bold text-blue-600">
          {totalInterviews}
        </p>
      </div>

      {/* Average Score */}
      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-medium text-slate-500">
          Average Score
        </p>

        <p className="mt-3 text-3xl font-bold text-green-600">
          {averageScore}/10
        </p>
      </div>

      {/* Best Score */}
      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm font-medium text-slate-500">
          Best Score
        </p>

        <p className="mt-3 text-3xl font-bold text-purple-600">
          {bestScore}/10
        </p>
      </div>

      {/* Total Questions */}
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