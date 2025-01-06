import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db } from "../firebase";

const StudentGrades = () => {
  const { id: courseId } = useParams(); // Course ID from the URL
  const [courseName, setCourseName] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch course and student details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch course details
        const courseDocRef = doc(
          db,
          `/courses/Computer Science & Engineering (Data Science)/years/III/sections/A/courseDetails/${courseId}`
        );
        const courseDocSnap = await getDoc(courseDocRef);

        if (!courseDocSnap.exists()) {
          throw new Error("Course not found.");
        }

        const courseData = courseDocSnap.data();
        setCourseName(courseData.courseName || "Unknown Course");

        // Fetch student details
        const studentDetailsPromises = (courseData.students || []).map(
          async (studentId) => {
            const studentDocRef = doc(db, `/students/III/A/${studentId}`);
            const studentDocSnap = await getDoc(studentDocRef);

            if (studentDocSnap.exists()) {
              const studentData = studentDocSnap.data();
              return {
                id: studentId,
                name: studentData.name || "Unknown Student",
                rollno: studentData.rollno || "Unknown Roll No",
                grades: studentData.grades || {},
              };
            } else {
              return {
                id: studentId,
                name: "Unknown Student",
                rollno: "Unknown Roll No",
                grades: {},
              };
            }
          }
        );

        const studentDetails = await Promise.all(studentDetailsPromises);
        setStudents(studentDetails);
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setGrades(student.grades[courseId] || {
      mid1: 0,
      assignment1: 0,
      mid2: 0,
      assignment2: 0,
      internal: 0,
      external: 0,
      labInternal: 0,
      labExternal: 0,
    });
    setIsModalOpen(true);
  };

  const handleGradeChange = (field, value) => {
    setGrades((prevGrades) => ({ ...prevGrades, [field]: Number(value) }));
  };

  const handleSaveGrades = async () => {
    if (!selectedStudent) return;

    try {
      const studentDocRef = doc(db, `/students/III/A/${selectedStudent.id}`);

      // Attach grades to the specific course ID
      const updatedGrades = {
        [`grades.${courseId}`]: grades, // Nested field update
      };

      // Debugging: Log the path and grades
      console.log("Updating grades for student:", selectedStudent.id);
      console.log("Course ID:", courseId);
      console.log("Grades to save:", updatedGrades);

      // Update the grades in Firestore under the specific course ID
      await updateDoc(studentDocRef, updatedGrades);

      // Update the local student list
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === selectedStudent.id
            ? {
                ...student,
                grades: {
                  ...student.grades,
                  [courseId]: grades,
                },
              }
            : student
        )
      );

      alert("Grades updated successfully!");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error updating grades:", err);
      alert("Failed to update grades. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (students.length === 0) {
    return <div>No students found for this course.</div>;
  }

  return (
    <div className="min-h-screen bg-light p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold mb-4 text-gray-800">
          {courseName} - Student Grades
        </h2>
        <table className="w-full bg-white shadow-md rounded my-6">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                Student Name
              </th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                Roll No
              </th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-100">
                <td className="py-3 px-4">{student.name}</td>
                <td className="py-3 px-4">{student.rollno}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleEdit(student)}
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

      {/* Modal for editing grades */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md max-h-full overflow-y-auto relative">
            <div className="sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                Edit Grades for {selectedStudent.name}
              </h3>
            </div>
            <div className="space-y-4 overflow-y-auto">
              {[
                "mid1",
                "assignment1",
                "mid2",
                "assignment2",
                "internal",
                "external",
                "labInternal",
                "labExternal",
              ].map((field) => (
                <div key={field}>
                  <label className="block text-gray-700 capitalize">
                    {field.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type="number"
                    value={grades[field] || 0}
                    onChange={(e) => handleGradeChange(field, e.target.value)}
                    className="mt-1 p-2 border rounded w-full"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-2 sticky bottom-0 bg-white z-10">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGrades}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Save Grades
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGrades;
