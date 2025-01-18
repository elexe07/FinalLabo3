<template>
    <div class="container">
        <button @click="goHome" class="btn-volver">Volver</button>

        <div class="analysis">
            <h1>Resumen de tus Finanzas</h1>

            <table class="crypto-table">
                <thead>
                    <tr>
                        <th>Criptomoneda</th>
                        <th>Cantidad</th>
                        <th>Invertido</th>
                        <th>Valor Actual</th>
                        <th>Ganancia/Pérdida</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(crypto, index) in cryptoList" :key="index">
                        <td>{{ crypto.name }}</td>
                        <td>{{ crypto.amount }}</td>
                        <td>{{ formatCurrency(crypto.invested) }}</td>
                        <td>{{ formatCurrency(crypto.currentValue) }}</td>
                        <td :class="{ gain: crypto.gainLoss > 0, loss: crypto.gainLoss < 0 }">
                            {{ formatCurrency(crypto.gainLoss) }}
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Total</strong></td>
                        <td></td>
                        <td><strong>{{ formatCurrency(totalInvested) }}</strong></td>
                        <td><strong>{{ formatCurrency(totalCurrentValue) }}</strong></td>
                        <td :class="{ gain: netProfitLoss > 0, loss: netProfitLoss < 0 }">
                            <strong>{{ formatCurrency(netProfitLoss) }}</strong>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import { getTransactions, getCryptoPrice } from '../services/api';

export default {
  data() {
    return {
      cryptoList: [],
      totalInvested: 0,
      totalCurrentValue: 0,
      netProfitLoss: 0,
      error: null,
    };
  },
  async mounted() {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('No se encontró el userId en el localStorage');
      }

      const transactions = await getTransactions(userId);
      await this.processTransactions(transactions);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      this.error = 'Error al cargar el resumen de finanzas.';
    }
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
    },

    async processTransactions(transactions) {
      const cryptoAmounts = {};
      const currentPrices = {};
      this.totalInvested = 0;
      this.totalCurrentValue = 0;
      this.netProfitLoss = 0;

      // Consolidar cantidades y valores invertidos
      transactions.forEach(({ crypto_code, crypto_amount, money, action }) => {
        const amount = parseFloat(crypto_amount);
        const invested = parseFloat(money);

        if (!cryptoAmounts[crypto_code]) {
          cryptoAmounts[crypto_code] = { amount: 0, invested: 0 };
        }

        if (action === 'purchase') {
          cryptoAmounts[crypto_code].amount += amount;
          cryptoAmounts[crypto_code].invested += invested;
          this.totalInvested += invested;
        } else if (action === 'sale') {
          cryptoAmounts[crypto_code].amount -= amount;
          cryptoAmounts[crypto_code].invested -= invested;
          this.totalInvested -= invested;
        }
      });

      // Obtener precios actuales
      const cryptoCodes = Object.keys(cryptoAmounts);
      try {
        const pricePromises = cryptoCodes.map((code) => getCryptoPrice(code, 'ARS', 1));
        const priceResponses = await Promise.all(pricePromises);

        priceResponses.forEach((response, index) => {
          const code = cryptoCodes[index];
          currentPrices[code] = response?.satoshitango?.ask || 0;
        });
      } catch (error) {
        console.error('Error al obtener los precios actuales:', error);
        this.error = 'No se pudieron obtener los precios actuales de las criptomonedas.';
        return;
      }

      // Calcular valores actuales y ganancias/pérdidas
      this.cryptoList = cryptoCodes.map((code) => {
        const amount = cryptoAmounts[code].amount;
        const invested = cryptoAmounts[code].invested;
        const currentPrice = currentPrices[code] || 0;
        const currentValue = amount * currentPrice;
        const gainLoss = currentValue - invested;

        this.totalCurrentValue += currentValue;
        this.netProfitLoss += gainLoss;

        return {
          name: code,
          amount,
          invested,
          currentValue,
          gainLoss,
        };
      });
    },

    goHome() {
      this.$router.push('/home');
    },
  },
};
</script>

<style scoped>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        color: #D9E1E8;
        font-family: 'Roboto', sans-serif;
    }

    .analysis {
        width: 100%;
        max-width: 800px;
        background-color: #2B2B3A;
        border-radius: 18px;
        padding: 20px;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
        margin-top: 20px;
    }

    .crypto-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

        .crypto-table th, .crypto-table td {
            padding: 10px 15px;
            border: 1px solid #4A4A5D;
        }

        .crypto-table th {
            background-color: #000;
            color: #FFF;
        }

        .crypto-table tr:nth-child(even) {
            background-color: #353B47;
        }

        .crypto-table tr:hover {
            background-color: #4A4A5D;
        }

    .gain {
        color: #4CAF50; /* Verde para ganancias */
    }

    .loss {
        color: #F44336; /* Rojo para pérdidas */
    }

    .btn-volver {
        position: fixed;
        top: 20px;
        left: 20px;
        background-color: #000;
        color: #FFF;
        padding: 10px 15px;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

        .btn-volver:hover {
            background-color: #5D9BB5;
        }
</style>
