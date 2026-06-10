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
            <ion-card color="base" :bordered="false">
				<ion-card-header>
                    <ion-searchbar @click="" placeholder="Rechercher"></ion-searchbar>
                    <ion-segment scrollable>
                         <ion-segment-button value="all">
                            <ion-label> Toutes </ion-label>
                        </ion-segment-button>
                        <ion-segment-button
                            v-for="category in categories"
                            :key="category.id"
                            :value="category.id"
                        >
                            <ion-label>{{ category.name }}</ion-label>
                        </ion-segment-button>
                    </ion-segment>
                </ion-card-header>

                <ion-card-content class="products">
                    <div v-for="(products, category) in groupedByCategory" :key="category" color="primary" outline>
                        <ion-label>{{ category }}</ion-label>

                        <ion-item v-for="product in products" :key="product.id" :button="true" class="ion-display-flex product opened ion-marging" lines="none">
							<ion-avatar slot="start">
								<img v-if="product.image_path" :src="product.image_path" />
                                <ion-icon v-else :icon="image" size="large"></ion-icon>
							</ion-avatar>
                            <ion-label>
                                {{ product.name }}
                                <p>{{ product.unit_price }} €</p>
                            </ion-label>
                        </ion-item>
                    </div>
                </ion-card-content>
            </ion-card>
        </ion-content>

    </ion-modal>

</template> 

<script setup lang="ts">
    import { IonHeader, IonToolbar, IonButtons, IonTitle, IonContent, IonButton, IonModal, IonSearchbar, IonChip, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardContent, IonIcon } from '@ionic/vue';
    import { image } from 'ionicons/icons';
    import { useTableStore } from '../../stores/tableStore';
    import { ref, onMounted, computed } from 'vue';
    import { useProductStore } from '../../stores/productStore';

    const tableStore = useTableStore();
    const productStore = useProductStore(); 
    const modal = ref();
    const products = computed(() => productStore.products);

    // unique categories from products
    const categories = computed(() => {
          return [
            ...new Map(
            products.value
                .filter(product => product.category)
                .map(product => [product.category.id, product.category])
            ).values(),
            ...new Map(
            products.value
                .filter(product => product.category)
                .map(product => [product.category.id, product.category])
            ).values()
        ];
    });

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

    const cancel = () => modal.value.$el.dismiss(null, 'cancel');

    const confirm = () => {
        modal.value.$el.dismiss(null, 'confirm');
    };

    const props = defineProps({
        table: {
            type: Object,
            required: true
        }
    });

    const isAlertOpen = ref(false);
    const acceptCloseTable = ref(false);

    const setAlertOpen = (value: boolean) => {
        isAlertOpen.value = value;
    };

    const setAcceptCloseTable = (value: boolean) => {
        acceptCloseTable.value = value;
    };

    const setCloseTable = (value: boolean) => {
        tableStore.closeTable(props.table.id);
    };

    onMounted(async () => {
        try {
            await productStore.fetchProducts();
            console.log('Products fetched successfully:', products.value);
            console.log('Unique categories:', categories.value);
            console.log('Grouped by category:', groupedByCategory.value);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });
</script>

<style scoped>
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