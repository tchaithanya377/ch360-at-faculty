import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher, faUserGraduate, faClipboardList, faCalendarAlt, faFileAlt, faComments, faChartLine, faClock } from '@fortawesome/free-solid-svg-icons';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FacultyDashboard = () => {
  const [facultyName, setFacultyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [userUid, setUserUid] = useState(null);

  const coursePerformanceData = {
    labels: ['Math 101', 'Science 102', 'History 201'],
    datasets: [
      {
        label: 'Student Performance',
        data: [85, 78, 92],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Course Performance Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const timetable = [
    { time: '09:00 AM - 10:00 AM', course: 'Math 101' },
    { time: '10:00 AM - 11:00 AM', course: 'Science 102' },
    { time: '11:00 AM - 12:00 PM', course: 'History 201' },
    { time: '01:00 PM - 02:00 PM', course: 'Art 101' },
    { time: '02:00 PM - 03:00 PM', course: 'Physical Education 101' },
  ];

  useEffect(() => {
    const auth = getAuth();
    
    // Listen to authentication state changes to get the user UID
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUid(user.uid); // Set the UID when the user is logged in
      } else {
        setUserUid(null); // Clear UID if the user is not logged in
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  useEffect(() => {
    if (!userUid) {
      console.error("UID is missing");
      setLoading(false); // Stop loading if UID is missing
      return; // Early return to prevent calling Firestore with an invalid UID
    }

    const fetchFacultyData = async () => {
      try {
        const db = getFirestore();
        const docRef = doc(db, 'faculty', userUid); // Reference to the faculty document using uid
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFacultyName(docSnap.data().name); // Set the faculty name from the Firestore document
        } else {
          console.log("No such document!");
        }

        setLoading(false); // Set loading to false after fetching data
      } catch (error) {
        console.error("Error fetching faculty data:", error);
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [userUid]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {loading ? 'Loading...' : facultyName}!</h1>
          <p className="text-gray-600">Here's an overview of your current academic responsibilities.</p>
        </div>
        <img src="/avatar.jpg" alt="Profile" className="w-16 h-16 rounded-full" />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-bold">Courses</h3>
          <p className="text-2xl text-blue-600 font-bold">5</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-bold">Students</h3>
          <p className="text-2xl text-green-600 font-bold">120</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-bold">Next Class</h3>
          <p className="text-xl">Math 101</p>
          <p className="text-gray-600">10:00 AM - 11:00 AM</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-bold">Upcoming Exams</h3>
          <p className="text-2xl text-red-600 font-bold">3</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Daily Class Timetable</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <ul>
            {timetable.map((classItem, index) => (
              <li key={index} className="py-2 border-b flex justify-between items-center">
                <div className="text-gray-600">{classItem.time}</div>
                <div className="text-gray-800 font-bold">{classItem.course}</div>
                <FontAwesomeIcon icon={faClock} className="text-blue-600" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
          <ul>
            <li className="py-2 border-b">
              <h3 className="text-lg font-bold">Math 101 - Assignment Graded</h3>
              <p className="text-gray-600">Assignment 1 has been graded and returned to students.</p>
            </li>
            <li className="py-2 border-b">
              <h3 className="text-lg font-bold">Science 102 - New Assignment</h3>
              <p className="text-gray-600">Assignment 2 has been posted and is due on April 15, 2024.</p>
            </li>
            <li className="py-2">
              <h3 className="text-lg font-bold">History 201 - Exam Scheduled</h3>
              <p className="text-gray-600">Midterm Exam is scheduled for May 5, 2024.</p>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Course Performance</h2>
          <Bar data={coursePerformanceData} options={options} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <ul>
            <li className="py-2 border-b">
              <h3 className="text-lg font-bold">Faculty Meeting</h3>
              <p className="text-gray-600">Meeting on April 10, 2024 to discuss curriculum changes.</p>
            </li>
            <li className="py-2 border-b">
              <h3 className="text-lg font-bold">Science Fair</h3>
              <p className="text-gray-600">Annual Science Fair on April 20, 2024. Volunteers needed.</p>
            </li>
            <li className="py-2">
              <h3 className="text-lg font-bold">Professional Development Workshop</h3>
              <p className="text-gray-600">Workshop on May 1, 2024 focused on modern teaching techniques.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="fixed bottom-0 right-0 m-6">
        <button className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700">
          <FontAwesomeIcon icon={faComments} className="text-2xl" />
        </button>
      </section>
    </div>
  );
};

export default FacultyDashboard;
