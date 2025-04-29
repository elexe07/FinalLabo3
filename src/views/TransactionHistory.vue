<template>
  
  <div id="transaction-history">
    <button @click="goHome" class="btn-volver">Volver</button>

    <h1>Historial de Transacciones</h1>

    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-if="transactions.length === 0">
      <p>No hay transacciones disponibles.</p>
    </div>

    <div v-if="transactions.length > 0">
      <table>
        <thead>
          <tr>
            <th>Acción</th>
            <th>Código Cripto</th>
            <th>Cantidad</th>
            <th>Dinero (ARS)</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction._id">
            <td>{{ transaction.action === 'purchase' ? 'Compra' : transaction.action === 'sale' ? 'Venta' : transaction.action }}</td>
            <td>{{ transaction.crypto_code }}</td>
            <td>{{ transaction.crypto_amount }}</td>
            <td>{{ transaction.money }}</td>
            <td>{{ formatDate(transaction.datetime) }}</td>
            <td>
              <button @click="editTransaction(transaction)">Editar</button>
              <button @click="deleteTransaction(transaction._id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="editMode" class="modal" @click="cancelEdit">
      <div class="modal-content" @click.stop>
        <h2>Editar Transacción</h2>
        <form @submit.prevent="updateTransactionDetails">
          <label for="cryptoAmount">Cantidad</label>
          <input type="number" v-model="editTransactionData.crypto_amount" id="cryptoAmount" required />

          <label for="money">Dinero (ARS)</label>
          <input type="number" v-model="editTransactionData.money" id="money" required />

          <button type="submit">Actualizar Transacción</button>
          <button type="button" @click="cancelEdit">Cancelar</button>
        </form>
      </div>
    </div>
  </div>
</template>


  <script>
  import { apiClient } from '../services/api.js'; 
  import { updateTransaction, deleteTransaction } from '../services/api.js'; 

  export default {
  data() {
    return {
      userId: localStorage.getItem('userId') || '',
      transactions: [],
      error: null,
      editMode: false,
      editTransactionData: {}
    };
  },
  methods: {
    editTransaction(transaction) {
      this.editTransactionData = { ...transaction };
      this.editMode = true; 
    },
    cancelEdit() {
      this.editMode = false;
      this.editTransactionData = {}; 
    },
    goHome() {
      this.$router.push('/home'); 
    },
    async updateTransactionDetails() {
      try {
        const updatedTransaction = await updateTransaction(
          this.editTransactionData._id,
          this.editTransactionData
        );
        const index = this.transactions.findIndex(t => t._id === this.editTransactionData._id);
        if (index !== -1) {
          this.transactions[index] = updatedTransaction;
        }
        this.editMode = false; 
      } catch (err) {
        this.error = 'Error actualizando la transacción: ' + err.message;
      }
    },
    async deleteTransaction(transactionId) {
      const confirmDelete = confirm('¿Estás seguro de eliminar esta transacción?');
      if (!confirmDelete) return;

      try {
        await deleteTransaction(transactionId);
        this.transactions = this.transactions.filter(t => t._id !== transactionId);
      } catch (err) {
        this.error = 'Error eliminando la transacción: ' + err.message;
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    async fetchTransactions() {
      if (!this.userId) {
        this.error = 'ID de usuario no disponible';
        return;
      }
      try {
        const response = await apiClient.get('/transactions', {
          params: {
            q: JSON.stringify({ user_id: this.userId })
          }
        });
        this.transactions = response.data;
      } catch (err) {
        this.error = 'Error obteniendo las transacciones: ' + err.message;
      }
    }
  },
  mounted() {
    this.fetchTransactions();
  }
};
</script>

<style scoped>
#transaction-history {
  font-family: 'Inter', sans-serif;
  background-color: #2B2B3A;
  color: #D9E1E8;
  padding: 30px;
  border-radius: 12px;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

h1 {
  color: #7DC4E4;
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center; 
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #3A3A4C;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

table th,
table td {
  padding: 12px 15px;
  text-align: center;
  border: 1px solid #4A4A5D;
  font-size: 14px;
  color: white; 
}

table th {
  background-color: #000000; 
  color: #FFFFFF; 
  font-weight: bold;
  text-transform: uppercase;
}

table td {
  background-color: #2B2B3A; 
}

table tr:nth-child(even) {
  background-color: #353B47;
}

table tr:hover {
  background-color: #4A4A5D;
  cursor: pointer;
}

button {
  background-color: #000000; 
  color: white;
  border: none;
  padding: 6px 12px; 
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px; 
  transition: background-color 0.3s, transform 0.3s;
  margin-right: 10px; 
  display: inline-block; 
}

button:hover {
  background-color: #5D9BB5;
  transform: translateY(-2px);
}

button:active {
  transform: translateY(1px);
}

.error {
  color: #FF4D4D;
  margin-top: 20px;
  font-size: 14px;
}

p {
  font-size: 16px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #3A3A4C;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
}

.modal-content form {
  text-align: center; 
}

.modal-content h2 {
  color: #7DC4E4;
  margin-bottom: 20px;
  text-align: center; 
}

.modal-content label {
  color: #D9E1E8;
  font-size: 16px; 
  display: block;
  margin-bottom: 8px;
  text-align: center;
}

.modal-content input {
  width: 80%; 
  max-width: 300px; 
  padding: 12px 16px;
  margin: 10px auto; 
  display: block;
  background-color: #2B2B3A; 
  color: #D9E1E8; 
  border: 2px solid #4A4A5D; 
  border-radius: 8px; 
  font-size: 14px; 
  transition: all 0.3s ease-in-out; 
}

.modal-content input:focus {
  border-color: #7DC4E4; 
  outline: none; 
  box-shadow: 0 0 8px rgba(125, 196, 228, 0.7); 
}

.modal-content button {
  padding: 8px 14px; 
  font-size: 14px; 
  background-color: #000000; 
  color: white; 
  border-radius: 6px;
  cursor: pointer;
  width: 48%; 
  margin: 10px 1%; 
  box-sizing: border-box;
  border: none; 
  transition: background-color 0.3s ease, transform 0.3s ease;
  display: inline-block; 
}

.modal-content button:hover {
  background-color: #5D9BB5; 
  transform: translateY(-2px);
}

.modal-content button:active {
  transform: translateY(1px); 
}

.modal-content button:first-child {
  margin-right: 10px; 
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
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
}

.btn-volver:hover {
  background-color: #5D9BB5; 
  transform: translateY(-2px);
}

.btn-volver:active {
  transform: translateY(1px); 
}

</style>