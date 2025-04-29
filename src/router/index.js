import { createRouter, createWebHashHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import NewTransaction from '../views/NewTransaction.vue'; 
import TransactionHistory from '../views/TransactionHistory.vue'; 
import AnalysisPage from '../views/AnalysisPage.vue';
import HomePage from '../views/HomePage.vue'; 

const routes = [

    {
        path: '/',
        redirect: '/home', 
    },
    { path: '/login', name: 'Login', component: LoginPage }, 
    { 
        path: "/transaction-history", 
        name: "TransactionHistory", 
        component: TransactionHistory 
    },
    { 
        path: '/new-transaction', 
        name: 'NewTransaction', 
        component: NewTransaction,
        meta: { requiresAuth: true } 
    }, 
    { path: '/analysis', name: 'Analysis', component: AnalysisPage }, 
    {
        path: '/home',
        name: 'Home',
        component: HomePage, 
    },
];

const router = createRouter({
    history: createWebHashHistory(process.env.BASE_URL), 
    routes,
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = localStorage.getItem('userId'); 
    if (to.meta.requiresAuth && !isLoggedIn) {
        next('/login'); 
    } else {
        next(); 
    }
});

export default router;