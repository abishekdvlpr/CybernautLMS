import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from "../api";
import { FaVideo, FaQuestionCircle, FaFileAlt, FaUpload, FaCheckCircle, FaCode, FaClock, FaMoon, FaSun } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════
   SKELETON LOADER
   ═══════════════════════════════════════════ */
const SkeletonLoader = () => (
  <div style={{ fontFamily: "'Poppins', sans-serif" }} className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-[#e8f0fe] to-[#f0f7ff] dark:from-[#0B1120] dark:via-[#0d1629] dark:to-[#0B1120] p-8">
    <div className="max-w-6xl mx-auto space-y-8">
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,102,255,0.08)' }} className="rounded-2xl p-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-[#0066FF]/10 to-[#00D4FF]/10 animate-pulse" />
          <div className="space-y-3 flex-1">
            <div className="h-4 w-32 rounded-lg bg-gradient-to-r from-[#0066FF]/10 to-[#00D4FF]/10 animate-pulse" />
            <div className="h-8 w-72 rounded-lg bg-gradient-to-r from-[#0066FF]/10 to-[#00D4FF]/10 animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-11 w-44 rounded-full bg-gradient-to-r from-[#0066FF]/10 to-[#00D4FF]/10 animate-pulse" />
          ))}
        </div>
      </div>
      {[1, 2].map(i => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,102,255,0.08)' }} className="rounded-2xl overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-[#0066FF]/10 to-[#00D4FF]/10 animate-pulse" />
          <div className="p-8 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="h-12 rounded-xl bg-gradient-to-r from-[#0066FF]/10 to-[#00D4FF]/10 animate-pulse" />
              ))}
            </div>
            <div className="h-24 rounded-xl bg-[#0066FF]/5 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24 }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function StudentBatch() {
  const { batchId } = useParams();
  const [student, setStudent] = useState(null);
  const [batch, setBatch] = useState(null);
  const [notesMap, setNotesMap] = useState({});
  const [activeModule, setActiveModule] = useState(null);
  const [reports, setReports] = useState([]);
  const [quizzesMap, setQuizzesMap] = useState({});
  const [codingQuestionsMap, setCodingQuestionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_LOGIN_API}/auth/student/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(res.data);
      } catch (err) {
        console.error(err);
        navigate('/');
      }
    };
    fetchStudent();
  }, [navigate]);

  useEffect(() => {
    const fetchBatchOverview = async () => {
      try {
        if (!student) return;
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await api.get(
          `/student/batch/overview/${batchId}/${student._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBatch(res.data.batch);
        setNotesMap(res.data.notesMap);
        setQuizzesMap(res.data.quizzesMap);
        setCodingQuestionsMap(res.data.codingQuestionsMap);
        console.log("Batch overview data:", res.data.batch);
        console.log("Notes map:", res.data.notesMap);
        console.log("Quizzes map:", res.data.quizzesMap);
        console.log("Coding questions map:", res.data.codingQuestionsMap);
        if (res.data.latestModule) setActiveModule(res.data.latestModule);
      } catch (err) {
        console.error('Error loading batch overview:', err);
      } finally {
        setLoading(false);
      }
    };
    if (batchId && student) fetchBatchOverview();
  }, [batchId, student]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (!student?._id) return;
        const token = localStorage.getItem('token');
        const res = await api.get(`/api/reports/${student._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    if (student) fetchReports();
  }, [student]);

  const getAssignmentMark = useCallback((module, day) => {
    const match = reports.find(r => r.module === module && r.day === day);
    return match ? match.marksObtained?.[2] ?? -2 : -2;
  }, [reports]);

  const getQuizMark = useCallback((module, day) => {
    const match = reports.find(r => r.module === module && r.day === day);
    console.log("Quiz mark match:", match);
    console.log("Quiz mark:", match?.marksObtained?.[1]);
    return match ? match.marksObtained?.[1] ?? -2 : -2;
  }, [reports]);

  /* ═══════════════════════════════════════════
     NOTE CARD RENDERER
     ═══════════════════════════════════════════ */
  const renderNoteCard = (note, student, batchId, module, large = false, index = 0) => {
    const assignmentMark = getAssignmentMark(module, note.day);
    const quizMark = getQuizMark(module, note.day);

    const viewAssignment = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_ADMIN_API}/assignment-question/${encodeURIComponent(batch.batchName)}/${encodeURIComponent(module)}/${encodeURIComponent(note.title)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Assignment link response:", res);
        if (res.data?.url) {
          window.open(res.data.url, '_blank');
        } else {
          toast.info("Assignment link not found");
        }
      } catch (err) {
        console.error("Error fetching assignment link:", err);
        toast.error("Failed to fetch assignment link");
      }
    };

    // Card glass style
    const cardGlass = darkMode
      ? { background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 212, 255, 0.1)' }
      : { background: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 102, 255, 0.1)' };

    return (
      <motion.div
        key={note._id || index}
        variants={cardVariants}
        style={{ ...cardGlass, fontFamily: "'Poppins', sans-serif" }}
        className="group rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-[#0066FF]/8 dark:hover:shadow-[#00D4FF]/8"
      >
        {/* Card Header */}
        <div className={`relative px-7 py-5 overflow-hidden ${
          large
            ? 'bg-gradient-to-r from-[#0050CC] via-[#0066FF] to-[#00C8F0]'
            : 'bg-gradient-to-r from-[#0B1426] via-[#0F1D3A] to-[#0B1426]'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base ${
                large ? 'bg-white/20 backdrop-blur-sm text-white' : 'bg-[#0066FF]/20 text-[#00D4FF]'
              }`} style={{ fontFamily: "'Poppins', sans-serif" }}>
                {note.day}
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-semibold tracking-[0.2em] uppercase mb-1 ${
                  large ? 'text-blue-100/80' : 'text-slate-400'
                }`}>
                  DAY &nbsp; {note.day}
                </p>
                <h3 className={`text-lg font-bold truncate ${
                  large ? 'text-white' : 'text-white'
                }`} style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.01em' }}>
                  {note.title}
                </h3>
              </div>
            </div>

            {large && (
              <div className="hidden sm:flex items-center gap-2.5 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/25 flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse shadow-sm shadow-[#00D4FF]" />
                <span className="text-white font-bold text-[11px] tracking-[0.15em] uppercase">Live</span>
              </div>
            )}
          </div>

          {large && (
            <img
              src="/cybernaut-icon.png"
              alt=""
              className="absolute right-5 bottom-2 w-20 h-20 opacity-[0.08] pointer-events-none select-none"
              draggable="false"
            />
          )}
        </div>

        {/* Card Body */}
        <div className="p-7 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Join Meet */}
            <button
              onClick={() => window.open(note.meetlink, '_blank')}
              style={{ fontFamily: "'Poppins', sans-serif" }}
              className="relative overflow-hidden flex items-center justify-center gap-2.5 bg-[#0B1426] dark:bg-[#1a2744] text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-sm hover:shadow-lg hover:shadow-[#0066FF]/15 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <FaVideo className="text-[#00D4FF] text-sm" />
              <span>Join Meet</span>
            </button>

            {/* Quiz */}
            {!quizzesMap[note._id] ? (
              <div style={{ fontFamily: "'Poppins', sans-serif" }} className="flex items-center justify-center gap-2.5 bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-semibold py-3 px-4 rounded-xl text-sm cursor-not-allowed border border-slate-200 dark:border-slate-700">
                <FaQuestionCircle className="text-sm" />
                <span>No Quiz</span>
              </div>
            ) : quizMark >= 0 ? (
              <div style={{ fontFamily: "'Poppins', sans-serif" }} className="flex items-center justify-center gap-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-semibold py-3 px-4 rounded-xl text-sm border border-emerald-200 dark:border-emerald-700/50">
                <FaCheckCircle className="text-sm" />
                <span>Submitted</span>
              </div>
            ) : (
              <button
                onClick={() => navigate(`/student/quiz/attempt/${note._id}`)}
                style={{ fontFamily: "'Poppins', sans-serif" }}
                className="relative overflow-hidden flex items-center justify-center gap-2.5 bg-[#0B1426] dark:bg-[#1a2744] text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-sm hover:shadow-lg hover:shadow-[#0066FF]/15 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                <FaQuestionCircle className="text-[#00D4FF] text-sm" />
                <span>Attempt Quiz</span>
              </button>
            )}

            {/* Coding */}
            {codingQuestionsMap[note._id] ? (
              codingQuestionsMap[note._id].submitted ? (
                <div style={{ fontFamily: "'Poppins', sans-serif" }} className="flex items-center justify-center gap-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-semibold py-3 px-4 rounded-xl text-sm border border-emerald-200 dark:border-emerald-700/50">
                  <FaCheckCircle className="text-sm" />
                  <span>Submitted</span>
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/student/code/attempt/${note._id}/${student._id}`)}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                  className="relative overflow-hidden flex items-center justify-center gap-2.5 bg-[#0B1426] dark:bg-[#1a2744] text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-sm hover:shadow-lg hover:shadow-[#0066FF]/15 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <FaCode className="text-[#00D4FF] text-sm" />
                  <span>Attempt Coding</span>
                </button>
              )
            ) : (
              <div style={{ fontFamily: "'Poppins', sans-serif" }} className="flex items-center justify-center gap-2.5 bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-semibold py-3 px-4 rounded-xl text-sm cursor-not-allowed border border-slate-200 dark:border-slate-700">
                <FaCode className="text-sm" />
                <span>No Coding</span>
              </div>
            )}

            {/* View Assignment */}
            <button
              onClick={viewAssignment}
              style={{ fontFamily: "'Poppins', sans-serif" }}
              className="relative overflow-hidden flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#0066FF] to-[#00C8F0] text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-sm hover:shadow-lg hover:shadow-[#00D4FF]/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <FaFileAlt className="text-sm" />
              <span>View Assignment</span>
            </button>
          </div>

          {/* Assignment Submission */}
          <div style={darkMode ? { background: 'rgba(13, 22, 41, 0.6)', border: '1px solid rgba(0,212,255,0.08)' } : { background: 'rgba(240, 247, 255, 0.8)', border: '1px solid rgba(0,102,255,0.08)' }} className="p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div style={{ background: 'linear-gradient(180deg, #0066FF, #00D4FF)' }} className="w-1 h-5 rounded-full" />
              <h4 style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.1em' }} className="text-[13px] font-bold text-slate-700 dark:text-slate-200 uppercase">
                Assignment Submission
              </h4>
            </div>

            {assignmentMark === -2 ? (
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex-1 w-full">
                  <label style={{ fontFamily: "'Poppins', sans-serif" }} className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Upload PDF Document
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => { note.file = e.target.files[0]; }}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                    className="w-full px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-[#0B1120] hover:border-[#0066FF] dark:hover:border-[#00D4FF] transition-colors duration-300 cursor-pointer text-sm text-slate-600 dark:text-slate-300"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!note.file) { toast.warn('Please choose a PDF'); return; }
                    const fd = new FormData();
                    fd.append('file', note.file);
                    try {
                      const token = localStorage.getItem('token');
                      await axios.post(
                        `${import.meta.env.VITE_ADMIN_API}/notes/upload/${encodeURIComponent(batch.batchName)}/${module}/${encodeURIComponent(note.title)}/${encodeURIComponent(student.user.name)}/${student._id}/${student.rollNo}/${note.day}`,
                        fd,
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      toast.success('Answer uploaded successfully');
                    } catch (err) {
                      console.error(err);
                      toast.error('Upload failed');
                    }
                  }}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                  className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-sm hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 flex-shrink-0"
                >
                  <FaUpload />
                  <span>Upload</span>
                </button>
              </div>
            ) : assignmentMark === -1 ? (
              <div className="flex items-center gap-4 p-4 bg-amber-50/80 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/30 rounded-xl">
                <div className="relative flex-shrink-0">
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-40" />
                </div>
                <div>
                  <p style={{ fontFamily: "'Poppins', sans-serif" }} className="text-amber-700 dark:text-amber-300 font-bold text-sm">Submitted Successfully</p>
                  <p style={{ fontFamily: "'Poppins', sans-serif" }} className="text-amber-600/70 dark:text-amber-400/70 text-xs mt-0.5">Evaluation in progress...</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-emerald-50/80 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-700/30 rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 dark:bg-emerald-800/40 rounded-xl flex-shrink-0">
                  <FaCheckCircle className="text-emerald-500 dark:text-emerald-400 text-xl" />
                </div>
                <div>
                  <p style={{ fontFamily: "'Poppins', sans-serif" }} className="text-emerald-600/80 dark:text-emerald-400/80 text-xs font-semibold mb-0.5">Score Achieved</p>
                  <p style={{ fontFamily: "'Poppins', sans-serif" }} className="text-emerald-700 dark:text-emerald-300 font-black text-2xl">{assignmentMark}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  if (loading) return <SkeletonLoader />;

  if (!student || !batch) {
    return (
      <div style={{ fontFamily: "'Poppins', sans-serif" }} className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f0f7ff] to-[#e8f0fe] dark:from-[#0B1120] dark:to-[#0d1629]">
        <img src="/cybernaut-icon.png" alt="Cybernaut" className="w-16 h-16 mb-6" style={{ animation: 'float 3s ease-in-out infinite' }} />
        <p className="text-xl font-semibold text-slate-600 dark:text-slate-300">Loading your dashboard...</p>
      </div>
    );
  }

  const currentModuleNotes = notesMap[activeModule] || { today: [], others: [] };
  const moduleKeys = Object.keys(notesMap);

  // Header glass style
  const headerGlass = darkMode
    ? { background: 'rgba(11, 17, 32, 0.92)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0, 212, 255, 0.1)' }
    : { background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0, 102, 255, 0.1)' };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-[#e8f4ff] to-[#f5f0ff] dark:from-[#0B1120] dark:via-[#0d1629] dark:to-[#0B1120] transition-colors duration-500">

      {/* ═══════ STICKY HEADER ═══════ */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        style={headerGlass}
        className="sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              {/* Logo */}
              <img
                src="/cybernaut-icon.png"
                alt="Cybernaut"
                className="w-12 h-12 object-contain"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 102, 255, 0.2))' }}
              />
              {/* Divider */}
              <div style={{ background: 'linear-gradient(180deg, transparent, #0066FF, #00D4FF, transparent)' }} className="w-[2px] h-12 rounded-full" />
              {/* Text */}
              <div>
                <p style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.25em', fontSize: '10px' }} className="font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                  Your Batch
                </p>
                <h1 style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.04em' }} className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#0050CC] via-[#0066FF] to-[#00D4FF] bg-clip-text text-transparent">
                  {batch.batchName}
                </h1>
              </div>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{ fontFamily: "'Poppins', sans-serif" }}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center text-lg"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FaSun className="text-amber-400" /> : <FaMoon className="text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Module Tabs */}
        <div className="max-w-6xl mx-auto px-6 pb-3">
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {moduleKeys.map((module) => {
              const isActive = activeModule === module;
              return (
                <button
                  key={module}
                  onClick={() => setActiveModule(module)}
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    letterSpacing: '0.03em',
                    ...(isActive
                      ? { background: 'linear-gradient(135deg, #0066FF, #00C8F0)', color: '#fff', boxShadow: '0 4px 15px rgba(0, 102, 255, 0.3)' }
                      : {})
                  }}
                  className={`px-5 py-2.5 font-bold text-[13px] whitespace-nowrap transition-all duration-300 rounded-full ${
                    isActive
                      ? ''
                      : 'text-slate-500 dark:text-slate-400 hover:text-[#0066FF] dark:hover:text-[#00D4FF] bg-slate-100/80 dark:bg-slate-800/50 hover:bg-[#0066FF]/10 dark:hover:bg-[#00D4FF]/10'
                  }`}
                >
                  {module}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10"
          >
            {/* Latest Session */}
            {currentModuleNotes.today.length > 0 && (
              <motion.section variants={cardVariants} className="space-y-5">
                <div className="flex items-center gap-4">
                  {/* LOGO instead of star */}
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D4FF] shadow-lg shadow-[#0066FF]/25 p-2">
                    <img src="/cybernaut-icon.png" alt="" className="w-full h-full object-contain brightness-0 invert" />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.02em' }} className="text-2xl font-extrabold text-slate-800 dark:text-white">
                      Latest Session
                    </h2>
                    <p style={{ fontFamily: "'Poppins', sans-serif" }} className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-0.5">
                      Your most recent class material
                    </p>
                  </div>
                  <span style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.15em' }} className="ml-auto px-5 py-2 bg-gradient-to-r from-[#0066FF] to-[#00C8F0] text-white text-[10px] font-black rounded-full shadow-md shadow-[#0066FF]/20 uppercase">
                    New
                  </span>
                </div>

                {currentModuleNotes.today.map((note, index) =>
                  renderNoteCard(note, student, batchId, activeModule, true, index)
                )}
              </motion.section>
            )}

            {/* Previous Sessions */}
            {currentModuleNotes.others.length > 0 && (
              <motion.section variants={cardVariants} className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 shadow-sm">
                    <FaClock className="text-slate-500 dark:text-slate-400 text-base" />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.02em' }} className="text-2xl font-extrabold text-slate-800 dark:text-white">
                      Previous Sessions
                    </h2>
                    <p style={{ fontFamily: "'Poppins', sans-serif" }} className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-0.5">
                      Review past class materials
                    </p>
                  </div>
                </div>

                <motion.div variants={containerVariants} className="grid gap-5">
                  {currentModuleNotes.others.map((note, index) =>
                    renderNoteCard(note, student, batchId, activeModule, false, index)
                  )}
                </motion.div>
              </motion.section>
            )}

            {/* Empty State */}
            {currentModuleNotes.today.length === 0 && currentModuleNotes.others.length === 0 && (
              <motion.div variants={cardVariants} className="flex flex-col items-center justify-center py-28">
                <div className="relative mb-8">
                  <div style={darkMode ? { background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(0,212,255,0.1)' } : { background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,102,255,0.1)' }} className="w-28 h-28 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <img src="/cybernaut-icon.png" alt="" className="w-14 h-14 opacity-30" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-[#0066FF] to-[#00D4FF] rounded-full flex items-center justify-center shadow-md">
                    <FaFileAlt className="text-white text-[10px]" />
                  </div>
                </div>
                <h3 style={{ fontFamily: "'Poppins', sans-serif" }} className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
                  No Content Available Yet
                </h3>
                <p style={{ fontFamily: "'Poppins', sans-serif" }} className="text-slate-400 dark:text-slate-500 text-sm text-center max-w-sm leading-relaxed">
                  Your learning materials will appear here once your instructor uploads them. Check back soon!
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-4 right-6 z-40">
        <div style={darkMode ? { background: 'rgba(11,17,32,0.8)', border: '1px solid rgba(0,212,255,0.1)' } : { background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,102,255,0.1)' }} className="rounded-full px-4 py-2 flex items-center gap-2 shadow-sm backdrop-blur-md opacity-70 hover:opacity-100 transition-opacity duration-300">
          <img src="/cybernaut-icon.png" alt="" className="w-5 h-5" />
          <span style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '0.15em', fontSize: '9px' }} className="font-bold text-slate-500 dark:text-slate-400 uppercase">
            Cybernaut
          </span>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover
        theme={darkMode ? 'dark' : 'light'}
      />
    </div>
  );
}