<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth'
import Tabs from './components/Tabs.vue'

const auth = useAuthStore()

onMounted(() => {
    auth.init();
})
</script>
