import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate

const Dashboard = ({ username }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any authentication tokens or session data
    localStorage.removeItem("authToken"); // Example: Clear token from localStorage
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4">
      {/* Header */}
      <header className="w-full flex justify-between items-center bg-gray-800 text-white px-6 py-4 shadow-md">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md transition-transform transform hover:scale-105"
        >
          Logout
        </button>
      </header>

      {/* Dashboard Content */}
      <main className="flex-grow flex flex-col items-center justify-center mt-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
          Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {/* Courses Card */}
          <Link
            to="/courses-approval"
            className="bg-blue-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
          >
            <h2 className="text-2xl font-bold mb-2">Courses</h2>
            <p className="text-sm">
              Manage your courses, view assignments, and access course
              materials.
            </p>
          </Link>

          {/* Coordinators Card */}
          <Link
            to="/coordinators-approval"
            className="bg-green-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
          >
            <h2 className="text-2xl font-bold mb-2">Coordinators</h2>
            <p className="text-sm">
              View and manage coordinators for your academic sections.
            </p>
          </Link>

          {/* Mentors Card */}
          <Link
            to="/mentors-approval"
            className="bg-yellow-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
          >
            <h2 className="text-2xl font-bold mb-2">Mentors</h2>
            <p className="text-sm">
              Connect with mentors and manage mentorship activities.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
