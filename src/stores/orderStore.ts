import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'
import { useAuthStore } from './auth';
const authStore = useAuthStore();

export const useOrderStore = defineStore('order', {
    state: () => ({
        orders: [] as any[],
        currentOrder: null as any,
    }),
    actions: {
        async fetchOrdersById(id: number) {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', id);

                if (error) throw error;

                this.orders = data;
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        },

        async createOrder(
                        order: { 
                            table_id: number, 
                            guests: number, 
                            total: number, 
                            libelle?: string, 
                            user_id?: number
                        }, 
                        orderItems: { 
                            product_name: string, 
                            category_name: string, 
                            product_unit_price: number, 
                            total_price: number, 
                            quantity: number, 
                            product_image_path?: string
                        }[]) {
            order.user_id = order.user_id ?? authStore.user?.id ?? null;
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .insert(order)
                    .select()
                    .single();

                if (error) throw error;

                this.currentOrder = data;
                const orderId = data.id;

                // Insert order items
                if(orderItems.length > 0) {
                    const {data: dataItems, error: itemsError } = await supabase
                        .from('orders_items')
                        .insert(orderItems.map(item => ({ ...item, order_id: orderId })));
                    if (itemsError) throw itemsError;

                    data.order_items = dataItems;
                }
                return data;
            } catch (error) {
                console.error('Error creating order:', error);
                throw error;
            }
        },

        async updateOrder(orderId: number, updates: { table_id?: number, guests?: number, total?: number, libelle?: string, user_id?: number }) {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .update(updates)
                    .eq('id', orderId)
                    .select()
                    .single();

                if (error) throw error;

                this.currentOrder = data;
                return data;
            } catch (error) {
                console.error('Error updating order:', error);
                throw error;
            }
        }
    }
})