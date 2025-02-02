import { createApp } from 'vue';
import App from './App.vue'; // Componente principal
import router from './router'; // Importa el enrutador
import './assets/styles.css';

createApp(App).use(router).mount('#app'); // Monta la aplicación y usa el enrutador
