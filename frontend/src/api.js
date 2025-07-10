import axios from "axios";

const instance = axios.create({
  baseURL: "http://smart-attend.onrender.com/", // 👈 change this to your backend URL
  withCredentials: true, // send cookies if using sessions/auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: interceptors for auth error handling/logging
// instance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error("API Error:", error.response?.data || error.message);
//     return Promise.reject(error);
//   }
// );

export default instance;
