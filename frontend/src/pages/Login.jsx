import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { setUserAfterLogin } = useAuth(); // Get the function from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    try {
      // Get token
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/token",
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const { access_token } = response.data;
      localStorage.setItem("token", access_token);

      // Fetch user data using the new token
      try {
        const userResponse = await axios.get("http://127.0.0.1:8000/api/auth/me", {
          headers: { 'Authorization': `Bearer ${access_token}` }
        });
        // Set user in the AuthContext
        setUserAfterLogin(userResponse.data);
      } catch (userError) {
        console.error("Failed to fetch user data after login:", userError);
        localStorage.removeItem("token"); // Clean up bad token
        setError("Login succeeded but failed to load user data.");
        return; // Stop before navigating
      }

      // Navigate to the home page AFTER setting the user
      navigate('/');

    } catch (err) {
      if (err.response && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Login failed. Please try again.");
      }
      console.error("Login failed:", err);
    }
  };

    return (
     <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded">
         <h2 className="text-2xl font-bold mb-4">Login</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Sign In
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="/register" // Link to your register page
          >
            Create an Account
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;