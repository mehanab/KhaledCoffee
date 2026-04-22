import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import { useAuthStore } from '@/stores/auth'

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		redirect: '/home'
	},
	{
		path: '/home',
		name: 'Home',
		meta: { requiresAuth: true },
		component: HomePage
	},
	{
		path: '/login',
		name: 'Login',
		component: () => import('../views/LoginPage.vue')
	},
	{
		path: '/logout',
		name: 'Logout',
		component: () => import('../views/LogoutPage.vue')
	}
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})

router.beforeEach(async (to, from, next) => {
	const auth = useAuthStore()
	// attendre que l'auth soit prête
	if (!auth.isReady) {
		await auth.init()
		return next(to.fullPath) // réessayer la navigation après l'initialisation de l'auth
	}
	const isLoggedIn = auth.isLoggedIn
	console.log('Navigation guard: requiresAuth =', to.meta.requiresAuth, 'isLoggedIn =', isLoggedIn)

	if (to.meta.requiresAuth && !isLoggedIn) {
		next('/login')
	} else {
		next()
	}
})

export default router
