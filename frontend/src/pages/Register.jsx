import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Components (adjust imports based on your library)
const Input = ({ ...props }) => <input {...props} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />;
const Label = ({ children, ...props }) => <label {...props} className="block text-gray-700 text-sm font-bold mb-2">{children}</label>;
const Button = ({ children, ...props }) => <button {...props} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">{children}</button>;

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    srn: '',
    role: 'passenger', // Default role
    user_type: 'student', // Default user_type
    vehicle_model: '',
    license_plate: '',
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

    const { vehicle_model, license_plate, ...basePayload } = formData;
    
    let finalPayload = basePayload;
    
    // 1. CRITICAL: Convert role and user_type to lowercase before sending
    finalPayload = {
      ...finalPayload,
      role: finalPayload.role.toLowerCase(),
      user_type: finalPayload.user_type.toLowerCase() 
    }

    if (finalPayload.role === 'driver') {
        if (!vehicle_model || !license_plate) {
            setError("Driver registration requires Vehicle Model and License Plate.");
            return;
        }
        finalPayload = { ...finalPayload, vehicle_model, license_plate };
    }
    
    try {
      // 2. Register user
      await axios.post(
        "http://127.0.0.1:8000/api/auth/register",
        finalPayload
      );

      setSuccess("Registration successful! Redirecting to login...");

      // 3. Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail && typeof detail === 'string') {
        setError(detail); 
      } else {
        setError("Registration failed. Check your data.");
      }
      console.error("Registration failed:", err.response);
    }
  };

  const isDriver = formData.role === 'driver';

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-xl rounded-lg w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Create an Account</h2>
        
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

        {/* --- Core Fields --- */}
        <div className="space-y-4 mb-6">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
          
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          
          <Label htmlFor="password">Password *</Label>
          <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
          
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
          
          <Label htmlFor="srn">SRN (PESXUGXXXXX) *</Label>
          <Input id="srn" name="srn" type="text" value={formData.srn} onChange={handleChange} required placeholder="PES2UG23CS001" />
        </div>
        
        {/* --- Role Selection --- */}
        <div className="mb-6 border-t pt-4">
            <Label>Register as a: *</Label>
            <div className="flex space-x-6">
                <label className="inline-flex items-center">
                    <input type="radio" name="role" value="passenger" checked={formData.role === 'passenger'} onChange={handleChange} className="form-radio" />
                    <span className="ml-2">Passenger</span>
                </label>
                <label className="inline-flex items-center">
                    <input type="radio" name="role" value="driver" checked={formData.role === 'driver'} onChange={handleChange} className="form-radio" />
                    <span className="ml-2">Driver</span>
                </label>
            </div>
        </div>

        {/* --- User Type (Student/Professor) --- */}
         <div className="mb-6">
            <Label>User Type: *</Label>
            <div className="flex space-x-6">
                <label className="inline-flex items-center">
                    <input type="radio" name="user_type" value="student" checked={formData.user_type === 'student'} onChange={handleChange} className="form-radio" />
                    <span className="ml-2">Student</span>
                </label>
                <label className="inline-flex items-center">
                    <input type="radio" name="user_type" value="professor" checked={formData.user_type === 'professor'} onChange={handleChange} className="form-radio" />
                    <span className="ml-2">Professor</span>
                </label>
            </div>
        </div>

        {/* --- DRIVER-SPECIFIC FIELDS (Conditional) --- */}
        {isDriver && (
            <div className="space-y-4 mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h3 className="text-lg font-semibold text-blue-700">Vehicle Details</h3>
                
                <Label htmlFor="vehicle_model">Vehicle Model *</Label>
                <Input id="vehicle_model" name="vehicle_model" type="text" value={formData.vehicle_model} onChange={handleChange} required={isDriver} placeholder="Maruti Swift, Honda City, etc." />
                
                <Label htmlFor="license_plate">License Plate No. *</Label>
                <Input id="license_plate" name="license_plate" type="text" value={formData.license_plate} onChange={handleChange} required={isDriver} placeholder="KA-01-AB-1234" />
            </div>
        )}

        <div className="flex items-center justify-between">
          <Button type="submit">
            Register
          </Button>
          <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="/login"
          >
            Already have an account?
          </a>
        </div>
      </form>
    </div>
  );
};

export default Register;