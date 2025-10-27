import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    srn: '',
    role: 'passenger' // Default role
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Check if passwords match (if you have a 'confirm password' field)
    // if (formData.password !== formData.confirmPassword) {
    //   setError("Passwords do not match");
    //   return;
    // }

    try {
      // 2. We use axios directly for registration
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/register",
        formData // Send the form data object as JSON
      );

      // 3. Handle success
      setSuccess("Registration successful! Redirecting to login...");
      console.log("Registration successful:", response.data);

      // 4. Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      if (err.response && err.response.data.detail) {
        setError(err.response.data.detail); // e.g., "Email or SRN already registered"
      } else {
        setError("Registration failed. Please try again.");
      }
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create an Account</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="srn">
            SRN
          </label>
          <input
            id="srn"
            name="srn"
            type="text"
            value={formData.srn}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Register as a:
          </label>
          <div className="flex">
            <label className="inline-flex items-center mr-6">
              <input
                type="radio"
                name="role"
                value="passenger"
                checked={formData.role === 'passenger'}
                onChange={handleChange}
                className="form-radio"
              />
              <span className="ml-2">Passenger</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="role"
                value="driver"
                checked={formData.role === 'driver'}
                onChange={handleChange}
                className="form-radio"
              />
              <span className="ml-2">Driver</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Register
          </button>
          <a 
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" 
            href="/login" // Link to your login page
          >
            Already have an account?
          </a>
        </div>
      </form>
    </div>
  );
};

export default Register;