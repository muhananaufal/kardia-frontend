import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/v1";

export const login = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email,
            password
        },
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error("Login failed:", error);
        throw new Error("Login failed. Please check your credentials.");
    }
}

export const register = async (email: string, password: string, password_confirmation: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/register`, {
            email,
            password,
            password_confirmation
        },
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error("Registration failed:", error);
        throw new Error("Registration failed. Please check your details.");
    }
}

export const logout = async (token: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/logout`, {},
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Logout successful:", response.data);
        return response.data;
    } catch (error) {
        console.error("Logout failed:", error);
        throw new Error("Logout failed. Please try again later.");
    }
}

export const fetchProfile = async (token: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Profile fetched successfully:", response.data);
         // Assuming the API returns the user profile data in response.data
         // Adjust this based on your actual API response structure
        return response.data;
    } catch (error) {
        console.error("Failed to fetch profile:", error);
        throw new Error("Failed to fetch profile. Please try again later.");
    }
}

export const updateProfile = async (token: string, userData: any) => {
    try {
        const response = await axios.put(`${BASE_URL}/profile`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: userData
        });
        console.log("Profile updated successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to update profile:", error);
        throw new Error("Failed to update profile. Please try again later.");
    }
}