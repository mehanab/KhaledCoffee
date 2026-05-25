<template>
		<ion-header :translucent="false">
            <Toolbar :title="'Menu'" :showMenuButton="false" />
		</ion-header>

		<ion-content :fullscreen="true">
        </ion-content>
</template>

<script setup lang="ts">
    import { IonHeader, IonContent } from '@ionic/vue';
    import Toolbar from '../Toolbar.vue';
</script>