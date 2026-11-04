<template>
    <ion-header :translucent="false">
        <Toolbar :title="'Historique'" :showMenuButton="false">
        </Toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="history-content ion-padding">
        <ion-segment v-model="selectedPeriod" @ionChange="handlePeriodChange">
            <ion-segment-button value="today">
                <ion-label>Aujourd'hui</ion-label>
            </ion-segment-button>
            <ion-segment-button value="week">
                <ion-label>Cette semaine</ion-label>
            </ion-segment-button>
            <ion-segment-button value="month">
                <ion-label>Ce mois</ion-label>
            </ion-segment-button>
        </ion-segment>

        <div class="search-row">
            <ion-searchbar
                v-model="searchTerm"
                class="searchbar"
                placeholder="Rechercher une commande..."
                :debounce="150"
            />
            <ion-button
                id="open-modal"
                class="filter-button"
                fill="outline"
                aria-label="Ouvrir les filtres"
            >
                <ion-icon :icon="filterOutline" />
            </ion-button>
        </div>

        <ion-grid class="summary-grid">
            <ion-row>
                <ion-col>
                    <ion-icon :icon="cashOutline" />
                    <span>Chiffre d'affaires</span>
                    <strong>{{ formatAmount(metrics.revenue) }}</strong>
                </ion-col>
                <ion-col>
                    <ion-icon :icon="receiptOutline" />
                    <span>Commandes</span>
                    <strong>{{ metrics.count }}</strong>
                </ion-col>
                <ion-col>
                    <ion-icon :icon="trendingUpOutline" />
                    <span>Panier moyen</span>
                    <strong>{{ formatAmount(metrics.average) }}</strong>
                </ion-col>
            </ion-row>
        </ion-grid>

        <ion-spinner v-if="loading" class="loading-spinner" />
        <ion-text v-else-if="loadError" color="danger">
            <p class="history-message">{{ loadError }}</p>
        </ion-text>
        <ion-text v-else-if="filteredOrders.length === 0" color="medium">
            <p class="history-message">Aucune commande pour cette période.</p>
        </ion-text>

        <ion-item
            v-else
            v-for="order in filteredOrders"
            :key="order.id"
            type="button"
            @click="openOrder(order)"
            class="ion-display-flex ion-hide-print"
        >
            <ion-text color="medium">
                {{ formatTime(order.created_at) }}
            </ion-text>

            <ion-label class="ion-margin-start">
                <h2>
                    <ion-icon :icon="restaurantOutline" />
                    Table {{ getTableName(order) }}
                </h2>

                <p>
                    <ion-icon :icon="personOutline" />
                    {{ getServerName(order) }}
                </p>
            </ion-label>

            <ion-note slot="end">
                {{ getItemCount(order) }} articles
            </ion-note>

            <ion-label slot="end" class="ion-text-end">
                <h2>{{ formatAmount(order.total) }}</h2>
                <p>{{ getStatusLabel(order) }}</p>
            </ion-label>
        </ion-item>

        <!-- Version dédiée à l'impression -->
        <div class="orders-list ion-hide-screen orders-grid">
            <div
                v-for="order in filteredOrders"
                :key="order.id"
                class="order-card"
                type="button"
            >
                <span class="order-time">{{ formatTime(order.created_at) }}</span>
                <span class="order-details">
                    <span class="order-table">
                        <ion-icon :icon="restaurantOutline" />
                        Table {{ getTableName(order) }}
                    </span>
                    <span class="order-server">
                        <ion-icon :icon="personOutline" />
                        {{ getServerName(order) }}
                    </span>
                </span>
                <span class="order-count">{{ getItemCount(order) }} articles</span>
                <span class="order-total">
                    <strong>{{ formatAmount(order.total) }}</strong>
                    <span class="order-status">{{ getStatusLabel(order) }}</span>
                </span>
                <ion-icon class="order-chevron" :icon="chevronForwardOutline" />
            </div>
        </div>

        <ion-button
            expand="block"
            fill="outline"
            class="export-button"
            :disabled="filteredOrders.length === 0"
            @click="exportPdf"
        >
            <ion-icon slot="start" :icon="documentTextOutline" />
            Exporter PDF
        </ion-button>

        <ion-modal
            ref="filtersModal"
            trigger="open-modal"
            :initial-breakpoint="0.5"
            :breakpoints="[0, 0.25, 0.5, 0.75]"
            class="filters-modal"
        >
            <ion-content class="ion-padding">
                <div class="filters-heading">
                    <div>
                        <ion-icon :icon="filterOutline" />
                        <strong>Filtres</strong>
                    </div>
                </div>

                <div class="filters-grid">
                    <ion-select v-model="selectedPeriod" label="Période" label-placement="stacked" interface="popover">
                        <ion-select-option value="today">Aujourd'hui</ion-select-option>
                        <ion-select-option value="week">Cette semaine</ion-select-option>
                        <ion-select-option value="month">Ce mois</ion-select-option>
                        <ion-select-option value="all">Tout l'historique</ion-select-option>
                    </ion-select>

                    <ion-select v-model="selectedServer" label="Serveur" label-placement="stacked" interface="popover">
                        <ion-select-option value="all">Tous</ion-select-option>
                        <ion-select-option v-for="server in serverOptions" :key="server.id" :value="server.id">
                            {{ server.name }}
                        </ion-select-option>
                    </ion-select>

                    <ion-select v-model="selectedTable" label="Table" label-placement="stacked" interface="popover">
                        <ion-select-option value="all">Toutes</ion-select-option>
                        <ion-select-option v-for="table in tableOptions" :key="table.id" :value="table.id">
                            Table {{ table.name }}
                        </ion-select-option>
                    </ion-select>

                    <ion-select v-model="selectedStatus" label="Statut" label-placement="stacked" interface="popover">
                        <ion-select-option value="all">Tous</ion-select-option>
                        <ion-select-option v-for="status in statusOptions" :key="status" :value="status">
                            {{ status }}
                        </ion-select-option>
                    </ion-select>

                </div>
                <ion-button fill="outline" class="ion-margin-top" @click="resetFilters" expand="block">
                    <ion-icon slot="start" :icon="refreshOutline" />
                    Réinitialiser
                </ion-button>
            </ion-content>
        </ion-modal>

        <ion-modal :is-open="Boolean(activeOrder)" @didDismiss="activeOrder = null" class="detail-order-modal">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Commande #{{ activeOrder?.id }}</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="activeOrder = null">Fermer</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content v-if="activeOrder" class="ion-padding">
                <div class="ion-modal-hide-print">
                    <p>Table {{ getTableName(activeOrder) }} · {{ formatDateTime(activeOrder.created_at) }}</p>
                    <p>Serveur : {{ getServerName(activeOrder) }}</p>
                    <ion-list>
                        <ion-item v-for="(item, index) in activeOrder.order_items ?? []" :key="item.id ?? index">
                            <ion-label>
                                <h2>{{ item.product_name }}</h2>
                                <p>{{ item.quantity }} × {{ formatAmount(item.product_unit_price) }}</p>
                            </ion-label>
                            <ion-text slot="end">{{ formatAmount(item.total_price) }}</ion-text>
                        </ion-item>
                        <ion-item>
                            <ion-label><strong>Total</strong></ion-label>
                            <ion-text slot="end"><strong>{{ formatAmount(activeOrder.total) }}</strong></ion-text>
                        </ion-item>
                    </ion-list>
                </div>
                  <!-- Version dédiée à l'impression -->
                <div class="orders-list ion-modal-hide-screen">
                    <h2>Commande #{{ activeOrder?.id }}</h2>
                    <div
                        v-for="order in filteredOrders"
                        :key="order.id"
                    >
                        <p>Table {{ getTableName(order) }} · {{ formatDateTime(order.created_at) }}</p>
                        <p>Serveur : {{ getServerName(order) }}</p>
                        <ul>
                            <li v-for="(item, index) in order.order_items ?? []" :key="item.id ?? index">
                                {{ item.quantity }} × {{ item.product_name }} - {{ formatAmount(item.total_price) }}
                            </li>
                        </ul>
                        <p><strong>Total : {{ formatAmount(order.total) }}</strong></p>
                    </div>
                </div>
                <ion-button
                    expand="block"
                    fill="outline"
                    class="export-button"
                    @click="exportPdf('modal')"
                >
                    <ion-icon slot="start" :icon="documentTextOutline" />
                    Exporter PDF
                </ion-button>
            </ion-content>
            
        </ion-modal>
    </ion-content>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonRow,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
    IonNote
} from '@ionic/vue';
import { useRoute } from 'vue-router';
import {
    cashOutline,
    chevronForwardOutline,
    documentTextOutline,
    filterOutline,
    personOutline,
    receiptOutline,
    refreshOutline,
    restaurantOutline,
    trendingUpOutline,
} from 'ionicons/icons';
import { useOrderStore } from '../../stores/orderStore';
import { useTableStore } from '../../stores/tableStore';
import Toolbar from '../Toolbar.vue';

defineOptions({ name: 'HistoryPage' });

interface HistoryOrder {
    id: number | string;
    created_at: string;
    table_id: number | string;
    user_id?: string | null;
    user?: HistoryServer | null;
    total: number | string | null;
    order_items?: HistoryOrderItem[];
    [key: string]: unknown;
}

interface HistoryOrderItem {
    id?: number | string;
    product_name?: string;
    quantity?: number | string;
    product_unit_price?: number | string;
    total_price?: number | string;
}

interface HistoryTable {
    id: number | string;
    number: number | string;
}

interface HistoryServer {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
}

type Period = 'today' | 'week' | 'month' | 'all';

const orderStore = useOrderStore();
const tableStore = useTableStore();
const orders = computed(() => orderStore.orders as HistoryOrder[]);
const tables = computed(() => tableStore.tables as HistoryTable[]);
const loading = ref(false);
const loadError = ref('');
const searchTerm = ref('');
const selectedPeriod = ref<Period>('today');
const selectedServer = ref('all');
const selectedTable = ref('all');
const selectedStatus = ref('all');
const filtersModal = ref<{ $el: HTMLIonModalElement } | null>(null);
const activeOrder = ref<HistoryOrder | null>(null);

const serverOptions = computed(() => {
    const uniqueServers = new Map<string, HistoryServer>();
    for (const order of orders.value) {
        if (order.user_id && order.user) uniqueServers.set(order.user_id, order.user);
    }
    return [...uniqueServers].map(([id, server]) => ({
        id,
        name: [server.first_name, server.last_name].filter(Boolean).join(' ') || 'Serveur',
    }));
});

const tableOptions = computed(() => tables.value.map(table => ({
    id: String(table.id),
    name: String(table.number),
})));

const statusOptions = computed(() => {
    const values = getDistinctOrderValues(['payment_status', 'status']);
    return values.length ? values : ['Terminée'];
});

const filteredOrders = computed(() => {
    const query = searchTerm.value.trim().toLocaleLowerCase('fr');

    return orders.value.filter(order => {
        if (!isInSelectedPeriod(order.created_at)) return false;
        if (selectedServer.value !== 'all' && order.user_id !== selectedServer.value) return false;
        if (selectedTable.value !== 'all' && String(order.table_id) !== selectedTable.value) return false;
        if (selectedStatus.value !== 'all' && getStatusLabel(order) !== selectedStatus.value) return false;
        if (!query) return true;

        const searchable = [
            order.id,
            getTableName(order),
            getServerName(order),
            order.libelle,
            ...(order.order_items ?? []).map(item => item.product_name),
        ].join(' ').toLocaleLowerCase('fr');

        return searchable.includes(query);
    });
});

const metrics = computed(() => {
    const revenue = filteredOrders.value.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
    const count = filteredOrders.value.length;
    return { revenue, count, average: count ? revenue / count : 0 };
});

const route = useRoute();

// Chargement initial si le store est vide
onMounted(() => {
    if (orderStore.orders.length === 0) void loadHistory();
});

// La vue reste montée dans les onglets : on recharge à chaque retour sur /history
watch(() => route.path, (path, previousPath) => {
    if (path === '/history' && previousPath !== path) void loadHistory();
});

async function loadHistory() {
    loading.value = true;
    loadError.value = '';

    try {
        await Promise.all([
            orderStore.fetchOrders(),
            tableStore.fetchTables(),
        ]);
    } catch (error) {
        console.error('Erreur lors du chargement de l’historique :', error);
        loadError.value = 'Impossible de charger l’historique. Veuillez réessayer.';
    } finally {
        loading.value = false;
    }
}

function handlePeriodChange(event: CustomEvent<{ value?: string | number }>) {
    const period = String(event.detail.value);
    if (period === 'today' || period === 'week' || period === 'month' || period === 'all') {
        selectedPeriod.value = period;
    }
}

function isInSelectedPeriod(dateValue: string) {
    if (selectedPeriod.value === 'all') return true;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return false;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (selectedPeriod.value === 'week') {
        const day = (start.getDay() + 6) % 7;
        start.setDate(start.getDate() - day);
    } else if (selectedPeriod.value === 'month') {
        start.setDate(1);
    }

    return date >= start;
}

function getTableName(order: HistoryOrder) {
    return tables.value.find(table => String(table.id) === String(order.table_id))?.number ?? order.table_id;
}

function getServerName(order: HistoryOrder) {
    const server = order.user;
    return server
        ? [server.first_name, server.last_name].filter(Boolean).join(' ') || 'Serveur'
        : 'Non attribué';
}

function getItemCount(order: HistoryOrder) {
    return (order.order_items ?? []).reduce((count, item) => count + Number(item.quantity ?? 0), 0);
}

function getOrderValue(order: HistoryOrder, keys: string[]) {
    for (const key of keys) {
        const value = order[key];
        if (typeof value === 'string' && value.length) return value;
    }
    return '';
}

function getDistinctOrderValues(keys: string[]) {
    return [...new Set(orders.value.map(order => getOrderValue(order, keys)).filter(Boolean))];
}

function getStatusLabel(order: HistoryOrder) {
    return getOrderValue(order, ['payment_status', 'status']) || 'Terminée';
}

function formatAmount(value: number | string | null | undefined) {
    return `${Number(value ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`;
}

function formatTime(value: string) {
    return new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

function openOrder(order: HistoryOrder) {
    activeOrder.value = order;
}

function resetFilters() {
    selectedPeriod.value = 'today';
    selectedServer.value = 'all';
    selectedTable.value = 'all';
    selectedStatus.value = 'all';
    searchTerm.value = '';
}

function exportPdf(context?: string) {
    if(context === 'modal') {
        const ordersGrid = document.querySelector('.orders-grid');
        if (ordersGrid) {
            ordersGrid.classList.remove('ion-hide-screen');
            ordersGrid.classList.add('ion-hide-print');
            window.print();
            ordersGrid.classList.remove('ion-hide-print');
            ordersGrid.classList.add('ion-hide-screen');
        } else {
            window.print();
        }
    } else {
        window.print();
    }
}
</script>

<style scoped>

ion-segment {
    margin-bottom: 12px;
    border: 1px solid #34363a;
    border-radius: 10px;
    background: #151619;
}

ion-segment-button {
    --color: #c5c6ca;
    --color-checked: #e6c47a;
    --indicator-color: transparent;
    --border-radius: 8px;
    min-height: 36px;
    text-transform: none;
    font-size: 12px;
}


.search-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.filter-button {
    flex: none;
    height: 44px;
    --border-color: #3a3c40;
    --color: #e0bd70;
    --border-radius: 10px;
    margin: 0;
}

.orders-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.order-card {
    display: grid;
    width: 100%;
    grid-template-columns: 48px minmax(88px, 1fr) auto auto 14px;
    align-items: center;
    gap: 6px;
    padding: 10px 8px;
    border: 1px solid #37393d;
    border-radius: 10px;
    background: #151619;
    color: #f2f2f3;
    text-align: left;
}

.order-time,
.order-count {
    align-self: start;
    padding-top: 2px;
    font-size: 12px;
}

.order-details {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
}

.order-table,
.order-server {
    display: flex;
    align-items: center;
    gap: 6px;
}

.order-server {
    color: #b8b9bd;
}

.order-table ion-icon,
.order-server ion-icon {
    flex: none;
    font-size: 14px;
}

.order-count {
    color: #c6c6ca;
    white-space: nowrap;
}

.order-total {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
    white-space: nowrap;
}

.order-total strong {
    font-size: 14px;
}

.order-status {
    padding: 2px 8px;
    border-radius: 12px;
    background: #173522;
    color: #a9dfb4;
    font-size: 10px;
}

.order-chevron {
    color: #bfc0c3;
    font-size: 17px;
}

.loading-spinner,
.history-message {
    display: block;
    margin: 24px auto;
    text-align: center;
}

.export-button {
    --border-color: #d7ad4f;
    --color: #e3bf70;
    margin-top: 12px;
    text-transform: uppercase;
}

.filters-panel {
    margin: 0;
    padding: 8px;
}

.filters-heading,
.filters-heading > div {
    display: flex;
    align-items: center;
}

.filters-heading {
    justify-content: space-between;
    margin-bottom: 6px;
}

.filters-heading > div {
    gap: 8px;
}

.filters-heading > div ion-icon {
    color: #d7ad4f;
}

.filters-heading ion-button {
    margin: -6px -6px -6px 0;
    color: #d7d8dc;
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
}

.filters-grid ion-select {
    min-height: 44px;
    padding: 5px 9px;
    border: 1px solid #3a3c40;
    border-radius: 9px;
    background: #17181a;
    font-size: 12px;
}

.filters-grid ion-select::part(label) {
    color: #9fa0a4;
    font-size: 10px;
}

.filters-grid ion-select::part(container) {
    margin-top: 1px;
}

.reset-button {
    --border-color: #8b6b2f;
    --color: #dbb55c;
    align-self: center;
    min-height: 40px;
    font-size: 10px;
}

.filters-modal {
    --border-radius: 16px 16px 0 0;
}

@media screen {
    .ion-hide-screen {
        display: none;
    }
    .ion-modal-hide-screen {
        display: none;
    }
}

@media print {
    .ion-hide-print {
        display: none !important;
    }
    .ion-modal-hide-print {
        display: none !important;
    }
    .ion-hide-screen {
        display: block !important;
    }
    .ion-modal-hide-screen {
        display: block !important;
    }
}

@media (max-width: 390px) {
    .order-card {
        grid-template-columns: 42px minmax(74px, 1fr) auto auto 12px;
        gap: 4px;
        padding: 9px 6px;
    }

    .order-time,
    .order-count,
    .order-details {
        font-size: 10px;
    }

    .order-total strong {
        font-size: 12px;
    }
}

@media print {
    :global(body *) {
        visibility: hidden !important;
    }

    .orders-list,
    .orders-list * {
        visibility: visible !important;
    }

    .orders-list {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }

    .order-card {
        break-inside: avoid;
        border-color: #aaa;
        background: #fff;
        color: #111;
    }

    .order-server,
    .order-count {
        color: #333;
    }
}
</style>
