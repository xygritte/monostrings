// Product Service for fetching and filtering products

const ProductService = {
    // Current filters state
    currentFilters: {
        category: null,
        outfit_type: null
    },
    
    // Current sorting state
    currentSort: 'newest',
    
    // Fetch all products from Supabase
    async getProducts() {
        try {
            console.log('[PRODUCT_SERVICE]: Fetching all products from Supabase...');
            
            // Using the actual Supabase client
            const { data, error } = await supabase
                .from('products')
                .select('*');
            
            if (error) {
                throw new Error(`Supabase error: ${error.message}`);
            }
            
            console.log(`[PRODUCT_SERVICE]: Successfully fetched ${data?.length || 0} products`);
            return data || [];
            
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]:', error.message);
            
            // Fallback to mock data for demo
            console.log('[PRODUCT_SERVICE]: Using fallback mock data');
            return getMockData();
        }
    },
    
    // Insert a new product (for admin panel - optional)
    async addProduct(productData) {
        try {
            console.log('[PRODUCT_SERVICE]: Adding new product...');
            
            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select();
            
            if (error) {
                throw new Error(`Failed to add product: ${error.message}`);
            }
            
            console.log('[PRODUCT_SERVICE]: Product added successfully');
            return data;
            
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to add product:', error.message);
            throw error;
        }
    },
    
    // Get unique categories from products
    getUniqueCategories(products) {
        try {
            if (!products || products.length === 0) return [];
            
            const categories = [...new Set(products
                .map(product => product.category)
                .filter(category => category && category.trim() !== '')
            )];
            
            console.log(`[PRODUCT_SERVICE]: Found ${categories.length} unique categories`);
            return categories;
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to get unique categories:', error.message);
            return ['baju', 'celana', 'topi']; // Default fallback
        }
    },
    
    // Get unique outfit types from products
    getUniqueOutfitTypes(products) {
        try {
            if (!products || products.length === 0) return [];
            
            const outfitTypes = [...new Set(products
                .map(product => product.outfit_type)
                .filter(outfit => outfit && outfit.trim() !== '')
            )];
            
            console.log(`[PRODUCT_SERVICE]: Found ${outfitTypes.length} unique outfit types`);
            return outfitTypes;
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to get unique outfit types:', error.message);
            return ['streetwear', 'casual', 'sporty', 'vintage']; // Default fallback
        }
    },
    
    // Filter products based on current filters
    filterProducts(products, filters = null) {
        try {
            if (!products || products.length === 0) return [];
            
            const activeFilters = filters || this.currentFilters;
            let filteredProducts = [...products];
            
            // Apply category filter
            if (activeFilters.category) {
                filteredProducts = filteredProducts.filter(
                    product => product.category === activeFilters.category
                );
            }
            
            // Apply outfit type filter
            if (activeFilters.outfit_type) {
                filteredProducts = filteredProducts.filter(
                    product => product.outfit_type === activeFilters.outfit_type
                );
            }
            
            console.log(`[PRODUCT_SERVICE]: Filtered ${products.length} products to ${filteredProducts.length} products`);
            return filteredProducts;
            
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to filter products:', error.message);
            return products || []; // Return original as fallback
        }
    },
    
    // Sort products based on current sort
    sortProducts(products, sortType = null) {
        try {
            if (!products || products.length === 0) return [];
            
            const sort = sortType || this.currentSort;
            let sortedProducts = [...products];
            
            switch (sort) {
                case 'newest':
                    sortedProducts.sort((a, b) => {
                        const dateA = new Date(a.created_at || 0);
                        const dateB = new Date(b.created_at || 0);
                        return dateB - dateA;
                    });
                    break;
                case 'oldest':
                    sortedProducts.sort((a, b) => {
                        const dateA = new Date(a.created_at || 0);
                        const dateB = new Date(b.created_at || 0);
                        return dateA - dateB;
                    });
                    break;
                default:
                    // Default to newest
                    sortedProducts.sort((a, b) => {
                        const dateA = new Date(a.created_at || 0);
                        const dateB = new Date(b.created_at || 0);
                        return dateB - dateA;
                    });
            }
            
            console.log(`[PRODUCT_SERVICE]: Sorted ${sortedProducts.length} products by ${sort}`);
            return sortedProducts;
            
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to sort products:', error.message);
            return products || [];
        }
    },
    
    // Apply both filter and sort
    getFilteredAndSortedProducts(products) {
        try {
            const filtered = this.filterProducts(products);
            const sorted = this.sortProducts(filtered);
            return sorted;
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to filter and sort products:', error.message);
            return products || [];
        }
    },
    
    // Update filters
    updateFilters(newFilters) {
        try {
            this.currentFilters = { ...this.currentFilters, ...newFilters };
            console.log('[PRODUCT_SERVICE]: Updated filters:', this.currentFilters);
            return this.currentFilters;
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to update filters:', error.message);
            return this.currentFilters;
        }
    },
    
    // Clear all filters
    clearFilters() {
        try {
            this.currentFilters = {
                category: null,
                outfit_type: null
            };
            console.log('[PRODUCT_SERVICE]: Cleared all filters');
            return this.currentFilters;
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to clear filters:', error.message);
            return this.currentFilters;
        }
    },
    
    // Update sort
    updateSort(newSort) {
        try {
            this.currentSort = newSort;
            console.log('[PRODUCT_SERVICE]: Updated sort to:', newSort);
            return this.currentSort;
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to update sort:', error.message);
            return this.currentSort;
        }
    }
};

// Mock data function for fallback
function getMockData() {
    return [
        {
            id: '1',
            name: 'Oversized Black Hoodie',
            image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
            affiliate_link: 'https://example.com/product1',
            category: 'baju',
            outfit_type: 'streetwear',
            created_at: '2023-10-15T10:30:00Z'
        },
        {
            id: '2',
            name: 'Cargo Jogger Pants',
            image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80',
            affiliate_link: 'https://example.com/product2',
            category: 'celana',
            outfit_type: 'casual',
            created_at: '2023-10-14T14:20:00Z'
        },
        {
            id: '3',
            name: 'Vintage Denim Jacket',
            image_url: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
            affiliate_link: 'https://example.com/product3',
            category: 'baju',
            outfit_type: 'vintage',
            created_at: '2023-10-13T09:15:00Z'
        },
        {
            id: '4',
            name: 'Baseball Cap - Black',
            image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=736&q=80',
            affiliate_link: 'https://example.com/product4',
            category: 'topi',
            outfit_type: 'sporty',
            created_at: '2023-10-12T16:45:00Z'
        },
        {
            id: '5',
            name: 'Graphic Tee - Abstract',
            image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
            affiliate_link: 'https://example.com/product5',
            category: 'baju',
            outfit_type: 'streetwear',
            created_at: '2023-10-11T11:20:00Z'
        },
        {
            id: '6',
            name: 'Tech Fleece Joggers',
            image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
            affiliate_link: 'https://example.com/product6',
            category: 'celana',
            outfit_type: 'sporty',
            created_at: '2023-10-10T13:10:00Z'
        },
        {
            id: '7',
            name: 'Bucket Hat - Camo',
            image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=736&q=80',
            affiliate_link: 'https://example.com/product7',
            category: 'topi',
            outfit_type: 'streetwear',
            created_at: '2023-10-09T08:30:00Z'
        },
        {
            id: '8',
            name: 'Oversized T-Shirt - White',
            image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80',
            affiliate_link: 'https://example.com/product8',
            category: 'baju',
            outfit_type: 'casual',
            created_at: '2023-10-08T15:40:00Z'
        }
    ];
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProductService };
}