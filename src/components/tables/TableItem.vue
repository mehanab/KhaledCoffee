<template>
    <ion-item :button="true" :class="{ opened: table.cart, unavailable: table.status === 'unavailable' }" lines="none" color="none" :disabled="table.status === 'unavailable'">
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
                    <p>
                        <ion-text :color="table.cart && table.status == 'available' ? 'secondary' : 'medium'">
                            {{ Number(table.cart?.total || 0).toFixed(2) }} {{ currency }}
                        </ion-text>
                    </p>
                    <p v-if="table.cart">
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
    currency: string|undefined|null
    now: Date
    getElapsed: (createdAt: string, now: Date) => string
}>()
</script>
<style scoped>
.tables {

	.table {
		.table-text {
			font-size: 0.8rem;
		}
		
		.table-number {
			font-size: 1.8rem;
			font-weight: 900;
			letter-spacing: 0.5px;
			display: inline-block;
			margin-right: 0.5em;
		}

		&.opened {
			--border-width: 0 0px 0 0px;
			--border-style: solid;
			--border-color: var(--ion-color-primary);
		}

		/* &.closed {
			--border-color: var(--ion-color-medium);
		}

		&.unavailable {
			--border-color: var(--ion-color-danger);
		} */
	}
}

</style>

