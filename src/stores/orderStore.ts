import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'
import { useAuthStore } from './auth';

export const useOrderStore = defineStore('order', {
    state: () => ({
        orders: [] as any[],
        currentOrder: null as any,
    }),
    actions: {
        async subscribeToProducts() {
            const subscription = supabase
                .channel('orders')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'orders' },
                    (payload) => {
                        this.fetchOrders();
                        console.log('Order change received:', payload);
                    }
                )
                .subscribe();
        },
        async fetchOrders() {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const fetchedOrders = data ?? [];
                const userIds = [...new Set(fetchedOrders
                    .map(order => order.user_id)
                    .filter((id): id is string => typeof id === 'string' && id.length > 0))];
                const orderIds = fetchedOrders.map(order => order.id);

                const [profilesResult, itemsResult] = await Promise.all([
                    userIds.length
                        ? supabase.from('profiles').select('id, first_name, last_name').in('id', userIds)
                        : Promise.resolve({ data: [], error: null }),
                    orderIds.length
                        ? supabase.from('orders_items').select('*').in('order_id', orderIds)
                        : Promise.resolve({ data: [], error: null }),
                ]);

                if (profilesResult.error) throw profilesResult.error;
                if (itemsResult.error) throw itemsResult.error;

                const profilesById = new Map(
                    (profilesResult.data ?? []).map(profile => [profile.id, profile])
                );
                const itemsByOrderId = new Map<string, any[]>();
                for (const item of itemsResult.data ?? []) {
                    const key = String(item.order_id);
                    itemsByOrderId.set(key, [...(itemsByOrderId.get(key) ?? []), item]);
                }

                this.orders = fetchedOrders.map(order => ({
                    ...order,
                    user: order.user_id ? profilesById.get(order.user_id) ?? null : null,
                    order_items: itemsByOrderId.get(String(order.id)) ?? [],
                }));
            } catch (error) {
                console.error('Error fetching orders:', error);
                throw error;
            }
        },

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

        async createOrder(cart: any) {
            const authStore = useAuthStore();
            const order = { 
                table_id: cart.table_id, 
                guests: cart.guests, 
                total: cart.total, 
                libelle: cart.libelle, 
                user_id: cart.user_id ?? authStore.user?.id ?? null
            };
            const orderItems = cart.carts_items.map((item: any) => ({
                product_name: item.product_name,
                category_name: item.category_name,
                product_unit_price: item.product_unit_price,
                total_price: item.total_price,
                quantity: item.quantity,
                product_image_path: item.product_image_path
            }));

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
                    const { data: dataItems, error: itemsError } = await supabase
                        .from('orders_items')
                        .insert(orderItems.map((item: any) => ({ ...item, order_id: orderId })))
                        .select();
                    if (itemsError) throw itemsError;

                    data.order_items = dataItems;
                }
                this.orders = [data, ...this.orders.filter(orderItem => orderItem.id !== data.id)];
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