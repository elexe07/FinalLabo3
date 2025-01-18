  <template>
    <div id="transaction-history">
      <h1>Historial de Transacciones</h1>
      
      <!-- Mostrar errores si existen -->
      <div v-if="error" class="error">
        <p>{{ error }}</p>
      </div>
      
      <!-- Si no hay transacciones disponibles -->
      <div v-if="transactions.length === 0">
        <p>No hay transacciones disponibles.</p>
      </div>
      
      <!-- Si hay transacciones disponibles -->
      <div v-if="transactions.length > 0">
        <table>
          <thead>
            <tr>
              <th>ID</th>
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
              <td>{{ transaction._id }}</td>
              <td>{{ transaction.action }}</td>
              <td>{{ transaction.crypto_code }}</td>
              <td>{{ transaction.crypto_amount }}</td>
              <td>{{ transaction.money }}</td>
              <td>{{ transaction.datetime }}</td>
              <td>
                <button @click="editTransaction(transaction)">Editar</button>
                <button @click="deleteTransaction(transaction._id)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>

  <script>
  import { apiClient } from '../services/api.js'; // Verifica que la ruta sea correcta

  export default {
    data() {
      return {
        userId: localStorage.getItem('userId') || '', // Obtener el ID de usuario desde localStorage
        transactions: [], // Almacena las transacciones
        error: null, // Para mostrar errores
      };
    },
    methods: {
      // Obtener todas las transacciones
      async fetchTransactions() {
    if (!this.userId) {
      this.error = 'ID de usuario no disponible';
      return;
    }

    try {
      // Asegurémonos de que la consulta esté en el formato correcto para RestDB
      const response = await apiClient.get('/transactions', {
        params: {
          q: JSON.stringify({ user_id: this.userId }) // Pasar la consulta como un string JSON
        }
      });
      this.transactions = response.data; // Asignar las transacciones obtenidas
    } catch (err) {
      this.error = 'Error obteniendo las transacciones: ' + err.message;
    }
  },

      // Consultar una transacción por su ID
      async getTransactionById(transactionId) {
        try {
          const response = await apiClient.get(`/transactions/${transactionId}`); // Llamada GET con el ID
          return response.data;
        } catch (err) {
          this.error = 'Error obteniendo la transacción: ' + err.message;
          throw err;
        }
      },

      // Eliminar una transacción
      async deleteTransaction(transactionId) {
        const confirmDelete = confirm('¿Estás seguro de eliminar esta transacción?');
        if (!confirmDelete) return;

        try {
          await apiClient.delete(`/transactions/${transactionId}`); // Llamada DELETE a la API
          this.transactions = this.transactions.filter(t => t._id !== transactionId); // Eliminar del array
        } catch (err) {
          this.error = 'Error eliminando la transacción: ' + err.message;
        }
      },
    },
    mounted() {
      this.fetchTransactions(); // Llamar a la API para obtener las transacciones cuando el componente se monte
    },
  };
  </script>

  <style scoped>
  #transaction-history {
    font-family: Arial, sans-serif;
    padding: 20px;
    text-align: center;
  }

  h1 {
    color: #333;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  table th,
  table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
  }

  button {
    background-color: #007BFF;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }

  .error {
    color: red;
    margin-top: 20px;
  }
  </style>
