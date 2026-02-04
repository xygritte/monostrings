// Main Application Script

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const categoryFilters = document.getElementById('categoryFilters');
const outfitFilters = document.getElementById('outfitFilters');
const activeFilters = document.getElementById('activeFilters');
const clearFiltersBtn = document.getElementById('clearFilters');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const sortSelect = document.getElementById('sortSelect');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

// App State
let allProducts = [];
let categories = [];
let outfitTypes = [];

// Initialize the application
async function initApp() {
    console.log('[APP]: Initializing application...');
    
    // Set up event listeners
    setupEventListeners();
    
    // Load products and filters
    await loadProducts();
    await loadFilters();
    
    // Render initial view
    renderProducts();
    renderFilters();
}

// Set up all event listeners
function setupEventListeners() {
    // Sort select change
    sortSelect.addEventListener('change', handleSortChange);
    
    // Clear filters button
    clearFiltersBtn.addEventListener('click', handleClearFilters);
    
    // Reset filters button (in empty state)
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', handleClearFilters);
    }
    
    // Mobile menu toggle
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenu && mobileMenuBtn && 
            !mobileMenu.contains(e.target) && 
            !mobileMenuBtn.contains(e.target) &&
            mobileMenu.classList.contains('hidden') === false) {
            mobileMenu.classList.add('hidden');
        }
    });
}

// Load products from service
async function loadProducts() {
    try {
        console.log('[APP]: Loading products...');
        
        // Show loading state
        loadingState.classList.remove('hidden');
        productsGrid.classList.add('hidden');
        emptyState.classList.add('hidden');
        
        // Fetch products
        allProducts = await ProductService.getProducts();
        
        console.log(`[APP]: Loaded ${allProducts.length} products`);
        
    } catch (error) {
        console.error('[APP_ERROR]: Failed to load products:', error.message);
        showError('Failed to load products. Please try again later.');
    }
}

// Load filters (categories and outfit types)
async function loadFilters() {
    try {
        console.log('[APP]: Loading filters...');
        
        // Get unique categories and outfit types from products
        categories = ProductService.getUniqueCategories(allProducts);
        outfitTypes = ProductService.getUniqueOutfitTypes(allProducts);
        
        console.log(`[APP]: Loaded ${categories.length} categories and ${outfitTypes.length} outfit types`);
        
    } catch (error) {
        console.error('[APP_ERROR]: Failed to load filters:', error.message);
    }
}

// Render product cards
function renderProducts() {
    try {
        console.log('[APP]: Rendering products...');
        
        // Get filtered and sorted products
        const filteredProducts = ProductService.getFilteredAndSortedProducts(allProducts);
        
        // Clear current grid
        productsGrid.innerHTML = '';
        
        // Show/hide appropriate states
        if (filteredProducts.length === 0) {
            productsGrid.classList.add('hidden');
            loadingState.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        // Hide loading and empty states, show grid
        loadingState.classList.add('hidden');
        emptyState.classList.add('hidden');
        productsGrid.classList.remove('hidden');
        
        // Create product cards
        filteredProducts.forEach(product => {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
        });
        
        console.log(`[APP]: Rendered ${filteredProducts.length} product cards`);
        
    } catch (error) {
        console.error('[APP_ERROR]: Failed to render products:', error.message);
        showError('Failed to render products. Please try again.');
    }
}

// Create a single product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Format date for display
    const date = new Date(product.created_at);
    const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
    
    card.innerHTML = `
        <a href="${product.affiliate_link}" target="_blank" rel="noopener noreferrer" class="affiliate-link"></a>
        
        <div class="product-image-container">
            <img 
                src="${product.image_url}" 
                alt="${product.name}" 
                class="product-image"
                loading="lazy"
                onerror="this.src='https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'"
            >
            <div class="product-overlay">
                <div class="product-tag">${formattedDate}</div>
            </div>
        </div>
        
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            
            <div class="product-tags">
                <span class="product-tag category">${product.category}</span>
                <span class="product-tag">${product.outfit_type}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Render filter buttons
function renderFilters() {
    try {
        console.log('[APP]: Rendering filters...');
        
        // Clear current filters
        categoryFilters.innerHTML = '';
        outfitFilters.innerHTML = '';
        activeFilters.innerHTML = '';
        
        // Create category filter buttons
        categories.forEach(category => {
            const button = createFilterButton(category, 'category');
            categoryFilters.appendChild(button);
        });
        
        // Create outfit type filter buttons
        outfitTypes.forEach(outfitType => {
            const button = createFilterButton(outfitType, 'outfit_type');
            outfitFilters.appendChild(button);
        });
        
        // Render active filters
        renderActiveFilters();
        
        console.log('[APP]: Rendered filter buttons');
        
    } catch (error) {
        console.error('[APP_ERROR]: Failed to render filters:', error.message);
    }
}

// Create a filter button
function createFilterButton(value, type) {
    const button = document.createElement('button');
    button.className = 'filter-btn';
    button.textContent = value;
    button.dataset.filterType = type;
    button.dataset.filterValue = value;
    
    // Check if this filter is active
    const isActive = type === 'category' 
        ? ProductService.currentFilters.category === value
        : ProductService.currentFilters.outfit_type === value;
    
    if (isActive) {
        button.classList.add('active');
    }
    
    // Add click event
    button.addEventListener('click', () => handleFilterClick(type, value));
    
    return button;
}

// Render active filters as badges
function renderActiveFilters() {
    // Clear current badges
    activeFilters.innerHTML = '';
    
    const { category, outfit_type } = ProductService.currentFilters;
    let hasActiveFilters = false;
    
    // Category filter badge
    if (category) {
        hasActiveFilters = true;
        const badge = createActiveFilterBadge('category', category);
        activeFilters.appendChild(badge);
    }
    
    // Outfit type filter badge
    if (outfit_type) {
        hasActiveFilters = true;
        const badge = createActiveFilterBadge('outfit_type', outfit_type);
        activeFilters.appendChild(badge);
    }
    
    // Show/hide active filters container
    if (hasActiveFilters) {
        activeFilters.classList.remove('hidden');
    } else {
        activeFilters.classList.add('hidden');
    }
}

// Create an active filter badge
function createActiveFilterBadge(type, value) {
    const badge = document.createElement('div');
    badge.className = 'active-filter-badge';
    badge.innerHTML = `
        <span>${type}: ${value}</span>
        <i class="fas fa-times text-xs cursor-pointer" data-filter-type="${type}"></i>
    `;
    
    // Add click event to remove button
    const removeBtn = badge.querySelector('i');
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleRemoveFilter(type);
    });
    
    return badge;
}

// Handle filter button click
function handleFilterClick(filterType, filterValue) {
    console.log(`[APP]: Filter clicked - ${filterType}: ${filterValue}`);
    
    // Update filter state
    const currentValue = ProductService.currentFilters[filterType];
    
    // Toggle filter: if same value is clicked again, remove filter
    const newValue = currentValue === filterValue ? null : filterValue;
    
    // Update service filters
    ProductService.updateFilters({ [filterType]: newValue });
    
    // Re-render filters and products
    renderFilters();
    renderProducts();
}

// Handle remove filter from active filters
function handleRemoveFilter(filterType) {
    console.log(`[APP]: Removing filter - ${filterType}`);
    
    // Update service filters
    ProductService.updateFilters({ [filterType]: null });
    
    // Re-render filters and products
    renderFilters();
    renderProducts();
}

// Handle clear all filters
function handleClearFilters() {
    console.log('[APP]: Clearing all filters');
    
    // Update service filters
    ProductService.clearFilters();
    
    // Reset sort to default
    sortSelect.value = 'newest';
    ProductService.updateSort('newest');
    
    // Re-render filters and products
    renderFilters();
    renderProducts();
}

// Handle sort change
function handleSortChange(e) {
    const sortValue = e.target.value;
    console.log(`[APP]: Sort changed to ${sortValue}`);
    
    // Update service sort
    ProductService.updateSort(sortValue);
    
    // Re-render products
    renderProducts();
}

// Toggle mobile menu
function toggleMobileMenu() {
    mobileMenu.classList.toggle('hidden');
}

// Show error message
function showError(message) {
    console.error('[APP_ERROR]:', message);
    
    // Hide loading state
    loadingState.classList.add('hidden');
    
    // Show error in products grid
    productsGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
            <div class="text-4xl mb-4">⚠️</div>
            <h3 class="text-xl font-bold mb-2">Error Loading Products</h3>
            <p class="text-gray-400">${message}</p>
            <button onclick="location.reload()" class="mt-4 bg-white text-black px-6 py-2 rounded font-bold">
                Retry
            </button>
        </div>
    `;
    productsGrid.classList.remove('hidden');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Add some demo data generation for testing
function generateDemoData(count = 20) {
    const demoCategories = ['baju', 'celana', 'topi', 'sepatu', 'aksesoris'];
    const demoOutfitTypes = ['streetwear', 'casual', 'sporty', 'vintage', 'minimalist'];
    
    const demoProducts = [];
    
    for (let i = 1; i <= count; i++) {
        const category = demoCategories[Math.floor(Math.random() * demoCategories.length)];
        const outfitType = demoOutfitTypes[Math.floor(Math.random() * demoOutfitTypes.length)];
        
        demoProducts.push({
            id: `demo-${i}`,
            name: `Demo Product ${i} - ${category} ${outfitType}`,
            image_url: `https://images.unsplash.com/photo-155${1000 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80`,
            affiliate_link: `https://example.com/demo${i}`,
            category: category,
            outfit_type: outfitType,
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    
    return demoProducts;
}

