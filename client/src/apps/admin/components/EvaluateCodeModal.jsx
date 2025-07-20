import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function EvaluateCodeModal({
  batchId,
  module,
  day,
  title,
  submissions,
  onClose,
  refreshSubmissions
}) {
  const [marks, setMarks] = useState({});
  const [submittingStudentId, setSubmittingStudentId] = useState(null);

  const handleEvaluate = async (studentId) => {
    const codingMark = parseInt(marks[studentId]);
    if (isNaN(codingMark) || codingMark < 0 || codingMark > 10) {
      toast.error("Please enter a valid mark between 0 and 10");
      return;
    }

    setSubmittingStudentId(studentId);
    try {
      await axios.post('http://localhost:5002/api/codeEval/evaluate-code', {
        studentId,
        module,
        day,
        mark: codingMark
      });

      await refreshSubmissions();
      toast.success('Marks saved');
    } catch (err) {
      console.error("Error saving marks", err);
      toast.error('Failed to save marks');
    } finally {
      setSubmittingStudentId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-20 z-50 text-black">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl"
          onClick={onClose}
        >✕</button>
        <h2 className="text-2xl font-bold mb-6 text-blue-800">
          Evaluate Code Submissions – {decodeURIComponent(title)}
        </h2>
        {submissions.length === 0 ? (
          <p className="text-gray-600">No code submissions found yet.</p>
        ) : (
          <table className="w-full table-auto border border-gray-300 shadow text-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Student</th>
                <th className="p-2 border">Language</th>
                <th className="p-2 border">Marks</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, i) => (
                <tr key={i}>
                  <td className="p-2 border text-center">{i + 1}</td>
                  <td className="p-2 border">{sub.studentName}</td>
                  <td className="p-2 border text-center">{sub.language}</td>
                  <td className="p-2 border text-center">
                    <input
                      type="number"
                      className="w-16 p-1 border rounded"
                      min="0"
                      max="10"
                      value={marks[sub.studentId] || ''}
                      onChange={(e) =>
                        setMarks(prev => ({
                          ...prev,
                          [sub.studentId]: e.target.value.replace(/\D/, '') // only digits
                        }))
                      }
                    />
                  </td>
                  <td className="p-2 border text-center space-x-2">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                      disabled={submittingStudentId === sub.studentId}
                      onClick={() => handleEvaluate(sub.studentId)}
                    >
                      {submittingStudentId === sub.studentId ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      onClick={() => {
                        toast.info('Output viewer to be implemented');
                      }}
                    >
                      Check Output
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
