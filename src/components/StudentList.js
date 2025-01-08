import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase"; // Firebase configuration
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "react-router-dom"; // React Router to get dynamic courseId from URL

const StudentList = () => {
  const { courseId } = useParams(); // Get courseId from URL parameters

  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [facultyId, setFacultyId] = useState(null);
  const [fetchedCourses, setFetchedCourses] = useState([]); // Track fetched courses

  // Fetch the list of students from a specific timetable
  const fetchTimetableStudents = async (facultyId) => {
    try {
      const timetableRef = collection(db, "timetables/III/A");
      const querySnapshot = await getDocs(timetableRef);
      const studentIds = [];

      querySnapshot.forEach((docSnap) => {
        const timetableData = docSnap.data();
        if (timetableData.facultyId === facultyId && !fetchedCourses.includes(timetableData.courseId)) {
          setFetchedCourses((prevCourses) => [...prevCourses, timetableData.courseId]); // Mark this course as fetched
          studentIds.push(...timetableData.studentIds);  // Collecting all student IDs from the timetable data
        }
      });

      if (studentIds.length > 0) {
        fetchStudentsByIds(studentIds);
      } else {
        console.error("No students found for this faculty.");
        setError("No students found for this faculty.");
      }
    } catch (err) {
      console.error("Error fetching timetable data:", err.message);
      setError("Error fetching timetable data.");
    }
  };

  // Fetch student details based on student IDs
  const fetchStudentsByIds = async (studentIds) => {
    try {
      const studentPromises = studentIds.map((id) =>
        getDoc(doc(db, "students", id))  // Assuming each student has a document in "students" collection
      );
      const studentDocs = await Promise.all(studentPromises);

      const fetchedStudents = studentDocs.map((studentDoc) => {
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          return {
            rollNo: studentData.rollNo,
            name: studentData.name,
          };
        }
        return null;
      }).filter((student) => student !== null);

      setStudents(fetchedStudents);
    } catch (err) {
      console.error("Error fetching student details:", err.message);
      setError("Error fetching student details.");
    }
  };

  // Fetch faculty and timetable data
  const fetchFacultyData = async () => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.error("No user is logged in.");
        setError("No user is logged in.");
        return;
      }

      console.log(`Logged in as user: ${user.uid}`);  // Debugging output for logged-in user
      setFacultyId(user.uid);
      await fetchTimetableStudents(user.uid); // Fetch students based on faculty ID
    });
  };

  useEffect(() => {
    if (courseId) {
      console.log(`Course ID received: ${courseId}`);  // Debugging output for course ID
      fetchFacultyData();
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
                <th className="px-4 py-2 text-left">View Details</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.rollNo}>
                  <td className="px-4 py-2">{student.rollNo}</td>
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => alert(`Viewing details for ${student.name}`)}  // Handle the details view logic
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View Details
                    </button>
                  </td>
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
