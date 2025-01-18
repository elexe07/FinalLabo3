<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">Iniciar sesión</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="userId" class="form-label">ID de usuario</label>
          <input
            type="text"
            id="userId"
            v-model="userId"
            placeholder="Ingresa tu ID"
            class="form-input"
            required
          />
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <button type="submit" class="login-btn">Iniciar sesión</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  mounted() {
  // Verificar si el usuario ya está logueado
  const isLoggedIn = localStorage.getItem("userId"); // Asegúrate de que la clave sea "userId" y no "user_id"
  if (isLoggedIn) {
    this.$router.push("/home"); // Si ya está logueado, redirigir a la página principal
  }
},
  data() {
    return {
      userId: "",
      errorMessage: "",
    };
  },
  methods: {
    handleLogin() {
  if (!this.userId.trim()) {
    this.errorMessage = "Por favor, ingresa un ID válido.";
    return;
  }
  // Guardar el userId en localStorage con la clave "userId"
  localStorage.setItem('userId', this.userId);
  this.$router.push("/home");
},
  },
};
</script>

<style scoped>
/* Estilos generales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f4f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* Estilos para el contenedor de login */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

/* Estilos para los elementos del formulario */
.form-group {
  margin-bottom: 15px;
}

.form-label {
  font-size: 14px;
  margin-bottom: 5px;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  outline: none;
}

.form-input:focus {
  border-color: #4caf50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
}

/* Estilos para el botón de login */
.login-btn {
  background-color: #4caf50;
  color: #fff;
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #45a049;
}
</style>