<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="ion-text-center">
        <ion-spinner v-if="loading" />
        <p>{{ message }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonSpinner } from '@ionic/vue'
import { supabase } from '../utils/supabase'

const router = useRouter()

const loading = ref(true)
const message = ref('Vérification de votre connexion...')

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)

  const tokenHash = params.get('token_hash')
  const type = params.get('type')

  if (!tokenHash || type !== 'email') {
    message.value = 'Lien de connexion invalide ou expiré.'
    loading.value = false
    return
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'email'
  })

  if (error) {
    console.error(error)
    message.value = 'Impossible de vous connecter : ' + error.message
    loading.value = false
    return
  }

  message.value = 'Connexion réussie !'

  await router.replace('/home')
})
</script>