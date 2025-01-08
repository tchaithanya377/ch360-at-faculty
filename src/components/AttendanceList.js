import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where, setDoc, Timestamp } from "firebase/firestore";
import { format } from 'date-fns'; // Import date-fns for date formatting
import ClipLoader from "react-spinners/ClipLoader"; // Importing the spinner component from react-spinners

const AttendancePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classSchedules, setClassSchedules] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [classDetails, setClassDetails] = useState(null);
  const [viewMode, setViewMode] = useState(true); // true: Viewing timetable, false: Editing attendance
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        setError(null);

        onAuthStateChanged(auth, async (user) => {
          if (!user) {
            setError("No user is logged in.");
            setLoading(false);
            return;
          }

          const selectedDay = format(selectedDate, "EEEE"); // Get day of the week (e.g., "Monday")

          // Define the list of years you want to display timetables for
          const years = ["II", "III", "IV"]; // Modify this if you want to include more years
          const allSchedules = [];

          // Fetch schedules for each year
          for (const year of years) {
            const timetablePath = `timetables/${year}/A`;
            const timetableCollectionRef = collection(db, timetablePath);

            const q = query(
              timetableCollectionRef,
              where("day", "==", selectedDay),
              where("facultyId", "==", user.uid)
            );

            const timetableDocsSnap = await getDocs(q);
            const schedules = [];

            for (const docSnap of timetableDocsSnap.docs) {
              const data = docSnap.data();
              const courseDocRef = doc(db, `courses/${year}/A/sem1/courseDetails/${data.courseId}`);
              const courseDocSnap = await getDoc(courseDocRef);
              let courseName = "Unnamed Course";

              if (courseDocSnap.exists()) {
                const courseData = courseDocSnap.data();
                courseName = courseData.courseName || "Unnamed Course";
              }

              schedules.push({
                year, // Add the year to the schedule for distinction
                id: docSnap.id,
                courseName,
                ...data,
              });
            }

            allSchedules.push(...schedules); // Combine schedules from all years
          }

          setClassSchedules(allSchedules); // Combine schedules from all years
        });
      } catch (err) {
        setError(err.message || "Error fetching timetable.");
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [selectedDate]);

  const fetchAttendanceDetails = async (schedule) => {
    try {
      setLoading(true);
      setError(null);
  
      console.log("Fetching class details for schedule: ", schedule);
      const classDocRef = doc(db, `timetables/${schedule.year}/${schedule.section}/${schedule.id}`);
      const classDocSnap = await getDoc(classDocRef);
  
      if (!classDocSnap.exists()) {
        throw new Error("Class details not found.");
      }
  
      const classData = classDocSnap.data();
      console.log("Class data: ", classData);
      setClassDetails(classData);
  
      const studentDetails = await Promise.all(
        classData.studentIds.map(async (studentId) => {
          const studentDocRef = doc(db, `students/${schedule.year}/${schedule.section}/${studentId}`);
          const studentDocSnap = await getDoc(studentDocRef);
  
          if (studentDocSnap.exists()) {
            return { id: studentDocSnap.id, ...studentDocSnap.data() };
          } else {
            return null;
          }
        })
      );
  
      console.log("Student details: ", studentDetails);
  
      const facultyId = auth.currentUser?.uid;
      if (!facultyId) {
        throw new Error("Faculty ID not found. Please log in again.");
      }
  
      const attendanceRef = doc(
        db,
        `attendance/${schedule.year}/${schedule.section}/${facultyId}/courses/${classData.courseId}`
      );
      const docSnapshot = await getDoc(attendanceRef);
  
      let previousAttendance = {};
      if (docSnapshot.exists()) {
        console.log("Attendance data found for the class.");
        const attendanceHistory = docSnapshot.data().attendanceHistory || [];
        const attendanceRecord = attendanceHistory.find(
          (record) => record.date === format(selectedDate, "yyyy-MM-dd")
        );
  
        if (attendanceRecord) {
          console.log("Found attendance record for the selected date:", attendanceRecord);
          previousAttendance = attendanceRecord.attendance.reduce((acc, student) => {
            acc[student.id] = student.status;
            return acc;
          }, {});
        } else {
          console.log("No attendance record found for the selected date.");
        }
      } else {
        console.log("No attendance data found for the class.");
      }
  
      const sortedAttendance = studentDetails
        .filter((student) => student !== null)
        .sort((a, b) => (a.rollNo || "").localeCompare(b.rollNo || ""))
        .map((student) => ({
          ...student,
          status: previousAttendance[student.id] || "Absent", // Ensure correct status is applied
        }));
  
      console.log("Sorted attendance: ", sortedAttendance);
      setAttendance(sortedAttendance);
      setViewMode(false);
    } catch (err) {
      console.error("Error fetching attendance details:", err);
      setError(err.message || "Error fetching attendance details.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) =>
      prev.map((student) => (student.id === studentId ? { ...student, status } : student))
    );
  };

  const handleAttendanceSubmit = async () => {
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const year = classDetails?.year || "UnknownYear";
      const section = classDetails?.section || "UnknownSection";
      const facultyId = auth.currentUser?.uid;
      const courseId = classDetails?.courseId || "UnknownCourseId";
  
      if (!facultyId) {
        alert("Faculty ID not found. Please log in again.");
        return;
      }
  
      const attendanceRef = doc(db, `attendance/${year}/${section}/${facultyId}/courses/${courseId}`);
      const facultyRef = doc(db, `faculty/${facultyId}`); // Reference to store faculty and course mapping
  
      // Fetch existing attendance data
      const docSnapshot = await getDoc(attendanceRef);
      let existingData = docSnapshot.exists()
        ? docSnapshot.data()
        : { attendanceHistory: [], totalClassesConducted: 0, totalPresent: 0 };
  
      // Check if date exists in history
      const historyIndex = existingData.attendanceHistory.findIndex(
        (record) => record.date === formattedDate
      );
  
      // Calculate totalPresentCount by counting how many students are present
      let totalPresentForDate = attendance.filter(student => student.status === "Present").length;
  
      const validatedAttendance = attendance.map((student) => ({
        id: student.id || "UnknownID",
        name: student.name || "UnknownName",
        rollNo: student.rollNo || "UnknownRollNo",
        status: student.status || "Absent",
        totalClasses: student.totalClasses || 1, // Default to 1 if undefined
        totalPresent: student.status === "Present" ? 1 : 0, // Count Present for the day
      }));
  
      if (historyIndex !== -1) {
        // Update existing record for the date
        validatedAttendance.forEach((student) => {
          const existingStudent = existingData.attendanceHistory[historyIndex].attendance.find(
            (s) => s.id === student.id
          );
  
          if (existingStudent) {
            const previousStatus = existingStudent.status;
  
            // If status changed from Present to Absent, decrease totalPresent for that student
            if (previousStatus === "Present" && student.status === "Absent") {
              existingStudent.totalPresent -= 1;
            }
            // If status changed from Absent to Present, increase totalPresent for that student
            else if (previousStatus === "Absent" && student.status === "Present") {
              existingStudent.totalPresent += 1;
            }
  
            // Update status
            existingStudent.status = student.status;
          } else {
            // Add new student record for the date
            existingData.attendanceHistory[historyIndex].attendance.push({
              ...student,
              totalPresent: student.status === "Present" ? 1 : 0,
              totalClasses: existingData.totalClassesConducted + 1,
            });
          }
        });
  
        // Update the total present count for the date
        existingData.attendanceHistory[historyIndex].totalPresentCount = totalPresentForDate;
      } else {
        // Add new record for the date
        const updatedAttendance = validatedAttendance.map((student) => ({
          ...student,
          totalPresent: student.status === "Present" ? 1 : 0,
          totalClasses: existingData.totalClassesConducted + 1,
        }));
  
        existingData.attendanceHistory.push({
          date: formattedDate,
          attendance: updatedAttendance,
          totalPresentCount: totalPresentForDate,
        });
      }
  
      // Increment total classes conducted only if it's a new class
      if (historyIndex === -1) {
        existingData.totalClassesConducted += 1;
      }
  
      // Update the total present count for the class
      existingData.totalPresent = 0; // Reset and recalculate total present
      existingData.attendanceHistory.forEach((record) => {
        totalPresentForDate = record.attendance.filter((student) => student.status === "Present").length;
        existingData.totalPresent += totalPresentForDate;
      });
  
      // Save updated attendance data back to Firestore
      await setDoc(attendanceRef, existingData);
  
      // Update faculty-course mapping
      const facultyDocSnapshot = await getDoc(facultyRef);
      let facultyData = facultyDocSnapshot.exists() ? facultyDocSnapshot.data() : { courses: [] };
  
      if (!facultyData.courses.includes(courseId)) {
        facultyData.courses.push(courseId);
      }
  
      await setDoc(facultyRef, { ...facultyData });
  
      alert("Attendance updated successfully!");
  
      // After submitting, call fetchAttendanceDetails to refresh the data
      fetchAttendanceDetails(classDetails); // Refresh attendance after update
  
      setViewMode(true); // Switch back to view mode
    } catch (err) {
      alert(`Failed to update attendance. Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen p-6">
      {loading ? (
        <div className="flex justify-center items-center">
          <ClipLoader size={50} color={"#000"} loading={loading} />
        </div>
      ) : (
        <>
          {viewMode ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Class Schedule for {format(selectedDate, "yyyy-MM-dd")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classSchedules.map((schedule) => (
                  <div key={schedule.id} className="p-4 border rounded bg-white">
                    <h3 className="font-bold">{schedule.courseName}</h3>
                    <p>{schedule.startTime} - {schedule.endTime}</p>
                    <button
                      className="text-blue-500 underline"
                      onClick={() => fetchAttendanceDetails(schedule)}
                    >
                      Edit Attendance
                    </button>
                  </div>
                ))}
              </div>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy/MM/dd"
                className="mt-4 p-2 border rounded"
              />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Edit Attendance</h2>
              <table className="w-full bg-white shadow rounded">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Permission</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.rollNo}</td>
                      <td>
                        <input
                          type="radio"
                          name={student.id}
                          value="Present"
                          checked={student.status === "Present"}
                          onChange={() => handleStatusChange(student.id, "Present")}
                        />
                      </td>
                      <td>
                        <input
                          type="radio"
                          name={student.id}
                          value="Absent"
                          checked={student.status === "Absent"}
                          onChange={() => handleStatusChange(student.id, "Absent")}
                        />
                      </td>
                      <td>
                        <input
                          type="radio"
                          name={student.id}
                          value="Permission"
                          checked={student.status === "Permission"}
                          onChange={() => handleStatusChange(student.id, "Permission")}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="mt-4 py-2 px-4 bg-blue-500 text-white rounded"
                onClick={handleAttendanceSubmit}
              >
                Submit Attendance
              </button>
            </>
          )}
        </>
      )}
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
};

export default AttendancePage;
