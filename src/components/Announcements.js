import React, { useState } from 'react';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([
        {
            id: 1,
            title: 'Department Meeting',
            details: 'A meeting will be held in Room 101 at 10:00 AM on 20th Nov.',
            date: '2024-11-15',
        },
        {
            id: 2,
            title: 'Exam Schedule Update',
            details: 'The midterm exam schedule has been updated. Check the notice board.',
            date: '2024-11-12',
        },
    ]);

    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        details: '',
    });

    const handleAddAnnouncement = () => {
        if (newAnnouncement.title && newAnnouncement.details) {
            const newEntry = {
                id: announcements.length + 1,
                title: newAnnouncement.title,
                details: newAnnouncement.details,
                date: new Date().toISOString().split('T')[0], // current date
            };
            setAnnouncements([...announcements, newEntry]);
            setNewAnnouncement({ title: '', details: '' }); // Reset the form
        } else {
            alert('Please fill out all fields.');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Announcements</h1>

            {/* Add Announcement Section */}
            <div className="bg-white shadow rounded-lg p-5 mb-6">
                <h2 className="text-2xl font-bold mb-4">Add Announcement</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Title</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-2"
                        placeholder="Enter the title"
                        value={newAnnouncement.title}
                        onChange={(e) =>
                            setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                        }
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Details</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-2"
                        placeholder="Enter the details"
                        rows="4"
                        value={newAnnouncement.details}
                        onChange={(e) =>
                            setNewAnnouncement({
                                ...newAnnouncement,
                                details: e.target.value,
                            })
                        }
                    ></textarea>
                </div>
                <button
                    onClick={handleAddAnnouncement}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                    Add Announcement
                </button>
            </div>

            {/* View Announcements Section */}
            <div className="bg-white shadow rounded-lg p-5">
                <h2 className="text-2xl font-bold mb-4">All Announcements</h2>
                {announcements.length > 0 ? (
                    <table className="w-full border-collapse border border-gray-200">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="border border-gray-300 p-2">Title</th>
                            <th className="border border-gray-300 p-2">Details</th>
                            <th className="border border-gray-300 p-2">Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {announcements.map((announcement) => (
                            <tr key={announcement.id} className="hover:bg-gray-100">
                                <td className="border border-gray-300 p-2">
                                    {announcement.title}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {announcement.details}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {announcement.date}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500">No announcements to display.</p>
                )}
            </div>
        </div>
    );
};

export default Announcements;
