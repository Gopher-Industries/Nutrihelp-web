import axios from 'axios';

// Module Owner: Harsh Kanojia (Junior Cyber Security Lead)

const API_Base = 'http://localhost:5000/api';

export const checkMedicalBreach = async (email) => {
    try {
        const response = await axios.post(`${API_Base}/security/medical-breach/breach-check`, { email });
        return response.data;
    } catch (error) {
        console.error("Error checking breach status:", error);
        throw error.response ? error.response.data : new Error('Network Error');
    }
};
