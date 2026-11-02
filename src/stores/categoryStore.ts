import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'

export const useCategoryStore = defineStore('category', {
    state: () => ({
        categories: [] as any[],
    }),
    actions: {
        async subscribeToProducts() {
            const subscription = supabase
                .channel('categories')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'categories' },
                    async payload => {
                        if(payload.eventType === 'DELETE' || payload.eventType === 'INSERT') {
                            // fetch all categories again to update the list
                            await this.fetchCategories();
                        } else {
                            try {
                                const categoryUpdated = await this.fetchCategoryById(payload.new.id);
                                this.categories = this.categories.map(c => c.id == categoryUpdated.id ? categoryUpdated : c)
                            } catch (error) {
                                console.error('Error updating category for category change:', error);
                            }
                        }
                    }
                )
                .subscribe();
            return subscription;
        },
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

        async deleteCategory(categoryId: number) {
            try {
                const { error } = await supabase
                    .from('categories')
                    .delete()
                    .eq('id', categoryId);

                if (error) throw error;

                this.categories = this.categories.filter(c => c.id !== categoryId);
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        },

        async fetchCategoryById(categoryId: number) {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('id', categoryId)
                    .single();

                if (error) throw error;

                return data;
            } catch (error) {
                console.error('Error fetching category by ID:', error);
                throw error;
            }
        }
    },
});