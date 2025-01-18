import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue'; // Componente Login
import NewTransaction from '../views/NewTransaction.vue'; // Componente NewTransaction
import TransactionHistory from '../views/TransactionHistory.vue'; // Componente TransactionHistory
import AnalysisPage from '../views/AnalysisPage.vue'; // Componente Analysis
import HomePage from '../views/HomePage.vue'; // Componente Home

const routes = [
    // Ruta principal, siempre redirige a /home
    {
        path: '/',
        redirect: '/home', // Siempre redirige al home
    },
    { path: '/login', name: 'Login', component: LoginPage }, // Ruta Login
    { 
        path: "/transaction-history", 
        name: "TransactionHistory", 
        component: TransactionHistory 
    }, // Ruta historial
    { 
        path: '/new-transaction', 
        name: 'NewTransaction', 
        component: NewTransaction,
        meta: { requiresAuth: true } // Esta ruta requiere autenticación
    }, // Ruta para crear una nueva transacción
    { path: '/analysis', name: 'Analysis', component: AnalysisPage }, // Ruta análisis
    {
        path: '/home',
        name: 'Home',
        component: HomePage, // Ruta Home
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL), // Historia sin hash
    routes,
});

// Guardián de navegación para verificar si el usuario está logueado
router.beforeEach((to, from, next) => {
    const isLoggedIn = localStorage.getItem('userId'); // Verificar si hay usuario logueado
    if (to.meta.requiresAuth && !isLoggedIn) {
        // Si intenta acceder a una ruta protegida sin estar logueado
        next('/login'); // Redirigir al Login
    } else {
        next(); // Permitir navegación
    }
});

export default router;
