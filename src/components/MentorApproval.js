import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Firestore configuration
import { useAuth } from "../auth"; // Authentication hook to get logged-in mentor

const MentorApproval = () => {
  const { user } = useAuth(); // Get the logged-in user
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");

  const loggedInMentorId = user?.uid; // Mentor ID from authentication

  const years = [
    { label: "I", value: "I" },
    { label: "II", value: "II" },
    { label: "III", value: "III" },
    { label: "IV", value: "IV" },
  ];
  const sections = ["A", "B", "C", "D"];

  useEffect(() => {
    if (loggedInMentorId) {
      console.log("Logged in Mentor ID:", loggedInMentorId);
    } else {
      console.error("No logged-in Mentor ID found!");
    }
  }, [loggedInMentorId]);

  const fetchNameById = async (collectionName, id) => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().name || "Unknown" : "Unknown";
  };

  const fetchData = async () => {
    if (!loggedInMentorId || !year || !section) {
      console.error("Mentor ID, year, or section is required.");
      return;
    }

    setLoading(true);
    try {
      // Query to get the latest `noDues` document based on year and section
      const noDuesCollectionRef = collection(db, "noDues", year, section);
      const latestNoDuesQuery = query(noDuesCollectionRef, orderBy("generatedAt", "desc"), limit(1));
      const querySnapshot = await getDocs(latestNoDuesQuery);

      if (querySnapshot.empty) {
        console.error("No noDues document found.");
        setMentors([]);
        setLoading(false);
        return;
      }

      const latestNoDuesDoc = querySnapshot.docs[0];
      const noDuesData = latestNoDuesDoc.data();
      console.log("Fetched NoDues Data:", noDuesData);

      if (!noDuesData.students || noDuesData.students.length === 0) {
        console.log("No students found.");
        setMentors([]);
        setLoading(false);
        return;
      }

      const fetchedMentors = await Promise.all(
        noDuesData.students.map(async (student) => {
          if (student.mentors) {
            const matchedMentor = student.mentors.find((mentor) => mentor.id === loggedInMentorId);

            if (matchedMentor) {
              const studentRef = doc(db, "students", year, section, student.id);
              const studentSnap = await getDoc(studentRef);

              let mentorName = "Unknown";
              if (matchedMentor.id) {
                const mentorRef = doc(db, "faculty", matchedMentor.id); // Fetch mentor details
                const mentorSnap = await getDoc(mentorRef);
                mentorName = mentorSnap.exists()
                  ? mentorSnap.data().name || "Unknown"
                  : "Unknown";
              }

              if (studentSnap.exists()) {
                const studentData = studentSnap.data();

                const coordinators = await Promise.all(
                  student.coordinators.map(async (coordinator) => ({
                    ...coordinator,
                    name: await fetchNameById("faculty", coordinator.id),
                  }))
                );

                const coursesFaculty = await Promise.all(
                  student.courses_faculty.map(async (courseFaculty) => ({
                    ...courseFaculty,
                    courseName: await fetchNameById(`courses/Computer Science & Engineering (Data Science)/years/${year}/sections/${section}/courseDetails`, courseFaculty.courseId),
                    facultyName: await fetchNameById("faculty", courseFaculty.facultyId),
                  }))
                );

                return {
                  rollNo: studentData.rollNo || "N/A",
                  studentName: studentData.name || "N/A",
                  mentorName,
                  status: matchedMentor.status || "Pending",
                  studentId: student.id,
                  mentorIndex: student.mentors.indexOf(matchedMentor),
                  coordinators,
                  coursesFaculty,
                };
              }
            }
          }
          return null;
        })
      );

      setMentors(fetchedMentors.filter(Boolean)); // Filter out null values
    } catch (error) {
      console.error("Error fetching mentors:", error);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (studentId, mentorIndex, newStatus) => {
    try {
      // Query the latest noDues document path dynamically
      const noDuesCollectionRef = collection(db, "noDues", year, section);
      const latestNoDuesQuery = query(noDuesCollectionRef, orderBy("generatedAt", "desc"), limit(1));
      const querySnapshot = await getDocs(latestNoDuesQuery);

      if (querySnapshot.empty) {
        console.error("No noDues document found for updating.");
        return;
      }

      const latestNoDuesDoc = querySnapshot.docs[0];
      const noDuesDocRef = latestNoDuesDoc.ref;

      const noDuesSnap = await getDoc(noDuesDocRef);

      if (noDuesSnap.exists()) {
        const noDuesData = noDuesSnap.data();

        const updatedStudents = noDuesData.students.map((student) => {
          if (student.id === studentId) {
            const updatedMentors = student.mentors.map((mentor, index) => {
              if (index === mentorIndex) {
                return { ...mentor, status: newStatus };
              }
              return mentor;
            });
            return { ...student, mentors: updatedMentors };
          }
          return student;
        });

        await updateDoc(noDuesDocRef, { students: updatedStudents });
        console.log("Mentor status updated successfully!");
        fetchData(); // Refresh the data
      }
    } catch (error) {
      console.error("Error updating mentor status:", error);
    }
  };

  useEffect(() => {
    if (loggedInMentorId && year && section) {
      fetchData();
    }
  }, [loggedInMentorId, year, section]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Mentor Approval</h1>
  
      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mb-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Year:</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Year</option>
            {years.map((yr) => (
              <option key={yr.value} value={yr.value}>
                {yr.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Section:</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Section</option>
            {sections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>
      </div>
  
      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
          <p className="ml-4 text-blue-600 font-medium">Loading...</p>
        </div>
      ) : (
        /* Table Section */
        <div className="overflow-x-auto w-full max-w-4xl">
          <table className="table-auto w-full border-collapse border border-gray-300 shadow-sm">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-4 py-2 border text-left font-semibold">Roll No</th>
                <th className="px-4 py-2 border text-left font-semibold">Student Name</th>
                <th className="px-4 py-2 border text-left font-semibold">Mentor</th>
                <th className="px-4 py-2 border text-left font-semibold">Status</th>
                <th className="px-4 py-2 border text-left font-semibold">Coordinators</th>
                <th className="px-4 py-2 border text-left font-semibold">Courses Faculty</th>
                <th className="px-4 py-2 border text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mentors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                mentors.map((mentor, index) => {
                  const allAccepted = mentor.coordinators.every((c) => c.status === "Accepted") &&
                                      mentor.coursesFaculty.every((cf) => cf.status === "Accepted");
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 border">{mentor.rollNo}</td>
                      <td className="px-4 py-2 border">{mentor.studentName}</td>
                      <td className="px-4 py-2 border">{mentor.mentorName}</td>
                      <td className="px-4 py-2 border">
                        <span
                          className={`px-2 py-1 rounded-full text-sm text-white ${
                            mentor.status === "Accepted"
                              ? "bg-green-500"
                              : mentor.status === "Rejected"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {mentor.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 border">
                        {mentor.coordinators.map((coordinator, i) => (
                          <span
                            key={i}
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${
                              coordinator.status === "Accepted"
                                ? "bg-green-500"
                                : coordinator.status === "Rejected"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            } mr-1`}
                          >
                            {coordinator.name}
                          </span>
                        ))}
                      </td>
                      <td className="px-4 py-2 border">
                        {mentor.coursesFaculty.map((courseFaculty, i) => (
                          <span
                            key={i}
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${
                              courseFaculty.status === "Accepted"
                                ? "bg-green-500"
                                : courseFaculty.status === "Rejected"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            } mr-1`}
                          >
                             {courseFaculty.facultyName}
                          </span>
                        ))}
                      </td>
                      <td className="px-4 py-2 border">
                        <button
                          className={`bg-green-500 text-white px-3 py-1 rounded-md mr-2 ${
                            !allAccepted ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          onClick={() =>
                            updateStatus(mentor.studentId, mentor.mentorIndex, "Accepted")
                          }
                          disabled={!allAccepted}
                        >
                          Accept
                        </button>
                        <button
                          className={`bg-red-500 text-white px-3 py-1 rounded-md ${
                            !allAccepted ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          onClick={() =>
                            updateStatus(mentor.studentId, mentor.mentorIndex, "Rejected")
                          }
                          disabled={!allAccepted}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MentorApproval;