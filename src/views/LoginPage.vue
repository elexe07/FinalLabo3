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
   const isLoggedIn = localStorage.getItem("userId");
  if (isLoggedIn) {
    this.$router.push("/home");
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
  localStorage.setItem('userId', this.userId);
  this.$router.push("/home");
},
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: #2B2B3A;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #D9E1E8;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-card {
  background-color: #3A3A4C;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  padding: 30px;
  transition: transform 0.3s ease-in-out;
}

.login-card:hover {
  transform: translateY(-5px);
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #7DC4E4;
  font-size: 28px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  font-size: 14px;
  margin-bottom: 8px;
  color: #D9E1E8;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #4A4A5D;
  border-radius: 8px;
  background-color: #2B2B3A;
  font-size: 16px;
  color: #D9E1E8;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input:focus {
  border-color: #7DC4E4;
  box-shadow: 0 0 8px rgba(125, 196, 228, 0.3);
}

.error-message {
  color: #FF4D4D;
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
}

.login-btn {
  background-color: #7DC4E4;
  color: #1E1E2E;
  padding: 14px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.login-btn:hover {
  background-color: #5D9BB5;
  transform: translateY(-3px);
}

.login-btn:active {
  transform: translateY(1px);
}
</style>
