const axios = require('axios');
const httpClient = axios.create({
    timeout: 8000,
    headers: {
        'User-Agent': 'FitnessTrainingProgressPlatform/1.0 (student project)'
    }
});

async function safeRequest(requestFn, sourceName) {
    try {
        const response = await requestFn();
        return { ok: true, data: response.data };
    } catch (err) {
        let message = `${sourceName} is unavailable right now.`;
        if (err.code === 'ECONNABORTED') {
            message = `${sourceName} timed out. Please try again.`;
        } else if (err.response) {
            message = `${sourceName} returned an error (status ${err.response.status}).`;
        } else if (err.request) {
            message = `${sourceName} did not respond. Check your connection and try again.`;
        }
        return { ok: false, error: message };
    }
}

module.exports = { httpClient, safeRequest };