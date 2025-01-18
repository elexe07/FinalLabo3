<template>
  <div id="app">
    <h1>Gestión de Transacciones de Criptomonedas</h1>

    <div class="transaction-form">
      <label for="action">Acción:</label>
      <select v-model="action" id="action">
        <option value="purchase">Compra</option>
        <option value="sale">Venta</option>
      </select>
      <label for="cryptoCode">Código de Criptomoneda:</label>
      <select v-model="cryptoCode" id="cryptoCode">
        <option v-for="crypto in cryptos" :key="crypto.code" :value="crypto.code">
          {{ crypto.name }}
        </option>
      </select>

      <label for="cryptoAmount">Cantidad de Criptomoneda:</label>
      <input type="number" v-model="cryptoAmount" id="cryptoAmount" placeholder="Cantidad" @input="fetchMoneyValue" />

      <label for="money">Dinero (ARS):</label>
      <input type="number" v-model="money" id="money" placeholder="Monto en ARS" disabled />

      <button @click="handleTransaction">Crear Transacción</button>
    </div>

    <div v-if="transactionResponse" class="response">
      <h3>Respuesta de la Transacción</h3>
      <pre>{{ transactionResponse }}</pre>
    </div>

    <div v-if="error" class="error">
      <h3>Error</h3>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script>
import apiClient from '@/services/api';
import { getCryptoPrice } from '../services/api.js'; // Importamos la función para obtener el precio
export default {
  data() {
    return {
      userId: localStorage.getItem('userId') || '', // Obtener ID de usuario del localStorage
      cryptoCode: '',
      cryptoAmount: null,
      money: null,
      action: 'purchase',
      cryptos: [], // Lista de criptomonedas
      transactionResponse: null,
      error: null,
    };
  },
  methods: {
    // Obtener criptomonedas disponibles
    async fetchCryptos() {
      this.cryptos = [
        { code: 'BTC', name: 'Bitcoin' },
        { code: 'ETH', name: 'Ethereum' },
        { code: 'USDT', name: 'Tether' },
        // Agrega más criptos aquí
      ];
    },

    // Obtener el precio en ARS de la criptomoneda seleccionada y calcular el monto
    async fetchMoneyValue() {
      if (this.cryptoAmount && this.cryptoCode) {
        try {
          // Llamamos a la función `getCryptoPrice` con los parámetros correctos
          const priceData = await getCryptoPrice(this.cryptoCode, 'ARS', this.cryptoAmount); // Pasamos 'cryptoCode', 'ARS', y 'cryptoAmount'
          
          // Imprimir los datos completos de la respuesta para verificar
          console.log(priceData); // Verifica lo que devuelve la API

          // Comprobamos si el campo 'ask' existe en la respuesta y lo usamos
          // Aquí tomamos el precio de la plataforma 'belo' como ejemplo
          const priceInARS = priceData.belo.ask || priceData.belo.bid;

          // Si no encontramos un precio, manejamos el error
          if (!priceInARS) {
            throw new Error('Precio no disponible');
          }

          // Calculamos el monto en ARS
          this.money = this.cryptoAmount * priceInARS;
        } catch (err) {
          this.error = 'Error al obtener el precio de la criptomoneda: ' + err.message;
        }
      }
    },

    // Manejar la creación de la transacción
    async handleTransaction() {
      this.transactionResponse = null;
      this.error = null;

      console.log('userId:', this.userId);
      console.log('cryptoCode:', this.cryptoCode);
      console.log('cryptoAmount:', this.cryptoAmount);
      console.log('money:', this.money);
      console.log('action:', this.action);

      // Validación de los campos
      if (!this.userId || !this.cryptoCode || !this.cryptoAmount || !this.money) {
        this.error = 'Por favor, complete todos los campos.';
        return;
      }

      try {
        let response;
        // Llamada a la función de transacción según la acción seleccionada
        if (this.action === 'purchase') {
          response = await this.createPurchase(this.userId, this.cryptoCode, this.cryptoAmount, this.money, new Date());
        } else if (this.action === 'sale') {
          response = await this.createSale(this.userId, this.cryptoCode, this.cryptoAmount, this.money, new Date());
        }

        this.transactionResponse = response;
      } catch (err) {
        this.error = 'Error al crear la transacción: ' + err.message;
      }
    },

    // Función para crear una compra
    async createPurchase(userId, cryptoCode, cryptoAmount, money, datetime) {
      const data = {
        user_id: userId,
        action: 'purchase',
        crypto_code: cryptoCode,
        crypto_amount: cryptoAmount,
        money: money,
        datetime: datetime,
      };

      try {
        const response = await apiClient.post('transactions', data); // Realizamos la solicitud POST
        return response.data;
      } catch (error) {
        console.error('Error creando la compra:', error);
        throw error;
      }
    },

    // Función para crear una venta
    async createSale(userId, cryptoCode, cryptoAmount, money, datetime) {
      const data = {
        user_id: userId,
        action: 'sale',
        crypto_code: cryptoCode,
        crypto_amount: cryptoAmount,
        money: money,
        datetime: datetime,
      };

      try {
        const response = await apiClient.post('transactions', data); // Realizamos la solicitud POST
        return response.data;
      } catch (error) {
        console.error('Error creando la venta:', error);
        throw error;
      }
    },
  },


  mounted() {
    this.fetchCryptos(); // Cargar las criptomonedas disponibles al montar el componente
  },
};
</script>

<style scoped>
/* Estilos del componente */
</style>


<style scoped>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 20px;
}

h1 {
  color: #333;
}

.transaction-form {
  margin: 20px auto;
  width: 300px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.transaction-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.transaction-form input,
.transaction-form select {
  width: 100%;
  padding: 8px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.transaction-form button {
  width: 100%;
  padding: 10px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.transaction-form button:hover {
  background-color: #0056b3;
}

.response, .error {
  margin-top: 30px;
  padding: 10px;
  border-radius: 5px;
}

.response {
  background-color: #d4edda;
  color: #155724;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}

pre {
  background-color: #f1f1f1;
  padding: 10px;
  border-radius: 5px;
  text-align: left;
}
</style>
