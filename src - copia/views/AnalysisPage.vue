<template>
  <div class="analysis">
    <h1>Estado Actual de tus Finanzas</h1>

    <table class="crypto-table">
      <thead>
        <tr>
          <th>Criptomoneda</th>
          <th>Cantidad</th>
          <th>Dinero</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(crypto, index) in cryptoList" :key="index">
          <td>{{ crypto.name }}</td>
          <td>{{ crypto.amount }}</td>
          <td>{{ formatCurrency(crypto.value) }}</td>
        </tr>
        <tr>
          <td><strong>Total</strong></td>
          <td></td>
          <td><strong>{{ formatCurrency(totalAmount) }}</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { getTransactions, getCryptoPrice } from '../services/api';

export default {
  data() {
    return {
      cryptoList: [],
      totalAmount: 0,
      transactions: [],
    };
  },
  async mounted() {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('No se encontró el userId en el localStorage');
      }

      const transactions = await getTransactions(userId);
      this.processTransactions(transactions);

      await this.fetchCryptoPrices();
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
    },

    processTransactions(transactions) {
      const cryptoAmounts = {};

      transactions.forEach((transaction) => {
        const { crypto_code, crypto_amount, money, action } = transaction;
        const amount = parseFloat(crypto_amount);
        const price = parseFloat(money);

        if (!cryptoAmounts[crypto_code]) {
          cryptoAmounts[crypto_code] = { amount: 0, value: 0 };
        }

        if (action === 'purchase') {
          cryptoAmounts[crypto_code].amount += amount;
          cryptoAmounts[crypto_code].value += price;
        } else if (action === 'sale') {
          cryptoAmounts[crypto_code].amount -= amount;
          cryptoAmounts[crypto_code].value -= price;
        }
      });

      this.cryptoList = Object.keys(cryptoAmounts).map((cryptoCode) => {
        return {
          name: cryptoCode.toUpperCase(),
          amount: cryptoAmounts[cryptoCode].amount,
          value: cryptoAmounts[cryptoCode].value,
        };
      });

      this.totalAmount = this.cryptoList.reduce((sum, crypto) => sum + crypto.value, 0);
    },

    async fetchCryptoPrices() {
      const pricePromises = this.cryptoList.map(async (crypto) => {
        if (crypto.name === 'BTC') {
          const priceData = await getCryptoPrice('satoshitango', 'btc', 'ars');
          const currentPrice = priceData.ask;
          crypto.value = crypto.amount * currentPrice;
        }
      });

      try {
        await Promise.all(pricePromises);
        this.totalAmount = this.cryptoList.reduce((sum, crypto) => sum + crypto.value, 0);
      } catch (error) {
        console.error('Error obteniendo los precios de las criptomonedas:', error);
      }
    },
  },
};
</script>

<style scoped>
.analysis {
  padding: 30px;
  background-color: #f4f7fc;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: auto;
}

h1 {
  font-family: 'Roboto', sans-serif;
  color: #333;
  text-align: center;
  font-size: 2rem;
  margin-bottom: 30px;
}

.crypto-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-top: 20px;
}

.crypto-table th, .crypto-table td {
  padding: 12px 20px;
  text-align: left;
  font-family: 'Roboto', sans-serif;
  color: #555;
  font-size: 1rem;
}

.crypto-table th {
  background-color: #3f51b5;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.crypto-table td {
  background-color: #f9f9f9;
  border-bottom: 1px solid #ddd;
}

.crypto-table tr:last-child td {
  border-bottom: none;
}

.crypto-table tr:hover {
  background-color: #f1f1f1;
  cursor: pointer;
}

.crypto-table td strong {
  color: #3f51b5;
  font-size: 1.1rem;
}

.crypto-table td:last-child {
  font-weight: bold;
}

.crypto-table td, th {
  transition: background-color 0.3s ease, color 0.3s ease;
}


@media (max-width: 768px) {
  .analysis {
    padding: 20px;
    margin: 20px;
  }

  .crypto-table th, .crypto-table td {
    font-size: 0.9rem;
    padding: 8px 12px;
  }

  h1 {
    font-size: 1.8rem;
  }
}
</style>