import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'
import { useAuthStore } from './auth';
const authStore = useAuthStore();

export const useTableStore = defineStore('table', {
    state: () => ({
        tables: [] as any[],
        currentTable: null as any,
    }),
    actions: {
        async closeTable(tableId: number) {
            try {
                const { error } = await supabase
                    .from('tables')
                    .update({ status: 'closed' })
                    .eq('id', tableId);

                if (error) throw error;

                this.tables = this.tables.map(table =>
                    table.id === tableId ? { ...table, status: 'closed' } : table
                );
            } catch (error) {
                console.error('Error closing table:', error);
            }
        },

        async fetchTables() {
            try {
                const { data, error } = await supabase
                    .from('tables')
                    .select(`*, carts (*, carts_items (*))`)
                    .limit(1, { referencedTable: 'carts' });

                if (error) throw error;

                this.tables = data.map((table: any) => {
                    const { carts, ...rest } = table;
                    return {
                        ...rest,
                        cart: carts?.[0] ?? null
                    };
                });
            } catch (error) {
                console.error('Error fetching tables:', error);
            }
        },

        async fetchTableById(tableId: number) {
            try {
                const { data, error } = await supabase
                    .from('tables')
                    .select(`*, carts (*, cart_items (*))`)
                    .eq('id', tableId)
                    .single();

                if (error) throw error;

                const { carts, ...rest } = data;
                this.currentTable = {
                    ...rest,
                    cart: carts?.[0] ?? null
                };
            } catch (error) {
                console.error('Error fetching table:', error);
            }
        }, 

        async setTableStatus(tableId: number, status: 'available' | 'unavailable') {
            try {
                const { error } = await supabase
                    .from('tables')
                    .update({ status })
                    .eq('id', tableId)
                    .select();

                if (error) throw error;

                this.tables = this.tables.map(table =>
                    table.id === tableId ? { ...table, status } : table
                );
            } catch (error) {
                console.error('Error setting table status:', error);
                throw error;
            }
        }, 
        
        async createTable(table: { number: string, status: string, location: string }) {
            try {
                const { data, error } = await supabase
                    .from('tables')
                    .insert(table)
                    .select()
                    .single();

                if (error) throw error;

                this.tables.push(data);
            } catch (error) {
                console.error('Error creating table:', error);
                throw error;
            }
        },


        // ----------------------------------------- cart ---------------------------

        // create a new cart for a table
        // async createCart(tableId: number) {
        //     try {
        //         const { data, error } = await supabase
        //             .from('carts')
        //             .insert({ table_id: tableId })
        //             .select()
        //             .single();

        //         if (error) throw error;

        //         return data;
        //     } catch (error) {
        //         console.error('Error creating cart:', error);
        //         throw error;
        //     }
        // },

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
            } catch (error) {
                console.error('Error deleting cart:', error);
                throw error;
            }
        },

        // upsert cart 
        async upsertCart(cart: { id: number, table_id: number, total: number, guest_count?: number, libelle?: string, user_id?: number }) {
            cart.user_id = cart.user_id ?? authStore.user?.id ?? null;
            try {
                const { data, error } = await supabase
                    .from('carts')
                    .upsert({ id: cart.id, table_id: cart.table_id, total: cart.total, guests: cart.guest_count, libelle: cart.libelle, user_id: cart.user_id }, { onConflict: 'id' })
                    .select('*, carts_items (*)')
                    .single();

                if (error) throw error;

                return data;
            } catch (error) {
                console.error('Error upserting cart:', error);
                throw error;
            }
        },


        //----------------------------------------- cart items ---------------------------
        // upsert cart item
        async upsertCartItem(cart: any, product: any, quantity: number) {
            try {
                const { data, error } = await supabase
                    .from('carts_items')
                    .upsert({ cart_id: cart.id, product_id: product.id, quantity: quantity, product_name: product.name, product_unit_price: product.unit_price, category_name: product.category?.name, total_price: product.unit_price * quantity }, {onConflict: 'product_id'})
                    .select('*')
                    .single();

                if (error) throw error;

                const newTotal = (cart.total || 0) + (product.unit_price * quantity);

                // set total cart price
                const cartData = await this.upsertCart({ id: cart.id, table_id: this.currentTable.id, total: newTotal });
                return cartData;
            } catch (error) {
                console.error('Error upserting cart item:', error);
                throw error;
            }
        },

        async updateCartItemQuantity(cart: any, cartItem: any, quantity: number) {
            try {
                const { data, error } = await supabase
                    .from('carts_items')
                    .update({ quantity: quantity, total_price: cartItem.product_unit_price * quantity })
                        .eq('id', cartItem.id)
                        .eq('cart_id', cartItem.cart_id)
                    .select('*');

                    if (error) throw error;
                    let newTotal;
                    if(quantity > cartItem.quantity) {
                        newTotal = (cart.total || 0) + (cartItem.product_unit_price * (quantity - cartItem.quantity));
                    } else {
                        newTotal = (cart.total || 0) - (cartItem.product_unit_price * (cartItem.quantity - quantity));
                    }

                // set total cart price
                const cartData = await this.upsertCart({ id: cart.id, table_id: this.currentTable.id, total: newTotal });
                return cartData;
            } catch (error) {
                console.error('Error updating cart item quantity:', error);
                throw error;
            }
        },
    }
});