import axios from 'axios';

// URL base para la API
const baseURL = 'https://laboratorio3-5459.restdb.io/rest/';

// APIKEY para acceder a la API de RestDB
const apiKey = '64a57c2b86d8c50fe6ed8fa5';

// Crear una instancia de axios con la configuración de la API
const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'x-apikey': apiKey
  }
  
});
export { apiClient };
// Función para obtener todas las transacciones de un usuario
export const getTransactions = async (userId) => {
  try {
    const response = await apiClient.get(`transactions?q={"user_id":"${userId}"}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo las transacciones:', error);
    throw error;
  }
};

// Función para crear una transacción de compra
export const createPurchase = async (userId, cryptoCode, cryptoAmount, money, datetime) => {
  const data = {
    user_id: userId,
    action: 'purchase',
    crypto_code: cryptoCode,
    crypto_amount: cryptoAmount,
    money: money,
    datetime: datetime
  };

  try {
    const response = await apiClient.post('transactions', data);
    return response.data;
  } catch (error) {
    console.error('Error creando la compra:', error);
    throw error;
  }
};

// Función para crear una transacción de venta
export const createSale = async (userId, cryptoCode, cryptoAmount, money, datetime) => {
  const data = {
    user_id: userId,
    action: 'sale',
    crypto_code: cryptoCode,
    crypto_amount: cryptoAmount,
    money: money,
    datetime: datetime
  };

  try {
    const response = await apiClient.post('transactions', data);
    return response.data;
  } catch (error) {
    console.error('Error creando la venta:', error);
    throw error;
  }
};



// Función para actualizar una transacción
export const updateTransaction = async (transactionId, updatedData) => {
  try {
    const response = await apiClient.patch(`transactions/${transactionId}`, updatedData);
    return response.data;
  } catch (error) {
    console.error('Error actualizando la transacción:', error);
    throw error;
  }
};

// Función para eliminar una transacción
export const deleteTransaction = async (transactionId) => {
  try {
    const response = await apiClient.delete(`transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Error eliminando la transacción:', error);
    throw error;
  }
};

// Función para obtener el precio de una criptomoneda de un exchange
export const getCryptoPrice = async (coin, fiat, volumen) => {
  // Construir la URL de la API con los parámetros coin, fiat y volumen
  const url = `https://criptoya.com/api/${coin}/${fiat}/${volumen}`;

  try {
    // Realizar la solicitud GET a la API
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json', // No es necesario el API key para esta consulta
      }
    });

    // Retornar los datos de la respuesta
    return response.data;
  } catch (error) {
    // Manejar el error si ocurre
    console.error('Error obteniendo el precio de la criptomoneda:', error);
    throw error;
  }
};
export default apiClient;
