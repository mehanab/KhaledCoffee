<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth'
import { useSettingsStore } from './stores/settingsStore'
// import Tabs from './components/Tabs.vue'

const auth = useAuthStore()
const params = useSettingsStore()

onMounted(async () => {
    auth.init();
    await params.fetchSettings();
    params.subscribeToSettings();
})
</script>
