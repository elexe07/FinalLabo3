<template>
    <div class="home">
        <header class="header">
            <h1 class="title">Vox Trading</h1>
            <p class="subtitle">Descubre el poder de las criptos y lleva tus inversiones al siguiente nivel</p>
        </header>

        <div class="user-info">
            <p v-if="isLoggedIn" class="welcome-message">¡Hola, {{ userName }}!</p>
            <div>
                <button v-if="isLoggedIn"
                        @click="handleLogout"
                        class="logout-button"
                        aria-label="Cerrar sesión">
                    Cerrar sesión
                </button>
                <router-link v-else to="/login">
                    <button class="login-button">Iniciar sesión</button>
                </router-link>
            </div>
        </div>

        <nav class="navigation">
            <router-link to="/transaction-history" class="nav-item">Historial de Transacciones</router-link>
            <router-link to="/analysis" class="nav-item">Análisis</router-link>
            <router-link to="/new-transaction" class="nav-item">Nueva Transacción</router-link>
        </nav>

        <section class="crypto-prices">
            <h2 class="section-title">Precios de Criptomonedas en AR$</h2>

            <div v-if="cryptoPrices.length > 0" class="price-list">
                <div v-for="(price, index) in cryptoPrices" :key="index" class="crypto-item">
                    <p class="crypto-name">{{ price.name }}:</p>
                    <p class="crypto-price">{{ formatCurrency(price.priceInARS) }}</p>
                </div>
            </div>

            <div v-else-if="!error" class="loading-indicator">
                <p>Cargando precios...</p>
                <div class="spinner"></div>
            </div>

            <div v-else class="error">
                <p>{{ error }}</p>
            </div>

            <button @click="fetchCryptoPrices" class="refresh-button">Actualizar Precios</button>
        </section>
        

        <footer class="footer">
            <div class="footer-content">
                <p class="copyright">&copy; 2024 Vox Trading. Todos los derechos reservados.</p>
                <small class="price-info-footer">Los precios mostrados son obtenidos de la API de satoshitango.</small>
            </div>
        </footer>
    </div>
</template>

<script>
import { getCryptoPrice } from "@/services/api.js";

export default {
  name: "HomePage",
  data() {
    return {
      isLoggedIn: localStorage.getItem("userId") !== null,
      userName: localStorage.getItem("userId") || "",
      cryptoPrices: [],
      error: null,
    };
  },
  mounted() {
    this.fetchCryptoPrices();
  },
  methods: {
    handleLogout() {
      localStorage.removeItem("userId");
      this.isLoggedIn = false;
    },
    async fetchCryptoPrices() {
      const coins = ["BTC", "ETH", "USDT", "LTC", "DOGE"];
      try {
        const promises = coins.map((coin) => getCryptoPrice(coin, "ARS", 1));
        const responses = await Promise.all(promises);
        this.cryptoPrices = responses.map((response, index) => {
          if (response?.satoshitango?.ask) {
            return { name: coins[index], priceInARS: response.satoshitango.ask };
          } else {
            throw new Error(`Datos no disponibles para ${coins[index]}`);
          }
        });
      } catch (error) {
        console.error("Error al obtener precios:", error);
        this.error = "Error al obtener los precios de las criptomonedas.";
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(value);
    },
  },
};
</script>

<style scoped>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: "Inter", sans-serif;
    }

    body {
        background-color: #1e1e2e;
        color: #d9e1e8;
        font-size: 16px;
        line-height: 1.6;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .home {
        padding: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 1000px;
        background: #2b2b3a;
        border-radius: 15px;
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
    }

    .header {
        background: #2b2b3a;
        border-radius: 15px;
        padding: 40px;
        text-align: center;
        width: 100%;
        position: relative;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }

        .header .title {
            font-size: 3rem;
            color: #7dc4e4;
            margin-bottom: 15px;
            font-weight: 700;
            letter-spacing: 2px;
            line-height: 1.2;
            font-family: "Exo 2", sans-serif;
            text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5), 0 0 25px #7dc4e4, 0 0 5px #7dc4e4;
        }

        .header .subtitle {
            color: #a6adc8;
            font-size: 1.2rem;
            font-family: "Roboto", sans-serif;
            letter-spacing: 1px;
            opacity: 0.9;
            font-weight: 400;
        }

    .user-info {
        display: flex;
        justify-content: flex-end;
        width: 100%;
        margin-top: 20px;
    }

        .user-info .welcome-message {
            margin-right: 20px;
        }

        .user-info .login-button,
        .user-info .logout-button {
            background-color: #7dc4e4;
            color: #1e1e2e;
            padding: 8px 16px;
            border-radius: 10px;
            border: none;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .user-info .logout-button {
            background: #ff6b6b;
        }

            .user-info .login-button:hover,
            .user-info .logout-button:hover {
                background-color: #e74c3c;
                transform: scale(1.05);
            }

    .navigation {
        display: flex;
        justify-content: center;
        gap: 30px;
        margin: 30px 0;
    }

        .navigation .nav-item {
            text-decoration: none;
            color: #d9e1e8;
            background: #3a3a4c;
            padding: 12px 25px;
            border-radius: 10px;
            font-weight: 500;
            transition: all 0.3s ease;
        }

            .navigation .nav-item:hover {
                background: #7dc4e4;
                color: #1e1e2e;
                transform: translateY(-2px);
            }

    .crypto-prices {
        background: #2b2b3a;
        padding: 40px;
        border-radius: 15px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        width: 100%;
        max-width: 700px;
        text-align: center;
    }

        .crypto-prices .section-title {
            font-size: 2rem;
            color: #7dc4e4;
            margin-bottom: 25px;
            font-weight: 700;
        }

    .price-list .crypto-item {
        display: flex;
        justify-content: space-between;
        background: #3a3a4c;
        padding: 12px 20px;
        border-radius: 10px;
        margin-bottom: 12px;
        color: #d9e1e8;
        transition: background-color 0.3s ease;
    }

        .price-list .crypto-item:hover {
            background: #7dc4e4;
            color: #1e1e2e;
            transform: translateY(-2px);
        }

    .footer {
        margin-top: 40px;
        background: #2b2b3a;
        color: #a6adc8;
        text-align: center;
        padding: 20px;
        border-radius: 12px;
        width: 100%;
        max-width: 900px;
        font-size: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

        .footer small {
            display: block;
            margin-top: 8px;
            color: #7dc4e4;
        }

    .loading-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .spinner {
        border: 4px solid #3a3a4c;
        border-top: 4px solid #7dc4e4;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        animation: spin 1s linear infinite;
        margin: 10px auto;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    .refresh-button {
        margin-top: 20px;
        padding: 10px 20px;
        background-color: #66cdaa;
        color: #1e1e2e;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s ease;
    }

        .refresh-button:hover {
            background-color: #4caf50;
        }
</style>
