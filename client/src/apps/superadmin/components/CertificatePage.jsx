import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function CertificatePage() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("all");

  useEffect(() => {
    const fetchEligibleStudents = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/certificates/eligible");
        setStudents(res.data);
        setFiltered(res.data);

        const uniqueBatches = [
          ...new Map(
            res.data.map((s) => [s.batch._id, { _id: s.batch._id, name: s.batch.name }])
          ).values()
        ];
        setBatches(uniqueBatches);
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
      const remaining = students.filter(s => !selected.includes(s._id));
      setStudents(remaining);
      filterByBatch(selectedBatch, remaining);
      setSelected([]);
    } catch (err) {
      console.error(err);
      toast.error("Error generating certificates");
    } finally {
      setLoading(false);
    }
  };

  const filterByBatch = (batchId, list = students) => {
    setSelectedBatch(batchId);
    if (batchId === "all") {
      setFiltered(list);
    } else {
      setFiltered(list.filter(s => s.batch._id === batchId));
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Eligible Students for Certificate Generation
        </h2>

        <select
          className="border p-2 rounded dark:bg-gray-800 dark:text-white"
          value={selectedBatch}
          onChange={(e) => filterByBatch(e.target.value)}
        >
          <option value="all">All Batches</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">No eligible students found for selected batch.</p>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map(student => (
              <div
                key={student._id}
                className="flex items-start gap-4 p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(student._id)}
                  onChange={() => toggleStudent(student._id)}
                  className="mt-2 accent-blue-600 dark:accent-blue-400"
                  disabled={loading}
                />
                <div className="text-gray-900 dark:text-white text-sm leading-relaxed">
                  <div><strong>Name:</strong> {student.user.name}</div>
                  <div><strong>Email:</strong> {student.user.email}</div>
                  <div><strong>Phone:</strong> {student.phone}</div>
                  <div><strong>Roll No:</strong> {student.rollNo}</div>
                  <div><strong>DOB:</strong> {new Date(student.dob).toLocaleDateString()}</div>
                  <div><strong>Batch:</strong> {student.batch.name}</div>
                  <div><strong>Course:</strong> {student.batch.course.name}</div>
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
