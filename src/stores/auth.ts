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

				// function to get user data based on the current user, table profiles
				const getUserData = async function( user: any) {
					if( !user || !user.id) return user;
					try {
						const { data: profile, error } = await supabase
							.from("profiles")
							.select("*")
							.eq("id", user.id)
							.single();
						if (error) throw error;

						return profile;
					} catch (error) {
						console.error('Error fetching profile:', error);
						return user;
					}
				}
				



				this.session = data.session
				this.user = data.session?.user ?? null
				this.isLoggedIn = !!data.session
				this.user.profile = await getUserData(this.user);

				//console.log('Initial session:', this.session)

				supabase.auth.onAuthStateChange(async (event, session) => {
					this.session = session
					this.user = session?.user ?? null
					this.isLoggedIn = !!session
					this.user.profile = await getUserData(this.user);
					this.user.profile.full_name = `${this.user.profile.first_name ?? ''} ${this.user.profile.last_name ?? ''}`.trim()

					if (event === 'SIGNED_IN') {
						// console.log('User connected')
						// console.log('Utilisateur:', session?.user)
						// console.log('Logged in:', this.isLoggedIn)
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