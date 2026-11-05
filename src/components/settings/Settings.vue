<template>
    <ion-header :translucent="false">
        <Toolbar :title="'Paramètres'" :showMenuButton="false">
        </Toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
        <ion-item :button="true" class="ion-display-flex" lines="none" type="button" @click="setOpen(true, { id: 0, created_at: '', key: 'appname', value: appNameSetting })" color="base">
            <!-- // serache settings key: appname -->
            <ion-thumbnail  slot="start">
                <img class="logo" src="/pwa-192x192.png" style="width: 100%; height: 100%;"/>
            </ion-thumbnail>
            <ion-label>
                <h2 class="">{{ appNameSetting }}</h2>
            </ion-label>
        </ion-item>
        <ion-item :button="true" class="ion-display-flex" lines="none" v-for="setting in settings?.sort((a, b) => a.key.localeCompare(b.key))" :key="setting.id" type="button" @click="setOpen(true, setting)" color="base">
            <ion-icon :icon="homeOutline" slot="start" v-if="setting.key == 'adresse'"></ion-icon>
            <ion-icon :icon="settingsOutline" slot="start" v-else></ion-icon>
            <ion-label>
                <h3 class=""v-if="setting.key == 'adresse'">Etablissement </h3>
                <h3 class=""v-else>{{ setting.key.charAt(0).toUpperCase() + setting.key.slice(1) }} </h3>
                <ion-text v-if="setting.value" color="medium" class="">
                    <span class="">{{ setting.key.charAt(0).toUpperCase() + setting.key.slice(1) }} :</span>
                    {{ setting.value }}
                </ion-text>
            </ion-label>
        </ion-item>
        <ion-modal :is-open="isOpen" @did-dismiss="setOpen(false)">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Modifier le paramètre</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="setOpen(false)">Fermer</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <ion-item lines="none">
                    <ion-input 
                        :label="paramKey == 'appname' ? 'Nom de l\'application' : paramKey.charAt(0).toUpperCase() + paramKey.slice(1)" 
                        type="text"
                        v-model="paramValue" 
                        placeholder="Entrez le libellé"
                        label-placement="floating"
                        fill="outline" 
                        class="ion-margin-vertical"
                        helper-text="La valeur est requise"
                        required
                        >
                    </ion-input>
                </ion-item>
                <ion-button expand="block" color="success" @click="updateSetting">
                    <ion-icon slot="start"></ion-icon>
                    <ion-text>Confirmer</ion-text>
                 </ion-button> 
            </ion-content>
        </ion-modal>
        <ion-alert :is-open="alertOpen" @did-dismiss="alertOpen = false" header="Erreur" message="Une erreur est survenue" :buttons="buttonsError"></ion-alert>
    </ion-content>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonThumbnail,
    IonText, 
    IonIcon,
    IonButton,
    IonModal,
    IonTitle,
    IonButtons,
    IonInput,
    IonToolbar,
    IonAlert,
} from '@ionic/vue';
import { homeOutline, settingsOutline } from 'ionicons/icons';
import { useSettingsStore } from '../../stores/settingsStore';
import Toolbar from '../Toolbar.vue';
const paramKey = ref('');
const paramValue = ref('');
const isOpen = ref(false);
const alertOpen = ref(false);
const buttonsError = ['OK'];
const setOpen = (value: boolean, setting?: Setting) => {
    isOpen.value = value;
    if (setting) {
        paramKey.value = setting.key;
        paramValue.value = setting.value;
    } else {
        paramKey.value = '';
        paramValue.value = '';
    }
};

interface Setting {
    id: number;
    created_at: string;
    key: string;
    value: any;
}

const settingsStore = useSettingsStore();
const settings = computed(() => settingsStore.settings?.filter(s => s.key != 'appname') as Setting[]);
const appNameSetting = computed(() =>  settingsStore.settings?.find(s => s.key === 'appname')?.value ?? null);

const updateSetting = async () => {
    try {
        await settingsStore.updateSettingByKey(paramKey.value, paramValue.value);
        setOpen(false);
    } catch (error) {
        console.error(error);
        alertOpen.value = true;
    }
};

const fetchSettings = async () => {
    try {
        await settingsStore.fetchSettings();
    } catch (error) {
        alertOpen.value = true;
        console.error(error);
    }
};

onMounted(() => {
    if (!settingsStore.settings?.length) void fetchSettings();
});
</script>
<style scoped>
.logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
   color: white;
}
</style>