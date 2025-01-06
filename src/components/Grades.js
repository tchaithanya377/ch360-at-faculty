import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase"; // Firebase configuration
import { onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

const Grades = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacultyCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        onAuthStateChanged(auth, async (user) => {
          if (!user) {
            setError("No user is logged in.");
            setLoading(false);
            return;
          }

          const facultyDocRef = doc(db, "faculty", user.uid);
          const facultyDocSnap = await getDoc(facultyDocRef);

          if (!facultyDocSnap.exists()) {
            setError("Faculty document not found.");
            setLoading(false);
            return;
          }

          const facultyData = facultyDocSnap.data();

          if (!facultyData.courses || facultyData.courses.length === 0) {
            setError("No courses assigned to this faculty.");
            setLoading(false);
            return;
          }

          const coursePromises = facultyData.courses.map(async (courseId) => {
            const coursePath = `/courses/Computer Science & Engineering (Data Science)/years/III/sections/A/courseDetails/${courseId}`;
            const courseRef = doc(db, coursePath);
            const courseSnap = await getDoc(courseRef);

            if (courseSnap.exists()) {
              return { id: courseId, ...courseSnap.data() };
            } else {
              return null;
            }
          });

          const resolvedCourses = (await Promise.all(coursePromises)).filter(
            (course) => course !== null
          );

          if (resolvedCourses.length === 0) {
            setError("No valid courses found for this faculty.");
            setCourses([]);
          } else {
            setCourses(resolvedCourses);
          }

          setLoading(false);
        });
      } catch (err) {
        setError("Error fetching faculty courses.");
        setLoading(false);
      }
    };

    fetchFacultyCourses();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  if (courses.length === 0) {
    return <div className="text-center text-red-600">No courses available for this faculty.</div>;
  }

  return (
    <div className="min-h-screen bg-light p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold mb-4 text-gray-800">Grades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="border p-4 rounded shadow-sm bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">{course.courseName}</h3>
              <p className="text-gray-600">Course Code: {course.courseCode}</p>
              <Link to={`/grades/${course.id}`} className="text-blue-500 mt-2 block">View Students</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Grades;
