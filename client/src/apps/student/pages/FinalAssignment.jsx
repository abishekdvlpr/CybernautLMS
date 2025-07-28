import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlayCircle } from "react-icons/fa";

const FinalAssignment = () => {
  const [modules, setModules] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await axios.get("http://localhost:5003/api/final-quiz/available", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setModules(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load modules");
      }
    };

    fetchModules();
  }, []);

  const handleAttempt = (module) => {
    window.location.href = `/student/final-quiz/${module}`;
  };

  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Final Assignment</h2>
      {modules.length === 0 ? (
        <p className="text-gray-400">No modules found</p>
      ) : (
        modules.map((m) => (
          <div key={m.module} className="mb-4 border-b pb-4">
            <h3 className="text-lg font-semibold dark:text-white">{m.module}</h3>
            {m.hasQuiz ? (
              <button
                onClick={() => handleAttempt(m.module)}
                disabled={m.attempted}
                className={`mt-2 px-4 py-2 rounded flex items-center gap-2 ${
                  m.attempted ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 text-white"
                }`}
              >
                <FaPlayCircle />
                {m.attempted ? "Quiz Attempted" : "Attempt Quiz"}
              </button>
            ) : (
              <p className="text-gray-400 mt-1">No quiz available</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default FinalAssignment;
