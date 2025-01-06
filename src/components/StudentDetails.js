import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Firebase configuration

const StudentDetails = () => {
  const { id } = useParams(); // Get student ID from URL
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Adjust the path if students are nested in a specific subcollection
        const studentDocRef = doc(db, `students/III/A/${id}`);
        const studentDocSnap = await getDoc(studentDocRef);

        if (studentDocSnap.exists()) {
          setStudent(studentDocSnap.data());
        } else {
          setError('Student not found.');
        }
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError('Failed to fetch student details.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id]);

  if (loading) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 bg-white rounded-lg shadow-md">{error}</div>;
  }

  if (!student) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Student not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-6">
          <img
            src={student.profilePicture || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="w-32 h-32 rounded-full mr-6"
          />
          <div>
            <h2 className="text-4xl font-bold text-gray-800">{student.name}</h2>
            <p className="text-lg text-gray-700 mb-4">{student.email}</p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-gray-600">
            <strong>Name:</strong> {student.name}
          </p>
          <p className="text-gray-600">
            <strong>Email:</strong> {student.email}
          </p>
          <p className="text-gray-600">
            <strong>Roll No:</strong> {student.rollNo}
          </p>
          <p className="text-gray-600">
            <strong>Mobile:</strong> {student.studentMobile}
          </p>
          <p className="text-gray-600">
            <strong>Father's Name:</strong> {student.fatherName}
          </p>
          <p className="text-gray-600">
            <strong>Mother's Name:</strong> {student.motherName}
          </p>
          <p className="text-gray-600">
            <strong>Father's Mobile:</strong> {student.fatherMobile}
          </p>
        </div>
        <div className="mt-6 text-center">
          <Link to="/students" className="text-blue-500 hover:underline">
            Back to Student List
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
