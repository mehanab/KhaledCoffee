<template>
    <ion-modal ref="modal" trigger="open-modal">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="cancel()">X</ion-button>
                </ion-buttons>
                <ion-title>Ajouter des articles</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-searchbar @click="" placeholder="Rechercher"></ion-searchbar>
            <p>Contenu du modal pour ajouter des articles au panier de la table {{ props.table.name }}</p>
        </ion-content>

    </ion-modal>

</template> 

<script setup lang="ts">
    import { IonHeader, IonToolbar, IonButtons, IonTitle, IonContent, IonButton, IonModal, IonSearchbar } from '@ionic/vue';
    import { useTableStore } from '../../stores/tableStore';
    import { ref } from 'vue';

    const tableStore = useTableStore();
    const modal = ref();

    const cancel = () => modal.value.$el.dismiss(null, 'cancel');

    const confirm = () => {
        modal.value.$el.dismiss(null, 'confirm');
    };

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