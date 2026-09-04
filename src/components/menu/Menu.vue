<template>
		<ion-header :translucent="false">
            <Toolbar :title="'Menu'" :showMenuButton="false" />
		</ion-header>

		<ion-content :fullscreen="false">
            <ion-card color="base">
                <ion-segment :scrollable="false">
                        <ion-segment-button value="produits" content-id="produits">
                            <ion-label>Produits</ion-label>
                        </ion-segment-button>
                        <ion-segment-button value="categories" content-id="categories">
                            <ion-label>Catégories</ion-label>
                        </ion-segment-button>
                </ion-segment>
                <ion-segment-view :swipe-gesture="false">
                    <ion-segment-content id="produits">
                        <ion-list class="ion-no-padding">
                            <ion-item-group v-for="(products, category) in groupedByCategory" :key="category">
                                <ion-item-divider>
                                    <ion-label> {{ category }}</ion-label>
                                </ion-item-divider>
                                <ion-item-sliding v-for="(product, index) in products" :key="product.id">
                                    <ion-item :lines="index === products.length - 1 ? 'none' : 'default'">
                                        <ion-avatar slot="start">
                                            <img v-if="product.image_path" :src="product.image_path" />
                                            <ion-icon v-else :icon="image" size="large"></ion-icon>
                                        </ion-avatar>
                                        <ion-label>
                                            {{ product.name }}
                                            <p>{{ parseFloat(product.unit_price).toFixed(2) }} DA - stock: {{ product.stock }}</p>
                                        </ion-label>
                                        <!-- <ion-button v-if="!currentTable.cart?.carts_items?.find((item: any) => item.product_id === product.id)" fill="clear" size="small" slot="end" @click="upsertCartItem(product, getProductQuantityInCart(product.id) + 1)">
                                            <ion-icon :icon="addCircleOutline" size="large"></ion-icon>
                                        </ion-button> -->
                                    </ion-item>
                                    <ion-item-options side="end">
                                        <ion-item-option color="primary" @click="setOpen('product', true); closeSliding($event); isValidName = true; productId = product.id; productName = product.name; productPriceUnit = product.unit_price; productStock = product.stock; productCategorie = product.category_id;titreModalProduit = 'Modifier le produit';">
                                            <ion-icon slot="icon-only" :icon="create" size="large"></ion-icon>
                                        </ion-item-option>
                                        <ion-item-option class="delete-btn" color="" @click="setAcceptRemoveProduct(true, 'product', product.id); closeSliding($event);">
                                            <ion-icon slot="icon-only" :icon="trash" size="large"></ion-icon>
                                        </ion-item-option>
                                    </ion-item-options>
                                </ion-item-sliding>
                            </ion-item-group>  
                        </ion-list>
                    </ion-segment-content>
                    <ion-segment-content id="categories">
                        <ion-list class="ion-no-padding">
                            <ion-item-sliding v-for="category in allCategories" :key="category.id">
                                <ion-item :lines="'full'">
                                    <ion-label>
                                        {{ category.name }}
                                        <p>{{ category.productsCount || 0 }} produit{{ category.productsCount > 1 ? 's' : '' }}</p>
                                    </ion-label>
                                </ion-item>
                                <ion-item-options side="end">
                                    <ion-item-option color="primary" @click="setOpen('category', true); closeSliding($event); isValidName = true; categoryId = category.id; categoryName = category.name; titreModalCategorie = 'Modifier la catégorie';">
                                        <ion-icon slot="icon-only" :icon="create" size="large"></ion-icon>
                                    </ion-item-option>
                                    <ion-item-option class="delete-btn" color="" @click="setAcceptRemoveProduct(true, 'category', category.id); closeSliding($event);">
                                        <ion-icon slot="icon-only" :icon="trash" size="large"></ion-icon>
                                    </ion-item-option>
                                </ion-item-options>
                            </ion-item-sliding>
                        </ion-list>
                    </ion-segment-content>
                </ion-segment-view>
            </ion-card>
        </ion-content>
        <ion-footer class="ion-display-flex ion-justify-content-center ion-padding">
            <ion-button color="" fill="outline" size="large" expand="block" @click="setOpen('product', true); productId = null;" class="ion-flex-grow-1">
                <ion-icon :icon="add" slot="start"></ion-icon>
                <ion-text> Produit </ion-text>
            </ion-button>
            <ion-button fill="outline" size="large" expand="block" color="primary" @click="setOpen('category', true); categoryId = null;" class="ion-flex-grow-1">
                <ion-icon :icon="add" slot="start"></ion-icon>
                <ion-text> Catégorie </ion-text>
            </ion-button>
        </ion-footer>

        <ion-modal ref="table-modal" :is-open="isModalProductOpen" @did-dismiss="setOpen('product',false)">
            <ion-content class="ion-padding">
                <ion-toolbar>
                    <ion-title>{{ titreModalProduit ??'Nouveau produit' }}</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="setOpen('product',false)">Fermer</ion-button>
                    </ion-buttons>
                </ion-toolbar>
                <input
                    type="hidden"
                    v-model="productId"
                    fill="outline"
                    class="ion-display-none"
                    >
                </input>
                <ion-item lines="none">
                    <ion-input 
                        ref="nameInput"
                        label="Nom du produit"
                        label-placement="floating"
                        type="text" 
                        v-model="productName"
                        helper-text="Le nom du produit ( max 50 caractères )"
                        error-text="Longueur minimale de 3 caractères et maximale de 50 caractères"
                        @ionInput="getValidationName"
                        @ionBlur="markTouched(nameInput)"
                        fill="outline"
                        :counter="true"
                        :maxlength="50"
                        :minlength="3"
                        class="ion-margin-vertical"
                        required
                        >
                    </ion-input>
                </ion-item>
                <ion-item lines="none">
                       <ion-input 
                        ref="PriceUnitInput"
                        label="Prix unitaire"
                        label-placement="floating"
                        type="number" 
                        min="0" 
                        step="0.01"
                        v-model="productPriceUnit"
                        helper-text="Le prix unitaire du produit"
                        error-text="Le prix doit être un nombre positif"
                        @ionBlur="markTouched(PriceUnitInput)"
                        fill="outline"
                        class="ion-margin-vertical"
                        required
                        >
                    </ion-input>
                </ion-item>
                <ion-item lines="none">
                       <ion-input 
                        ref="stockInput"
                        label="Stock"
                        label-placement="floating"
                        type="number" 
                        min="0" 
                        step="0.01"
                        v-model="productStock"
                        helper-text="Le stock du produit"
                        error-text="Le stock doit être un nombre positif"
                        @ionBlur="markTouched(stockInput)"
                        fill="outline"
                        class="ion-margin-vertical"
                        required
                        >
                    </ion-input>
                </ion-item>
                <ion-item>
                    <ion-select 
                        v-model="productCategorie"
                        label="Catégorie" 
                        label-placement="floating"
                        fill="outline"
                        class="ion-margin-vertical"
                        required
                        >
                        <ion-select-option v-for="categorie in allCategories" :key="categorie.id" :value="categorie.id">{{ categorie.name }}</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-button expand="block" color="success" @click="createProduct()" :disabled="!isValidName || productPriceUnit <= 0 || productStock < 0 || !productCategorie">
                    <ion-icon :icon="checkmarkOutline" slot="start"></ion-icon>
                    Enregistrer le produit
                </ion-button>
            </ion-content>
		</ion-modal>

        <ion-modal ref="table-modal" :is-open="isModalCategoryOpen" @did-dismiss="setOpen('category',false)">
            <ion-content class="ion-padding">
                <ion-toolbar>
                    <ion-title>{{ titreModalCategorie ?? 'Nouvelle catégorie' }}</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="setOpen('category',false)">Fermer</ion-button>
                    </ion-buttons>
                </ion-toolbar>
                <input
                    type="hidden"
                    v-model="categoryId"
                    fill="outline"
                    class="ion-display-none"
                    >
                </input>
                <ion-item lines="none">
                    <ion-input 
                        ref="nameInput"
                        label="Nom de la catégorie"
                        label-placement="floating"
                        type="text" 
                        v-model="categoryName"
                        helper-text="Le nom de la catégorie ( max 50 caractères )"
                        error-text="Longueur minimale de 3 caractères et maximale de 50 caractères"
                        @ionInput="getValidationName"
                        @ionBlur="markTouched(nameInput)"
                        fill="outline"
                        :counter="true"
                        :maxlength="50"
                        :minlength="3"
                        class="ion-margin-vertical"
                        required
                        >
                    </ion-input>
                </ion-item>
                <ion-button expand="block" color="success" @click="createCategory()" :disabled="!isValidName">
                    <ion-icon :icon="checkmarkOutline" slot="start"></ion-icon>
                    Enregistrer la catégorie
                </ion-button>
            </ion-content>
        </ion-modal>
        <ion-alert  :is-open="acceptRemoveProduct"
            header="Confirmation"
            sub-header="Voulez-vous vraiment supprimer cet élément ?"
            message="Cette action est irréversible."
            :buttons="acceptRemoveProductButtons"
            @didDismiss="setAcceptRemoveProduct(false)"
            >
        </ion-alert>
        <ion-alert  :is-open="isInAnyCartAlert"
            header="Action impossible"
            :sub-header="toRemove.type === 'product' ? 'Ce Produit est présent dans un ou plusieurs tables ouvertes.' : 'Cette catégorie contient un ou plusieurs produits.'"
            :message="toRemove.type === 'product' ? 'Il ne peut pas être supprimé tant qu\'il est en cours de vente.' : 'Vous devez d\'abord supprimer tous les produits de cette catégorie.'"
            :buttons="[{ text: 'OK', role: 'cancel' }]"
            @didDismiss="setIsInAnyCartAlert(false)"
            >
        </ion-alert>
</template>

<script setup lang="ts">
    import Toolbar from '../Toolbar.vue';
    import { IonHeader, IonContent, IonLabel, IonCard, IonIcon, IonAvatar, IonItem, IonList, IonItemGroup, IonItemDivider, IonSegment, IonSegmentButton, IonFooter, IonToolbar, IonTitle, IonSegmentView, IonSegmentContent, IonButtons, IonButton, IonText, IonModal, IonInput, IonSelect, IonSelectOption, IonItemOptions, IonItemOption, IonItemSliding, IonAlert } from '@ionic/vue';
    import { image, add, checkmarkOutline, create, trash } from 'ionicons/icons';
    import { ref, onMounted, computed } from 'vue';
    import { useProductStore } from '../../stores/productStore';
    import { useCategoryStore } from '../../stores/categoryStore';
    import { useTableStore } from '../../stores/tableStore';
    const productStore = useProductStore();
    const tableStore = useTableStore();

    const products = computed(() => productStore.products);
    const categoryStore = useCategoryStore();
    const allCategories = computed(function() {
        // add key count_products to each category based on the products in the store
        return categoryStore.categories.sort((a, b) => a.name.localeCompare(b.name)).map(category => {
            const productsCount = products.value.filter(product => product.category_id === category.id).length;
            return {
                ...category,
                productsCount
            };
        });
    });
    const categoryId = ref(null);
    const categoryName = ref('');

    const productId = ref(null);
    const titreModalProduit = ref('Nouveau produit');
    const titreModalCategorie = ref('Nouvelle catégorie');
    const productName = ref('');
    const productPriceUnit = ref(0);
    const productStock = ref(0);
    const productCategorie = ref(null);
    const isValidName = ref(false);

    //ref inputs
    const nameInput = ref();
    const PriceUnitInput = ref();
    const stockInput = ref();

    const isModalProductOpen = ref(false);
    const isModalCategoryOpen = ref(false);
    const setOpen = (modalName: string, isOpen: boolean) => {
        if (modalName === 'product') {
            isModalProductOpen.value = isOpen;
        } 
        if (modalName === 'category') {
            isModalCategoryOpen.value = isOpen;
        }
        //if isOpen is false, reset the modal titles to their default values
        if (!isOpen) {
            titreModalProduit.value = 'Nouveau produit';
            titreModalCategorie.value = 'Nouvelle catégorie'; 
            // reset fields
            productId.value = null;
            productName.value = '';
            productPriceUnit.value = 0;
            productStock.value = 0;
            productCategorie.value = null;

            nameInput.value = null;
            categoryName.value = '';
            PriceUnitInput.value = null;
            stockInput.value = null;
            isValidName.value = false;
        }

    };

    const closeSliding = (event: any) => {
        const slidingItem = event.target.closest('ion-item-sliding');
        if (slidingItem) {
            slidingItem.close();
        }
    };

    const isInAnyCartAlert = ref(false);
    const setIsInAnyCartAlert = (open: boolean) => {
        isInAnyCartAlert.value = open;
    };
    const acceptRemoveProduct = ref(false);
    const toRemove = ref<{ type?: string, id?: number }>({});
    const setAcceptRemoveProduct = (open: boolean, type?: string, id?: number) => {
        acceptRemoveProduct.value = open;
        if (open) {
            toRemove.value = { type: type, id: id };
        } else {
            toRemove.value = { type: undefined, id: undefined };
        }
    };
    const acceptRemoveProductButtons = [
    {
        text: 'Confirmer',
        handler: async () => {
            if (!toRemove.value.id || !toRemove.value.type) {
                console.warn('No product or type specified for removal.');
                setAcceptRemoveProduct(false);
                return;
            }
            if(toRemove.value.type === 'product') {
                // check if the product is in any cart
                let isInAnyCart = await tableStore.isProductInAnyCart(toRemove.value.id);
                if (isInAnyCart) {
                    // handle the case when the product is in any cart
                    console.warn('Product is in one or more carts and cannot be removed.');
                    setIsInAnyCartAlert(true);
                    return;
                }
                // proceed with removal if not in any cart
                await productStore.deleteProduct(toRemove.value.id);
            }

            if(toRemove.value.type === 'category') {
                // check if any products belong to this category
                let hasProducts = await productStore.fetchProductsByCategory(toRemove.value.id);
                if (hasProducts && hasProducts.length > 0) {
                    console.warn('Category has one or more products and cannot be removed.');
                    setIsInAnyCartAlert(true);
                    return;
                }
                // proceed with removal if no products belong to this category
                await categoryStore.deleteCategory(toRemove.value.id);
            }
            setAcceptRemoveProduct(false);
            setIsInAnyCartAlert(false);
        }
    },
    {
        text: 'Annuler',
        role: 'cancel',
        handler: () => {            
            setAcceptRemoveProduct(false);
        }
    }
];
    const markTouched = (inputRef: any) => {
        inputRef.value.$el?.classList?.add('ion-touched');
    };

    const getValidationName = (event: any) => {
        nameInput.value.$el?.classList?.remove('ion-valid');
        nameInput.value.$el?.classList?.remove('ion-invalid');
        const name = event.target.value;
        if (!name || name.length < 3) nameInput.value.$el?.classList?.add('ion-invalid');
        else if (name.length <= 50) nameInput.value.$el?.classList?.add('ion-valid');
        else nameInput.value.$el?.classList?.add('ion-invalid');
        isValidName.value = name.length >= 3 && name.length <= 50;
        return isValidName.value;
    }

    const groupedByCategory = computed(() => {
        const grouped = products.value.reduce((acc: Record<string, any>, product) => {
            const categoryName = product.category ? product.category.name : 'Non classé';
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(product);
            return acc;
        }, {});

        // sort by categoryName keys name and then sort the products by name
        const sortedGrouped = Object.keys(grouped).sort().reduce((sortedAcc: Record<string, any>, key) => {
            sortedAcc[key] = grouped[key].sort((a: any, b: any) => a.name.localeCompare(b.name));
            return sortedAcc;
        }, {});
        return sortedGrouped;
    });

    const createProduct = async () => {
         if(!isValidName.value || productPriceUnit.value <= 0 || productStock.value < 0 || !productCategorie.value) {
            console.error('Invalid product data');
            return;
        }
        try {
            if(productId.value) {
                // update product
                await productStore.updateProduct(productId.value, {
                    name: productName.value,
                    unit_price: productPriceUnit.value,
                    stock: productStock.value,
                    category_id: productCategorie.value
                });
            } else {
                // create new product
                await productStore.createProduct({
                    name: productName.value,
                    unit_price: productPriceUnit.value,
                    stock: productStock.value,
                    category_id: productCategorie.value
                });
            }
            setOpen('product', false);
            //reset the form
            isValidName.value = false;
            productId.value = null;
            productName.value = '';
            productPriceUnit.value = 0;
            productStock.value = 0;
            productCategorie.value = null;

            // activate the products segment
            const segment = document.querySelector('ion-segment') as any;
            if (segment) {
                segment.value = 'produits';
            }
        } catch (error) {
            console.error('Error creating product:', error);
        }
    };

    const createCategory = async () => {
        if(!isValidName.value) {
            console.error('Invalid category name');
            return;
        }
        try {
            if(categoryId.value) {
                // update category
                await categoryStore.updateCategory(categoryId.value, {
                    name: categoryName.value
                });

                // update category in the local store of productStore.products
                productStore.products.forEach(product => {
                    if (product.category_id === categoryId.value) {
                        product.category.name = categoryName.value;
                    }
                });
            } else {
                // create new category
                await categoryStore.createCategory({
                    name: categoryName.value
                });
            };

            setOpen('category', false);
            //reset the form
            isValidName.value = false;
            categoryId.value = null;
            categoryName.value = '';
            // activate the categories segment
            const segment = document.querySelector('ion-segment') as any;
            if (segment) {
                segment.value = 'categories';
            }
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    onMounted(async () => {
        try {
            await productStore.fetchProducts();
            await categoryStore.fetchCategories();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });
</script>

<style scoped>
    .delete-btn {
        --background: var(--red)!important;
        --opacity: 0.5;
    }
</style>