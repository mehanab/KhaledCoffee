<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="ion-padding">
        <h1>Khaled Coffee</h1>
        <p>Se connecter via le lien magique envoyé à votre email</p>
      </div>
      <ion-list :inset="true">
        <form @submit.prevent="handleLogin">
          <ion-item>
            <ion-input
              v-model="email"
              label="Email"
              label-placement="stacked"
              name="email"
              autocomplete="email"
              type="email"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              v-model="password"
              label="Mot de passe"
              label-placement="stacked"
              name="password"
              autocomplete="current-password"
              type="password"
            ></ion-input>
          </ion-item>
          <div class="ion-text-center">
            <ion-button type="submit" fill="clear">Se connecter</ion-button>
          </div>
        </form>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { supabase } from '../utils/supabase';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  toastController,
  loadingController,
} from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore()
const router = useRouter()
const email = ref('');
const password = ref('');

const handleLogin = async () => {
  const loader = await loadingController.create({});
  const toast = await toastController.create({ duration: 5000 });

  try {
    await loader.present();
    // const { error } = await supabase.auth.signInWithOtp({ 
    //     email: email.value,
    //     options: {
    //       emailRedirectTo: `${window.location.origin}/auth/confirm`
    //     }
    // });
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) throw error;

    //toast.message = 'Vérifiez votre email pour vous connecter';
    router.push('/home');
  } catch (error: any) {
    toast.message = error.error_description || error.message;
    await toast.present();
  } finally {
    await loader.dismiss();
  }
};

onMounted(() => {
    if(auth.isLoggedIn) {
        router.push('/home')
    }
})
</script>