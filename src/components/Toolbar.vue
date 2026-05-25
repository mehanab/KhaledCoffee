<template>
    <ion-toolbar color="base" class="bg-dark">
        <ion-buttons slot="start">
            <ion-menu-button v-if="props.showMenuButton"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ props.title }}</ion-title>

        <ion-buttons slot="end">
            <ion-button v-if="!isLoggedIn" router-link="/login">
                <ion-icon :icon="logIn"></ion-icon>
            </ion-button>
            <ion-button v-else router-link="/logout" >
                <ion-icon :icon="logOut"></ion-icon>
            </ion-button>
        </ion-buttons>
    </ion-toolbar>
</template>

<script setup lang="ts">
    import { IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/vue';
    import { logIn, logOut } from 'ionicons/icons';
    import { useAuthStore } from '@/stores/auth';

    const auth = useAuthStore();
    const isLoggedIn = auth.isLoggedIn;

    const props = defineProps({
        title: {
            type: String,
            default: 'Khaled Coffee'
        },
        showMenuButton: {
            type: Boolean,
            default: true
        }
    });
</script>