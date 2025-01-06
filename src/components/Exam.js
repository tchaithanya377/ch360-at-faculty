import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClipboardList, faFileAlt } from '@fortawesome/free-solid-svg-icons';

const examData = [
    {
      id: 1,
      courseName: 'Introduction to Computer Science',
      examType: 'Mid-term',
      date: '2024-08-15',
      time: '10:00 AM',
      location: 'Room 101',
      syllabus: 'Chapters 1-5',
      examPattern: 'Multiple Choice, Short Answer',
      students: [
        { id: 1, name: 'Alice Johnson' },
        { id: 2, name: 'Bob Smith' },
      ],
    },
    // Add more exam data here
  ];
  
const Exam = () => {
  const [exams, setExams] = useState(examData);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Exam Management</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <table className="w-full bg-white shadow-md rounded my-6">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Course Name</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Exam Type</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Date</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Time</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Location</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map(exam => (
              <tr key={exam.id} className="border-b hover:bg-gray-100">
                <td className="py-3 px-4">{exam.courseName}</td>
                <td className="py-3 px-4">{exam.examType}</td>
                <td className="py-3 px-4">{exam.date}</td>
                <td className="py-3 px-4">{exam.time}</td>
                <td className="py-3 px-4">{exam.location}</td>
                <td className="py-3 px-4">
                  <Link to={`/exams/${exam.id}`} className="text-blue-500 hover:underline">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Exam;
