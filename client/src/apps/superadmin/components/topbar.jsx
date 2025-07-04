import React, { useState } from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import cybernaut_logo from '../assets/cybernaut_logo.jpg';

export default function Topbar({ pageTitle = "Dashboard" }) {
  

  return (
    <div className="sticky top-0 z-30 w-full bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
      {/* Left: LMS Brand and Page Title */}
      <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">{pageTitle}</h1>
      </div>

      {/* Right: User Info */}
      <div className="flex items-center gap-4">
        <FaBell className="text-xl text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" />
        <span className="text-sm hidden sm:inline text-gray-700 dark:text-gray-300">Welcome, Super Admin</span>
      </div>
    </div>
  );
}
