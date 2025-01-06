import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase"; // Firebase configuration
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const FacultyCourseList = () => {
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

          // Step 1: Query timetable documents for this faculty
          const timetableRef = collection(db, "timetables/III/A");
          const timetableQuery = query(timetableRef, where("facultyId", "==", user.uid));
          const timetableSnap = await getDocs(timetableQuery);

          if (timetableSnap.empty) {
            setError("No timetables found for this faculty.");
            setLoading(false);
            return;
          }

          // Step 2: Extract unique course IDs
          const courseIds = [];
          timetableSnap.forEach((doc) => {
            const data = doc.data();
            if (data.courseId && !courseIds.includes(data.courseId)) {
              courseIds.push(data.courseId);
            }
          });

          if (courseIds.length === 0) {
            setError("No courses assigned to this faculty.");
            setLoading(false);
            return;
          }

          // Step 3: Fetch course details
          const coursePromises = courseIds.map(async (courseId) => {
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
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Courses</h1>
        <p className="text-gray-600">Here is the list of courses you are teaching.</p>
      </header>

      <section className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow-md p-6 transition-transform transform hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-800">{course.courseName}</h3>
            <p className="text-gray-700 mt-2">{course.courseCode}</p>
            <p className="text-gray-500 mt-1">{course.semester} - {course.section}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => navigate(`/course/${course.id}`, { state: course })}
            >
              View
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default FacultyCourseList;
