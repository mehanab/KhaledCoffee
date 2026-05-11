<template>
	<ion-page>
		<!-- MENU -->
		<ion-menu content-id="main-content">
			<ion-header>
				<ion-toolbar>
					<ion-title>Paramètres</ion-title>
				</ion-toolbar>
			</ion-header>
			<ion-content class="ion-padding">
				This is the menu content.
			</ion-content>
		</ion-menu>
		<ion-page id="main-content">
			<ion-nav :root="component"></ion-nav>
		</ion-page>
	</ion-page>
</template>

<script setup lang="ts">
  import { markRaw } from 'vue';
  import { IonNav, IonPage, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
  import Tables from '../components/tables/Tables.vue';

  const component = markRaw(Tables);
</script>

<style scoped>
</style>
