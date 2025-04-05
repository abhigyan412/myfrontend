import { useState, useEffect, useCallback } from "react";
import api from "../api";

import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                navigate("/login");
                return;
            }
    
            try {
                
                await api.get("/protected-check/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } catch (err) {
                console.error("Token expired or invalid:", err);
                localStorage.removeItem("access_token");
                navigate("/login");
            }
        };
    
        checkAuth();
    }, [navigate]);
    
    
    const [documents, setDocuments] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState("");
    const [categoryUpdates, setCategoryUpdates] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [ordering, setOrdering] = useState("");
    

    
    
    const fetchDocuments = useCallback(async () => {
        try {
            let url = "/documents/";
            const params = [];

            if (searchTerm.trim()) {
                params.push(`search=${searchTerm}`);
            }

            if (filterCategory !== "all") {
                params.push(`category=${filterCategory}`);
            }

            if (ordering) {
                params.push(`ordering=${ordering}`);
            }

            if (params.length > 0) {
                url += "?" + params.join("&");
            }

            const response = await api.get(url);
            setDocuments(response.data);
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    }, [searchTerm, filterCategory, ordering]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/documents/${id}/`);
            fetchDocuments();
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
            fetchDocuments();
        } catch (error) {
            setUploadMessage("Upload failed. Please try again.");
        }
    };

    const handleCategoryChange = (id, newCategory) => {
        setCategoryUpdates((prev) => ({ ...prev, [id]: newCategory }));
    };

    const updateCategory = async (id) => {
        const doc = documents.find((d) => d.id === id);
        const newCategory = categoryUpdates[id] || doc.category;
    
        try {
            await api.patch(`/documents/${id}/update_category/`, {
                category: newCategory,
            });
    
            setCategoryUpdates((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
    
            
            setFilterCategory("all"); 
            fetchDocuments();
        } catch (error) {
            console.error("Error updating category:", error);
        }
    };
    
    

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h2 className="text-3xl font-semibold mb-4">Dashboard</h2>

            {/* File Upload */}
            <div className="mb-6 bg-white p-4 rounded shadow w-1/2">
                <h3 className="text-lg font-semibold mb-2">Upload a Document</h3>
                <input type="file" onChange={handleFileChange} className="p-2 border rounded w-full" />
                <button onClick={handleUpload} className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full">Upload</button>
                {uploadMessage && <p className="mt-2 text-blue-600">{uploadMessage}</p>}
            </div>

            {/* Search, Filter & Sort */}
            <div className="flex gap-4 w-3/4 mb-4">
                <input
                    type="text"
                    placeholder="Search by filename or extracted text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-1/3 p-2 border rounded"
                />
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="all">All Categories</option>
                    <option value="tax">Tax</option>
                    <option value="identity">Identity</option>
                    <option value="medical">Medical</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="other">Other</option>
                </select>
                <select
                    value={ordering}
                    onChange={(e) => setOrdering(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">Sort By</option>
                    <option value="uploaded_at">Date (Newest First)</option>
                    <option value="-uploaded_at">Date (Oldest First)</option>
                    <option value="confidence_score">Confidence ↑</option>
                    <option value="-confidence_score">Confidence ↓</option>
                </select>
            </div>

            {/* Document List */}
            <div className="w-3/4 bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Your Documents</h3>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2">Filename</th>
                            <th className="p-2">Category</th>
                            <th className="p-2">Confidence</th>
                            <th className="p-2">Uploaded</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.length > 0 ? documents.map((doc) => (
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
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-gray-500">No documents found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;
