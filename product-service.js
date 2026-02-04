/**
 * Product Service
 * Handles all product data operations with error handling
 */

const ProductService = {
    // Application state
    state: {
        products: [],
        filteredProducts: [],
        categories: [],
        outfitTypes: [],
        filters: {
            category: null,
            outfit_type: null,
            search: ''
        },
        sort: 'newest',
        isLoading: false
    },

    // Initialize the service
    async initialize() {
        try {
            console.log('[PRODUCT_SERVICE]: Initializing...');
            this.state.isLoading = true;
            
            // Fetch products from Supabase
            await this.fetchProducts();
            
            // Extract unique categories and outfit types
            this.extractFilterOptions();
            
            console.log('[PRODUCT_SERVICE]: Ready. Products:', this.state.products.length);
            return true;
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Initialization failed:', error);
            return false;
        } finally {
            this.state.isLoading = false;
        }
    },

    // Fetch products from Supabase
    async fetchProducts() {
        try {
            console.log('[PRODUCT_SERVICE]: Fetching products...');
            
            // Use the Supabase client
            const { data, error } = await supabaseClient
                .from('products')
                .select('*');
            
            if (error) {
                throw new Error(`Supabase error: ${error.message}`);
            }
            
            // Store products
            this.state.products = data || [];
            this.state.filteredProducts = [...this.state.products];
            
            console.log(`[PRODUCT_SERVICE]: Fetched ${this.state.products.length} products`);
            return this.state.products;
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to fetch products:', error.message);
            
            // Fallback to mock data
            console.log('[PRODUCT_SERVICE]: Using mock data as fallback');
            this.state.products = getMockProducts();
            this.state.filteredProducts = [...this.state.products];
            
            return this.state.products;
        }
    },

    // Extract unique categories and outfit types for filters
    extractFilterOptions() {
        try {
            // Get unique categories
            const categories = [...new Set(this.state.products
                .map(product => product.category)
                .filter(Boolean)
                .sort())];
            
            // Get unique outfit types
            const outfitTypes = [...new Set(this.state.products
                .map(product => product.outfit_type)
                .filter(Boolean)
                .sort())];
            
            this.state.categories = categories;
            this.state.outfitTypes = outfitTypes;
            
            console.log(`[PRODUCT_SERVICE]: Extracted ${categories.length} categories, ${outfitTypes.length} outfit types`);
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to extract filter options:', error);
            this.state.categories = ['baju', 'celana', 'topi'];
            this.state.outfitTypes = ['streetwear', 'casual', 'sporty', 'vintage'];
        }
    },

    // Apply filters and search
    applyFilters() {
        try {
            let results = [...this.state.products];
            const { category, outfit_type, search } = this.state.filters;
            
            // Apply category filter
            if (category) {
                results = results.filter(product => 
                    product.category.toLowerCase() === category.toLowerCase()
                );
            }
            
            // Apply outfit type filter
            if (outfit_type) {
                results = results.filter(product => 
                    product.outfit_type.toLowerCase() === outfit_type.toLowerCase()
                );
            }
            
            // Apply search filter
            if (search && search.trim() !== '') {
                const searchTerm = search.toLowerCase().trim();
                results = results.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.category.toLowerCase().includes(searchTerm) ||
                    product.outfit_type.toLowerCase().includes(searchTerm)
                );
            }
            
            // Apply sorting
            results = this.applySorting(results);
            
            // Update filtered products
            this.state.filteredProducts = results;
            
            console.log(`[PRODUCT_SERVICE]: Filtered to ${results.length} products`);
            return results;
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to apply filters:', error);
            this.state.filteredProducts = [...this.state.products];
            return this.state.filteredProducts;
        }
    },

    // Apply sorting to products
    applySorting(products) {
        try {
            const sorted = [...products];
            
            switch (this.state.sort) {
                case 'newest':
                    sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    break;
                case 'oldest':
                    sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                    break;
                case 'name_asc':
                    sorted.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name_desc':
                    sorted.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                default:
                    sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }
            
            return sorted;
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to sort products:', error);
            return products;
        }
    },

    // Set category filter
    setCategoryFilter(category) {
        try {
            // Toggle filter: if same category is selected, remove it
            this.state.filters.category = 
                this.state.filters.category === category ? null : category;
            
            console.log('[PRODUCT_SERVICE]: Category filter:', this.state.filters.category);
            return this.applyFilters();
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to set category filter:', error);
            return this.state.filteredProducts;
        }
    },

    // Set outfit type filter
    setOutfitFilter(outfitType) {
        try {
            // Toggle filter: if same outfit type is selected, remove it
            this.state.filters.outfit_type = 
                this.state.filters.outfit_type === outfitType ? null : outfitType;
            
            console.log('[PRODUCT_SERVICE]: Outfit filter:', this.state.filters.outfit_type);
            return this.applyFilters();
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to set outfit filter:', error);
            return this.state.filteredProducts;
        }
    },

    // Set search filter
    setSearchFilter(searchTerm) {
        try {
            this.state.filters.search = searchTerm || '';
            console.log('[PRODUCT_SERVICE]: Search filter:', this.state.filters.search);
            return this.applyFilters();
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to set search filter:', error);
            return this.state.filteredProducts;
        }
    },

    // Set sort order
    setSortOrder(sortType) {
        try {
            this.state.sort = sortType || 'newest';
            console.log('[PRODUCT_SERVICE]: Sort order:', this.state.sort);
            return this.applyFilters();
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to set sort order:', error);
            return this.state.filteredProducts;
        }
    },

    // Clear all filters
    clearAllFilters() {
        try {
            this.state.filters = {
                category: null,
                outfit_type: null,
                search: ''
            };
            
            console.log('[PRODUCT_SERVICE]: Cleared all filters');
            return this.applyFilters();
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to clear filters:', error);
            return this.state.filteredProducts;
        }
    },

    // Clear search only
    clearSearch() {
        try {
            this.state.filters.search = '';
            console.log('[PRODUCT_SERVICE]: Cleared search');
            return this.applyFilters();
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to clear search:', error);
            return this.state.filteredProducts;
        }
    },

    // Get active filters count
    getActiveFiltersCount() {
        let count = 0;
        if (this.state.filters.category) count++;
        if (this.state.filters.outfit_type) count++;
        if (this.state.filters.search.trim() !== '') count++;
        return count;
    },

    // Get search suggestions
    getSearchSuggestions(searchTerm, limit = 5) {
        try {
            if (!searchTerm || searchTerm.trim() === '') {
                return [];
            }
            
            const term = searchTerm.toLowerCase().trim();
            const suggestions = [];
            
            // Search in product names
            this.state.products.forEach(product => {
                if (product.name.toLowerCase().includes(term)) {
                    suggestions.push({
                        type: 'product',
                        value: product.name,
                        category: product.category
                    });
                }
            });
            
            // Search in categories
            this.state.categories.forEach(category => {
                if (category.toLowerCase().includes(term)) {
                    suggestions.push({
                        type: 'category',
                        value: category,
                        category: 'Category'
                    });
                }
            });
            
            // Search in outfit types
            this.state.outfitTypes.forEach(outfitType => {
                if (outfitType.toLowerCase().includes(term)) {
                    suggestions.push({
                        type: 'outfit',
                        value: outfitType,
                        category: 'Outfit Type'
                    });
                }
            });
            
            // Remove duplicates and limit results
            const uniqueSuggestions = suggestions
                .filter((suggestion, index, self) =>
                    index === self.findIndex(s => s.value === suggestion.value)
                )
                .slice(0, limit);
            
            return uniqueSuggestions;
        } catch (error) {
            console.error('[PRODUCT_SERVICE_ERROR]: Failed to get search suggestions:', error);
            return [];
        }
    },

    // Get current state (for debugging)
    getState() {
        return {
            totalProducts: this.state.products.length,
            filteredProducts: this.state.filteredProducts.length,
            activeFilters: this.getActiveFiltersCount(),
            filters: this.state.filters,
            sort: this.state.sort
        };
    }
};

// Export for browser use
window.ProductService = ProductService;
console.log('[PRODUCT_SERVICE]: Ready');