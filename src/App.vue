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
import { useTableStore } from './stores/tableStore'
import { useProductStore } from './stores/productStore'
import { useCategoryStore } from './stores/categoryStore'
// import Tabs from './components/Tabs.vue'

const auth = useAuthStore()
const params = useSettingsStore()
const tableStore = useTableStore()
const productStore = useProductStore()
const categoryStore = useCategoryStore()

onMounted(async () => {
    auth.init();
    await params.fetchSettings();
    params.subscribeToSettings();
    await tableStore.fetchTables();
    tableStore.subscribeToTables();
    tableStore.subscribeToCarts();
    productStore.subscribeToProducts();
    categoryStore.subscribeToProducts();
})
</script>
