<template>
		<ion-header :translucent="true">
			<ion-toolbar color="base">
				<ion-buttons slot="start">
					<ion-menu-button></ion-menu-button>
				</ion-buttons>
				<ion-title>{{ appName }}</ion-title>

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
				<ion-card-content class="tables">
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

					<ion-nav-link v-if="openedTables.length" v-for="table in openedTables" :key="table.id" router-direction="forward" :component="tablesDetails" :component-props="{ table: table }">
						<ion-item :button="true" class="ion-display-flex table opened" lines="none">
							<ion-avatar slot="start">
								<img src="/table.svg"/>
							</ion-avatar>
							<ion-label color="primary" class="ion-text-start ion-display-flex table-label">
								<h2 class="table-number ion-align-self-center">{{ table.number }}</h2>
								<ion-text v-if="table.cart" color="medium" class="table-text">
									<h3><strong><ion-text color="secondary">{{ table.cart.libelle }}</ion-text></strong></h3>
									<ion-text class="ion-display-inline-flex ion-align-items-center">
										<ion-icon :icon="peopleOutline" class="ion-margin-end bold-icon"></ion-icon>
										{{ table.cart.guests }} personnes
									</ion-text>
									<p>Ouverte {{ new Date(table.cart.created_at).toLocaleString('dz-DZ', { dateStyle: 'short', timeStyle: 'short' }) }}</p>
								</ion-text>
							</ion-label>
							<ion-text v-if="table.cart" color="primary" class="ion-margin ion-text-end">
								<ion-text color="secondary">{{ parseFloat(table.cart?.total || '0').toFixed(2) }} DA</ion-text>
								<p>{{ getElapsed(table.cart.created_at, new Date(now)) }}</p>
							</ion-text>
						</ion-item>
					</ion-nav-link>

					<ion-nav-link v-if="closedTables.length" v-for="table in closedTables" :key="table.id" router-direction="forward" :component="tablesDetails" :component-props="{ table: table }">
							<ion-item :button="true" class="ion-display-flex table closed" lines="none">
								<ion-avatar slot="start">
									<img src="/table.svg" />
								</ion-avatar>
								<ion-label color="primary" class="ion-text-start ion-display-flex table-label">
									<h2 class="table-number ion-align-self-center">{{ table.number }}</h2>
									<ion-text color="medium" class="table-text">
										<ion-text class="ion-display-inline-flex ion-align-items-center">
											<ion-icon :icon="peopleOutline" class="ion-margin-end bold-icon"></ion-icon>
											0 personnes
										</ion-text>
										<p><ion-text color="primary">Disponible</ion-text></p>
									</ion-text>
								</ion-label>
								<ion-text color="primary" class="ion-margin ion-text-end">
									<ion-text color="medium">0.00 DA</ion-text>
								</ion-text>
							</ion-item>
					</ion-nav-link>

					<ion-item-sliding v-if="unavailableTables.length" v-for="table in unavailableTables" :key="table.id" class="table">
						<ion-item :button="true" :disabled="table.status === 'unavailable'" class="ion-display-flex unavailable" lines="none">
							<ion-avatar slot="start">
								<img src="/table.svg" />
							</ion-avatar>
							<ion-label color="primary" class="ion-text-start ion-display-flex table-label">
								<h2 class="table-number ion-align-self-center">{{ table.number }}</h2>
								<ion-text color="medium" class="table-text">
									<ion-text class="ion-display-inline-flex ion-align-items-center">
										<ion-icon :icon="peopleOutline" class="ion-margin-end bold-icon"></ion-icon>
										0 personnes
									</ion-text>
									<p><ion-text color="danger">Indisponible</ion-text></p>
								</ion-text>
							</ion-label>
							<ion-text color="primary" class="ion-margin ion-text-end">
								<ion-text color="medium">0.00 DA</ion-text>
							</ion-text>
						</ion-item>
						<ion-item-options slot="end">
							<ion-item-option color="success" @click="setTableAvailable(table.id)">
								<ion-icon slot="icon-only" :icon="flash"></ion-icon>
							</ion-item-option>
						</ion-item-options>
					</ion-item-sliding>
				</ion-card-content>
			</ion-card>
			<ion-fab vertical="bottom" horizontal="end" slot="fixed">
				<ion-button  @click="setOpen(true)">
					<ion-icon :icon="add"></ion-icon>
				</ion-button>
			</ion-fab>

			<ion-modal ref="table-modal" :is-open="isOpen" @did-dismiss="setOpen(false)">
				<ion-content class="ion-padding">
					<ion-toolbar>
						<ion-title>Nouvelle Table</ion-title>
						<ion-buttons slot="end">
							<ion-button @click="setOpen(false)">Fermer</ion-button>
						</ion-buttons>
					</ion-toolbar>
					<ion-item>
						<ion-input 
							ref="cartInput"
							label="Numéro de table"
							label-placement="floating"
							type="text" 
							v-model="cartNumber"
							helper-text="Le numéro doit être unique et ne doit pas contenir de lettres"
							error-text="Numéro invalide ou déjà utilisé"
							@ionInput="getValidationNumber"
    						@ionBlur="markTouched"
							>
						</ion-input>
					</ion-item>
					<ion-item>
							<ion-select v-model="cartStatus" placeholder="Select status" label="Status" label-placement="floating">
								<ion-select-option value="available">Disponible</ion-select-option>
								<ion-select-option value="unavailable">Indisponible</ion-select-option>
							</ion-select>
					</ion-item>
					<ion-item>
						<ion-select v-model="cartLocation" placeholder="Select location" label="Localisation" label-placement="floating">
							<ion-select-option value="salle">Salle</ion-select-option>
							<ion-select-option value="terrasse">Terrasse</ion-select-option>
						</ion-select>
					</ion-item>
					<ion-button expand="block" color="success" @click="createTable()" :disabled="!isValidNumber">
						<ion-icon :icon="checkmarkOutline" slot="start"></ion-icon>
						Enregistrer
					</ion-button>
				</ion-content>
			</ion-modal>
		</ion-content>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonIcon, IonNavLink, IonButtons, IonLabel, IonMenu, IonFab, IonFabButton, IonMenuButton, IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonAvatar, IonText, onIonViewWillEnter, IonModal, IonInput, IonSelect, IonSelectOption, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/vue';
import { logIn, logOut, add, peopleOutline, timeOutline, checkmarkOutline, flash } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth'
import { supabase } from '../../utils/supabase';
import { onMounted, ref, markRaw, computed, onUnmounted } from 'vue';
import TablesDetails from './TablesDetails.vue';
import { getElapsed } from '../../utils/functions';

const tablesDetails = markRaw(TablesDetails);
const auth = useAuthStore()
const isLoggedIn = auth.isLoggedIn
const appName = import.meta.env.VITE_APP_NAME || 'Khaffee Shop'

const tables = ref<any[]>([])
const error = ref<any>(null)

const openedTables = computed(() => tables.value.filter(table => table.cart).sort((a, b) => a.number < b.number ? -1 : 1))
const closedTables = computed(() => tables.value.filter(table => !table.cart && table.status === 'available').sort((a, b) => a.number < b.number ? -1 : 1))
const unavailableTables = computed(() => tables.value.filter(table => table.status === 'unavailable'))

const isOpen = ref(false);
const setOpen = (open: boolean) => (isOpen.value = open);

const cartInput = ref();
const cartStatus = ref('available');
const cartLocation = ref('salle');
const cartNumber = ref('');
const isValidNumber = ref(false);

function createTable() {
	if(!cartNumber.value || !isValidNumber.value || !cartStatus.value || !cartLocation.value) {
		return;
	}
	supabase.from('tables').insert({
		number: cartNumber.value,
		status: cartStatus.value,
		location: cartLocation.value
	}).select().then(({ data, error }) => {
		if (error) {
			console.error('Error creating table:', error);
		} else {
			//close the modal
			setOpen(false);
			console.log('Table created:', data);
			tables.value.push(data[0]);
			setOpen(false);
		}
	});
}

const getValidationNumber = (event: any) => {
	cartInput.value.$el.classList.remove('ion-valid');
	cartInput.value.$el.classList.remove('ion-invalid');
	const number = event.target.value;
	if (!number) cartInput.value.$el.classList.add('ion-invalid');
	else if (!isNaN(Number(number)) && !tables.value.some(table => table.number === Number(number))) cartInput.value.$el.classList.add('ion-valid');
	else if (isNaN(Number(number)) || tables.value.some(table => table.number === Number(number))) cartInput.value.$el.classList.add('ion-invalid');
	isValidNumber.value = !isNaN(Number(number)) && !tables.value.some(table => table.number === Number(number));
	return isValidNumber.value;
}

const markTouched = () => {
	cartInput.value.$el.classList.add('ion-touched');
};

function setTableAvailable(tableId: number) {
	supabase.from('tables').update({ status: 'available' }).eq('id', tableId).select().then(({ data, error }) => {
		if (error) {
			console.error('Error updating table:', error);
		} else {
			console.log('Table updated:', data);
			const table = tables.value.find((t: any) => t.id === tableId);
			if (table) {
				table.status = 'available';
			}
		}
	});
}

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

	// update time every second
	interval = setInterval(() => {
		now.value = Date.now()
	}, 1000)
})

// update time in getElapsed 
const now = ref(Date.now())
let interval: any
onUnmounted(() => {
	clearInterval(interval)
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


.tables {

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

		&.opened {
			--border-width: 0 1px 0 1px;
			--border-style: solid;
			--border-color: var(--ion-color-primary);
		}

		/* &.closed {
			--border-color: var(--ion-color-medium);
		}

		&.unavailable {
			--border-color: var(--ion-color-danger);
		} */
	}
}

</style>
