import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'

export const useProductStore = defineStore('product', {
    state: () => ({
        products: [] as any[],
    }),
    actions: {
        async subscribeToProducts() {
            const subscription = supabase
                .channel('products')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'products' },
                    
                    async payload => {
                        console.log('Product change payload:', payload);
                        if(payload.eventType === 'DELETE' || payload.eventType === 'INSERT') {
                            // fetch all products again to update the list
                            await this.fetchProducts();
                        } else {
                            try {
                                const productUpdated = await this.fetchProductById(payload.new.id);
                                this.products = this.products.map(p => p.id == productUpdated.id ? productUpdated : p)
                            } catch (error) {
                                console.error('Error updating product for product change:', error);
                            }
                        }
                    }
                )
                .subscribe();
            return subscription;
        },
        async fetchProducts() {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*, category:categories (id, name)');

                if (error) throw error;

                this.products = data;
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        },

        async fetchProductsByCategory(categoryId: number) {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*, category:categories (id, name)')
                    .eq('category_id', categoryId);

                if (error) throw error;

                return data;
            } catch (error) {
                console.error('Error fetching products by category:', error);
            }
        },

        async fetchProductById(productId: number) {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*, category:categories (id, name)')
                    .eq('id', productId)
                    .single();

                if (error) throw error;

                return data;
            } catch (error) {
                console.error('Error fetching product by ID:', error);
                throw error;
            }
        },

        async searchProducts(query: string) {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*, category:categories (id, name)')
                    .ilike('name', `%${query}%`);

                if (error) throw error;

                this.products = data;
            } catch (error) {
                console.error('Error searching products:', error);
            }
        },

        async createProduct(product: { name: string, unit_price: number, category_id: number, image_path?: string, stock?: number }) {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .insert(product)
                    .select('*, category:categories (id, name)')
                    .single();

                if (error) throw error;

                this.products.push(data);
                return data;
            } catch (error) {
                console.error('Error creating product:', error);
                throw error;
            }
        },

        async updateProduct(productId: number, updates: { name?: string, unit_price?: number, category_id?: number, image_path?: string, stock?: number}) {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .update(updates)
                    .eq('id', productId)
                    .select('*, category:categories (id, name)')
                    .single();

                if (error) throw error;

                const index = this.products.findIndex(p => p.id === productId);
                if (index !== -1) {
                    this.products[index] = data;
                }
                return data;
            } catch (error) {
                console.error('Error updating product:', error);
                throw error;
            }
        },

        async deleteProduct(productId: number) {
            try {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', productId);

                if (error) throw error;

                this.products = this.products.filter(p => p.id !== productId);
            } catch (error) {
                console.error('Error deleting product:', error);
                throw error;
            }
        },

        async updateProductStock(productId: number, stockIncrement: number) {
            try {
                //if empty this.products, fetch products first
                if (this.products.length === 0) {
                    await this.fetchProducts();
                }
                let product = this.products.find(p => p.id === productId);
                if (!product) {
                    throw new Error(`Product with ID ${productId} not found`);
                }
                let value = (product.stock || 0) + (-stockIncrement);
                if(value < 0) {
                    value = 0;
                } 
                const data = await this.updateProduct(productId, {
                    stock: value
                });

                console.log('Updated product data:', data);
                return data;
            } catch (error) {
                console.error('Error updating product stock:', error);
                throw error;
            }
        }
    }
})