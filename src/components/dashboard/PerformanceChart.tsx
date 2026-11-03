
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { auth } from "../../firebase/firebase";

interface Interview {
  overallScore?: number;
  createdAt?: string | null;
}

interface ChartData {
  interview: string;
  score: number;
}

const PerformanceChart = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (!user) {
        setData([]);
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

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch performance data."
          );
        }

        const interviews: Interview[] = result.interviews || [];

        const sortedInterviews = [...interviews].sort(
          (a, b) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
        );

        const chartData: ChartData[] = sortedInterviews.map(
          (interview, index) => ({
            interview: `#${index + 1}`,
            score: Number(interview.overallScore) || 0,
          })
        );

        setData(chartData);
      } catch (error) {
        console.error("Failed to fetch performance data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-96 animate-pulse rounded-xl bg-white shadow" />
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          Interview Performance
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Track your interview scores over time.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-80 items-center justify-center">
          <p className="text-slate-500">
            Complete an interview to see your performance.
          </p>
        </div>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="interview"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                formatter={(value) => [`${value}/10`, "Score"]}
              />

              <Line
                type="monotone"
                dataKey="score"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default PerformanceChart;
