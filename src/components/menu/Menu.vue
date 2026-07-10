<template>
		<ion-header :translucent="false">
            <Toolbar :title="'Menu'" :showMenuButton="false" />
		</ion-header>

		<ion-content :fullscreen="true">
            <ion-card color="base">
                <ion-segment :scrollable="true" v-model="selectedSegment" @ionChange="handleSegmentChange($event)">
                        <ion-segment-button value="produits">
                            <ion-label>Produits</ion-label>
                        </ion-segment-button>
                        <ion-segment-button value="categories">
                            <ion-label>Catégories</ion-label>
                        </ion-segment-button>
                </ion-segment>
                <ion-list class="ion-no-padding" v-if="selectedSegment === 'produits'">
                    <ion-item-group v-for="(products, category) in groupedByCategory" :key="category">
                        <ion-item-divider>
                            <ion-label> {{ category }}</ion-label>
                        </ion-item-divider>
                        <ion-item v-for="(product, index) in products" :key="product.id" :lines="index === products.length - 1 ? 'none' : 'default'">
                            <ion-avatar slot="start">
                                <img v-if="product.image_path" :src="product.image_path" />
                                <ion-icon v-else :icon="image" size="large"></ion-icon>
                            </ion-avatar>
                            <ion-label>
                                {{ product.name }}
                                <p>{{ parseFloat(product.unit_price).toFixed(2) }} DA</p>
                            </ion-label>
                            <!-- <ion-button v-if="!currentTable.cart?.carts_items?.find((item: any) => item.product_id === product.id)" fill="clear" size="small" slot="end" @click="upsertCartItem(product, getProductQuantityInCart(product.id) + 1)">
                                <ion-icon :icon="addCircleOutline" size="large"></ion-icon>
                            </ion-button> -->
                        </ion-item>
                    </ion-item-group>  
                </ion-list>
                <ion-list class="ion-no-padding" v-else>
                    <ion-item v-for="category in productsCategories" :key="category.id" :lines="'full'">
                        <ion-label>
                            {{ category.name }}
                            <p>{{ category.productsCount }} produits</p>
                        </ion-label>
                    </ion-item>
                </ion-list>
            </ion-card>
        </ion-content>
</template>

<script setup lang="ts">
    import Toolbar from '../Toolbar.vue';
    import { IonHeader, IonContent, IonLabel, IonCard, IonIcon, IonAvatar, IonItem, IonList, IonItemGroup, IonItemDivider, IonSegment, IonSegmentButton } from '@ionic/vue';
    import { image } from 'ionicons/icons';
    import { ref, onMounted, computed } from 'vue';
    import { useProductStore } from '../../stores/productStore';

    const productStore = useProductStore();
    const products = computed(() => productStore.products);


    const groupedByCategory = computed(() => {
        return products.value.reduce((acc, product) => {
            const categoryName = product.category ? product.category.name : 'Uncategorized';
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(product);
            return acc; 
        }, {});
    });


    // unique categories from products
    const productsCategories = computed(() => {
        //use the groupedByCategory to get the unique categories
        return Object.keys(groupedByCategory.value).map(categoryName => {
            return {
                id: categoryName,
                name: categoryName,
                productsCount: groupedByCategory.value[categoryName].length            
            };
        });
    });

    const selectedSegment = ref('produits');
    const handleSegmentChange = (event: CustomEvent) => {
        selectedSegment.value = event.detail.value;
    };

    onMounted(async () => {
        try {
            await productStore.fetchProducts();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });
</script>