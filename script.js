class RecipeCostCalculator {
    constructor() {
        this.ingredients = this.loadFromStorage('ingredients') || [];
        this.decorations = this.loadFromStorage('decorations') || [];
        this.packaging = this.loadFromStorage('packaging') || this.getDefaultPackaging();
        this.init();
    }

    loadFromStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Unable to load ${key}:`, error);
            return null;
        }
    }

    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Unable to save ${key}:`, error);
        }
    }

    getDefaultPackaging() {
        return {
            boxes: [
                { name: '6-inch box', price: 0 },
                { name: '8-inch box', price: 0 },
                { name: '10-inch box', price: 0 },
                { name: '12-inch box', price: 0 }
            ],
            boards: [
                { name: '8-inch cake board', price: 0 },
                { name: '10-inch cake board', price: 0 },
                { name: '12-inch cake board', price: 0 },
                { name: 'Cake drum', price: 0 }
            ],
            other: [
                { name: 'Ribbon', price: 0 },
                { name: 'Dowels', price: 0 }
            ]
        };
    }

    init() {
        this.bindSidebarNavigation();
        this.bindActionButtons();
        this.bindForms();
        this.renderIngredients();
        this.renderDecorations();
        this.switchTab('ingredients', document.querySelector('.nav-button[data-tab="ingredients"]'));
    }

    bindSidebarNavigation() {
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                console.log('Sidebar click:', button.dataset.tab);
                this.switchTab(button.dataset.tab, button);
            });
        });
    }

    bindActionButtons() {
        const exportBtn = document.getElementById('exportBtn');
        const importBtn = document.getElementById('importBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (exportBtn) exportBtn.addEventListener('click', () => alert('Export is not available yet.'));
        if (importBtn) importBtn.addEventListener('click', () => alert('Import is not available yet.'));
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset all saved data?')) {
                    localStorage.clear();
                    this.ingredients = [];
                    this.decorations = [];
                    this.packaging = this.getDefaultPackaging();
                    this.renderIngredients();
                    this.renderDecorations();
                    alert('Data reset successfully.');
                }
            });
        }
    }

    bindForms() {
        const ingredientForm = document.getElementById('ingredientForm');
        if (ingredientForm) {
            ingredientForm.addEventListener('submit', (event) => this.addIngredient(event));
        }

        const decorationForm = document.getElementById('decorationForm');
        if (decorationForm) {
            decorationForm.addEventListener('submit', (event) => this.addDecoration(event));
        }

        const packagingForm = document.getElementById('packagingForm');
        if (packagingForm) {
            packagingForm.addEventListener('submit', (event) => this.addPackaging(event));
        }
    }

    switchTab(tabName, button) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.toggle('active', tab.id === tabName);
        });

        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.toggle('active', btn === button || btn.dataset.tab === tabName);
        });

        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const label = button ? button.textContent.trim().replace(/\s+/g, ' ') : tabName;
            pageTitle.textContent = label;
        }
    }

    addIngredient(event) {
        event.preventDefault();

        const nameInput = document.getElementById('ingredientName');
        const categoryInput = document.getElementById('ingredientCategory');
        const unitInput = document.getElementById('ingredientUnit');
        const costInput = document.getElementById('ingredientCost');

        if (!nameInput || !categoryInput || !unitInput || !costInput) {
            return;
        }

        const name = nameInput.value.trim();
        const category = categoryInput.value.trim();
        const unit = unitInput.value.trim();
        const cost = parseFloat(costInput.value);

        if (!name || !category || !unit || Number.isNaN(cost) || cost < 0) {
            alert('Please fill in all ingredient fields correctly.');
            return;
        }

        const ingredient = {
            id: Date.now(),
            name,
            category,
            unit,
            costPerUnit: cost,
            purchasePrice: cost,
            purchaseQuantity: 1,
            purchaseUnit: unit
        };

        this.ingredients.push(ingredient);
        this.saveToStorage('ingredients', this.ingredients);
        this.renderIngredients();
        event.target.reset();
        alert('Ingredient added successfully.');
    }

    renderIngredients() {
        const tableBody = document.querySelector('#ingredientTable tbody');
        if (!tableBody) return;

        if (this.ingredients.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">No ingredients saved yet.</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.ingredients.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.unit}</td>
                <td>GH₵ ${Number(item.costPerUnit || item.purchasePrice || 0).toFixed(2)}</td>
                <td>
                    <button type="button" class="btn btn-danger" data-delete-ingredient="${item.id}">Delete</button>
                </td>
            </tr>
        `).join('');

        tableBody.querySelectorAll('[data-delete-ingredient]').forEach(button => {
            button.addEventListener('click', () => this.deleteIngredient(Number(button.dataset.deleteIngredient)));
        });
    }

    deleteIngredient(id) {
        this.ingredients = this.ingredients.filter(item => item.id !== id);
        this.saveToStorage('ingredients', this.ingredients);
        this.renderIngredients();
    }

    addDecoration(event) {
        event.preventDefault();

        const nameInput = document.getElementById('decorationName');
        const categoryInput = document.getElementById('decorationCategory');
        const costInput = document.getElementById('decorationCost');

        if (!nameInput || !categoryInput || !costInput) return;

        const name = nameInput.value.trim();
        const category = categoryInput.value.trim();
        const cost = parseFloat(costInput.value);

        if (!name || !category || Number.isNaN(cost) || cost < 0) {
            alert('Please fill in all decoration fields correctly.');
            return;
        }

        const decoration = {
            id: Date.now(),
            name,
            category,
            price: cost
        };

        this.decorations.push(decoration);
        this.saveToStorage('decorations', this.decorations);
        this.renderDecorations();
        event.target.reset();
        alert('Decoration added successfully.');
    }

    renderDecorations() {
        const tableBody = document.querySelector('#decorationTable tbody');
        if (!tableBody) return;

        if (this.decorations.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">No decorations saved yet.</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.decorations.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>GH₵ ${Number(item.price || 0).toFixed(2)}</td>
                <td>
                    <button type="button" class="btn btn-danger" data-delete-decoration="${item.id}">Delete</button>
                </td>
            </tr>
        `).join('');

        tableBody.querySelectorAll('[data-delete-decoration]').forEach(button => {
            button.addEventListener('click', () => this.deleteDecoration(Number(button.dataset.deleteDecoration)));
        });
    }

    deleteDecoration(id) {
        this.decorations = this.decorations.filter(item => item.id !== id);
        this.saveToStorage('decorations', this.decorations);
        this.renderDecorations();
    }

    addPackaging(event) {
        event.preventDefault();
        const nameInput = document.getElementById('packagingName');
        const categoryInput = document.getElementById('packagingCategory');
        const costInput = document.getElementById('packagingCost');

        if (!nameInput || !categoryInput || !costInput) return;

        const name = nameInput.value.trim();
        const category = categoryInput.value.trim();
        const cost = parseFloat(costInput.value);

        if (!name || !category || Number.isNaN(cost) || cost < 0) {
            alert('Please fill in all packaging fields correctly.');
            return;
        }

        const packagingItem = { name, category, costPerUnit: cost, price: cost };
        this.packaging[category] = this.packaging[category] || [];
        this.packaging[category].push(packagingItem);
        this.saveToStorage('packaging', this.packaging);
        event.target.reset();
        alert('Packaging item added successfully.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RecipeCostCalculator();
});
