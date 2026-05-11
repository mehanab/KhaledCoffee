<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button text="" :icon="arrowBackOutline"></ion-back-button>
            </ion-buttons>
            <!-- center title -->
            <ion-title>Tables détails</ion-title>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
            <ion-grid class="ion-text-center" :fixed="true">
                <ion-row class="first-row row">
                    <ion-col>
                        <ion-text color="medium">
                            <p>Occupants</p>
                        </ion-text>
                        <ion-text color="medium">
                            <ion-icon :icon="people"></ion-icon>
                        </ion-text>
                        <ion-text class="ion-padding">{{ table.cart ? table.cart.guests : '0' }}</ion-text>
                    </ion-col>
                    <ion-col>
                        <ion-text color="medium">
                            <p>Ouverture</p>
                        </ion-text>
                        <span>{{ table.cart ? new Date(table.cart.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A' }}</span>
                    </ion-col>
                    <ion-col>
                        <ion-text color="medium">
                            <p>Ecoulé</p>
                        </ion-text>
                        <ion-text color="primary">{{ table.cart ? getElapsed(table.cart.created_at) : '00:00' }}</ion-text>
                    </ion-col>
                </ion-row>
                 <ion-row class="row">
                    <ion-col>
                        <ion-text color="medium">
                            <p>Total</p>
                        </ion-text>

                        <ion-text>
                            <h2>{{ parseFloat(table.cart.total).toFixed(2) }} DA</h2>
                        </ion-text>
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-list v-if="table.cart?.items && table.cart.items.length > 0">
                <ion-item v-for="(item, index) in table.cart?.items || []" :key="index">
                    <ion-label>
                        <h2>{{ item.name }}</h2>
                        <p>Prix unitaire : {{ parseFloat(item.price).toFixed(2) }} DA</p>
                        <p>Quantité : {{ item.quantity }}</p>
                        <p>Total : {{ (parseFloat(item.price) * item.quantity).toFixed(2) }} DA</p>
                    </ion-label>
                </ion-item>
            </ion-list>
             <ion-button expand="block" color="medium" type="button" class="ion-margin-top" fill="outline">
                <ion-icon :icon="add"></ion-icon>
                <ion-text class="ion-padding-start">Ajouter des articles</ion-text>
            </ion-button>

    </ion-content>
</template>

<script setup lang="ts">
  import { IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonPage, IonGrid, IonRow, IonCol, IonIcon, IonItem, IonText, IonButton, IonList, IonLabel } from '@ionic/vue';
  import { arrowBackOutline, people, add } from 'ionicons/icons';
  import { getElapsed } from '../../utils/functions';

  defineProps({
    table: {
      type: Object,
      required: true
    }
  })


</script>

<style scoped>
.first-row {
    background-color: rgb(27, 27, 27);
    border-radius: 10px;
}

.row {
    padding: 1em 0;
}
</style>