/**
 * Main Application Script
 * Controls UI interactions and rendering
 */

// Application instance
const App = {
    // DOM elements cache
    elements: {},
    
    // Debounce timer for search
    searchDebounceTimer: null,
    
    // Initialize the application
    async init() {
        try {
            console.log('[APP]: Initializing...');
            
            // Cache DOM elements
            this.cacheElements();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize Product Service
            await ProductService.initialize();
            
            // Initial render
            this.renderFilters();
            this.renderProducts();
            this.updateUIState();
            
            console.log('[APP]: Ready');
        } catch (error) {
            console.error('[APP_ERROR]: Initialization failed:', error);
            this.showError('Failed to initialize application');
        }
    },
    
    // Cache all DOM elements
    cacheElements() {
        // Main elements
        this.elements = {
            // Product grid
            productsGrid: document.getElementById('productsGrid'),
            loadingState: document.getElementById('loadingState'),
            emptyState: document.getElementById('emptyState'),
            
            // Filter elements
            categoryFilters: document.getElementById('categoryFilters'),
            outfitFilters: document.getElementById('outfitFilters'),
            activeFilters: document.getElementById('activeFilters'),
            
            // Search elements
            searchInput: document.getElementById('searchInput'),
            searchInputMobile: document.getElementById('searchInputMobile'),
            clearSearch: document.getElementById('clearSearch'),
            clearSearchMobile: document.getElementById('clearSearchMobile'),
            searchResultsInfo: null,
            
            // Control elements
            sortSelect: document.getElementById('sortSelect'),
            clearFiltersBtn: document.getElementById('clearFilters'),
            resetFiltersBtn: document.getElementById('resetFiltersBtn'),
            
            // Mobile elements
            mobileMenuBtn: document.getElementById('mobileMenuBtn'),
            mobileMenu: document.getElementById('mobileMenu'),
            
            // Create search suggestions element
            searchSuggestions: document.createElement('div')
        };
        
        // Create search suggestions dropdown
        this.elements.searchSuggestions.id = 'searchSuggestions';
        this.elements.searchSuggestions.className = 'search-suggestions hidden';
    },
    
    // Setup all event listeners
    setupEventListeners() {
        // Sort select
        if (this.elements.sortSelect) {
            this.elements.sortSelect.addEventListener('change', (e) => {
                ProductService.setSortOrder(e.target.value);
                this.renderProducts();
                this.updateUIState();
            });
        }
        
        // Clear filters button
        if (this.elements.clearFiltersBtn) {
            this.elements.clearFiltersBtn.addEventListener('click', () => {
                ProductService.clearAllFilters();
                this.clearSearchInputs();
                this.renderFilters();
                this.renderProducts();
                this.updateUIState();
            });
        }
        
        // Reset filters button in empty state
        if (this.elements.resetFiltersBtn) {
            this.elements.resetFiltersBtn.addEventListener('click', () => {
                ProductService.clearAllFilters();
                this.clearSearchInputs();
                this.renderFilters();
                this.renderProducts();
                this.updateUIState();
            });
        }
        
        // Mobile menu toggle
        if (this.elements.mobileMenuBtn && this.elements.mobileMenu) {
            this.elements.mobileMenuBtn.addEventListener('click', () => {
                this.elements.mobileMenu.classList.toggle('hidden');
            });
        }
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.elements.mobileMenu && this.elements.mobileMenuBtn) {
                if (!this.elements.mobileMenu.contains(e.target) && 
                    !this.elements.mobileMenuBtn.contains(e.target) &&
                    !this.elements.mobileMenu.classList.contains('hidden')) {
                    this.elements.mobileMenu.classList.add('hidden');
                }
            }
            
            // Close search suggestions when clicking outside
            if (!e.target.closest('.search-container') && 
                !e.target.closest('#searchSuggestions')) {
                this.hideSearchSuggestions();
            }
        });
        
        // Setup search functionality
        this.setupSearch();
    },
    
    // Setup search functionality
    setupSearch() {
        // Desktop search
        if (this.elements.searchInput) {
            const container = this.elements.searchInput.parentElement;
            container.classList.add('search-container');
            container.appendChild(this.elements.searchSuggestions);
            
            this.elements.searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
            
            this.elements.searchInput.addEventListener('focus', () => {
                if (this.elements.searchInput.value.trim() !== '') {
                    this.showSearchSuggestions(this.elements.searchInput.value);
                }
            });
        }
        
        // Mobile search
        if (this.elements.searchInputMobile) {
            const container = this.elements.searchInputMobile.parentElement;
            container.classList.add('search-container');
            
            this.elements.searchInputMobile.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
            
            this.elements.searchInputMobile.addEventListener('focus', () => {
                if (this.elements.searchInputMobile.value.trim() !== '') {
                    this.showSearchSuggestions(this.elements.searchInputMobile.value);
                }
            });
        }
        
        // Clear search buttons
        if (this.elements.clearSearch) {
            this.elements.clearSearch.addEventListener('click', () => {
                this.clearSearchInputs();
                this.handleSearchInput('');
            });
        }
        
        if (this.elements.clearSearchMobile) {
            this.elements.clearSearchMobile.addEventListener('click', () => {
                this.clearSearchInputs();
                this.handleSearchInput('');
            });
        }
    },
    
    // Handle search input with debouncing
    handleSearchInput(searchTerm) {
        // Sync both search inputs
        if (this.elements.searchInput && this.elements.searchInputMobile) {
            this.elements.searchInput.value = searchTerm;
            this.elements.searchInputMobile.value = searchTerm;
        }
        
        // Show/hide clear buttons
        if (this.elements.clearSearch) {
            this.elements.clearSearch.classList.toggle('hidden', !searchTerm.trim());
        }
        if (this.elements.clearSearchMobile) {
            this.elements.clearSearchMobile.classList.toggle('hidden', !searchTerm.trim());
        }
        
        // Clear previous debounce timer
        clearTimeout(this.searchDebounceTimer);
        
        // Show suggestions for non-empty search
        if (searchTerm.trim() !== '') {
            this.showSearchSuggestions(searchTerm);
        } else {
            this.hideSearchSuggestions();
        }
        
        // Debounce the actual search
        this.searchDebounceTimer = setTimeout(() => {
            ProductService.setSearchFilter(searchTerm);
            this.renderProducts();
            this.updateUIState();
            this.updateSearchResultsInfo();
        }, 300);
    },
    
    // Show search suggestions dropdown
    showSearchSuggestions(searchTerm) {
        const suggestions = ProductService.getSearchSuggestions(searchTerm, 5);
        
        if (suggestions.length === 0) {
            this.elements.searchSuggestions.innerHTML = `
                <div class="search-suggestion-item">
                    <div class="search-suggestion-name">No suggestions found</div>
                    <div class="search-suggestion-category">Try different keywords</div>
                </div>
            `;
        } else {
            this.elements.searchSuggestions.innerHTML = suggestions.map(suggestion => `
                <div class="search-suggestion-item" data-suggestion='${JSON.stringify(suggestion)}'>
                    <div class="search-suggestion-name">${suggestion.value}</div>
                    <div class="search-suggestion-category">${suggestion.category}</div>
                </div>
            `).join('');
            
            // Add click event to suggestions
            this.elements.searchSuggestions.querySelectorAll('.search-suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const suggestion = JSON.parse(item.getAttribute('data-suggestion'));
                    const searchValue = suggestion.value;
                    
                    // Set search input value
                    if (this.elements.searchInput) this.elements.searchInput.value = searchValue;
                    if (this.elements.searchInputMobile) this.elements.searchInputMobile.value = searchValue;
                    
                    // Show clear buttons
                    if (this.elements.clearSearch) this.elements.clearSearch.classList.remove('hidden');
                    if (this.elements.clearSearchMobile) this.elements.clearSearchMobile.classList.remove('hidden');
                    
                    // Perform search
                    this.handleSearchInput(searchValue);
                    this.hideSearchSuggestions();
                });
            });
        }
        
        this.elements.searchSuggestions.classList.remove('hidden');
    },
    
    // Hide search suggestions dropdown
    hideSearchSuggestions() {
        this.elements.searchSuggestions.classList.add('hidden');
    },
    
    // Clear search inputs
    clearSearchInputs() {
        if (this.elements.searchInput) this.elements.searchInput.value = '';
        if (this.elements.searchInputMobile) this.elements.searchInputMobile.value = '';
        if (this.elements.clearSearch) this.elements.clearSearch.classList.add('hidden');
        if (this.elements.clearSearchMobile) this.elements.clearSearchMobile.classList.add('hidden');
    },
    
    // Render filter buttons
    renderFilters() {
        try {
            const state = ProductService.state;
            
            // Clear existing filters
            if (this.elements.categoryFilters) {
                this.elements.categoryFilters.innerHTML = '';
            }
            if (this.elements.outfitFilters) {
                this.elements.outfitFilters.innerHTML = '';
            }
            
            // Render category filters
            state.categories.forEach(category => {
                const button = this.createFilterButton(
                    category, 
                    'category',
                    state.filters.category === category
                );
                if (this.elements.categoryFilters) {
                    this.elements.categoryFilters.appendChild(button);
                }
            });
            
            // Render outfit type filters
            state.outfitTypes.forEach(outfitType => {
                const button = this.createFilterButton(
                    outfitType,
                    'outfit_type',
                    state.filters.outfit_type === outfitType
                );
                if (this.elements.outfitFilters) {
                    this.elements.outfitFilters.appendChild(button);
                }
            });
            
            // Render active filters badges
            this.renderActiveFilters();
            
            console.log('[APP]: Filters rendered');
        } catch (error) {
            console.error('[APP_ERROR]: Failed to render filters:', error);
        }
    },
    
    // Create filter button element
    createFilterButton(value, type, isActive = false) {
        const button = document.createElement('button');
        button.className = `filter-btn ${isActive ? 'active' : ''}`;
        button.textContent = value;
        button.dataset.filterType = type;
        button.dataset.filterValue = value;
        
        button.addEventListener('click', () => {
            if (type === 'category') {
                ProductService.setCategoryFilter(value);
            } else if (type === 'outfit_type') {
                ProductService.setOutfitFilter(value);
            }
            
            this.renderFilters();
            this.renderProducts();
            this.updateUIState();
        });
        
        return button;
    },
    
    // Render active filters badges
    renderActiveFilters() {
        if (!this.elements.activeFilters) return;
        
        const state = ProductService.state;
        const activeFilters = [];
        
        // Category filter badge
        if (state.filters.category) {
            activeFilters.push(this.createActiveFilterBadge('category', state.filters.category));
        }
        
        // Outfit type filter badge
        if (state.filters.outfit_type) {
            activeFilters.push(this.createActiveFilterBadge('outfit_type', state.filters.outfit_type));
        }
        
        // Search filter badge
        if (state.filters.search.trim() !== '') {
            activeFilters.push(this.createActiveFilterBadge('search', state.filters.search));
        }
        
        // Update active filters container
        this.elements.activeFilters.innerHTML = '';
        activeFilters.forEach(badge => {
            this.elements.activeFilters.appendChild(badge);
        });
        
        // Show/hide container
        if (activeFilters.length > 0) {
            this.elements.activeFilters.classList.remove('hidden');
        } else {
            this.elements.activeFilters.classList.add('hidden');
        }
    },
    
    // Create active filter badge
    createActiveFilterBadge(type, value) {
        const badge = document.createElement('div');
        badge.className = 'active-filter-badge';
        
        let displayText = value;
        if (type === 'category') displayText = `Category: ${value}`;
        if (type === 'outfit_type') displayText = `Outfit: ${value}`;
        if (type === 'search') displayText = `Search: "${value}"`;
        
        badge.innerHTML = `
            <span>${displayText}</span>
            <i class="fas fa-times text-xs cursor-pointer" data-filter-type="${type}"></i>
        `;
        
        // Add remove event
        const removeBtn = badge.querySelector('i');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFilter(type);
        });
        
        return badge;
    },
    
    // Remove specific filter
    removeFilter(type) {
        if (type === 'category') {
            ProductService.setCategoryFilter(null);
        } else if (type === 'outfit_type') {
            ProductService.setOutfitFilter(null);
        } else if (type === 'search') {
            ProductService.clearSearch();
            this.clearSearchInputs();
        }
        
        this.renderFilters();
        this.renderProducts();
        this.updateUIState();
    },
    
    // Render products grid
    renderProducts() {
        try {
            const products = ProductService.state.filteredProducts;
            
            // Clear existing products
            if (this.elements.productsGrid) {
                this.elements.productsGrid.innerHTML = '';
            }
            
            // Show/hide appropriate states
            if (products.length === 0) {
                if (this.elements.loadingState) {
                    this.elements.loadingState.classList.add('hidden');
                }
                if (this.elements.productsGrid) {
                    this.elements.productsGrid.classList.add('hidden');
                }
                if (this.elements.emptyState) {
                    this.elements.emptyState.classList.remove('hidden');
                    
                    // Customize empty state message
                    const state = ProductService.state;
                    let message = 'No products found';
                    
                    if (state.filters.search.trim() !== '') {
                        message = `No results for "${state.filters.search}"`;
                    } else if (state.filters.category || state.filters.outfit_type) {
                        message = 'No products match your filters';
                    }
                    
                    this.elements.emptyState.querySelector('h3').textContent = message;
                }
                return;
            }
            
            // Hide loading and empty states, show grid
            if (this.elements.loadingState) {
                this.elements.loadingState.classList.add('hidden');
            }
            if (this.elements.emptyState) {
                this.elements.emptyState.classList.add('hidden');
            }
            if (this.elements.productsGrid) {
                this.elements.productsGrid.classList.remove('hidden');
            }
            
            // Create and append product cards
            products.forEach(product => {
                const productCard = this.createProductCard(product);
                if (this.elements.productsGrid) {
                    this.elements.productsGrid.appendChild(productCard);
                }
            });
            
            console.log(`[APP]: Rendered ${products.length} products`);
        } catch (error) {
            console.error('[APP_ERROR]: Failed to render products:', error);
            this.showError('Failed to load products');
        }
    },
    
    // Create product card element
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Format date
        const date = new Date(product.created_at);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        
        // Highlight search term in product name
        let displayName = product.name;
        const searchTerm = ProductService.state.filters.search;
        
        if (searchTerm && searchTerm.trim() !== '') {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            displayName = product.name.replace(regex, '<mark class="highlight">$1</mark>');
        }
        
        card.innerHTML = `
            <a href="${product.affiliate_link}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="affiliate-link">
            </a>
            
            <div class="product-image-container">
                <img 
                    src="${product.image_url}" 
                    alt="${product.name}" 
                    class="product-image"
                    loading="lazy"
                    onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'"
                >
                <div class="product-overlay">
                    <div class="product-tag">${formattedDate}</div>
                </div>
            </div>
            
            <div class="product-info">
                <h3 class="product-name">${displayName}</h3>
                
                <div class="product-tags">
                    <span class="product-tag category">${product.category}</span>
                    <span class="product-tag">${product.outfit_type}</span>
                </div>
            </div>
        `;
        
        return card;
    },
    
    // Update search results information
    updateSearchResultsInfo() {
        const state = ProductService.state;
        
        // Remove existing search info
        if (this.elements.searchResultsInfo) {
            this.elements.searchResultsInfo.remove();
            this.elements.searchResultsInfo = null;
        }
        
        // Only show if there's an active search
        if (state.filters.search.trim() !== '') {
            this.elements.searchResultsInfo = document.createElement('div');
            this.elements.searchResultsInfo.id = 'searchResultsInfo';
            this.elements.searchResultsInfo.className = 'search-results-info';
            
            const products = state.filteredProducts;
            const totalProducts = state.products.length;
            
            this.elements.searchResultsInfo.innerHTML = `
                <div class="search-results-count">
                    Search: <strong>"${state.filters.search}"</strong> | 
                    Found: <strong>${products.length}</strong> of ${totalProducts} products
                </div>
                <button id="clearSearchResults" class="filter-btn">
                    Clear Search
                </button>
            `;
            
            // Insert after filter section
            const filterSection = document.querySelector('section.mb-10');
            if (filterSection) {
                filterSection.insertAdjacentElement('afterend', this.elements.searchResultsInfo);
            }
            
            // Add clear search event
            document.getElementById('clearSearchResults').addEventListener('click', () => {
                ProductService.clearSearch();
                this.clearSearchInputs();
                this.renderProducts();
                this.updateUIState();
            });
        }
    },
    
    // Update UI state (show/hide elements based on state)
    updateUIState() {
        const activeFiltersCount = ProductService.getActiveFiltersCount();
        
        // Update clear filters button text
        if (this.elements.clearFiltersBtn) {
            this.elements.clearFiltersBtn.textContent = 
                activeFiltersCount > 0 ? `Clear Filters (${activeFiltersCount})` : 'Clear Filters';
            
            this.elements.clearFiltersBtn.disabled = activeFiltersCount === 0;
        }
        
        // Update search results info
        this.updateSearchResultsInfo();
        
        // Log state for debugging
        console.log('[APP]: UI state updated', ProductService.getState());
    },
    
    // Show error message
    showError(message) {
        console.error('[APP_ERROR]:', message);
        
        // Hide loading state
        if (this.elements.loadingState) {
            this.elements.loadingState.classList.add('hidden');
        }
        
        // Show error in products grid
        if (this.elements.productsGrid) {
            this.elements.productsGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-4xl mb-4">⚠️</div>
                    <h3 class="text-xl font-bold mb-2">Error Loading Products</h3>
                    <p class="text-gray-400 mb-6">${message}</p>
                    <button onclick="location.reload()" 
                            class="bg-white text-black px-6 py-3 rounded-lg font-bold uppercase text-sm hover:bg-gray-200 transition-colors">
                        Retry
                    </button>
                </div>
            `;
            this.elements.productsGrid.classList.remove('hidden');
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[APP]: DOM loaded, starting initialization...');
    App.init().catch(error => {
        console.error('[APP_ERROR]: Critical initialization error:', error);
        App.showError('Failed to initialize application. Please refresh the page.');
    });
});

// Expose App for debugging
window.App = App;