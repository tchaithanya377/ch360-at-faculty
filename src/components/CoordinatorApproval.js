import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth";

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const loggedInFacultyId = user?.uid;

  useEffect(() => {
    if (loggedInFacultyId) {
      console.log("Logged in Faculty ID:", loggedInFacultyId);
    } else {
      console.error("No logged-in Faculty ID found!");
    }
  }, [loggedInFacultyId]);

  const fetchData = async () => {
    if (!year || !section || !loggedInFacultyId) {
      console.error("Year, Section, and Faculty ID are required.");
      return;
    }

    setLoading(true);
    try {
      const noDuesCollectionRef = collection(db, `noDues/${year}/${section}`);
      const latestNoDuesQuery = query(
        noDuesCollectionRef,
        orderBy("generatedAt", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(latestNoDuesQuery);

      if (querySnapshot.empty) {
        console.error("No data found for the specified year and section.");
        setCoordinators([]);
        setLoading(false);
        return;
      }

      const noDuesDoc = querySnapshot.docs[0];
      const noDuesData = noDuesDoc.data();

      if (!noDuesData.students || noDuesData.students.length === 0) {
        console.log("No students found in this section.");
        setCoordinators([]);
        setLoading(false);
        return;
      }

      const fetchedCoordinators = await Promise.all(
        noDuesData.students.map(async (student) => {
          if (student.coordinators) {
            const matchedCoordinator = student.coordinators.find(
              (coordinator) => coordinator.id === loggedInFacultyId
            );

            if (matchedCoordinator) {
              const coordinatorRef = doc(db, "faculty", matchedCoordinator.id);
              const coordinatorSnap = await getDoc(coordinatorRef);

              const studentRef = doc(db, `students/${year}/${section}`, student.id);
              const studentSnap = await getDoc(studentRef);

              if (coordinatorSnap.exists() && studentSnap.exists()) {
                const coordinatorData = coordinatorSnap.data();
                const studentData = studentSnap.data();

                return {
                  rollNo: studentData.rollNo || "N/A",
                  studentName: studentData.name || "N/A",
                  coordinatorName: coordinatorData.name || "Unknown",
                  status: matchedCoordinator.status || "Pending",
                  studentId: student.id,
                  coordinatorIndex: student.coordinators.indexOf(matchedCoordinator),
                };
              }
            }
          }
          return null;
        })
      );

      const sortedCoordinators = fetchedCoordinators.filter(Boolean).sort((a, b) =>
        a.rollNo.localeCompare(b.rollNo)
      );

      setCoordinators(sortedCoordinators);
    } catch (error) {
      console.error("Error fetching data:", error);
      setCoordinators([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (studentId, coordinatorIndex, newStatus) => {
    try {
      const noDuesCollectionRef = collection(db, `noDues/${year}/${section}`);
      const latestNoDuesQuery = query(
        noDuesCollectionRef,
        orderBy("generatedAt", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(latestNoDuesQuery);

      if (!querySnapshot.empty) {
        const noDuesDoc = querySnapshot.docs[0];
        const noDuesDocRef = doc(db, `noDues/${year}/${section}`, noDuesDoc.id);
        const noDuesData = noDuesDoc.data();

        const updatedStudents = noDuesData.students.map((student) => {
          if (student.id === studentId) {
            const updatedCoordinators = student.coordinators.map((coordinator, index) => {
              if (index === coordinatorIndex) {
                return { ...coordinator, status: newStatus };
              }
              return coordinator;
            });
            return { ...student, coordinators: updatedCoordinators };
          }
          return student;
        });

        await updateDoc(noDuesDocRef, { students: updatedStudents });
        console.log("Status updated successfully!");
        fetchData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(studentId)
        ? prevSelected.filter((id) => id !== studentId)
        : [...prevSelected, studentId]
    );
  };

  const handleBulkAction = async (newStatus) => {
    if (selectedStudents.length > 0) {
      for (const studentId of selectedStudents) {
        const student = coordinators.find((coordinator) => coordinator.studentId === studentId);
        if (student) {
          await updateStatus(student.studentId, student.coordinatorIndex, newStatus);
        }
      }
      setSelectedStudents([]);
    }
  };

  useEffect(() => {
    if (year && section && loggedInFacultyId) {
      fetchData();
    }
  }, [year, section, loggedInFacultyId]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Coordinator Dashboard
      </h1>
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Year:</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Year</option>
              {["I", "II", "III", "IV"].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Section:</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Section</option>
              {["A", "B", "C", "D"].map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <p className="text-center text-blue-600 font-medium">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border border-gray-300 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSelectedStudents(
                          e.target.checked ? coordinators.map((c) => c.studentId) : []
                        )
                      }
                      checked={selectedStudents.length === coordinators.length}
                    />
                  </th>
                  <th className="px-4 py-2 border border-gray-300 text-left">Roll No</th>
                  <th className="px-4 py-2 border border-gray-300 text-left">Student Name</th>
                  <th className="px-4 py-2 border border-gray-300 text-left">Coordinator</th>
                  <th className="px-4 py-2 border border-gray-300 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {coordinators.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-2 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  coordinators.map((coordinator, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-all">
                      <td className="px-4 py-2 border border-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(coordinator.studentId)}
                          onChange={() => handleSelectStudent(coordinator.studentId)}
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-300">{coordinator.rollNo}</td>
                      <td className="px-4 py-2 border border-gray-300">{coordinator.studentName}</td>
                      <td className="px-4 py-2 border border-gray-300">{coordinator.coordinatorName}</td>
                      <td className="px-4 py-2 border border-gray-300">{coordinator.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="bg-green-500 text-white px-3 py-1 rounded-md"
            onClick={() => handleBulkAction("Accepted")}
            disabled={selectedStudents.length === 0}
          >
            Accept Selected
          </button>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded-md"
            onClick={() => handleBulkAction("Rejected")}
            disabled={selectedStudents.length === 0}
          >
            Reject Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
