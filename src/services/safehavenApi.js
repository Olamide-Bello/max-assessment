const axios = require('axios');
require('dotenv').config();

const SAFEHAVEN_BASE_URL = process.env.SAFEHAVEN_API_URL;
const CLIENT_ID = process.env.SAFEHAVEN_CLIENT_ID;
const CLIENT_ASSERTION = process.env.SAFEHAVEN_ENCODED_CLIENT_ASSERTION;

let accessToken = null;
let tokenExpiry = null;
let ibsClientId = null; //This is used for making requests to the Safehaven API. It is different from the OAuth Client ID

/**
 * Fetch a new access token from the Safehaven API.
 * @returns {Promise<string>} - The access token.
 */
const fetchAccessToken = async () => {
  try {
    const response = await axios.post(
      `${SAFEHAVEN_BASE_URL}/oauth2/token`,
      {
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_assertion: CLIENT_ASSERTION,
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Set the access token, expiry time and the IBS client ID
    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000; 
    ibsClientId = response.data.ibs_client_id;

    console.log("New access token fetched:", response.data);
    return accessToken;
  } catch (error) {
    console.error("Error fetching access token:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Get the current access token. If expired, fetch a new one.
 * @returns {Promise<string>} - The access token.
 */
const getAccessToken = async () => {
  if (!accessToken || Date.now() >= tokenExpiry) {
    console.log("Access token expired or not available. Fetching a new one...");
    await fetchAccessToken();
  }
  return accessToken;
};

/**
 * Create a virtual account using the Safehaven API.
 * @param {Object} payload - The payload for creating a virtual account.
 * @returns {Promise<Object>} - The response from the Safehaven API.
 */
const createVirtualAccount = async (payload) => {
  try {
    const token = await getAccessToken();

    const response = await axios.post(
      `${SAFEHAVEN_BASE_URL}/virtual-accounts`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ClientID: ibsClientId,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("virt res", response.data, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating virtual account_:", error);
    throw error;
  }
};

module.exports = {
  createVirtualAccount,
};