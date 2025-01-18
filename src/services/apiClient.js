import axios from 'axios';

// URL base para la API
const baseURL = 'https://laboratorio3-5459.restdb.io/rest/';
const apiKey = '64a57c2b86d8c50fe6ed8fa5';

// Crear una instancia de axios
const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'x-apikey': apiKey
  }
});

export default apiClient;
