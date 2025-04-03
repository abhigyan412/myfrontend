import { useState } from "react";
import api from "../api";

function Upload() {
    const [file, setFile] = useState(null);
    const [category, setCategory] = useState("");
    const [message, setMessage] = useState("");

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);

        try {
            const response = await api.post("/documents/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 201) {
                setMessage("File uploaded successfully!");
                setFile(null);
                setCategory("");
            }
        } catch (error) {
            setMessage("Upload failed. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
            <input type="file" onChange={handleFileChange} className="mb-2 p-2 border rounded" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="mb-2 p-2 border rounded">
                <option value="">Select Category</option>
                <option value="Tax">Tax</option>
                <option value="Identity">Identity</option>
                <option value="Medical">Medical</option>
            </select>
            <button onClick={handleUpload} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Upload
            </button>
            {message && <p className="mt-2 text-red-500">{message}</p>}
        </div>
    );
}

export default Upload;
