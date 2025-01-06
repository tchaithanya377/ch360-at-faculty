import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CourseManagement from './components/Course';
import CourseDetails from './components/CourseDetails';
import StudentList from './components/StudentList';
import StudentDetails from './components/StudentDetails';
import Attendance from './components/AttendanceList';
import StudentAttendance from './components/StudentAttendance';
import EditAttendance from './components/EditAttendance';
import ExamDetails from './components/ExamDetails';
import Exam from './components/Exam';
import Grades from './components/Grades';
import StudentGrades from './components/StudentGrades';
import CommunicationPage from './components/Communication';
import Announcements from './components/Announcements';
import ApprovalWorkflow from "./components/ApprovalWorkflow";
import RequestPage from "./components/RequestPage";
import ProfilePage from "./components/ProfilePage";
import Login from './components/Login';
import FacultyCourseApproal from './components/FacultyCourseApproval'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './auth'; // Import AuthProvider and useAuth
import ProtectedRoute from './ProtectedRoute'; // Custom protected route component
import CoordinatorDashboard from './components/CoordinatorApproval';
import MentorApproval from './components/MentorApproval';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer />
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}

const MainLayout = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Navbar /> 
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Login />} />
           <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:id"
            element={
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <StudentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/:id"
            element={
              <ProtectedRoute>
                <StudentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance/:id"
            element={
              <ProtectedRoute>
                <StudentAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-attendance/:id"
            element={
              <ProtectedRoute>
                <EditAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams"
            element={
              <ProtectedRoute>
                <Exam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams/:id"
            element={
              <ProtectedRoute>
                <ExamDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <ProtectedRoute>
                <Grades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grades/:id"
            element={
              <ProtectedRoute>
                <StudentGrades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/communication"
            element={
              <ProtectedRoute>
                <CommunicationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <Announcements />
              </ProtectedRoute>
            }
          />
          
          
          <Route
            path="/request"
            element={
              <ProtectedRoute>
                <RequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approval"
            element={
              <ProtectedRoute>
                <ApprovalWorkflow />
              </ProtectedRoute>
            }/>
           <Route
            path="/courses-approval"
            element={
              <ProtectedRoute>
                <FacultyCourseApproal />
              </ProtectedRoute>
            }
          />
           <Route
            path="/coordinators-approval"
            element={
              <ProtectedRoute>
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />
           <Route
            path="/mentors-approval"
            element={
              <ProtectedRoute>
                <MentorApproval />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
