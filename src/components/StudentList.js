import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase"; // Firebase configuration
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "react-router-dom"; // React Router to get dynamic courseId from URL

const StudentList = () => {
  const { courseId } = useParams(); // Get courseId from URL parameters

  // State to store students data
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  // Fetch attendance data based on faculty ID and course ID
  const fetchAttendanceData = async (facultyId) => {
    try {
      const attendancePath = `attendance/III/A/${facultyId}/courses/${courseId}`;
      console.log(`Attendance Path: ${attendancePath}`);  // Debugging output for the path
      const attendanceDocRef = doc(db, attendancePath);
      const attendanceDocSnap = await getDoc(attendanceDocRef);
  
      if (!attendanceDocSnap.exists()) {
        console.error("Attendance document not found.");
        setError("Attendance document not found.");
        return;
      }
  
      const attendanceData = attendanceDocSnap.data();
      console.log("Fetched Attendance Data:", attendanceData);  // Debugging output for fetched data
  
      const { attendanceHistory } = attendanceData;
      if (!attendanceHistory || !Array.isArray(attendanceHistory)) {
        console.error("No valid attendance history found.");
        setError("No valid attendance history found.");
        return;
      }
  
      // Use a Set to track unique students by their roll number
      const uniqueStudents = new Map();
  
      attendanceHistory.forEach((record, index) => {
        console.log(`Processing attendance record ${index + 1}:`, record);  // Debugging output for each attendance record
        if (record.attendance && Array.isArray(record.attendance)) {
          record.attendance.forEach((student) => {
            console.log(`Processing student: ${student.rollNo}, ${student.name}`);  // Debugging output for each student
            if (student.rollNo && student.name) {
              if (!uniqueStudents.has(student.rollNo)) {
                uniqueStudents.set(student.rollNo, {
                  rollNo: student.rollNo,
                  name: student.name,
                });
                console.log(`Added new student: ${student.rollNo}, ${student.name}`); // Debugging output for new student addition
              }
            }
          });
        } else {
          console.warn(`No attendance array found in record ${index + 1}.`);
        }
      });
  
      const studentsList = Array.from(uniqueStudents.values());
      console.log("Unique Students List:", studentsList);  // Debugging output for final unique students list
  
      if (studentsList.length > 0) {
        setStudents(studentsList); // Update state with the students list if there are any
      } else {
        console.warn("No students found in the attendance records.");
        setError("No students found in the attendance records.");
      }
    } catch (err) {
      console.error("Error fetching attendance data:", err.message);
      setError("Error fetching attendance data.");
    }
  };

  // Fetch students based on the logged-in faculty's attendance records
  const fetchStudentsByFaculty = async () => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.error("No user is logged in.");
        setError("No user is logged in.");
        return;
      }

      console.log(`Logged in as user: ${user.uid}`);  // Debugging output for logged-in user
      await fetchAttendanceData(user.uid); // Fetch attendance data using facultyId
    });
  };

  // Trigger fetching students when the component mounts
  useEffect(() => {
    if (courseId) {
      console.log(`Course ID received: ${courseId}`);  // Debugging output for course ID
      fetchStudentsByFaculty();
    } else {
      console.error("No course ID provided.");
      setError("No course ID provided.");
    }
  }, [courseId]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Check Console for Data</h1>
        <p className="text-gray-600">
          Open the console to view attendance data and students list.
        </p>
      </header>

      {/* Error Handling */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Display students list */}
      {students.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 mt-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Students List for Course {courseId}</h2>
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Roll No</th>
                <th className="px-4 py-2 text-left">Name</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.rollNo}>
                  <td className="px-4 py-2">{student.rollNo}</td>
                  <td className="px-4 py-2">{student.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 mt-4">No students data available.</p>
      )}
    </div>
  );
};

export default StudentList;
