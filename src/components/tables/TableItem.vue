<template>
    <ion-item :button="true" class="table opened unavailable" lines="none" color="none" :disabled="table.status === 'unavailable'">
        <ion-grid>
            <ion-row class="ion-align-items-center">

                <!-- Table -->
                <ion-col size="2" class="ion-text-center">
                    <ion-img src="/table.svg"></ion-img>
                    <ion-label color="primary">
                        <h2>{{ table.number }}</h2>
                    </ion-label>
                </ion-col>

                <!-- Informations -->
                <ion-col>
                    <ion-label color="primary">
                        <h3>
                            <strong>
                                <ion-text color="secondary">
                                    {{ table.cart?.libelle }}
                                </ion-text>
                            </strong>
                        </h3>

                        <p>
                            <ion-icon :icon="peopleOutline"></ion-icon>
                            <ion-text color="medium" class="ion-padding-start">
                                {{ table.cart && table.status === 'available' ? table.cart.guests : 0 }}
                            </ion-text>
                        </p>

                        <p v-if="table.cart && table.status === 'available'">
                            {{ new Date(table.cart.created_at).toLocaleString('fr-FR', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                            }) }}
                        </p>
                        <p v-else>
                            <ion-text :color="table.status == 'available' ? 'primary' : 'danger'">{{ table.status == 'available' ? 'Disponible' : 'Indisponible' }}</ion-text>
                        </p>
                    </ion-label>
                </ion-col>

                <!-- Total -->
                <ion-col size="4" class="ion-text-end">
                    <ion-text :color="table.cart && table.status == 'available' ? 'secondary' : 'medium'">
                        {{ Number(table.cart?.total || 0).toFixed(2) }} {{ currency }}
                    </ion-text>

                    <p v-if="table.cart" class="ion-padding-top">
                        {{ getElapsed(table.cart.created_at, now) }}
                    </p>
                </ion-col>

            </ion-row>
        </ion-grid>
    </ion-item>
</template>
<script setup lang="ts">
import { IonItem, IonGrid, IonRow, IonCol, IonImg, IonLabel, IonText, IonIcon } from '@ionic/vue'
import { peopleOutline } from 'ionicons/icons'

defineProps<{
    table: any
    currency: string
    now: Date
    getElapsed: (createdAt: string, now: Date) => string
}>()
</script>
