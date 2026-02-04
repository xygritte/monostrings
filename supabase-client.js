// Supabase Client Configuration
// Using your provided credentials

const SUPABASE_URL = 'https://ifrouumcsnzdmushqcvk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlmcm91dW1jc256ZG11c2hxY3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTQzMTAsImV4cCI6MjA4NTczMDMxMH0.BXzln9GUmhpRFLFrDS2n486brQBojxNkS52KwuwNmc4';

// Supabase client variable
window.supabaseClient = null;

// Initialize Supabase client
try {
    // Check if Supabase CDN is loaded
    if (typeof supabase !== 'undefined') {
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[SUPABASE_CLIENT]: Initialized successfully with Supabase CDN');
    } else {
        console.warn('[SUPABASE_CLIENT]: Supabase CDN not loaded, using fallback');
        window.supabaseClient = createMockSupabaseClient();
    }
} catch (error) {
    console.error('[SUPABASE_CLIENT_ERROR]:', error.message);
    window.supabaseClient = createMockSupabaseClient();
}

// Create mock Supabase client for fallback
function createMockSupabaseClient() {
    console.log('[SUPABASE_CLIENT]: Using mock client for demonstration');
    
    return {
        from: function(table) {
            return {
                select: function(columns = '*') {
                    return {
                        then: function(callback) {
                            setTimeout(() => {
                                const mockData = getMockData();
                                callback({ data: mockData, error: null });
                            }, 500);
                            
                            return {
                                catch: function(errorCallback) {
                                    setTimeout(() => {
                                        // 10% chance of simulated error for demo
                                        if (Math.random() < 0.1) {
                                            errorCallback(new Error('Simulated network error'));
                                        }
                                    }, 500);
                                    return { 
                                        then: function(cb) { 
                                            setTimeout(() => cb(), 500); 
                                            return this; 
                                        } 
                                    };
                                }
                            };
                        }
                    };
                }
            };
        }
    };
}

// Mock data for demo purposes
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

// Export for Node.js environment (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabaseClient: window.supabaseClient };
}