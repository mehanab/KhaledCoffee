import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'
import { useAuthStore } from './auth';
const authStore = useAuthStore();

export const useCartStore = defineStore('cart', {
    state: () => ({
        carts: [] as any[],
        currentCart: null as any,
    }),
    actions: {
        async createCart(tableId: number) {
            try {
                const { data, error } = await supabase
                    .from('carts')
                    .insert({ table_id: tableId })
                    .select()
                    .single();

                if (error) throw error;

                this.currentCart = data;
                return data;
            } catch (error) {
                console.error('Error creating cart:', error);
                throw error;
            }
        },

        async upsertCart(cart: { id: number, table_id: number, total: number, guest_count?: number, libelle?: string, user_id?: number }) {
            cart.user_id = cart.user_id ?? authStore.user?.id ?? null;
            try {
                const { data, error } = await supabase
                    .from('carts')
                    .upsert({ id: cart.id, table_id: cart.table_id, total: cart.total, guests: cart.guest_count, libelle: cart.libelle, user_id: cart.user_id }, { onConflict: 'id' })
                    .select('*, carts_items (*)')
                    .single();

                if (error) throw error;

                this.currentCart = data;
                return data;
            } catch (error) {
                console.error('Error upserting cart:', error);
                throw error;
            }
        },

        // delete cart and cart items by id 
        async deleteCart(cartId: number) {
            try {
                // delete cart items first
                const { error: itemsError } = await supabase
                    .from('carts_items')
                    .delete()
                    .eq('cart_id', cartId);

                if (itemsError) throw itemsError;

                // then delete the cart
                const { error } = await supabase
                    .from('carts')
                    .delete()
                    .eq('id', cartId);

                if (error) throw error;

                this.currentCart = null;
            } catch (error) {
                console.error('Error deleting cart:', error);
                throw error;
            }
        },
    }
})