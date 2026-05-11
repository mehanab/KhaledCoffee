<template>
		<ion-header :translucent="true">
			<ion-toolbar color="base">
				<ion-buttons slot="start">
					<ion-menu-button></ion-menu-button>
				</ion-buttons>
				<ion-title>Khaled coffee shop</ion-title>

				<ion-buttons slot="end">
					<ion-button v-if="!isLoggedIn" router-link="/login">
						<ion-icon :icon="logIn"></ion-icon>
					</ion-button>
					<ion-button v-else router-link="/logout" >
						<ion-icon :icon="logOut"></ion-icon>
					</ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>

		<ion-content :fullscreen="true">

			<ion-card color="base" :bordered="false">
				<ion-card-header>
					<ion-card-subtitle>Bonjour,</ion-card-subtitle>
					<ion-card-title>{{ auth.user?.email }}</ion-card-title>
				</ion-card-header>
				<ion-card-content>
					<div class="ion-display-flex ion-justify-content-between ion-align-items-center">
						<div class="tables-header ">
							<ion-label slot="end">Tables ouvertes</ion-label>
							<ion-badge class="ion-margin outline-badge">
								{{ tables.filter(table => table.cart).length ?? '0' }}
							</ion-badge>
						</div>
						<ion-text color="medium" class="ion-text-end">
							Temps écoulé
							<ion-icon :icon="timeOutline" class="ion-margin-end"></ion-icon>
						</ion-text>
					</div>
					<p v-if="error">Erreur de chargement des tables : {{ error.message }}</p>
					<ion-nav-link v-else v-for="table in tables" :key="table.id" router-direction="forward" :component="tablesDetails" :component-props="{ table: table }">
						<ion-item :button="true" :disabled="table.status === 'unavailable'" class="ion-display-flex table" lines="none">
							<ion-avatar slot="start">
								<img src="/table.svg" />
							</ion-avatar>
							<ion-label color="primary" class="ion-text-start ion-display-flex table-label">
								<h2 class="table-number ion-align-self-center">{{ table.number }}</h2>
								<ion-text v-if="table.cart" color="medium" class="table-text">
									<ion-text class="ion-display-inline-flex ion-align-items-center">
										<ion-icon :icon="peopleOutline" class="ion-margin-end bold-icon"></ion-icon>
										{{ table.cart.guests }} personnes
									</ion-text>
									<p>Ouverte {{ new Date(table.cart.created_at).toLocaleString('dz-DZ', { dateStyle: 'short', timeStyle: 'short' }) }}</p>
								</ion-text>
							</ion-label>
							<ion-text v-if="table.cart" color="primary" class="ion-margin ion-text-end">
								<ion-text color="secondary">{{ parseFloat(table.cart?.total || '0').toFixed(2) }} DA</ion-text>
								<p>{{ getElapsed(table.cart.created_at) }}</p>
							</ion-text>
						</ion-item>
					</ion-nav-link>
				</ion-card-content>
			</ion-card>
			<ion-fab vertical="bottom" horizontal="end" slot="fixed">
				<ion-fab-button>
					<ion-icon :icon="add"></ion-icon>
				</ion-fab-button>
			</ion-fab>
		</ion-content>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonIcon, IonNavLink, IonButtons, IonLabel, IonMenu, IonFab, IonFabButton, IonMenuButton, IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonAvatar, IonText } from '@ionic/vue';
import { logIn, logOut, add, peopleOutline, timeOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth'
import { supabase } from '../../utils/supabase';
import { onMounted, ref, markRaw } from 'vue';
import TablesDetails from './TablesDetails.vue';
import { getElapsed } from '../../utils/functions';

const tablesDetails = markRaw(TablesDetails);
const auth = useAuthStore()
const isLoggedIn = auth.isLoggedIn

const tables = ref<any[]>([])
const error = ref<any>(null)

onMounted(async () => {
  const { data, error: err } = await supabase
    .from('tables')
    .select(`*, carts (*)`)
	.limit(1, { referencedTable: 'carts' })

  if (err) {
    error.value = err
  } else {
    tables.value = data.map((table: any) => ({
	  ...table,
	  cart: table.carts?.[0] ?? null
	}))
  }
})
</script>

<style scoped>
/**#container {
  text-align: center;
  
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
**/
#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  
  color: #8c8c8c;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}

.tables-header {
	display: inline-flex;
	align-items: center;
	justify-content: space-between;
}

.table {
	margin: 0.5em 0;
	border-radius: 10px;

	.table-text {
		font-size: 0.8rem;
	}
	
	.table-number {
		font-size: 1.8rem;
		font-weight: 900;
		letter-spacing: 0.5px;
		display: inline-block;
		margin-right: 0.5em;
	}
}

</style>
