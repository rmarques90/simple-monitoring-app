const fetch = require('node-fetch');

const makeRequest = async (urlToRequest, headersToRequest = {}) => {
    try {
        const response = await fetch(urlToRequest, {
            method: 'GET',
            headers: headersToRequest
        })

        return response.ok;
    } catch (error) {
        console.error(error);
        return false;
    }
}

module.exports = {
    makeRequest
}