import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Signup() {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/signup/", formData);
            navigate("/login"); // Redirect after successful signup
        } catch (error) {
            setError(error.response?.data?.message || "Signup failed. Try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
                <h2 className="text-2xl font-semibold text-center">Sign Up</h2>
                {error && <p className="text-red-500">{error}</p>}
                <input type="text" name="username" placeholder="Username" onChange={handleChange} required className="w-full p-2 mt-2 border rounded" />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full p-2 mt-2 border rounded" />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full p-2 mt-2 border rounded" />
                <button type="submit" className="w-full bg-blue-500 text-white p-2 mt-4 rounded">Sign Up</button>
            </form>
        </div>
    );
}

export default Signup;
