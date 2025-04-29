<template>
  <div id="app">
    <button @click="goHome" class="btn-volver">Volver</button>

    <h1>Transacciones de Criptomonedas</h1>

    <div class="transaction-form">
      <label for="action">Acción:</label>
      <select v-model="action" id="action">
        <option value="purchase">Compra</option>
        <option value="sale">Venta</option>
      </select>

      <label for="cryptoCode">Criptomoneda:</label>
      <select v-model="cryptoCode" id="cryptoCode" @change="updateAvailableCrypto">
        <option v-for="crypto in cryptos" :key="crypto.code" :value="crypto.code">
          {{ crypto.name }}
        </option>
      </select>
      
      <label for="cryptoAmount">Cantidad de Criptomoneda:</label>
      <input 
        type="number" 
        v-model="cryptoAmount" 
        id="cryptoAmount" 
        placeholder="Cantidad" 
        @input="fetchMoneyValue" 
        :max="action === 'sale' ? availableCrypto : null"
      />

      <label for="money">Precio (ARS):</label>
      <input type="number" v-model="money" id="money" placeholder="Monto en ARS" disabled />

      <button @click="handleTransaction">{{ action === 'purchase' ? 'Comprar' : 'Vender' }}</button>
    </div>

    <div class="available-crypto">
      <h2>Balance de Criptomonedas</h2>
      <ul>
        <li v-for="(amount, code) in allAvailableCryptos" :key="code">
          {{ getCryptoName(code) }}: {{ amount }} {{ code }}
        </li>
      </ul>
    </div>

  </div>
    <div v-if="transactionResponse" class="modal-overlay" @click="closeModal">
  <div :class="modalClass()" @click.stop>
    <h3>Respuesta de la Transacción</h3>
    <p>{{ transactionResponse }}</p>
    <button @click="closeModal">Cerrar</button>
  </div>
</div>

<div v-if="error" class="modal-overlay" @click="closeErrorModal">
  <div :class="modalClass()" @click.stop>
    <h2>Error</h2>
    <p>{{ error }}</p>
    <button @click="closeErrorModal">Cerrar</button>
  </div>
</div>
</template>

<script>
import apiClient from '@/services/api';
import { getCryptoPrice, getTransactions } from '../services/api.js';

export default {
  data() {
    return {
      userId: localStorage.getItem('userId') || '',
      cryptoCode: '',
      cryptoAmount: null,
      money: null,
      action: 'purchase',
      cryptos: [],
      availableCrypto: 0,
      allAvailableCryptos: {}, 
      transactionResponse: null,
      error: null,
    };
  },
  methods: {
    async fetchCryptos() {
      this.cryptos = [
        { code: 'BTC', name: 'Bitcoin' },
        { code: 'ETH', name: 'Ethereum' },
        { code: 'USDT', name: 'Tether' },
        { code: 'LTC', name: 'Litecoin' },
        { code: 'DOGE', name: 'Dogecoin' },
      ];
      await this.fetchAllCryptoAvailability();
    },

    goHome() {
      this.$router.push('/home'); 
    },
    async fetchAvailableCrypto() {
      try {
        const transactions = await getTransactions(this.userId);
        const cryptoAmounts = {};

        transactions.forEach(({ crypto_code, crypto_amount, action }) => {
          const amount = parseFloat(crypto_amount);
          if (!cryptoAmounts[crypto_code]) cryptoAmounts[crypto_code] = 0;
          cryptoAmounts[crypto_code] += action === 'purchase' ? amount : -amount;
        });

        this.availableCrypto = cryptoAmounts[this.cryptoCode] || 0;
        return cryptoAmounts; 
      } catch (err) {
        this.error = 'Error al obtener criptomonedas disponibles: ' + err.message;
      }
    },

    async fetchAllCryptoAvailability() {
      const availability = await this.fetchAvailableCrypto();
      this.allAvailableCryptos = availability;
    },

    getCryptoName(code) {
      const crypto = this.cryptos.find((c) => c.code === code);
      return crypto ? crypto.name : code;
    },

    async fetchMoneyValue() {
      if (this.cryptoAmount && this.cryptoCode) {
        try {
          const priceData = await getCryptoPrice(this.cryptoCode, 'ARS', this.cryptoAmount);
          const priceInARS = priceData.satoshitango.ask || priceData.satoshitango.bid;

          if (!priceInARS) throw new Error('Precio no disponible');
          this.money = this.cryptoAmount * priceInARS;
        } catch (err) {
          this.error = 'Error al obtener el precio de la criptomoneda: ' + err.message;
        }
      }
    },

    async handleTransaction() {
    this.transactionResponse = null;
    this.error = null;

    if (!this.userId || !this.cryptoCode || !this.cryptoAmount || !this.money) {
      this.error = 'Por favor, complete todos los campos.';
      return;
    }

    if (this.action === 'sale' && this.cryptoAmount > this.availableCrypto) {
      this.error = `No puede vender más de lo disponible (${this.availableCrypto} ${this.cryptoCode}).`;
      return;
    }

    try {
      if (this.action === 'purchase') {
        await this.createPurchase(this.userId, this.cryptoCode, this.cryptoAmount, this.money, new Date());
      } else if (this.action === 'sale') {
        await this.createSale(this.userId, this.cryptoCode, this.cryptoAmount, this.money, new Date());
      }

      this.transactionResponse = this.action === 'purchase' ? 'Compra completada' : 'Venta completada';
      await this.fetchAllCryptoAvailability();
    } catch (err) {
      this.error = 'Error al crear la transacción: ' + err.message;
    }
  },

  closeModal() {
    this.transactionResponse = null;
    this.$router.push('/home'); 
  },

  closeErrorModal() {
    this.error = null;
  },
  modalClass() {
  if (this.transactionResponse) {
    return 'modal-content success'; 
  } else if (this.error) {
    return 'modal-content error';
  }
  return 'modal-content'; 
},
    async createPurchase(userId, cryptoCode, cryptoAmount, money, datetime) {
      const data = {
        user_id: userId,
        action: 'purchase',
        crypto_code: cryptoCode,
        crypto_amount: cryptoAmount,
        money: money,
        datetime: datetime,
      };
      const response = await apiClient.post('transactions', data);
      return response.data;
    },

    async createSale(userId, cryptoCode, cryptoAmount, money, datetime) {
      const data = {
        user_id: userId,
        action: 'sale',
        crypto_code: cryptoCode,
        crypto_amount: cryptoAmount,
        money: money,
        datetime: datetime,
      };
      const response = await apiClient.post('transactions', data);
      return response.data;
    },

    async updateAvailableCrypto() {
      if (this.cryptoCode) {
        await this.fetchAvailableCrypto();
      }
    },
  },
  mounted() {
    this.fetchCryptos();
  },
};
</script>

<style scoped>
#app {
  font-family: 'Inter', sans-serif;
  background-color: #1E1E2E;
  color: #D9E1E8;
  padding: 30px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 15px;
  color: #7DC4E4;
}

h2 {
  font-size: 1.5em;
  margin: 20px 0;
  color: #A6ADC8;
  text-align: center; 
  display: inline-block; 
  width: 100%; 
  font-weight: 600; 
  position: relative;
  padding-bottom: 10px; 
}

h2::after {
  content: ""; 
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px; 
  background: linear-gradient(90deg, #7DC4E4, #A6ADC8, #7DC4E4); 
  border-radius: 3px; 
  transform: scaleX(0); 
  transform-origin: center; 
  transition: transform 0.3s ease-in-out; 
}

h2:hover::after {
  transform: scaleX(1); 
}
.transaction-form, .available-crypto, .response, .error {
  background: #2B2B3A;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 20px;
  margin: 15px 0;
  width: 100%;
  max-width: 400px;
  transition: all 0.3s ease;
}

.transaction-form:hover, .available-crypto:hover {
  transform: scale(1.05); 
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.4); 
  background-color: #3A3A4C; 
}

.transaction-form label {
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
  color: #D9E1E8;
  text-align: left;
}

.transaction-form input,
.transaction-form select {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  background: #3A3A4C;
  color: #D9E1E8;
  border: 1px solid #4A4A5D;
  border-radius: 8px;
  font-size: 1em;
  outline: none;
  box-sizing: border-box; 
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.transaction-form input[type="number"],
.transaction-form input[type="text"],
.transaction-form select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 100%; 
}

.transaction-form input[type="number"]::-webkit-outer-spin-button,
.transaction-form input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.transaction-form input[type="number"] {
  -moz-appearance: textfield; 
}

.transaction-form input:focus,
.transaction-form select:focus {
  border-color: #7DC4E4;
  box-shadow: 0 0 5px rgba(125, 196, 228, 0.5);
}

button {
  width: 100%;
  padding: 12px;
  font-size: 1em;
  font-weight: 600;
  background: #7DC4E4;
  color: #1E1E2E;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

button:hover {
  background: #66A8C2;
  transform: translateY(-3px);
}

button:active {
  transform: translateY(0);
}

.available-crypto ul {
  list-style: none;
  padding: 0;
}

.available-crypto li {
  background: #3A3A4C;
  color: #D9E1E8;
  padding: 10px 15px;
  margin-bottom: 8px;
  border-radius: 8px;
  display: flex;
  justify-content: center; 
  align-items: center; 
  font-weight: 500;
  text-align: center; 
}
.response, .error {
  text-align: left;
  border-left: 5px solid;
  padding: 15px;
  font-size: 0.9em;
}

.response {
  border-color: #66CDAA; 
  background: #2A3C36; 
  color: #D1F7D8; 
}

.error {
  border-color: #FF6B6B; 
  background: #3C2B2B; 
  color: #FFBABA; 
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #2A3C36; 
  color: #D1F7D8; 
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.modal-content button {
  padding: 10px;
  background: #a8a8a8; 
  color: #1E1E2E;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
}

.modal-content button:hover {
  background: #55B89A;
}

.modal-content.success {
  background: #66CDAA;
  color: #1E1E2E; 
}

.modal-content.error {
  background: #FF6B6B;
  color: #1E1E2E;
}

.btn-volver {
  position: fixed; 
  top: 20px; 
  right: 20px; 
  z-index: 1000; 
  background-color: #000000; 
  color: white;
  padding: 12px 20px; 
  font-size: 1.2rem; 
  font-family: 'Roboto', sans-serif; 
  border: none; 
  border-radius: 6px; 
  cursor: pointer; 
  transition: background-color 0.3s ease, transform 0.3s ease; 
  width: auto; 
  white-space: nowrap; 
}

.btn-volver:hover {
  background-color: #5D9BB5; 
  transform: translateY(-2px); 
}

.btn-volver:active {
  transform: translateY(1px); 
}

</style>
