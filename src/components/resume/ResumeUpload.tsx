import { useState } from "react";
import Button from "../ui/Button";

import { auth, db } from "../../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";

import { uploadResumeToCloudinary } from "../../services/cloudinary";
import { extractTextFromPDF } from "../../services/resumeParser";

import {
  analyzeResumeAgainstJob,
} from "../../lib/gemini";

import type {
  ResumeMatchResult,
} from "../../lib/gemini";

const ResumeUpload = () => {
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const [resumeText, setResumeText] = useState("");

  const [jobDescription, setJobDescription] =
    useState("");

  const [analyzing, setAnalyzing] = useState(false);

  const [matchResult, setMatchResult] =
    useState<ResumeMatchResult | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (
      e.target.files &&
      e.target.files.length > 0
    ) {
      setFile(e.target.files[0]);

      // Reset previous analysis
      setResumeText("");
      setMatchResult(null);
    }
  };

  // =====================================================
  // UPLOAD RESUME
  // =====================================================

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF.");
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please login first.");
      return;
    }

    try {
      setUploading(true);
      setExtracting(true);

      // Extract PDF text locally
      const extractedText =
        await extractTextFromPDF(file);

      if (!extractedText) {
        alert(
          "Could not extract text from this PDF. Please use a text-based PDF."
        );

        return;
      }

      setResumeText(extractedText);

      setExtracting(false);

      // Upload PDF to Cloudinary
      const result =
        await uploadResumeToCloudinary(file);

      // Save resume information in Firestore
      await updateDoc(
        doc(db, "users", currentUser.uid),
        {
          resumeURL: result.url,
          resumeName: file.name,
          resumeText: extractedText,
          uploadedAt: new Date(),
        }
      );

      alert("Resume uploaded successfully!");

    } catch (error) {
      console.error(
        "Resume upload failed:",
        error
      );

      alert("Upload failed.");
    } finally {
      setUploading(false);
      setExtracting(false);
    }
  };

  // =====================================================
  // ANALYZE RESUME
  // =====================================================

  const handleAnalyze = async () => {
    if (!resumeText) {
      alert(
        "Please upload your resume first."
      );

      return;
    }

    if (!jobDescription.trim()) {
      alert(
        "Please enter a job description."
      );

      return;
    }

    try {
      setAnalyzing(true);

      setMatchResult(null);

      // ONE Gemini request
      const result =
        await analyzeResumeAgainstJob(
          resumeText,
          jobDescription
        );

      setMatchResult(result);

    } catch (error) {
      console.error(
        "Resume analysis failed:",
        error
      );

      alert(
        "Failed to analyze resume. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* =================================================
          UPLOAD SECTION
      ================================================= */}

      <div className="rounded-2xl bg-white p-8 shadow">

        <h2 className="mb-2 text-2xl font-bold">
          Upload Resume
        </h2>

        <p className="mb-6 text-sm text-slate-500">
          Upload your PDF resume to analyze it
          against a job description.
        </p>

        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="mb-6 w-full rounded-lg border p-3"
        />

        {file && (
          <div className="mb-6 rounded-lg bg-slate-50 p-4">

            <p className="font-medium text-slate-700">
              Selected Resume
            </p>

            <p className="mt-1 text-sm text-green-600">
              {file.name}
            </p>

          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading
            ? extracting
              ? "Extracting Resume..."
              : "Uploading..."
            : "Upload Resume"}
        </Button>

        {resumeText && (
          <div className="mt-5 rounded-lg bg-green-50 p-4">

            <p className="font-semibold text-green-700">
              ✓ Resume text extracted successfully
            </p>

            <p className="mt-1 text-sm text-green-600">
              Your resume is ready for AI analysis.
            </p>

          </div>
        )}

      </div>

      {/* =================================================
          JOB DESCRIPTION SECTION
      ================================================= */}

      {resumeText && (
        <div className="rounded-2xl bg-white p-8 shadow">

          <h2 className="mb-2 text-2xl font-bold">
            Job Description
          </h2>

          <p className="mb-5 text-sm text-slate-500">
            Paste the job description you want to
            compare with your resume.
          </p>

          <textarea
            value={jobDescription}
            onChange={(e) =>
              setJobDescription(e.target.value)
            }
            placeholder="Paste the job description here..."
            rows={12}
            className="w-full resize-none rounded-lg border border-slate-300 p-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={
              !jobDescription.trim() ||
              analyzing
            }
            className="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analyzing
              ? "Analyzing Resume..."
              : "Analyze Resume"}
          </button>

        </div>
      )}

      {/* =================================================
          MATCH RESULT
      ================================================= */}

      {matchResult && (
        <div className="space-y-6">

          {/* Match Score */}

          <div className="rounded-2xl bg-white p-8 text-center shadow">

            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Resume Match Score
            </p>

            <div className="mt-4">

              <span className="text-6xl font-bold text-blue-600">
                {matchResult.matchScore}
              </span>

              <span className="text-2xl text-slate-400">
                %
              </span>

            </div>

            <p className="mt-3 text-slate-500">
              Based on your resume and the
              provided job description.
            </p>

          </div>

          {/* Matched Skills */}

          <div className="rounded-2xl bg-white p-8 shadow">

            <h3 className="text-2xl font-bold text-green-600">
              ✓ Matched Skills
            </h3>

            <div className="mt-5 flex flex-wrap gap-3">

              {matchResult.matchedSkills.length >
              0 ? (
                matchResult.matchedSkills.map(
                  (skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
                    >
                      {skill}
                    </span>
                  )
                )
              ) : (
                <p className="text-slate-500">
                  No matching skills found.
                </p>
              )}

            </div>

          </div>

          {/* Missing Skills */}

          <div className="rounded-2xl bg-white p-8 shadow">

            <h3 className="text-2xl font-bold text-red-600">
              ✕ Missing Skills
            </h3>

            <div className="mt-5 flex flex-wrap gap-3">

              {matchResult.missingSkills.length >
              0 ? (
                matchResult.missingSkills.map(
                  (skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700"
                    >
                      {skill}
                    </span>
                  )
                )
              ) : (
                <p className="text-green-600">
                  Great! No major missing skills
                  were identified.
                </p>
              )}

            </div>

          </div>

          {/* Strengths */}

          <div className="rounded-2xl bg-white p-8 shadow">

            <h3 className="text-2xl font-bold text-purple-600">
              💪 Resume Strengths
            </h3>

            <div className="mt-5 space-y-3">

              {matchResult.strengths.length >
              0 ? (
                matchResult.strengths.map(
                  (strength, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-purple-50 p-4 text-slate-700"
                    >
                      {strength}
                    </div>
                  )
                )
              ) : (
                <p className="text-slate-500">
                  No specific strengths identified.
                </p>
              )}

            </div>

          </div>

          {/* Suggestions */}

          <div className="rounded-2xl bg-white p-8 shadow">

            <h3 className="text-2xl font-bold text-blue-600">
              💡 Improvement Suggestions
            </h3>

            <div className="mt-5 space-y-3">

              {matchResult.suggestions.length >
              0 ? (
                matchResult.suggestions.map(
                  (suggestion, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-blue-50 p-4 text-slate-700"
                    >
                      {suggestion}
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

        </div>
      )}

    </div>
  );
};

export default ResumeUpload;