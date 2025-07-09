import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function CertificatePage() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchEligibleStudents = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/certificates/eligible");
        setStudents(res.data);
        console.log(res.data,"check");
      } catch (err) {
        console.error(err);
      }
    };

    fetchEligibleStudents();
  }, []);

  const toggleStudent = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    try {
      await axios.post("http://localhost:5001/api/certificates/generate", {
        students: selected
      });
      toast.success("Certificates generated and mailed!");
      setStudents((prev) => prev.filter(s => !selected.includes(s._id)));
      setSelected([]);
    } catch (err) {
      toast.error("Error generating certificates");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Eligible Students for Certificates</h2>
      <div className="space-y-2">
        {students.map(student => (
          <div key={student._id} className="flex items-center gap-4 p-2 border rounded">
            <input
              type="checkbox"
              checked={selected.includes(student._id)}
              onChange={() => toggleStudent(student._id)}
            />
            <span>{student.user.name} - {student.user.email}</span>
          </div>
        ))}
      </div>
      {selected.length > 0 && (
        <button
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          onClick={handleGenerate}
        >
          Generate Certificates
        </button>
      )}
    </div>
  );
}
