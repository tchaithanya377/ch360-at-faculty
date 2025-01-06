import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher, faClipboardList, faUserGraduate, faCalendarAlt, faComments, faFolderOpen, faUser, faCog, faQuestionCircle, faBell } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Welcome to Faculty Dashboard!</h1>
          <p className="text-gray-600">Manage your classes, communicate with students, and more.</p>
        </div>
        <img src="/avatar.jpg" alt="Profile" className="w-16 h-16 rounded-full" />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-bold">Current Classes</h3>
          <p className="text-gray-600">You have 5 classes this semester</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-bold">Upcoming Events</h3>
          <p className="text-gray-600">Next event: Faculty Meeting</p>
          <p className="text-gray-600">Date: March 15, 2024</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-bold">Quick Links</h3>
          <div className="flex flex-col items-center space-y-2">
            <Link to="/courses" className="text-blue-600 hover:underline">Courses</Link>
            <Link to="/attendance" className="text-blue-600 hover:underline">Attendance</Link>
            <Link to="/grades" className="text-blue-600 hover:underline">Grades</Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faBell} className="text-yellow-500" />
              <p className="text-gray-600">New message from Admin</p>
            </li>
            <li className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faBell} className="text-yellow-500" />
              <p className="text-gray-600">Assignment submission deadline</p>
            </li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <ul className="space-y-2">
            <li className="text-gray-600">Submitted grades for Math 101</li>
            <li className="text-gray-600">Updated course materials for Science 102</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Upcoming Deadlines</h2>
          <ul className="space-y-2">
            <li className="text-gray-600">Grade submission for History 201</li>
            <li className="text-gray-600">Project review for Art 101</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/courses" className="bg-white rounded-lg shadow-md p-6 flex items-center hover:shadow-lg transition-shadow">
            <FontAwesomeIcon icon={faChalkboardTeacher} className="text-2xl text-blue-600 mr-4" />
            <div>
              <h3 className="text-lg font-bold">Courses</h3>
              <p className="text-gray-600">Manage your courses and materials</p>
            </div>
          </Link>
          <Link to="/attendance" className="bg-white rounded-lg shadow-md p-6 flex items-center hover:shadow-lg transition-shadow">
            <FontAwesomeIcon icon={faClipboardList} className="text-2xl text-blue-600 mr-4" />
            <div>
              <h3 className="text-lg font-bold">Attendance</h3>
              <p className="text-gray-600">Track and manage student attendance</p>
            </div>
          </Link>
          <Link to="/grades" className="bg-white rounded-lg shadow-md p-6 flex items-center hover:shadow-lg transition-shadow">
            <FontAwesomeIcon icon={faUserGraduate} className="text-2xl text-blue-600 mr-4" />
            <div>
              <h3 className="text-lg font-bold">Grades</h3>
              <p className="text-gray-600">Record and view student grades</p>
            </div>
          </Link>
          <Link to="/communication" className="bg-white rounded-lg shadow-md p-6 flex items-center hover:shadow-lg transition-shadow">
            <FontAwesomeIcon icon={faComments} className="text-2xl text-blue-600 mr-4" />
            <div>
              <h3 className="text-lg font-bold">Communication</h3>
              <p className="text-gray-600">Communicate with students and faculty</p>
            </div>
          </Link>
          <Link to="/events" className="bg-white rounded-lg shadow-md p-6 flex items-center hover:shadow-lg transition-shadow">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-2xl text-blue-600 mr-4" />
            <div>
              <h3 className="text-lg font-bold">Events</h3>
              <p className="text-gray-600">Upcoming events and schedules</p>
            </div>
          </Link>
          <Link to="/resources" className="bg-white rounded-lg shadow-md p-6 flex items-center hover:shadow-lg transition-shadow">
            <FontAwesomeIcon icon={faFolderOpen} className="text-2xl text-blue-600 mr-4" />
            <div>
              <h3 className="text-lg font-bold">Resources</h3>
              <p className="text-gray-600">Access course materials and resources</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Link to="/profile" className="block">
              <FontAwesomeIcon icon={faUser} className="text-3xl text-blue-600 mb-2" />
              <h3 className="text-lg font-bold">Profile</h3>
              <p className="text-gray-600">View and edit your profile</p>
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Link to="/settings" className="block">
              <FontAwesomeIcon icon={faCog} className="text-3xl text-blue-600 mb-2" />
              <h3 className="text-lg font-bold">Settings</h3>
              <p className="text-gray-600">Manage your account settings</p>
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Link to="/help" className="block">
              <FontAwesomeIcon icon={faQuestionCircle} className="text-3xl text-blue-600 mb-2" />
              <h3 className="text-lg font-bold">Help</h3>
              <p className="text-gray-600">Get assistance and support</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
