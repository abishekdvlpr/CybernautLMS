const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Report = require('../models/Report');
const { generatePDF } = require('../utils/generatePDF');
const { sendMail } = require('../utils/sendMail');

router.get('/eligible', async (req, res) => {
  try {
    const students = await Student.find({ certificate: false }).populate('user');
    console.log(students);
    console.log("check");
    let eligible = [];

    for (let student of students) {
      const reports = await Report.find({ student: student._id });
    console.log(reports,"charan baadu");
      const moduleMap = {};

      reports.forEach(r => {
        if (!moduleMap[r.module]) moduleMap[r.module] = { quizzes: [], assignments: [], count: 0 };
        moduleMap[r.module].quizzes.push(r.marksObtained[0]);      // Quiz marks
        moduleMap[r.module].assignments.push(r.marksObtained[2]);  // Assignment marks
        moduleMap[r.module].count += 1;
      });

      let pass = true;

      for (let module in moduleMap) {
        const data = moduleMap[module];

        if (data.count < 1) {  // Minimum 4 reports required
          pass = false;
          break;
        }

        const quizAvg = data.quizzes.reduce((a, b) => a + b, 0) / data.quizzes.length;
        const assignAvg = data.assignments.reduce((a, b) => a + b, 0) / data.assignments.length;

        if (quizAvg < -2 || assignAvg < -2) {
          pass = false;
          break;
        }
      }

      if (pass) eligible.push(student);
      console.log(student,"charan baadu 2");
    }

    res.json(eligible);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


router.post('/generate', async (req, res) => {
  try {
    const { students } = req.body; // array of student ids

    for (let id of students) {
      const student = await Student.findById(id).populate('user');

      const name = student.user.name;
      const email = student.user.email;

      const filePath = await generatePDF(name);
      await sendMail(name, email, filePath);

      // Update certificate status
      student.certificate = true;
      await student.save();
    }

    res.status(200).json({ message: "Certificates generated and sent." });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating certificates');
  }
});

module.exports = router;
