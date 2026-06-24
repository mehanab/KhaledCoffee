<template>
    <ion-modal ref="modal" trigger="open-modal">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="cancel()">X</ion-button>
                </ion-buttons>
                <ion-title>Ajouter des articles</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-card color="base">
				<ion-card-header>
                    <ion-searchbar @ionInput="handleSearchProducts($event)" placeholder="Rechercher" ></ion-searchbar>
                </ion-card-header>
                <swiper
                    :slides-per-view="2.5"
                    :space-between="8"
                    :pagination="{
                        el: '.custom-pagination',
                        clickable: true
                        }"
                    :modules="[Pagination]">
                    <swiper-slide value="all">
                        <ion-chip value="all" @click="selectedCategory = 'all'">
                            <ion-label>Toutes</ion-label>
                        </ion-chip>
                    </swiper-slide>
                    <swiper-slide v-for="category in categories" :key="category.id":value="category.name">
                        <ion-chip :value="category.name" @click="selectedCategory = category.name">
                            <ion-label>{{ category.name }}</ion-label>
                        </ion-chip>
                    </swiper-slide>
                </swiper>
                <div class="custom-pagination ion-display-flex ion-justify-content-center ion-margin-top"></div>
                <ion-list class="ion-no-padding">
                    <ion-item-group v-for="(products, category) in filteredGroupedByCategory" :key="category">
                        <ion-item-divider>
                            <ion-label> {{ category }}</ion-label>
                        </ion-item-divider>
                        <ion-item v-for="(product, index) in products" :key="product.id" :lines="index === products.length - 1 ? 'none' : 'full'">
                            <ion-avatar slot="start">
                                <img v-if="product.image_path" :src="product.image_path" />
                                <ion-icon v-else :icon="image" size="large"></ion-icon>
                            </ion-avatar>
                            <ion-label>
                                {{ product.name }}
                                <p>{{ parseFloat(product.unit_price).toFixed(2) }} DA</p>
                            </ion-label>
                            <ion-button v-if="!currentTable.cart?.carts_items?.find((item: any) => item.product_id === product.id)" fill="clear" size="small" slot="end" @click="upsertCartItem(product, getProductQuantityInCart(product.id) + 1)">
                                <ion-icon :icon="addCircleOutline" size="large"></ion-icon>
                            </ion-button>
                        </ion-item>
                    </ion-item-group>  
                </ion-list>
            </ion-card>
        </ion-content>

    </ion-modal>

</template> 

<script setup lang="ts">
    import { IonHeader, IonToolbar, IonButtons, IonTitle, IonContent, IonButton, IonModal, IonSearchbar, IonChip, IonLabel, IonCard, IonCardHeader, IonIcon, IonAvatar, IonItem, IonList, IonItemGroup, IonItemDivider } from '@ionic/vue';
    import { image, addCircleOutline } from 'ionicons/icons';
    import { ref, onMounted, computed } from 'vue';
    import { useTableStore } from '../../stores/tableStore';
    import { useProductStore } from '../../stores/productStore';
    import { Swiper, SwiperSlide } from 'swiper/vue';
    import { Pagination } from 'swiper/modules'
    
    // Import Swiper styles
    import 'swiper/css';
    //import 'swiper/css/navigation';
    import 'swiper/css/pagination';
    //import 'swiper/css/bundle';

    const tableStore = useTableStore();
    const productStore = useProductStore();
    const modal = ref();
    const products = computed(() => productStore.products);

    
    const props = defineProps({
        table: {
            type: Object,
            required: true
        }
    });

    tableStore.currentTable = props.table;
    const currentTable = computed(() => tableStore.currentTable);

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

    const searchTerm = ref('');
    const selectedCategory = ref('all');
    const filteredGroupedByCategory = computed(() => {
        const term = searchTerm.value.toLowerCase();
        const selectedCat = selectedCategory.value;

        if (!term && selectedCat === 'all') {
            return groupedByCategory.value;
        } else if (term && selectedCat === 'all') {
            return Object.keys(groupedByCategory.value).reduce((acc, category) => {
                const filteredProducts = groupedByCategory.value[category].filter((product: any) =>
                    product.name.toLowerCase().includes(term)
                );

                if (filteredProducts.length > 0) {
                    acc[category] = filteredProducts;
                }

                return acc;
            }, {});
        } else if (!term && selectedCat !== 'all') {
            return {
                [selectedCat]: groupedByCategory.value[selectedCat] || []
            };
        } else {
            const filteredProducts = (groupedByCategory.value[selectedCat] || []).filter((product: any) =>
                product.name.toLowerCase().includes(term)
            );

            return {
                [selectedCat]: filteredProducts
            };
        }
    });

    const handleSearchProducts = (event: Event) => {
        const target = event.target as HTMLInputElement;
        searchTerm.value = target.value;
    };

    const getProductQuantityInCart = (productId: number) => {
        const cartItems = currentTable.value.cart?.carts_items || [];
        const item = cartItems.find((item: any) => item.product_id === productId);
        return item ? item.quantity : 0;
    };

    const upsertCartItem = async (product: any, quantity: number) => {
        try {
            if (!currentTable.value.cart) {
                console.error('No cart found for this table');
                return;
            }

            const data = await tableStore.upsertCartItem(currentTable.value.cart, product, quantity);
            // Update the local cart data in the table store
            console.log('Upserted cart item data:', data);
            tableStore.currentTable.cart = data;

        } catch (error) {
            console.error('Error upserting cart item:', error);
        }
    };

    // unique categories from products
    const categories = computed(() => {
        //use the groupedByCategory to get the unique categories
        return Object.keys(groupedByCategory.value).map(categoryName => {
            return {
                id: categoryName,
                name: categoryName            
            };
        });
    });

    const cancel = () => modal.value.$el.dismiss(null, 'cancel');

    onMounted(async () => {
        try {
            await productStore.fetchProducts();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });
</script>

<style scoped>

    :deep(.swiper-slide) {
        width: auto !important;
    }

    :deep(.swiper-pagination-bullet) {
        background: var(--ion-color-medium);
    }

    :deep(.swiper-pagination-bullet-active) {
        background: var(--ion-color-medium);
    }

    .products {

	.product {
		margin: 0.5em 0;
		border-radius: 10px;
	
		.product-text {
			font-size: 0.8rem;
		}
		
		.product-number {
			font-size: 1.8rem;
			font-weight: 900;
			letter-spacing: 0.5px;
			display: inline-block;
			margin-right: 0.5em;
		}

		&.opened {
			--border-width: 0 0px 0 0px;
			--border-style: solid;
			--border-color: var(--ion-color-primary);
		}

		/* &.closed {
			--border-color: var(--ion-color-medium);
		}

		&.unavailable {
			--border-color: var(--ion-color-danger);
		} */
	}
}

</style>