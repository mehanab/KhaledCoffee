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
  import Settings from '../components/settings/Settings.vue';
  import { ref, provide } from 'vue';

  const component = markRaw(Settings);
  const nav = ref<InstanceType<typeof IonNav>>();
  provide('ionSettingsNav', nav);
</script>