import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'
import { useRouter } from 'vue-router'

const router = useRouter();
let initPromise: Promise<void> | null = null

export const useAuthStore = defineStore('auth', {
	state: () => ({
		session: null as any,
		user: null as any,
		isLoggedIn: false,
		isReady: false
	}),

	actions: {
		async init() {
			if (initPromise) return initPromise

			// 1. récupérer la session UNE FOIS au démarrage
			initPromise = (async () => {
				const { data } = await supabase.auth.getSession()

				this.session = data.session
				this.user = data.session?.user ?? null
				this.isLoggedIn = !!data.session

				
				console.log('Initial session:', this.session)

				supabase.auth.onAuthStateChange((event, session) => {
					this.session = session
					this.user = session?.user ?? null
					this.isLoggedIn = !!session

					if (event === 'SIGNED_IN') {
						console.log('User connected')
						console.log('Utilisateur:', session?.user)
						console.log('Logged in:', this.isLoggedIn)
						//router.push('/home')
					}

					if (event === 'SIGNED_OUT') {
						console.log('User disconnected');
						//router.push('/login')
					}
				})

				this.isReady = true
			})()
		}
	}
})