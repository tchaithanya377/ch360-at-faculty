import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase"; // Firebase configuration
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const FacultyCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [dayFilter, setDayFilter] = useState(""); // For day filter
  const [sectionFilter, setSectionFilter] = useState(""); // For section filter
  const [yearFilter, setYearFilter] = useState(""); // For year filter
  const navigate = useNavigate();

  // Get today's day (e.g., "Monday", "Tuesday")
  const today = new Date().toLocaleString("en-US", { weekday: "long" });

  useEffect(() => {
    const fetchFacultyCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Checking user authentication...");

        onAuthStateChanged(auth, async (user) => {
          if (!user) {
            console.log("No user logged in.");
            setError("No user is logged in.");
            setLoading(false);
            return;
          }

          console.log("User logged in:", user.uid);

          const facultyDocRef = doc(db, "faculty", user.uid);
          const facultyDocSnap = await getDoc(facultyDocRef);

          if (!facultyDocSnap.exists()) {
            console.log("Faculty document not found.");
            setError("Faculty document not found.");
            setLoading(false);
            return;
          }

          const facultyData = facultyDocSnap.data();
          console.log("Faculty data fetched:", facultyData);

          if (!facultyData.courses || facultyData.courses.length === 0) {
            console.log("No courses assigned to this faculty.");
            setError("No courses assigned to this faculty.");
            setLoading(false);
            return;
          }

          // Fetch timetable entries based on facultyId
          console.log("Fetching timetable entries...");
          const timetableCollection = collection(db, "timetables", "III", "A");
          const q = query(timetableCollection, where("facultyId", "==", user.uid));
          const querySnapshot = await getDocs(q);

          const timetableData = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Timetable entry found:", data);
            timetableData.push({
              courseId: data.courseId,
              startTime: data.startTime,
              endTime: data.endTime,
              room: data.room,
              periods: data.periods,
              day: data.day,
              year: data.year,
              section: data.section,
            });
          });

          if (timetableData.length === 0) {
            console.log("No timetable found for this faculty.");
            setError("No timetable found for this faculty.");
            setCourses([]);
          } else {
            console.log("Timetable data fetched:", timetableData);

            // Now fetch course details for each courseId
            const coursePromises = timetableData.map(async (entry) => {
              const courseRef = doc(db, "courses", "III", "A", "sem1", "courseDetails", entry.courseId);
              const courseSnap = await getDoc(courseRef);

              if (courseSnap.exists()) {
                console.log("Course details fetched:", courseSnap.data());
                return { ...courseSnap.data(), ...entry };
              } else {
                console.log("Course details not found for courseId:", entry.courseId);
                return null;
              }
            });

            const resolvedCourses = (await Promise.all(coursePromises)).filter(course => course !== null);

            // Remove duplicates by courseId but keep them if they are in different days
            const uniqueCourses = [];
            resolvedCourses.forEach((course) => {
              uniqueCourses.push(course); // Always push the course, even if it's the same course on a different day
            });

            if (uniqueCourses.length === 0) {
              console.log("No valid courses found for this faculty.");
              setError("No valid courses found for this faculty.");
            } else {
              console.log("Resolved courses:", uniqueCourses);
              setCourses(uniqueCourses);
              setFilteredCourses(uniqueCourses); // Set initial filtered courses
            }
          }

          setLoading(false);
        });
      } catch (err) {
        console.log("Error occurred:", err);
        setError("Error fetching faculty courses.");
        setLoading(false);
      }
    };

    fetchFacultyCourses();
  }, []);

  useEffect(() => {
    // Automatically set the day filter to today's day
    if (!dayFilter) {
      setDayFilter(today);
    }

    // Filter courses based on selected day, section, and year
    let filtered = [...courses];

    if (dayFilter) {
      filtered = filtered.filter(course => course.day === dayFilter);
    }
    if (sectionFilter) {
      filtered = filtered.filter(course => course.section === sectionFilter);
    }
    if (yearFilter) {
      filtered = filtered.filter(course => course.year === yearFilter);
    }

    setFilteredCourses(filtered);
  }, [dayFilter, sectionFilter, yearFilter, courses, today]);

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
        <p className="text-gray-600">Here is the list of courses you are teaching along with their timetable entries.</p>
      </header>

      <section className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <label className="mr-2 text-gray-700">Filter by Day:</label>
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </div>

          <div className="flex space-x-4">
            {/* Section Filter */}
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="">Filter by Section</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>

            {/* Year Filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="">Filter by Year</option>
              <option value="I">1st Year</option>
              <option value="II">2nd Year</option>
              <option value="III">3rd Year</option>
              <option value="IV">4th Year</option>
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <div
            key={`${course.courseId}-${course.day}`} // Make sure each course has a unique key even if the same course is taught on different days
            className="bg-white rounded-lg shadow-md p-6 transition-transform transform hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-800">{course.courseName}</h3>
            <p className="text-gray-700 mt-2">Course Code: {course.courseCode}</p>
            <p className="text-gray-700 mt-2">Year: {course.year}</p>
            <p className="text-gray-700 mt-2">Section: {course.section}</p>
            <p className="text-gray-700 mt-2">Day: {course.day}</p>
            <p className="text-gray-700 mt-2">Room: {course.room}</p>

            {/* Display Periods and Timings */}
            <div className="mt-4">
              {course.periods && course.periods.map((period, index) => (
                <div key={index} className="text-gray-700">
                  <span className="font-semibold">{`Period ${index + 1}: `}</span>
                  <span>{`${course.startTime} - ${course.endTime}`}</span>
                </div>
              ))}
            </div>

            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => navigate(`/course/${course.courseId}`, { state: course })}
            >
              View Details
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default FacultyCourseList;
