console.log('app.js loading...');

// API Base URL
const API_BASE = window.location.origin;

// State
let token = localStorage.getItem('token') || null;
let allProducts = [];
let allCategories = [];
let currentEditId = null;

// Chat state
let engagementId = null;
let username = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const productsBody = document.getElementById('productsBody');
const totalProducts = document.getElementById('totalProducts');
const totalCategories = document.getElementById('totalCategories');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const brandFilter = document.getElementById('brandFilter');
const minPriceInput = document.getElementById('minPrice');
const maxPriceInput = document.getElementById('maxPrice');
const addProductBtn = document.getElementById('addProductBtn');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const modalTitle = document.getElementById('modalTitle');
const modalError = document.getElementById('modalError');
const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');

// Chat DOM Elements
const chatPanel = document.getElementById('chatPanel');
const mainContent = document.querySelector('.main-content');
const openChatBtn = document.getElementById('openChatBtn');
const closeChatBtn = document.getElementById('closeChatBtn');
const jujiChatIframe = document.getElementById('jujiChatIframe');

console.log('Chat DOM elements:', {
    chatPanel,
    mainContent,
    openChatBtn,
    closeChatBtn,
    jujiChatIframe
});

// Initialize
if (token) {
    showApp();
} else {
    showLogin();
}

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
searchBtn.addEventListener('click', applyFilters);
clearSearchBtn.addEventListener('click', handleClearSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') applyFilters();
});
categoryFilter.addEventListener('change', applyFilters);
brandFilter.addEventListener('change', applyFilters);
minPriceInput.addEventListener('input', applyFilters);
maxPriceInput.addEventListener('input', applyFilters);
addProductBtn.addEventListener('click', () => openProductModal());
closeModal.addEventListener('click', closeProductModal);
cancelBtn.addEventListener('click', closeProductModal);
productForm.addEventListener('submit', handleProductSubmit);

// Chat Event Listeners
openChatBtn.addEventListener('click', toggleChatPanel);
closeChatBtn.addEventListener('click', toggleChatPanel);

// API Functions
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token && endpoint !== '/api/login') {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                handleLogout();
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(data.error || 'An error occurred');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// Login/Logout
async function handleLogin(e) {
    e.preventDefault();
    loginError.textContent = '';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const data = await apiCall('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        token = data.token;
        localStorage.setItem('token', token);
        userInfo.textContent = `Welcome, ${username}`;
        showApp();
    } catch (error) {
        loginError.textContent = error.message;
    }
}

function handleLogout() {
    // Clear chat iframe
    if (jujiChatIframe) {
        jujiChatIframe.setAttribute('src', '');
    }

    // Clear chat session
    engagementId = null;
    username = null;

    // Clear authentication
    token = null;
    localStorage.removeItem('token');
    showLogin();
}

function showLogin() {
    loginScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
    loginForm.reset();
    loginError.textContent = '';
}

function showApp() {
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    loadProducts();
    loadCategories();
}

// Load Data
async function loadProducts() {
    try {
        showLoading(true);
        hideError();
        const data = await apiCall('/api/items');
        allProducts = data.data;
        displayProducts(allProducts);
        updateStats();
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

async function loadCategories() {
    try {
        const data = await apiCall('/api/categories');
        allCategories = data.data;
        populateCategoryDropdowns();
        populateBrandDropdown();
        totalCategories.textContent = allCategories.length;
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Display Functions
function displayProducts(products) {
    if (products.length === 0) {
        productsBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #999;">No products found</td></tr>';
        return;
    }

    productsBody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.SKU}</td>
            <td>${product.BRAND || '-'}</td>
            <td>${product.ITEM}</td>
            <td>${product.CATEGORY}</td>
            <td>${product.PACK || '-'}</td>
            <td>${product.SIZE || '-'}</td>
            <td>$${product.PRICE}</td>
            <td>
                <button class="btn btn-edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateStats() {
    totalProducts.textContent = allProducts.length;
}

function populateCategoryDropdowns() {
    const options = allCategories.map(cat =>
        `<option value="${cat}">${cat}</option>`
    ).join('');

    categoryFilter.innerHTML = '<option value="">All Categories</option>' + options;
    document.getElementById('category').innerHTML = '<option value="">Select a category</option>' + options;
}

function populateBrandDropdown() {
    const brands = [...new Set(allProducts.map(p => p.BRAND).filter(b => b))].sort();
    const options = brands.map(brand =>
        `<option value="${brand}">${brand}</option>`
    ).join('');

    brandFilter.innerHTML = '<option value="">All Brands</option>' + options;
}

// Search and Filter - Combined Client-Side Filtering
function applyFilters() {
    const searchQuery = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedBrand = brandFilter.value;
    const minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
    const maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;

    let filtered = allProducts;

    // Filter by search query (search in ITEM field only)
    if (searchQuery) {
        filtered = filtered.filter(product =>
            product.ITEM.toLowerCase().includes(searchQuery)
        );
    }

    // Filter by category
    if (selectedCategory) {
        filtered = filtered.filter(product =>
            product.CATEGORY === selectedCategory
        );
    }

    // Filter by brand
    if (selectedBrand) {
        filtered = filtered.filter(product =>
            product.BRAND === selectedBrand
        );
    }

    // Filter by price range
    if (minPrice !== null) {
        filtered = filtered.filter(product =>
            parseFloat(product.PRICE) >= minPrice
        );
    }

    if (maxPrice !== null) {
        filtered = filtered.filter(product =>
            parseFloat(product.PRICE) <= maxPrice
        );
    }

    displayProducts(filtered);
}

function handleClearSearch() {
    searchInput.value = '';
    categoryFilter.value = '';
    brandFilter.value = '';
    minPriceInput.value = '';
    maxPriceInput.value = '';
    displayProducts(allProducts);
}

// Product Modal
function openProductModal(product = null) {
    currentEditId = product ? product.id : null;
    modalTitle.textContent = product ? 'Edit Product' : 'Add Product';
    modalError.textContent = '';

    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('sku').value = product.SKU;
        document.getElementById('brand').value = product.BRAND || '';
        document.getElementById('item').value = product.ITEM;
        document.getElementById('category').value = product.CATEGORY;
        document.getElementById('pack').value = product.PACK || '';
        document.getElementById('size').value = product.SIZE || '';
        document.getElementById('price').value = product.PRICE;
    } else {
        productForm.reset();
    }

    productModal.classList.remove('hidden');
}

function closeProductModal() {
    productModal.classList.add('hidden');
    productForm.reset();
    currentEditId = null;
}

async function handleProductSubmit(e) {
    e.preventDefault();
    modalError.textContent = '';

    const productData = {
        SKU: document.getElementById('sku').value,
        BRAND: document.getElementById('brand').value,
        ITEM: document.getElementById('item').value,
        CATEGORY: document.getElementById('category').value,
        PACK: document.getElementById('pack').value,
        SIZE: document.getElementById('size').value,
        PRICE: document.getElementById('price').value
    };

    try {
        if (currentEditId !== null) {
            await apiCall(`/api/items/${currentEditId}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
        } else {
            await apiCall('/api/items', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
        }

        closeProductModal();
        loadProducts();
    } catch (error) {
        modalError.textContent = error.message;
    }
}

// Edit Product
async function editProduct(id) {
    try {
        const data = await apiCall(`/api/items/${id}`);
        openProductModal(data.data);
    } catch (error) {
        showError(error.message);
    }
}

// Delete Product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        await apiCall(`/api/items/${id}`, {
            method: 'DELETE'
        });
        loadProducts();
    } catch (error) {
        showError(error.message);
    }
}

// UI Helpers
function showLoading(show) {
    if (show) {
        loadingMessage.classList.remove('hidden');
    } else {
        loadingMessage.classList.add('hidden');
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

function hideError() {
    errorMessage.classList.add('hidden');
}

// ============================================================
// CHAT FUNCTIONS
// ============================================================

// Toggle chat panel (open/close)
async function toggleChatPanel() {
    console.log('toggleChatPanel called');
    console.log('chatPanel:', chatPanel);
    console.log('jujiChatIframe:', jujiChatIframe);

    const isOpen = chatPanel.classList.contains('open');

    if (isOpen) {
        // Close panel
        chatPanel.classList.remove('open');
        mainContent.classList.remove('chat-open');
        console.log('Chat panel closed');
    } else {
        // Open panel
        chatPanel.classList.remove('hidden');
        chatPanel.classList.add('open');
        mainContent.classList.add('chat-open');
        console.log('Chat panel opened');

        // Load Juji chatbot iframe if not already loaded
        const currentSrc = jujiChatIframe.getAttribute('src');
        console.log('iframe src attribute:', currentSrc);
        console.log('iframe src property:', jujiChatIframe.src);

        if (!currentSrc || currentSrc === '') {
            console.log('Loading Juji chatbot...');
            await loadJujiChatbot();
        } else {
            console.log('Chatbot already loaded');
        }
    }
}

// Load Juji chatbot iframe
async function loadJujiChatbot() {
    console.log('loadJujiChatbot function called');
    try {
        console.log('Calling /api/chatbot/start-session...');
        const response = await apiCall('/api/chatbot/start-session', {
            method: 'POST'
        });

        console.log('Response received:', response);

        if (response.success) {
            engagementId = response.engagementId;
            username = response.username;

            console.log('Loading Juji chatbot:', { engagementId, username });

            // Use chat URL from backend (configured via .env)
            const chatUrl = response.chatUrl;
            jujiChatIframe.setAttribute('src', chatUrl);

            console.log('Juji chatbot loaded:', chatUrl);
            console.log('iframe now has src:', jujiChatIframe.getAttribute('src'));
        } else {
            throw new Error(response.error || 'Failed to get chat URL');
        }
    } catch (error) {
        console.error('Chatbot load error:', error);
        alert('Sorry, could not load the chatbot. Please try again later.');
    }
}

// Search products (for chatbot integration)
async function searchProducts(query) {
    try {
        const response = await apiCall('/api/chatbot/search-products', {
            method: 'POST',
            body: JSON.stringify({ query })
        });

        if (response.success) {
            appendMessage(response.message, 'bot');
        } else {
            appendMessage('Sorry, I had trouble searching for products.', 'bot');
        }
    } catch (error) {
        console.error('Product search error:', error);
        appendMessage('Sorry, I encountered an error while searching.', 'bot');
    }
}

// ============================================================
// END CHAT FUNCTIONS
// ============================================================
