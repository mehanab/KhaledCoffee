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
  import Menu from '../components/menu/Menu.vue';
  import { ref, provide } from 'vue';

  const component = markRaw(Menu);
  const nav = ref<InstanceType<typeof IonNav>>();
  provide('ionMenuNav', nav);
</script>

<style scoped>
</style>
