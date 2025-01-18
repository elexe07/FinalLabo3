<template>
  <div class="home">
    <header class="header">
      <h1 class="title">CryptoTracker</h1>
      <p class="subtitle">Bienvenido a nuestra plataforma. Explora las criptomonedas y mucho más.</p>
      
      <p v-if="isLoggedIn" class="welcome-message">¡Hola, {{ userName }}!</p>
      
      <div class="user-info">
        <div v-if="isLoggedIn">
          <button @click="handleLogout" class="logout-button">Cerrar sesión</button>
        </div>
        <router-link v-else to="/login">
          <button class="login-button">Iniciar sesión</button>
        </router-link>
      </div>
    </header>
    
    <nav class="navigation">
      <router-link to="/transaction-history" class="nav-item">Historial de Transacciones</router-link>
      <router-link to="/analysis" class="nav-item">Análisis</router-link>
      <router-link to="/new-transaction" class="nav-item">Nueva Transacción</router-link>
    </nav>

    <section class="crypto-prices">
      <h2 class="section-title">Precios de Criptomonedas en Pesos Argentinos</h2>

      <div v-if="cryptoPrices.length > 0" class="price-list">
        <div v-for="(price, index) in cryptoPrices" :key="index" class="crypto-item">
          <p class="crypto-name">{{ price.name }}:</p>
          <p class="crypto-price">{{ formatCurrency(price.priceInARS) }}</p>
        </div>
      </div>
      
      <div v-else>
        <p class="loading-message">Cargando precios...</p>
      </div>
    </section> 

    <footer class="footer">
      <div class="footer-content">
        <p class="copyright">&copy; 2024 CryptoTracker. Todos los derechos reservados.</p>
        <small class="price-info-footer">Los precios mostrados son obtenidos de la API de Belo.</small>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      isLoggedIn: localStorage.getItem('userId') !== null,
      userName: localStorage.getItem('userId') || '',
      cryptoPrices: [],
      error: null,
    };
  },
  mounted() {
    this.fetchCryptoPrices();
  },
  methods: {
    handleLogout() {
      localStorage.removeItem('userId');
      this.isLoggedIn = false;
    },
    
    // Consultar los precios de las criptomonedas desde la API
    async fetchCryptoPrices() {
      const coins = ['BTC', 'ETH', 'USDT']; // Lista de criptomonedas
      try {
        const prices = [];
        for (const coin of coins) {
          const response = await fetch(`https://criptoya.com/api/${coin}/ARS`);
          if (!response.ok) {
            console.error(`Error en la API para ${coin}:`, response.statusText);
            this.error = `Error al obtener datos de ${coin}`;
            continue;
          }

          const data = await response.json();
          console.log(`Respuesta para ${coin}:`, data);

          if (data.belo && data.belo.ask) {
            prices.push({
              name: coin,
              priceInARS: data.belo.ask, // Precio ask de Belo
            });
          } else {
            console.error(`Error: Precio de Belo no disponible para ${coin}`);
            this.error = `Datos no disponibles para ${coin} en Belo`;
          }
        }
        this.cryptoPrices = prices;
      } catch (err) {
        console.error('Error general en fetchCryptoPrices:', err.message);
        this.error = 'Error al obtener los precios.';
      }
    },

    // Método para formatear la moneda
    formatCurrency(value) {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
      }).format(value);
    },
  }
}
</script>

<style scoped>
/* Estilos globales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
}

body {
  background-color: #f4f7fa;
  color: #333;
  font-size: 16px;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Asegura que el body ocupe toda la altura */
}

/* Contenedor principal */
.home {
  flex: 1; /* Esto hace que la sección principal ocupe el espacio disponible */
}

/* Encabezado */
.header {
  background: linear-gradient(135deg, #4e73df, #1e3d58);
  color: white;
  padding: 30px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.header p {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

/* Mostrar el mensaje de bienvenida en el centro */
.welcome-message {
  font-size: 1.2rem;
  margin-top: 10px;
  font-weight: 500;
}

/* Ubicamos el botón de login/logout en la parte superior derecha */
.user-info {
  position: absolute;
  top: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info .login-button,
.user-info .logout-button {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.user-info .login-button {
  background-color: #28a745;
  color: white;
  border: none;
}

.user-info .logout-button {
  background-color: #dc3545;
  color: white;
  border: none;
}

.user-info .login-button:hover {
  background-color: #218838;
}

.user-info .logout-button:hover {
  background-color: #c82333;
}

/* Barra de navegación horizontal */
.navigation {
  background-color: #343a40;
  padding: 10px 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  padding: 10px 20px;
  border-radius: 5px;
  background-color: #007bff;
  transition: background-color 0.3s ease;
}

.nav-item:hover {
  background-color: #0056b3;
}

/* Sección de precios de criptomonedas */
.crypto-prices {
  background-color: white;
  padding: 40px 20px;
  text-align: center;
  margin-top: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.crypto-prices h2 {
  font-size: 2rem;
  margin-bottom: 30px;
  font-weight: 600;
  color: #333;
}

.price-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.crypto-item {
  font-size: 1.2rem;
  color: #333;
}

/* Footer */
.footer {
  background-color: #343a40;
  color: #f8f9fa;
  text-align: center;
  padding: 15px;
  font-size: 0.9rem;
  border-top: 1px solid #dee2e6;
  margin-top: auto;
}

.footer p {
  margin: 0;
  font-size: 1rem;
  color: #f8f9fa;
}

.footer small {
  font-size: 0.8rem;
  color: #ced4da;
}

.footer .price-info-footer {
  margin-top: 10px;
  font-size: 0.8rem;
  color: #ced4da;
}

/* Responsividad */
@media (max-width: 768px) {
  .header h1 {
    font-size: 2.5rem;
  }

  .header p {
    font-size: 1rem;
  }

  .navigation {
    flex-direction: column;
    gap: 10px;
  }

  .crypto-prices {
    padding: 20px;
  }

  .nav-item {
    width: 100%;
    text-align: center;
  }
}
</style>
