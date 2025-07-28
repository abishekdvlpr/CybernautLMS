import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const FinalQuiz = () => {
  const { module } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timer, setTimer] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`http://localhost:5003/api/final-quiz/${module}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuiz(res.data);
        setAnswers(new Array(res.data.questions.length).fill(null));
        setTimer(res.data.questions.length * 60); // 60s per question
      } catch (err) {
        toast.error("Quiz not available.");
        navigate("/final-assignment");
      }
    };
    fetchQuiz();
  }, [module, navigate, token]);

  // Enter fullscreen on load
  useEffect(() => {
    const enterFullScreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error("Fullscreen request failed:", err);
      }
    };
    enterFullScreen();
  }, []);

  // Auto-submit on fullscreen exit, tab switch, or unload
  useEffect(() => {
    const handleAutoSubmit = () => {
      if (!submitting) handleSubmit();
    };

    const handleFullScreenExit = () => {
      if (!document.fullscreenElement) handleAutoSubmit();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") handleAutoSubmit();
    };

    const handleBlur = () => {
      handleAutoSubmit();
    };

    const handleUnload = (e) => {
      e.preventDefault();
      handleAutoSubmit();
    };

    document.addEventListener("fullscreenchange", handleFullScreenExit);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenExit);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [answers, quiz, submitting]);

  // Timer logic
  useEffect(() => {
    if (timer <= 0) {
      handleSubmit();
      return;
    }

    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const formatTime = () => {
    const mins = String(Math.floor(timer / 60)).padStart(2, "0");
    const secs = String(timer % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleSelect = (index, option) => {
    const updated = [...answers];
    updated[index] = option;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    if (submitting || !quiz) return;
    setSubmitting(true);

    try {
      await axios.post(
        `http://localhost:5003/api/final-quiz/submit/${module}`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Quiz submitted successfully!");

      // Exit fullscreen after submission
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      navigate("/student/theory");
    } catch (err) {
      toast.error("Failed to submit quiz.");
      setSubmitting(false);
    }
  };

  if (!quiz) return <div className="text-white text-center mt-10">Loading Quiz...</div>;

  const q = quiz.questions[currentQ];

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white text-black rounded-lg shadow-lg p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold text-gray-900">
            {module} — Question {currentQ + 1} of {quiz.questions.length}
          </h2>
          <div className="text-sm font-semibold text-red-600">
            Time Left: {formatTime()}
          </div>
        </div>

        {/* Question */}
        <div className="space-y-4">
          <p className="text-lg font-medium">{q.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["A", "B", "C", "D"].map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(currentQ, opt)}
                className={`px-4 py-3 text-left rounded border text-sm font-medium transition-all
                  ${answers[currentQ] === opt
                    ? "bg-black text-white border-black"
                    : "bg-gray-100 hover:bg-gray-200 border-gray-300"}`}
              >
                {opt}. {q.options?.[opt] || ""}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <button
              disabled={currentQ === 0}
              onClick={() => setCurrentQ(currentQ - 1)}
              className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-30"
            >
              Previous
            </button>
            <button
              disabled={currentQ === quiz.questions.length - 1}
              onClick={() => setCurrentQ(currentQ + 1)}
              className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-30"
            >
              Next
            </button>
          </div>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
          >
            Submit Quiz
          </button>
        </div>

        {/* Jump to question */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Jump to:</h4>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQ(idx)}
                className={`w-8 h-8 rounded-full border text-sm font-semibold
                  ${idx === currentQ
                    ? "bg-black text-white border-black"
                    : answers[idx]
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-black border-gray-300 hover:bg-gray-100"}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalQuiz;
