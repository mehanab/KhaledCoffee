import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'

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

        async upsertCart(cart: { id: number, table_id: number, total: number, guest_count?: number, libelle?: string }) {
            try {
                const { data, error } = await supabase
                    .from('carts')
                    .upsert({ id: cart.id, table_id: cart.table_id, total: cart.total, guests: cart.guest_count, libelle: cart.libelle }, { onConflict: 'id' })
                    .select()
                    .single();

                if (error) throw error;

                this.currentCart = data;
                return data;
            } catch (error) {
                console.error('Error upserting cart:', error);
                throw error;
            }
        }
    }
})