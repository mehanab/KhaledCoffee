import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'
import { useAuthStore } from './auth';

interface CartItem {
    id: number;
    cart_id: number;
    product_id: number;
    quantity: number;
    product_name: string;
    category_name: string;
    product_unit_price: number;
    total_price: number;
    product_image_path: string;
    product: {
        id: number;
        name: string;
        unit_price: number;
        image_path: string;
        stock: number;
    };
}

interface Cart {
    id: number|undefined;
    table_id: number;
    guests: number;
    user_id: string;
    libelle: string;
    total: number;
    created_at: string;
    carts_items: CartItem[];
    user?: { first_name?: string; last_name?: string };
}

export interface Table {
    id: number;
    created_at: string;
    number: number;
    status: string;
    location: string;
    cart?: Cart;
}


export const useTableStore = defineStore('table', {
    state: () => ({
        tables: [] as Table[],
        currentTable: null as Table | null,
    }),
    actions: {
        async subscribeToTables() {
            const subscription = supabase
                .channel('tables-changes')
                .on(
                    'postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'tables' 

                    }, 
                    async payload => {
                        if(payload.eventType === 'DELETE' || payload.eventType === 'INSERT') {
                            // fetch all tables again to update the list
                            await this.fetchTables();
                        } else {  
                            try {
                                const tableUpdated = await this.fetchTableById(payload.new.id);
                                this.tables = this.tables.map(table =>
                                    table.id === tableUpdated.id ? tableUpdated : table
                                );
                                // update the current table if it matches the updated table
                                if (this.currentTable?.id === tableUpdated.id) {
                                    this.currentTable = tableUpdated;
                                }
                            } catch (error) {
                                console.error('Error updating table for table change:', error);
                            }
                        }
                    }
                )
                .subscribe();
            return subscription;
        },

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
                throw error;
            }
        },

        async fetchTables() {
            try {
                const { data, error } = await supabase
                    .from('tables')
                    .select(`*, carts (*, user:profiles (*), carts_items (*, product:products (*)))`)
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
                throw error;
            }
        },

        async fetchTableById(tableId: number) {
            try {
                const { data, error } = await supabase
                    .from('tables')
                    .select(`*, carts (*, carts_items (*, product:products (*)))`)
                    .eq('id', tableId)
                    .single();

                if (error) throw error;

                const { carts, ...rest } = data;
                let table = {
                    ...rest,
                    cart: carts?.[0] ?? null
                };
                //this.currentTable = table;
                return table;
            } catch (error) {
                console.error('Error fetching table:', error);
                throw error;
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

         async subscribeToCarts() {
            const subscription = supabase
                .channel('carts-changes')
                .on(
                    'postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'carts' }, 
                    async payload => {
                        if(payload.eventType === 'DELETE' || payload.eventType === 'INSERT') {
                            // fetch all tables again to update the list
                            await this.fetchTables();
                        } else {
                            try {
                                const tableUpdated = await this.fetchTableById(payload.new.table_id);
                                this.tables = this.tables.map(table =>
                                    table.id === tableUpdated.id ? tableUpdated : table
                                );
                                // update the current table if it matches the updated table
                                if (this.currentTable?.id === tableUpdated.id) {
                                    this.currentTable = tableUpdated;
                                }
                            } catch (error) {
                                console.error('Error updating table for cart change:', error);
                            }
                        }
                    }
                )
                .on(
                    'postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'carts_items' 
                    }, 
                    async payload => {
                        console.log('Carts items change payload:', payload);
                    }
                )
                .subscribe();
        },

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
        async upsertCart(cart: { id: number|undefined, table_id: number, total: number, guest_count?: number, libelle?: string, user_id?: number }) {
            const authStore = useAuthStore();
            cart.user_id = cart.user_id ?? authStore.user?.id ?? null;
            try {
                const { data, error } = await supabase
                    .from('carts')
                    .upsert({ id: cart.id, table_id: cart.table_id, total: cart.total, guests: cart.guest_count, libelle: cart.libelle, user_id: cart.user_id }, { onConflict: 'id' })
                    .select('*, carts_items (*, product:products (*))')
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
                    .upsert({ cart_id: cart.id, product_id: product.id, quantity: quantity, product_name: product.name, product_unit_price: product.unit_price, category_name: product.category?.name, total_price: product.unit_price * quantity }, {onConflict: 'id, cart_id, product_id'})
                    .select('*')
                    .single();

                if (error) throw error;

                const newTotal = (cart.total || 0) + (product.unit_price * quantity);

                // set total cart price
                let cartData;
                if (this.currentTable && this.currentTable.id) {
                    cartData = await this.upsertCart({ id: cart.id, table_id: this.currentTable?.id, total: newTotal });
                } else {
                    console.warn('No current table found to update cart total.');
                }
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
                    .select('*, product:products (*)');

                    if (error) throw error;
                    let newTotal;
                    if(quantity > cartItem.quantity) {
                        newTotal = (cart.total || 0) + (cartItem.product_unit_price * (quantity - cartItem.quantity));
                    } else {
                        newTotal = (cart.total || 0) - (cartItem.product_unit_price * (cartItem.quantity - quantity));
                    }

                // set total cart price
                let cartData;
                if (this.currentTable && this.currentTable.id) {
                    cartData = await this.upsertCart({ id: cart.id, table_id: this.currentTable.id, total: newTotal });
                } else {
                    console.warn('No current table found to update cart total.');
                }
                return cartData;
            } catch (error) {
                console.error('Error updating cart item quantity:', error);
                throw error;
            }
        },

        async removeCartItem(cartId: number, cartItemId: number) {
            try {
                const { data, error } = await supabase
                    .from('carts_items')
                    .delete()
                    .eq('id', cartItemId)
                    .eq('cart_id', cartId)
                    .select('*')
                    .single();

                if (error) throw error;

                const newTotal = (this.currentTable?.cart?.total || 0) - (data.product_unit_price * data.quantity);

                // set total cart price
                let cartData;
                if (this.currentTable && this.currentTable.id) {
                    cartData = await this.upsertCart({ id: cartId, table_id: this.currentTable.id, total: newTotal });
                } else {
                    console.warn('No current table found to update cart total.');
                }
                return cartData;
            } catch (error) {
                console.error('Error removing cart item:', error);
                throw error;
            }
        },

        // check any cart having product id
        async isProductInAnyCart(productId: number) {
            try {
                const { data, error } = await supabase
                    .from('carts_items')
                    .select('*')
                    .eq('product_id', productId);

                if (error) throw error;
                return data.length > 0;
            } catch (error) {
                console.error('Error checking product in carts:', error);
                throw error;
            }
        }
    }
});