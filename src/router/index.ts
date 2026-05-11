import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import { useAuthStore } from '@/stores/auth'
import Tabs from '../components/Tabs.vue'

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		redirect: '/home',
		meta: {
			requiresAuth: true
		}
	},
	{
		path: '/',
		component: Tabs,
		children: [
			{
				path: '',
				redirect: '/home',
				meta: {
					requiresAuth: true
				}
			},
			{
				path: '/home',
				name: 'home',
				component: () => import('../views/HomePage.vue'),
				meta: {
					requiresAuth: true
				}
			},
			{
				path: '/menu',
				name: 'menu',
				component: () => import('../views/MenuPage.vue'),
				meta: {
					requiresAuth: true
				}
			},
			{
				path: '/history',
				name: 'history',
				component: () => import('../views/HistoryPage.vue'),
				meta: {
					requiresAuth: true
				}
			},
			{
				path: '/settings',
				name: 'settings',	
				component: () => import('../views/SettingsPage.vue'),
				meta: {
					requiresAuth: true
				}
			},
		],
	},
	{
		path: '/login',
		name: 'login',
		component: () => import('../views/LoginPage.vue')
	},
	{
		path: '/logout',
		name: 'logout',
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
