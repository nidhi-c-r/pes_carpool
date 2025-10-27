import axios from 'axios';

// 1. Create the base Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api" // Your backend API URL
});

// 2. Add a request interceptor
// This function runs *before* every single request you make using 'api'
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem("token");
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config; // Continue with the request
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// 3. Add a response interceptor (This part is crucial)
// This automatically handles expired tokens
api.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.log("Token expired or invalid. Logging out.");
      
      // Remove the bad token
      localStorage.removeItem("token"); 
      
      // Reload the page to force the user to the login screen
      // This also clears any user state in React
      window.location.href = '/login'; 
    }
    
    // Return the error so the component can handle it (e.g., show a message)
    return Promise.reject(error);
  }
);

export default api;