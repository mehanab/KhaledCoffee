<template>
	<ion-page>
		<ion-page>
			<ion-nav ref="nav" :root="component"></ion-nav>
		</ion-page>
	</ion-page>
</template>

<script setup lang="ts">
  import { markRaw } from 'vue';
  import { IonNav, IonPage } from '@ionic/vue';
  import Menu from '../components/history/History.vue';
  import { ref, provide } from 'vue';

  const component = markRaw(Menu);
  const nav = ref<InstanceType<typeof IonNav>>();
  provide('ionHistoryNav', nav);
</script>

<style scoped>
</style>