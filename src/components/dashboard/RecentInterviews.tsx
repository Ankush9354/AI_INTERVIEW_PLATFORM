import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
} from "firebase/firestore";

import { auth, db } from "../../firebase/firebase";

interface Interview {
  id: string;
  overallScore: number;
  totalQuestions: number;
  createdAt: any;
  technicalAccuracy: number;
  communication: number;
  relevance: number;
  completeness: number;
  evaluations: any[];
}

const RecentInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviews = async () => {
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
          orderBy("createdAt", "desc"),
          limit(5)
        );

        const snapshot = await getDocs(interviewsQuery);

        const data: Interview[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Interview, "id">),
        }));

        setInterviews(data);
      } catch (error) {
        console.error(
          "Failed to fetch interviews:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) {
      return "Date unavailable";
    }

    try {
      return timestamp
        .toDate()
        .toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
    } catch {
      return "Date unavailable";
    }
  };

  const handleViewInterview = (interview: Interview) => {
    navigate("/interview-result", {
      state: {
        evaluations: interview.evaluations,
        overallScore: interview.overallScore,
        technicalAccuracy:
          interview.technicalAccuracy,
        communication: interview.communication,
        relevance: interview.relevance,
        completeness: interview.completeness,

        // IMPORTANT:
        // This tells InterviewResult that this
        // result already exists in Firestore.
        isSavedResult: true,
      },
    });
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          Recent Interviews
        </h2>

        {interviews.length > 0 && (
          <span className="text-sm text-slate-500">
            Latest 5
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-slate-500">
          Loading interviews...
        </p>
      )}

      {/* No Interviews */}
      {!loading && interviews.length === 0 && (
        <div className="rounded-lg bg-slate-50 p-6 text-center">
          <p className="text-slate-500">
            No interviews yet.
          </p>

          <button
            onClick={() => navigate("/interview")}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Start Your First Interview
          </button>
        </div>
      )}

      {/* Interview List */}
      {!loading && interviews.length > 0 && (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="flex flex-col gap-4 rounded-lg border border-slate-200 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >

              {/* Interview Information */}
              <div>
                <h3 className="font-semibold text-slate-800">
                  AI Mock Interview
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {interview.totalQuestions || 0} Questions
                  {" • "}
                  {formatDate(interview.createdAt)}
                </p>
              </div>

              {/* Score + View */}
              <div className="flex items-center gap-4">

                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    Score
                  </p>

                  <p className="text-xl font-bold text-blue-600">
                    {interview.overallScore}/10
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleViewInterview(interview)
                  }
                  className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
                >
                  View
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentInterviews;