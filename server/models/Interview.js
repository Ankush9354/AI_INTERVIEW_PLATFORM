
const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    score: { type: Number, min: 0, max: 10, default: 0 },
    technicalAccuracy: { type: Number, min: 0, max: 10, default: 0 },
    communication: { type: Number, min: 0, max: 10, default: 0 },
    relevance: { type: Number, min: 0, max: 10, default: 0 },
    completeness: { type: Number, min: 0, max: 10, default: 0 },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    jobRole: {
      type: String,
      default: "",
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    technicalAccuracy: { type: Number, min: 0, max: 10, default: 0 },
    communication: { type: Number, min: 0, max: 10, default: 0 },
    relevance: { type: Number, min: 0, max: 10, default: 0 },
    completeness: { type: Number, min: 0, max: 10, default: 0 },
    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
    },
    evaluations: {
      type: [evaluationSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
