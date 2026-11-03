
const express = require("express");
const mongoose = require("mongoose");
const Interview = require("../models/Interview");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");

const router = express.Router();
// Prevent browser caching of interview API responses
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// POST /api/interviews — Save an interview result
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const {
      jobRole,
      overallScore,
      technicalAccuracy,
      communication,
      relevance,
      completeness,
      totalQuestions,
      evaluations,
    } = req.body;

    // Always get UID from the verified Firebase token
    const userId = req.user.uid;

    if (overallScore === undefined || totalQuestions === undefined) {
      return res.status(400).json({
        success: false,
        message: "overallScore and totalQuestions are required.",
      });
    }

    if (
      !Number.isFinite(overallScore) ||
      overallScore < 0 ||
      overallScore > 10 ||
      !Number.isInteger(totalQuestions) ||
      totalQuestions < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid overallScore or totalQuestions.",
      });
    }

    const interview = await Interview.create({
      userId,
      jobRole,
      overallScore,
      technicalAccuracy,
      communication,
      relevance,
      completeness,
      totalQuestions,
      evaluations,
    });

    return res.status(201).json({
      success: true,
      message: "Interview result saved successfully.",
      interview,
    });
  } catch (error) {
    console.error("Save interview error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save interview result.",
    });
  }
});

// GET /api/interviews/:userId — Get interview history
router.get("/:userId", verifyFirebaseToken, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const authenticatedUserId = req.user.uid;

    // Prevent users from accessing another user's history
    if (requestedUserId !== authenticatedUserId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot access another user's history.",
      });
    }

    const interviews = await Interview.find({
      userId: authenticatedUserId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Fetch interviews error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch interview history.",
    });
  }
});

// GET /api/interviews/detail/:id — Get one interview result
router.get("/detail/:id", verifyFirebaseToken, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID.",
      });
    }

    // Find the interview only if it belongs to the authenticated user
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user.uid,
    }).lean();

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    return res.json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Fetch interview error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch interview result.",
    });
  }
});

module.exports = router;
