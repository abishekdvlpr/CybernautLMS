import React from 'react';
import { FaBell } from 'react-icons/fa';

export default function Topbar({ pageTitle = "Dashboard", userName = "Student" }) {
  return (
      <div className="sticky top-0 z-30 w-full bg-white dark:bg-black shadow-sm px-6 py-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        <FaBell className="text-xl text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white cursor-pointer" />
        <span className="text-sm hidden sm:inline text-gray-700 dark:text-gray-300">Welcome, {userName}</span>
      </div>
    </div>
  );
}
