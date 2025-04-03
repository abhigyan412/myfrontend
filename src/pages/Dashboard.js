import { useState, useEffect } from "react";
import api from "../api";

function Dashboard() {
    const [documents, setDocuments] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState("");
    const [categoryUpdates, setCategoryUpdates] = useState({});

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await api.get("/documents/");
            setDocuments(response.data);
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/documents/${id}/`);
            setDocuments(documents.filter((doc) => doc.id !== id));
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadMessage("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const token = localStorage.getItem("access_token");
            const response = await api.post("/documents/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            
            setUploadMessage(`Upload successful! Category: ${response.data.category}`);
            setSelectedFile(null);
            fetchDocuments(); // Refresh document list
        } catch (error) {
            setUploadMessage("Upload failed. Please try again.");
        }
    };

    const handleCategoryChange = (id, newCategory) => {
        setCategoryUpdates((prev) => ({ ...prev, [id]: newCategory }));
    };

    const updateCategory = async (id) => {
        if (!categoryUpdates[id]) return;
        try {
            await api.patch(`/documents/${id}/update_category/`, { category: categoryUpdates[id] });
            fetchDocuments(); // Refresh list
        } catch (error) {
            console.error("Error updating category:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h2 className="text-3xl font-semibold mb-4">Dashboard</h2>
            
            {/* File Upload Section */}
            <div className="mb-6 bg-white p-4 rounded shadow w-1/2">
                <h3 className="text-lg font-semibold mb-2">Upload a Document</h3>
                <input type="file" onChange={handleFileChange} className="p-2 border rounded w-full" />
                <button onClick={handleUpload} className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full">Upload</button>
                {uploadMessage && <p className="mt-2 text-blue-600">{uploadMessage}</p>}
            </div>

            {/* Document List Table */}
            <div className="w-3/4 bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Your Documents</h3>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2">Filename</th>
                            <th className="p-2">Category</th>
                            <th className="p-2">Confidence Score</th>
                            <th className="p-2">Uploaded</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc) => (
                            <tr key={doc.id} className="border-b">
                                <td className="p-2">{doc.file}</td>
                                <td className="p-2">
                                    <select
                                        value={categoryUpdates[doc.id] || doc.category}
                                        onChange={(e) => handleCategoryChange(doc.id, e.target.value)}
                                        className="border p-1 rounded"
                                    >
                                        <option value="tax">Tax</option>
                                        <option value="identity">Identity</option>
                                        <option value="medical">Medical</option>
                                        <option value="real_estate">Real Estate</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <button
                                        onClick={() => updateCategory(doc.id)}
                                        className="ml-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                    >
                                        Save
                                    </button>
                                </td>
                                <td className="p-2">{(doc.confidence_score * 100).toFixed(2)}%</td>
                                <td className="p-2">{new Date(doc.uploaded_at).toLocaleString()}</td>
                                <td className="p-2">
                                    <button onClick={() => handleDelete(doc.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;