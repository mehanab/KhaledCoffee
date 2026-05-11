<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/home">
          <ion-icon :icon="restaurant" />
          <ion-label>Tables</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="menu" href="/menu">
          <ion-icon :icon="book" />
          <ion-label>Menu</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="history" href="/history">
          <ion-icon :icon="time" />
          <ion-label>Historique</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="settings" href="/settings">
          <ion-icon :icon="cog" />
          <ion-label>Paramètres</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
  import { IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/vue';
  import { book, time, cog, restaurant } from 'ionicons/icons';
</script>