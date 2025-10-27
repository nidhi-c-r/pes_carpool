import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Components (adjust imports based on your library)
const Input = ({ ...props }) => <input {...props} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />;
const Label = ({ children, ...props }) => <label {...props} className="block text-gray-700 text-sm font-bold mb-2">{children}</label>;
const Button = ({ children, ...props }) => <button {...props} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">{children}</button>;

const DriverOnboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        origin: 'RR Nagar',
        destination: 'PES University',
        vehicle_model: '',
        license_plate: '',
        seats_available: 4,
        price: 50.00,
        distance_km: 15.0,
    });

    if (!user || user.role.toLowerCase() !== 'driver') {
        // Should be protected by App.jsx route guard, but safety check is good
        navigate('/'); 
        return null;
    }

    const handleChange = (e) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const payload = {
                ...formData,
                seats_available: parseInt(formData.seats_available),
            };

            // Use the new onboarding endpoint
            await axios.post('http://127.0.0.1:8000/api/auth/onboard-driver', payload, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            alert('Setup complete! You can now view and manage your rides.');
            navigate('/my-rides'); // Redirect to MyRides page
            
        } catch (err) {
            setError(err.response?.data?.detail || "Onboarding failed. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-xl rounded-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Welcome, Driver! Final Setup</h2>
                <p className="text-sm text-gray-600 mb-4">Provide your primary vehicle details and a sample route.</p>

                {error && <div className="text-red-500 mb-4">{error}</div>}

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-blue-700 border-b pb-1">Vehicle Details</h3>
                    <Label htmlFor="vehicle_model">Vehicle Model *</Label>
                    <Input id="vehicle_model" name="vehicle_model" type="text" value={formData.vehicle_model} onChange={handleChange} required />
                    
                    <Label htmlFor="license_plate">License Plate No. *</Label>
                    <Input id="license_plate" name="license_plate" type="text" value={formData.license_plate} onChange={handleChange} required />

                    <Label htmlFor="seats_available">Vehicle Capacity (Seats Available) *</Label>
                    <Input id="seats_available" name="seats_available" type="number" min="1" max="7" value={formData.seats_available} onChange={handleChange} required />
                </div>
                
                <div className="space-y-4 mt-6">
                    <h3 className="font-semibold text-lg text-blue-700 border-b pb-1">Sample Route (Your Default)</h3>
                    <Label htmlFor="origin">Origin *</Label>
                    <Input id="origin" name="origin" type="text" value={formData.origin} onChange={handleChange} required />
                    
                    <Label htmlFor="destination">Destination *</Label>
                    <Input id="destination" name="destination" type="text" value={formData.destination} onChange={handleChange} required />

                    <Label htmlFor="price">Price per Seat (₹) *</Label>
                    <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />

                    <Label htmlFor="distance_km">Distance (km) *</Label>
                    <Input id="distance_km" name="distance_km" type="number" step="0.1" value={formData.distance_km} onChange={handleChange} required />
                </div>

                <Button type="submit" disabled={loading} className="mt-6 w-full">
                    {loading ? "Completing Setup..." : "Complete Setup & Post First Ride"}
                </Button>
            </form>
        </div>
    );
};

export default DriverOnboard;