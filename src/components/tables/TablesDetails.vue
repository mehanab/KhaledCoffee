<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button text="" :icon="arrowBackOutline"></ion-back-button>
            </ion-buttons>
            <!-- center title -->
            <ion-title>Détails table {{ currentTable.number }} {{ currentTable.cart && currentTable.cart.libelle ? ' - ' + currentTable.cart.libelle : '' }}</ion-title>
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
                        <ion-text class="ion-padding">{{ currentTable.cart ? currentTable.cart.guests : '0' }}</ion-text>
                    </ion-col>
                    <ion-col>
                        <ion-text color="medium">
                            <p>Ouverture</p>
                        </ion-text>
                        <span>{{ currentTable.cart ? new Date(currentTable.cart.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A' }}</span>
                    </ion-col>
                    <ion-col>
                        <ion-text color="medium">
                            <p>Ecoulé</p>
                        </ion-text>
                        <ion-text color="primary">{{ currentTable.cart ? getElapsed(currentTable.cart.created_at) : '00:00' }}</ion-text>
                    </ion-col>
                </ion-row>
                 <ion-row class="row">
                    <ion-col>
                        <ion-text color="medium">
                            <p>Total</p>
                        </ion-text>

                        <ion-text>
                            <h2>{{ currentTable.cart ? parseFloat(currentTable.cart?.total).toFixed(2) : '0.00' }} DA</h2>
                        </ion-text>
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-list v-if="currentTable.cart?.carts_items && currentTable.cart.carts_items.length > 0">
                <ion-item v-for="(item, index) in (currentTable.cart?.carts_items || []).sort((a: any, b: any) => a.product_name.localeCompare(b.product_name))" :key="index" :lines="index === (currentTable.cart?.carts_items || []).length - 1 ? 'none' : 'full'">
                     <ion-avatar slot="start">
                        <img v-if="item.product_image_path" :src="item.product_image_path" />
                        <ion-icon v-else :icon="image" size="large"></ion-icon>
                    </ion-avatar>
                    <ion-label>
                        <h2>{{ item.product_name }}</h2>
                        <p>{{ parseFloat(item.product_unit_price).toFixed(2) }} DA</p>
                    </ion-label>
                    <ion-button fill="clear" size="small" @click="updateCartItemQuantity(item, item.quantity - 1)" color="medium">
                        <ion-icon :icon="removeCircleOutline" size="large"></ion-icon>
                    </ion-button>
                    <div slot="end">{{ item.quantity }}</div>
                    <ion-button fill="clear" size="small" slot="end" @click="updateCartItemQuantity(item, item.quantity + 1)">
                        <ion-icon :icon="addCircleOutline" size="large"></ion-icon>
                    </ion-button>
                </ion-item>
            </ion-list>
             <ion-button expand="block" color="medium" type="button" class="ion-margin-top" fill="outline" :disabled="!currentTable.cart" id="open-modal">
                <ion-icon :icon="add"></ion-icon>
                <ion-text class="ion-padding-start">Ajouter des articles</ion-text>
            </ion-button>
            <add-to-cart :table="currentTable"></add-to-cart>
    </ion-content>

    <ion-footer class="ion-display-flex ion-justify-content-center ion-padding">
        <!-- if table is opened show close button else show open button -->
        <ion-button v-if="currentTable.cart" color="light" fill="solid" size="large" expand="block" class="ion-flex-grow-1" @click="setOpen(true)">
            <ion-icon :icon="create" slot="start"></ion-icon>
           <ion-text>modifier</ion-text>
       </ion-button>
       <ion-button v-if="currentTable.cart" fill="solid" size="large" expand="block" @click="setAcceptCloseTable(true)" class="detail-table-close-btn">
            <ion-icon :icon="lockClosed" slot="start" color="danger"></ion-icon>
            <ion-text color="danger">Fermer la table</ion-text>
        </ion-button>
         <ion-button v-if="!currentTable.cart" expand="block" color="light" fill="solid"  size="large" @click="setCurrentTableStatus('unavailable')" :disabled="disableBtns">
            <ion-icon :icon="lockOpen" slot="start"></ion-icon>
            <ion-text>Désactiver</ion-text>
        </ion-button>
         <ion-button v-if="!currentTable.cart" expand="block" fill="solid" class="ion-flex-grow-1 detail-table-open-btn" size="large" @click="setOpen(true)" :disabled="disableBtns">
            <ion-icon :icon="lockOpen" slot="start" color="success"></ion-icon>
            <ion-text color="success">Ouvrir la table</ion-text>
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
import { IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonGrid, IonRow, IonCol, IonIcon, IonItem, IonText, IonButton, IonList, IonLabel, IonInput, IonModal, IonFooter, IonAlert, IonAvatar } from '@ionic/vue';
import { arrowBackOutline, people, add, create, lockClosed, lockOpen, addCircleOutline, removeCircleOutline, image } from 'ionicons/icons';
import { getElapsed } from '../../utils/functions';
import { ref, inject, computed, watch } from 'vue';

import { useTableStore } from '../../stores/tableStore';
import { useOrderStore } from '../../stores/orderStore';
import AddToCart from '../modals/AddToCart.vue';

const tableStore = useTableStore();
const orderStore = useOrderStore();

const props = defineProps({
    table: {
        type: Object,
        required: true
    }
})

// set the current table in the store when the component is mounted
tableStore.currentTable = props.table;
const currentTable = computed(() => tableStore.currentTable);

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
            if (currentTable.value.cart) {
                try {
                    if(!currentTable.value.cart ) {
                        throw new Error('Cart ID is undefined');
                    }
                    await orderStore.createOrder(currentTable.value.cart);

                } catch (error) {
                    console.error('Error inserting order:', error);
                    setAlertOpen(true);
                    return;
                }
            
                //delete cart
                try {
                    if(!currentTable.value.cart || !currentTable.value.cart.id) {
                        throw new Error('Cart ID is undefined');
                    }
                    await tableStore.deleteCart(currentTable.value.cart.id);
                } catch (error) {
                    console.error('Error deleting cart:', error);
                    setAlertOpen(true);
                    return;
                }

                tableStore.currentTable.cart = null;
                await setCurrentTableStatus('available');
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

const cartLibelle = ref('')
const cartPeople = ref(0)

async function openUpdateTable() {

    try {
        // Call the store action to update the table's cart
        const updatedCart = await tableStore.upsertCart({
            id: currentTable.value.cart ? currentTable.value.cart.id : undefined,
            table_id: currentTable.value.id,
            total: currentTable.value.cart ? currentTable.value.cart.total : '0',
            guest_count: cartPeople.value,
            libelle: cartLibelle.value,
        });
        setOpen(false);
        tableStore.currentTable.cart = updatedCart;
    } catch (error) {
        console.error('Error updating table cart:', error);
        setAlertOpen(true);
    }
}

// nav est fourni par le composant parent (HomePage) via provide/inject pour permettre la navigation depuis ce composant modal vers la liste des tables après une mise à jour.
const nav = inject<any>('ionNav');

async function setCurrentTableStatus(status: 'available' | 'unavailable') {
    // check correct param status : available or unavailable 
    if (status !== 'available' && status !== 'unavailable') {
        console.error('Invalid status:', status);
        setAlertOpen(true);
        return;
    }

    try {
    // Call the store action to set the table as unavailable
        await tableStore.setTableStatus(currentTable.value.id, status);

        // Update the table's status locally
        tableStore.currentTable.status = status;
        // disable the openTableActivate button
        disableBtns.value = true;
        // navigate back to the tables list
        nav?.value?.$el.popToRoot();

    } catch (error) {
        console.error('Error setting table status:', error);
        setAlertOpen(true);
    }
}

watch(() => tableStore.currentTable, (table) => {
        cartLibelle.value = table?.cart?.libelle ?? ''
        cartPeople.value = table?.cart?.guests ?? 0
    },
    { immediate: true }
)


const updateCartItemQuantity = async (cartItem: any, quantity: number) => {
    try {
        if (!currentTable.value.cart) {
            console.error('No cart found for this table');
            return;
        }

        if(quantity <= 0) {
            console.log('Quantity is zero or negative, removing item from cart');
            return;
        }

        const data = await tableStore.updateCartItemQuantity(currentTable.value.cart, cartItem, quantity);
        // Update the local cart data in the table store
        console.log('Upserted cart item data:', data);
        tableStore.currentTable.cart = data;

    } catch (error) {
        console.error('Error upserting cart item:', error);
    }
};
</script>

<style scoped>
.first-row {
    background-color: rgb(27, 27, 27);
    border-radius: 10px;
}

.row {
    padding: 1em 0;
}

ion-button {
    &.detail-table-close-btn {
        --background: #462d2d;
        --opacity: 0.5;
    }

    &.detail-table-open-btn {
        --background: #2c412d;
        --opacity: 0.5;
    }
}
</style>