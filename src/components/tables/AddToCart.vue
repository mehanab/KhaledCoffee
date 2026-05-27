<template>
    <ion-header>
        <ion-toolbar color="base">
            <ion-buttons slot="start">
                <ion-back-button default-href="/tables"></ion-back-button>
            </ion-buttons>
            <ion-title>Ajouter au panier</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
        <p>Contenu du modal pour ajouter des articles au panier de la table {{ props.table.name }}</p>
    </ion-content>

    <ion-footer>
        <ion-alert
            :is-open="isAlertOpen"
            :buttons="alertButtons"
            @didDismiss="setAlertOpen(false)"
            >
        </ion-alert>

        <ion-alert
            :is-open="acceptCloseTable"
            header="Confirmer la fermeture de la table"
            sub-header="Êtes-vous sûr de vouloir fermer la table ?"
            :buttons="[
                {
                    text: 'Annuler',
                    role: 'cancel',
                    handler: () => {
                        setAcceptCloseTable(false);
                    }
                },
                {
                    text: 'Confirmer',
                    handler: () => {
                        setAcceptCloseTable(false);
                        setCloseTable(true);
                    }
                }
            ]"
            @didDismiss="setAcceptCloseTable(false)"
            >
        </ion-alert>
    </ion-footer>
</template> 

<script setup lang="ts">
    import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonFooter, IonAlert } from '@ionic/vue';
    import { useTableStore } from '../../stores/tableStore';
    import { ref } from 'vue';

    const tableStore = useTableStore();

    const props = defineProps({
        table: {
            type: Object,
            required: true
        }
    });

    const isAlertOpen = ref(false);
    const acceptCloseTable = ref(false);

    const setAlertOpen = (value: boolean) => {
        isAlertOpen.value = value;
    };

    const setAcceptCloseTable = (value: boolean) => {
        acceptCloseTable.value = value;
    };

    const setCloseTable = (value: boolean) => {
        tableStore.closeTable(props.table.id);
    };
</script>