import React, { useState } from 'react';

const RequestPage = () => {
    const [formData, setFormData] = useState({
        requestType: '',
        details: '',
        requestedBy: '',
    });

    const [submittedRequests, setSubmittedRequests] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.requestType || !formData.details || !formData.requestedBy) {
            alert('Please fill out all fields.');
            return;
        }

        const newRequest = {
            id: submittedRequests.length + 1,
            ...formData,
            status: 'Pending',
        };

        setSubmittedRequests((prev) => [...prev, newRequest]);
        setFormData({
            requestType: '',
            details: '',
            requestedBy: '',
        });
        alert('Request submitted successfully!');
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Submit a Request to HOD</h1>

            {/* Request Form */}
            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="mb-4">
                    <label className="block font-bold mb-2">Request Type</label>
                    <select
                        name="requestType"
                        value={formData.requestType}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    >
                        <option value="">Select a request type</option>
                        <option value="Leave Request">Leave Request</option>
                        <option value="Permission Request">Permission Request</option>
                        <option value="Resource Request">Resource Request</option>
                        <option value="General Help">General Help</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block font-bold mb-2">Details</label>
                    <textarea
                        name="details"
                        value={formData.details}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                        placeholder="Enter the details of your request"
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label className="block font-bold mb-2">Requested By</label>
                    <input
                        type="text"
                        name="requestedBy"
                        value={formData.requestedBy}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                        placeholder="Enter your name"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                    Submit Request
                </button>
            </form>

            {/* Submitted Requests Table */}
            {submittedRequests.length > 0 && (
                <div className="bg-white shadow rounded-lg p-5">
                    <h2 className="text-2xl font-bold mb-4">Submitted Requests</h2>
                    <table className="w-full border-collapse border border-gray-200">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="border border-gray-300 p-2">Request ID</th>
                            <th className="border border-gray-300 p-2">Type</th>
                            <th className="border border-gray-300 p-2">Details</th>
                            <th className="border border-gray-300 p-2">Requested By</th>
                            <th className="border border-gray-300 p-2">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {submittedRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-100">
                                <td className="border border-gray-300 p-2">{req.id}</td>
                                <td className="border border-gray-300 p-2">{req.requestType}</td>
                                <td className="border border-gray-300 p-2">{req.details}</td>
                                <td className="border border-gray-300 p-2">{req.requestedBy}</td>
                                <td className="border border-gray-300 p-2">{req.status}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RequestPage;
