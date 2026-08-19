import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { auth, db } from "../../firebase/firebase";

interface Interview {
  overallScore?: number;
  createdAt?: any;
}

interface ChartData {
  interview: string;
  score: number;
}

const PerformanceChart = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
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

        const interviewsQuery = query(
          interviewsRef,
          orderBy("createdAt", "asc")
        );

        const snapshot = await getDocs(
          interviewsQuery
        );

        const chartData: ChartData[] =
          snapshot.docs.map((doc, index) => {
            const interview =
              doc.data() as Interview;

            return {
              interview: `#${index + 1}`,
              score:
                Number(interview.overallScore) || 0,
            };
          });

        setData(chartData);
      } catch (error) {
        console.error(
          "Failed to fetch performance data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
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
            Complete an interview to see your
            performance.
          </p>
        </div>
      ) : (
        <div className="h-80 w-full">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >
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
                formatter={(value) => [
                  `${value}/10`,
                  "Score",
                ]}
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