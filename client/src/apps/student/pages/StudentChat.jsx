import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5006");

export default function StudentChat() {
  const [sender, setSender] = useState("");
  const [batchInfo, setBatchInfo] = useState(null);
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [activeChat, setActiveChat] = useState(null); // { type: "forum" | "admin", adminName: "..." }
  const chatRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
  try {
    const token = localStorage.getItem("token");
    const studentRes = await axios.get("http://localhost:5004/auth/student/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSender(studentRes.data.user.name);

    const batchId = new URLSearchParams(window.location.search).get("batch");
    const batchRes = await axios.get(`http://localhost:5003/student/batch/by-id/${batchId}`);
    setBatchInfo(batchRes.data);
    setActiveChat({ type: "forum" }); // ✅ default to forum chat
  } catch (err) {
    console.error("Failed to fetch data", err);
  }
};


    fetchData();
  }, []);

  useEffect(() => {
    if (!activeChat || !batchInfo || !sender) return;

    const course = batchInfo.courseName;
    const batch = batchInfo.batchName;
    const encodedStudent = encodeURIComponent(sender.trim());

    let newRoom = "";

    if (activeChat.type === "forum") {
      newRoom = `${course}/${batch}/forum/general`;
    } else if (activeChat.type === "admin") {
      const adminName = encodeURIComponent(activeChat.adminName.trim());
      newRoom = `${course}/${batch}/admins/${adminName}/students/${encodedStudent}`;
    }

    setRoom(newRoom);
  }, [activeChat, batchInfo, sender]);

  useEffect(() => {
    if (!room || !sender) return;

    socket.emit("joinRoom", { name: sender, room });

    socket.on("chatHistory", history => setMessages(history));
    socket.on("message", msg => setMessages(prev => [...prev, msg]));

    return () => {
      socket.emit("leaveRoom", { room });
      socket.off("chatHistory");
      socket.off("message");
    };
  }, [room, sender]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = () => {
    if (!msg.trim()) return;
    socket.emit("message", { name: sender, room, message: msg });
    setMsg("");
  };

  const getHeaderTitle = () => {
    if (!activeChat) return "Select a chat to begin";
    if (activeChat.type === "forum") return `${batchInfo?.courseName || 'Course'} - Course Chat`;
    if (activeChat.type === "admin") return `Chat with ${activeChat.adminName}`;
    return "Chat";
  };

  if (!batchInfo) return <p className="text-center mt-6 text-gray-500 dark:text-gray-400">Loading chat...</p>;

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Chat Window */}
      <div className="flex-1 flex flex-col h-[calc(100vh-6rem)] bg-white dark:bg-gray-800">
        {/* Enhanced Header - Fixed */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 px-6 py-4 border-b border-blue-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                {activeChat?.type === "forum" ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">{getHeaderTitle()}</h1>
                {activeChat?.type === "forum" && (
                  <p className="text-sm text-blue-100 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    {batchInfo.students?.length || 6} participants online
                  </p>
                )}
                {activeChat?.type === "admin" && (
                  <p className="text-sm text-blue-100 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Active now
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </button>
              <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900 min-h-0" ref={chatRef}>
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Start the conversation</h3>
                <p className="text-gray-500 dark:text-gray-400">Send a message to begin chatting</p>
              </div>
            ) : (
              messages.map((m, i) => {
                const [name, ...text] = m.split(": ");
                const isSender = name === sender;
                return (
                  <div
                    key={i}
                    className={`flex ${isSender ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                  >
                    {!isSender && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-xs font-bold text-white">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className={`flex flex-col max-w-xs lg:max-w-md ${isSender ? 'items-end' : 'items-start'}`}>
                      {!isSender && (
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 px-1">{name}</span>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          isSender
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                            : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{text.join(": ")}</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {isSender && (
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-xs font-bold text-white">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Enhanced Input Area - Fixed */}
        {activeChat && (
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 p-4 flex-shrink-0">
            <div className="flex items-end space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
              </button>
              <div className="flex-1 relative">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  placeholder="Type your message..."
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </button>
              </div>
              <button
                onClick={sendMessage}
                disabled={!msg.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Right Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-600 flex flex-col h-[calc(100vh-6rem)]">
        {/* Sidebar Header - Fixed */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
            Chat Rooms
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Select a conversation</p>
        </div>
        
        {/* Sidebar Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {/* Forum Chat Option */}
          <div className="mb-6">
            <button
              onClick={() => {
                setMessages([]);
                setActiveChat({ type: "forum" });
              }}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                activeChat?.type === "forum"
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-700 shadow-md"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-base">Forum Chat</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    {batchInfo.students?.length || 6} members online
                  </div>
                </div>
                {activeChat?.type === "forum" && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </button>
          </div>

          {/* Admin Chats */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-2">Teachers</h3>
            <div className="space-y-3">
              {Object.entries(
                batchInfo.admins.reduce((acc, admin) => {
                  const name = admin.name;
                  if (!acc[name]) acc[name] = [];
                  acc[name].push(admin.module);
                  return acc;
                }, {})
              ).map(([adminName, modules], i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMessages([]);
                    setActiveChat({ type: "admin", adminName });
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                    activeChat?.type === "admin" && activeChat?.adminName === adminName
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50 text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-700 shadow-md"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white font-bold text-sm">
                          {adminName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-base">{adminName}</div>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full mr-2">Teacher</span>
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                          Online
                        </span>
                      </div>
                    </div>
                    {activeChat?.type === "admin" && activeChat?.adminName === adminName && (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Students List */}
          {batchInfo.students && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-2">Classmates</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {batchInfo.students.map((student, i) => (
                  <div key={i} className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
                        <span className="text-white font-medium text-sm">
                          {student.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
                        </span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        student.name === sender ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {student.name || 'Student'}
                        {student.name === sender && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">(You)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-1 ${
                          student.name === sender ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'
                        }`}></span>
                        {student.name === sender ? 'Online' : 'Student'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}