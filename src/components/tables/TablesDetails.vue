<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button text="" :icon="arrowBackOutline"></ion-back-button>
            </ion-buttons>
            <!-- center title -->
            <ion-title>Détails table {{ table.number }} {{ table.cart && table.cart.libelle ? ' - ' + table.cart.libelle : '' }}</ion-title>
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
             <ion-button expand="block" color="medium" type="button" class="ion-margin-top" fill="outline" :disabled="!table.cart" id="open-modal">
                <ion-icon :icon="add"></ion-icon>
                <ion-text class="ion-padding-start">Ajouter des articles</ion-text>
            </ion-button>
            <add-to-cart :table="table"></add-to-cart>
    </ion-content>

    <ion-footer class="ion-display-flex ion-justify-content-center ion-padding">
        <!-- if table is opened show close button else show open button -->
        <ion-button v-if="table.cart" color="medium" fill="outline" size="large" expand="block" class="ion-flex-grow-1" @click="setOpen(true)">
            <ion-icon :icon="create" slot="start"></ion-icon>
           <ion-text>modifier</ion-text>
       </ion-button>
       <ion-button v-if="table.cart" color="danger" fill="outline" :strong="true" size="large" expand="block" @click="setAcceptCloseTable(true)">
            <ion-icon :icon="lockClosed" slot="start"></ion-icon>
            <ion-text>Fermer la table</ion-text>
        </ion-button>
         <ion-button v-if="!table.cart" expand="block" color="medium" fill="outline"  size="large" @click="setTableStatus(table.id, 'unavailable')" :disabled="disableBtns">
            <ion-icon :icon="lockOpen" slot="start"></ion-icon>
            <ion-text>Désactiver</ion-text>
        </ion-button>
         <ion-button v-if="!table.cart" expand="block" color="success" fill="outline" class="ion-flex-grow-1" size="large" @click="setOpen(true)" :disabled="disableBtns">
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
                <ion-button expand="block" color="success" @click="openUpdateTable()">
                    <ion-icon :icon="lockOpen" slot="start"></ion-icon>
                    <ion-text>Confirmer</ion-text>
                 </ion-button>  
            </ion-content>
        </ion-modal>

        <ion-alert  :is-open="isAlertOpen"
            header="Erreur"
            sub-header="Une erreur est survenue"
            message="Une erreur est survenue lors de la mise à jour de la table."
            :buttons="alertButtons"
            @didDismiss="setAlertOpen(false)"
            >
        </ion-alert>

        <ion-alert  :is-open="acceptCloseTable"
            header="Confirmation"
            sub-header="Voulez-vous vraiment fermer la table ?"
            message="Cette action est irréversible."
            :buttons="acceptCloseTableButtons"
            @didDismiss="setAcceptCloseTable(false)"
            >
        </ion-alert>
    </ion-footer>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonPage, IonGrid, IonRow, IonCol, IonIcon, IonItem, IonText, IonButton, IonList, IonLabel, IonInput, IonModal, IonFooter, IonAlert } from '@ionic/vue';
import { arrowBackOutline, people, add, create, lockClosed, lockOpen } from 'ionicons/icons';
import { getElapsed } from '../../utils/functions';
import { ref, inject } from 'vue';

import { useTableStore } from '../../stores/tableStore';
import { useCartStore } from '../../stores/cartStore';
import { useOrderStore } from '../../stores/orderStore';
import AddToCart from '../modals/AddToCart.vue';
const tableStore = useTableStore();
const cartStore = useCartStore();
const orderStore = useOrderStore();

const isOpen = ref(false);
const setOpen = (open: boolean) => (isOpen.value = open);
const disableBtns = ref(false);
const isAlertOpen = ref(false);

// alert state and buttons
const setAlertOpen = (open: boolean) => (isAlertOpen.value = open);
const alertButtons = [
    {
        text: 'Fermer',
        role: 'cancel',
        handler: () => {            
            setAlertOpen(false);
        }
    }
];

const acceptCloseTable = ref(false);
const setAcceptCloseTable = (open: boolean) => (acceptCloseTable.value = open);
const acceptCloseTableButtons = [
    {
        text: 'Confirmer',
        handler: async () => {
            //insert order
            if (props.table.cart) {
                try {
                    await orderStore.createOrder({
                        table_id: props.table.id,
                        guests: props.table.cart.guests,
                        total: props.table.cart.total,
                        libelle: props.table.cart.libelle,
                        user_id: props.table.cart.user_id,
                    }, props.table.cart.carts_items.map((item: any) => ({
                        product_name: item.name,
                        category_name: item.category_name,
                        product_unit_price: item.price,
                        total_price: item.price * item.quantity,
                        quantity: item.quantity,
                        product_image_path: item.image_path
                    })));

                } catch (error) {
                    console.error('Error inserting order:', error);
                    setAlertOpen(true);
                    return;
                }
            
                //delete cart
                try {
                    await cartStore.deleteCart(props.table.cart.id);
                } catch (error) {
                    console.error('Error deleting cart:', error);
                    setAlertOpen(true);
                    return;
                }

                props.table.cart = null;
                await setTableStatus(props.table.id, 'available');
            }
            setAcceptCloseTable(false);
        }
    },
    {
        text: 'Annuler',
        role: 'cancel',
        handler: () => {            
            setAcceptCloseTable(false);
        }
    }
];

const props = defineProps({
    table: {
        type: Object,
        required: true
    }
})

const cartLibelle = ref(props.table.cart ? props.table.cart.libelle : '');
const cartPeople = ref(props.table.cart ? props.table.cart.guests : 0);

async function openUpdateTable() {

    try {
        // Call the store action to update the table's cart
        const updatedCart = await cartStore.upsertCart({
            id: props.table.cart ? props.table.cart.id : undefined,
            table_id: props.table.id,
            total: props.table.cart ? props.table.cart.total : '0',
            guest_count: cartPeople.value,
            libelle: cartLibelle.value,
        });
        setOpen(false);
        props.table.cart = updatedCart;
    } catch (error) {
        console.error('Error updating table cart:', error);
        setAlertOpen(true);
    }
}

// nav est fourni par le composant parent (HomePage) via provide/inject pour permettre la navigation depuis ce composant modal vers la liste des tables après une mise à jour.
const nav = inject<any>('ionNav');

async function setTableStatus(tableId: number, status: 'available' | 'unavailable') {
    // check correct param status : available or unavailable 
    if (status !== 'available' && status !== 'unavailable') {
        console.error('Invalid status:', status);
        setAlertOpen(true);
        return;
    }

    try {
    // Call the store action to set the table as unavailable
        await tableStore.setTableStatus(tableId, status);

        // Update the table's status locally
        props.table.status = status;
        // disable the openTableActivate button
        disableBtns.value = true;
        // navigate back to the tables list
        nav?.value?.$el.popToRoot();

    } catch (error) {
        console.error('Error setting table unavailable:', error);
        setAlertOpen(true);
    }
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