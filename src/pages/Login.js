import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async () => {
        try {
            const response = await api.post("/auth/login/", credentials);
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);
            navigate("/dashboard"); 
        } catch (error) {
            setError("Invalid username or password.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <input type="text" name="username" placeholder="Username" value={credentials.username} onChange={handleChange} className="mb-2 p-2 border rounded" />
            <input type="password" name="password" placeholder="Password" value={credentials.password} onChange={handleChange} className="mb-2 p-2 border rounded" />
            <button onClick={handleLogin} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Login</button>
            {error && <p className="mt-2 text-red-500">{error}</p>}
        </div>
    );
}

export default Login;

