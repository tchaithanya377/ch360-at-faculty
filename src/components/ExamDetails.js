import React from 'react';
import { useParams } from 'react-router-dom';
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

const ExamDetails = () => {
  const { id } = useParams();
  const exam = examData.find(exam => exam.id === parseInt(id));

  if (!exam) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Exam not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold mb-4 text-gray-800">{exam.courseName} ({exam.examType})</h2>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800"><FontAwesomeIcon icon={faCalendarAlt} /> Date & Time</h3>
          <p className="text-gray-600">{exam.date} at {exam.time}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800"><FontAwesomeIcon icon={faClipboardList} /> Location</h3>
          <p className="text-gray-600">{exam.location}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800"><FontAwesomeIcon icon={faFileAlt} /> Syllabus</h3>
          <p className="text-gray-600">{exam.syllabus}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800"><FontAwesomeIcon icon={faFileAlt} /> Exam Pattern</h3>
          <p className="text-gray-600">{exam.examPattern}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800"><FontAwesomeIcon icon={faClipboardList} /> Students</h3>
          <ul className="list-disc pl-5 text-gray-600">
            {exam.students.map(student => (
              <li key={student.id}>{student.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;
