import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function CertificatePage() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEligibleStudents = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/certificates/eligible");
        setStudents(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch eligible students");
      }
    };

    fetchEligibleStudents();
  }, []);

  const toggleStudent = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selected.length === 0) {
      toast.warn("No students selected");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5001/api/certificates/generate", {
        students: selected
      });
      toast.success("Certificates generated and mailed!");
      setStudents(prev => prev.filter(s => !selected.includes(s._id)));
      setSelected([]);
    } catch (err) {
      console.error(err);
      toast.error("Error generating certificates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        Eligible Students for Certificate Generation
      </h2>

      {students.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">No eligible students found. Ensure all admins have completed evaluations.</p>
      ) : (
        <>
          <div className="space-y-2">
            {students.map(student => (
              <div
                key={student._id}
                className="flex items-center gap-4 p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(student._id)}
                  onChange={() => toggleStudent(student._id)}
                  className="accent-blue-600 dark:accent-blue-400"
                  disabled={loading}
                />
                <div className="text-gray-900 dark:text-white">
                  <div className="font-medium">{student.user.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{student.user.email}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            className={`mt-6 px-6 py-2 rounded text-white font-medium transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800'
            }`}
            onClick={handleGenerate}
            disabled={loading || selected.length === 0}
          >
            {loading ? 'Generating...' : `Generate ${selected.length} Certificate${selected.length > 1 ? 's' : ''}`}
          </button>
        </>
      )}
    </div>
  );
}
