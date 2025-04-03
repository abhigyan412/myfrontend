import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function ViewDocument() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [category, setCategory] = useState("");

    useEffect(() => {
        const storedDocuments = JSON.parse(localStorage.getItem("documents")) || [];
        const doc = storedDocuments.find(doc => doc.id === id);
        if (doc) {
            setDocument(doc);
            setCategory(doc.category);
        }
    }, [id]);

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    const handleSaveCategory = () => {
        const storedDocuments = JSON.parse(localStorage.getItem("documents")) || [];
        const updatedDocuments = storedDocuments.map(doc =>
            doc.id === id ? { ...doc, category } : doc
        );
        localStorage.setItem("documents", JSON.stringify(updatedDocuments));
        navigate("/dashboard");
    };

    if (!document) return <p className="text-center mt-10">Document not found</p>;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h2 className="text-3xl font-semibold mb-4">View Document</h2>
            <div className="w-3/4 bg-white p-4 shadow rounded-lg">
                <p><strong>Filename:</strong> {document.name}</p>
                <p><strong>Uploaded:</strong> {document.uploadedAt}</p>
                <p><strong>Category:</strong> 
                    <select value={category} onChange={handleCategoryChange} className="ml-2 p-1 border rounded">
                        <option value="Tax">Tax</option>
                        <option value="Identity">Identity</option>
                        <option value="Medical">Medical</option>
                        <option value="Real Estate">Real Estate</option>
                    </select>
                </p>
                <button onClick={handleSaveCategory} className="mt-3 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                    Save Category
                </button>
            </div>
            <div className="w-3/4 mt-4 bg-white p-4 shadow rounded-lg">
                {document.type.includes("image") ? (
                    <img src={document.url} alt={document.name} className="max-w-full h-auto" />
                ) : (
                    <iframe src={document.url} title={document.name} className="w-full h-96"></iframe>
                )}
            </div>
        </div>
    );
}

export default ViewDocument;