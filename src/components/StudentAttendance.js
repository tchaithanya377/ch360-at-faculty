import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCheck, faTimes, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

const attendanceData = [
    {
      id: 1,
      courseName: 'Introduction to Computer Science',
      year: 2023,
      semester: 'Spring',
      students: [
        { id: 1, name: 'Alice Johnson' },
        { id: 2, name: 'Bob Smith' },
        { id: 3, name: 'Charlie Brown' },
        { id: 4, name: 'David Wilson' },
      ],
    },
    // Add more class data here
  ];

const StudentAttendance = () => {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState(
    attendanceData.find(classData => classData.id === parseInt(id)).students.map(student => ({
      ...student,
      status: 'present',
    }))
  );

  const handleStatusChange = (index, status) => {
    setAttendance(prevAttendance =>
      prevAttendance.map((student, i) => (i === index ? { ...student, status } : student))
    );
  };

  const handleSubmit = () => {
    console.log('Attendance submitted:', attendance);
    // Here you can add the logic to save the attendance data
  };

  const classDetails = attendanceData.find(classData => classData.id === parseInt(id));

  return (
    <div className="min-h-screen bg-light p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold mb-4 text-gray-800">
          Attendance for {classDetails.courseName} ({classDetails.year}, Semester {classDetails.semester})
        </h2>
        {/* <div className="mb-4">
          <label className="text-lg font-bold text-gray-800">Select Date:</label>
          <input
            type="date"
            className="ml-2 border rounded-lg p-2"
            value={selectedDate.toISOString().substr(0, 10)}
            onChange={e => setSelectedDate(new Date(e.target.value))}
          />
        </div> */}
        <table className="w-full bg-white shadow-md rounded my-6">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm"><FontAwesomeIcon icon={faUser} /> Student</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm"><FontAwesomeIcon icon={faCheck} /> Present</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm"><FontAwesomeIcon icon={faTimes} /> Absent</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm"><FontAwesomeIcon icon={faShieldAlt} /> Permission</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((student, index) => (
              <tr key={student.id} className="border-b hover:bg-gray-100">
                <td className="py-3 px-4">{student.name}</td>
                <td className="py-3 px-4">
                  <input
                    type="radio"
                    name={`status-${student.id}`}
                    checked={student.status === 'present'}
                    onChange={() => handleStatusChange(index, 'present')}
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="radio"
                    name={`status-${student.id}`}
                    checked={student.status === 'absent'}
                    onChange={() => handleStatusChange(index, 'absent')}
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="radio"
                    name={`status-${student.id}`}
                    checked={student.status === 'permission'}
                    onChange={() => handleStatusChange(index, 'permission')}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Submit Attendance
        </button>
      </div>
    </div>
  );
};

export default StudentAttendance;
