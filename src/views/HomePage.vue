<template>
	<ion-page>
		<ion-header :translucent="true">
			<ion-toolbar>
				<ion-title>Khaled coffee shop</ion-title>
				<ion-button slot="end" v-if="!isLoggedIn" router-link="/login">Se connecter</ion-button>
				<ion-button slot="end" v-else router-link="/logout">Se déconnecter</ion-button>
			</ion-toolbar>
		</ion-header>

		<ion-content :fullscreen="true">
			<ion-header collapse="condense">
				<ion-toolbar>
					<ion-title size="large">Khaled coffee shop</ion-title>
				</ion-toolbar>
			</ion-header>

			<div id="container">
				<strong>Les tables du café : </strong>
				<p>Voici la liste des tables du café avec leur statut et localisation.</p>
				<ion-list id="tables">
					<p v-if="error">Erreur de chargement des tables : {{ error.message }}</p>
					<ion-item v-for="table in tables" :key="table.id">
						Table {{ table.number }} : status "{{ table.status }}", localisation "{{ table.location }}"
					</ion-item>
				</ion-list>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonList, IonItem } from '@ionic/vue';
import { useAuthStore } from '@/stores/auth'
import { supabase } from '../utils/supabase';
import { onMounted, ref } from 'vue';

const auth = useAuthStore()
const isLoggedIn = auth.isLoggedIn

const tables = ref<any[]>([])
const error = ref<any>(null)

onMounted(async () => {
  const { data, error: err } = await supabase
    .from('tables')
    .select('*')

  if (err) {
    error.value = err
  } else {
    tables.value = data || []
  }
})

</script>

<style scoped>
#container {
  text-align: center;
  
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

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
</style>
