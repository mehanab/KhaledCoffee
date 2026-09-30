<template>
		<ion-header :translucent="false">
            <Toolbar :title="'Historique'" :showMenuButton="false" />
		</ion-header>
        <ion-content :fullscreen="true" class="ion-padding">
                <ion-segment v-model="selectedFilter" @ionChange="handleSegmentChange($event)">
                        <ion-segment-button value="all" class="ion-no-padding">
                            <ion-label><small>Aujourd'hui</small></ion-label>
                        </ion-segment-button>
                        <ion-segment-button value="week" class="ion-no-padding">
                            <ion-label><small>Cette semaine</small></ion-label>
                        </ion-segment-button>
                        <ion-segment-button value="month" class="ion-no-padding">
                            <ion-label><small>Ce mois</small></ion-label>
                        </ion-segment-button>
                </ion-segment>
                <ion-card-header class="ion-padding-top ion-no-padding">
                    <ion-searchbar @ionInput="handleSearchOrders($event)" placeholder="Rechercher une commande" class="ion-no-padding ion-rounded" color="light" shape="round"></ion-searchbar>
                </ion-card-header>
                <ion-grid class="ion-text-center ion-padding-top ion-no-padding" :fixed="true">
                    <ion-row class="first-row row">
                        <ion-col>
                            <ion-label color="medium">
                                <ion-icon :icon="cash" color="primary" size="large"></ion-icon>
                                <h3>Chiffre d'affaires</h3>
                            </ion-label>
                            <ion-text>
                                <p>1200 DA</p>
                            </ion-text>
                        </ion-col>
                        <ion-col>
                            <ion-label color="medium">
                                <ion-icon :icon="newspaper" color="primary" size="large"></ion-icon>
                                <h3>Commandes</h3>
                            </ion-label>
                              <ion-text>
                                <p>45</p>
                            </ion-text>
                        </ion-col>
                        <ion-col>
                            <ion-label color="medium">
                                <ion-icon :icon="trendingUp" color="primary" size="large"></ion-icon>
                                <h3>Panier moyen</h3>
                            </ion-label>
                            <ion-text>
                                <p>87 DA</p>
                            </ion-text>
                        </ion-col>
                    </ion-row>
                </ion-grid>
        </ion-content>
</template>

<script setup lang="ts">
import Toolbar from '../Toolbar.vue';
import { ref } from 'vue';
import { trendingUp, cash, newspaper, statsChart } from 'ionicons/icons';

const selectedFilter = ref('all');

function handleSearchOrders(event: CustomEvent) {
    console.log('Search Orders:', event.detail.value);
}

function handleSegmentChange(event: CustomEvent) {
    console.log('Segment Changed:', event.detail.value);
}
</script>