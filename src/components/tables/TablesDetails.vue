<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button text="" :icon="arrowBackOutline"></ion-back-button>
            </ion-buttons>
            <!-- center title -->
            <ion-title>Détails table {{ table.number }} {{ table.cart ? ' - ' + table.cart.libelle : '' }}</ion-title>
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
                            <h2>{{ table.cart ? parseFloat(table.cart?.total).toFixed(2) : '0.00' }} DA</h2>
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

    <ion-footer class="ion-display-flex ion-justify-content-center ion-padding">
        <!-- if table is opened show close button else show open button -->
        <ion-button v-if="table.cart" color="medium" fill="outline" size="large" expand="block" class="ion-flex-grow-1" @click="setOpen(true)">
            <ion-icon :icon="create" slot="start"></ion-icon>
           <ion-text>modifier</ion-text>
       </ion-button>
       <ion-button v-if="table.cart" color="danger" fill="outline" :strong="true" size="large" expand="block">
            <ion-icon :icon="lockClosed" slot="start"></ion-icon>
            <ion-text>Fermer la table</ion-text>
        </ion-button>
         <ion-button v-if="!table.cart" expand="block" color="medium" fill="outline"  size="large" @click="setTableUnavailable(table.id)">
            <ion-icon :icon="lockOpen" slot="start"></ion-icon>
            <ion-text>Désactiver</ion-text>
        </ion-button>
         <ion-button v-if="!table.cart" expand="block" color="success" fill="outline" class="ion-flex-grow-1" size="large" @click="setOpen(true)">
            <ion-icon :icon="lockOpen" slot="start"></ion-icon>
            <ion-text>Ouvrir la table</ion-text>
        </ion-button>

         <ion-modal ref="modal" :is-open="isOpen" @did-dismiss="setOpen(false)">
            <ion-content class="ion-padding">
                <ion-toolbar>
                    <ion-title>Informations</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="setOpen(false)">Fermer</ion-button>
                    </ion-buttons>
                </ion-toolbar>
                <ion-item>
                    <ion-input label="Libellé" v-model="cartLibelle"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="Nombre de personnes" type="number" v-model="cartPeople"></ion-input>
                 </ion-item>
                <ion-button expand="block" color="success" @click="openTable()">
                    <ion-icon :icon="lockOpen" slot="start"></ion-icon>
                    <ion-text>Confirmer</ion-text>
                 </ion-button>  
            </ion-content>
        </ion-modal>
    </ion-footer>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonPage, IonGrid, IonRow, IonCol, IonIcon, IonItem, IonText, IonButton, IonList, IonLabel, IonInput, IonModal, IonFooter } from '@ionic/vue';
import { arrowBackOutline, people, add, create, lockClosed, lockOpen } from 'ionicons/icons';
import { getElapsed } from '../../utils/functions';
import { supabase } from '../../utils/supabase';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const isOpen = ref(false);
const setOpen = (open: boolean) => (isOpen.value = open);

const props = defineProps({
    table: {
        type: Object,
        required: true
    }
})

const cartLibelle = ref(props.table.cart ? props.table.cart.libelle : '');
const cartPeople = ref(props.table.cart ? props.table.cart.guests : 0);

function openTable() {
    supabase.from('carts').upsert({
        id: props.table.cart ? props.table.cart.id : undefined, // If cart exists, use its ID to update, otherwise create new
        table_id: props.table.id,
        total: props.table.cart ? props.table.cart.total : '0',
        guests: cartPeople.value,
        libelle: cartLibelle.value
    }).select().then(({ data, error }) => {
        if (error) {
            console.error('Error creating cart:', error);
        } else {
            // close the modal
            setOpen(false);
            console.log('Cart created successfully:', data);
            // Update the table's cart to reflect the new cart
            if (data && data.length > 0) {
                props.table.cart = data[0]; // Assuming the upsert returns the created/updated cart
            }
        }
    });
}

function setTableUnavailable(tableId: number) {
	supabase.from('tables').update({ status: 'unavailable' }).eq('id', tableId).select().then(({ data, error }) => {
		if (error) {
			console.error('Error updating table:', error);
		} else {
			console.log('Table updated:', data);
            // Update the table's status locally
            props.table.status = 'unavailable';
            // navigate back to the tables list
            router.go(-1);
		}
	});
}
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