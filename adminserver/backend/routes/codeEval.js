const express = require("express");
const axios = require("axios");
const auth = require("../middleware/auth");
const CodingQuestion = require("../models/Code");
const CodeSubmission = require("../models/CodeSubmission");
const Student = require("../models/Student");
const Report = require("../models/Report"); // your Report model
const router = express.Router();

// Replace with your actual EC2 IP
const JUDGE0_URL = "http://13.50.13.88:2358";

router.post("/run", async (req, res) => {
  const { source_code, language_id } = req.body;

  try {
    const response = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      { source_code, language_id },
      { headers: { "Content-Type": "application/json" } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Execution Failed" });
  }
});

router.get("/:noteId/:batchId", auth, async (req, res) => {
  const { noteId, batchId } = req.params;

  try {
    // Validate question exists
    const question = await CodingQuestion.findOne({ noteId });

    if (!question) {
      return res.status(404).json({ message: "Coding question not found" });
    }

    // Find submissions for the noteId and batch's students
    const submissions = await CodeSubmission.find({ noteId })
      .populate({
        path: "studentId",
        match: { batch: batchId },
        populate: {
          path: "user",
          select: "name email"
        }
      });

    const filtered = submissions.filter(s => s.studentId !== null);

    const response = filtered.map(sub => ({
      studentName: sub.studentId.user.name,
      email: sub.studentId.user.email,
      language: sub.language,
      code: sub.code,
      submittedAt: sub.submittedAt,
    }));

    res.json(response);

  } catch (err) {
    console.error("Error fetching submissions:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/evaluate-code", async (req, res) => {
  const { studentId, module, day, mark } = req.body;

  if (!studentId || !module || day === undefined || mark === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if report already exists
    let report = await Report.findOne({ student: studentId, module, day });

    if (report) {
      // Update coding mark (index 0)
      report.marksObtained[0] = mark;
      await report.save();
      return res.json({ message: "Marks updated in existing report" });
    } else {
      // Create new report with [mark, -1, -1]
      const newReport = new Report({
        student: studentId,
        module,
        day,
        marksObtained: [mark, -1, -1],
      });

      await newReport.save();
      return res.json({ message: "New report created with coding mark" });
    }

  } catch (err) {
    console.error("Error saving marks:", err);
    res.status(500).json({ message: "Server error while saving marks" });
  }
});

module.exports = router;
