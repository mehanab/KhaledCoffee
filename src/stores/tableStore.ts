import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'

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

                this.tables = data.map((table: any) => ({
                    ...table,
                    cart: table.carts?.[0] ?? null
                }));
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

                this.currentTable = data;
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
        }
    }
});