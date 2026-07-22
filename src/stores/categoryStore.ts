import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'

export const useCategoryStore = defineStore('category', {
    state: () => ({
        categories: [] as any[],
    }),
    actions: {
        async fetchCategories() {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*');

                if (error) throw error;

                this.categories = data;
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        },

        async createCategory(category: { name: string }) {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .insert(category)
                    .select()
                    .single();

                if (error) throw error;

                this.categories.push(data);
            } catch (error) {
                console.error('Error creating category:', error);
            }
        },

        async updateCategory(categoryId: number, updates: { name?: string }) {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .update(updates)
                    .eq('id', categoryId)
                    .select()
                    .single();

                if (error) throw error;

                const index = this.categories.findIndex(c => c.id === categoryId);
                if (index !== -1) {
                    this.categories[index] = data;
                }
            } catch (error) {
                console.error('Error updating category:', error);
            }
        },
    },
});