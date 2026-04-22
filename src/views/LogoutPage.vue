<script setup lang="ts">
import { supabase } from '../utils/supabase';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router'; 
import { onMounted } from 'vue';
const auth = useAuthStore()
const router = useRouter()
const handleLogout = async () => {
    await supabase.auth.signOut();
    auth.init(); // réinitialiser l'état de l'authentification
    router.push('/login');
}

onMounted(() => {
    handleLogout();
})
</script>