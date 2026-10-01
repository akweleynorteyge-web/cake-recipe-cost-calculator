const STORAGE_KEYS = {
    ingredients: 'cakeCalculator.ingredients',
    recipes: 'cakeCalculator.recipes',
    orders: 'cakeCalculator.orders',
    packaging: 'cakeCalculator.packaging',
    decorations: 'cakeCalculator.decorations'
};

class CakeCalculatorApp {
    constructor() {
        this.ingredients = this.loadFromStorage(STORAGE_KEYS.ingredients, []);
        this.recipes = this.loadFromStorage(STORAGE_KEYS.recipes, []);
        this.orders = this.loadFromStorage(STORAGE_KEYS.orders, []);
        this.packaging = this.loadFromStorage(STORAGE_KEYS.packaging, []);
        this.decorations = this.loadFromStorage(STORAGE_KEYS.decorations, []);
        this.init();
    }

    loadFromStorage(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            console.error('Local storage read failed:', error);
            return fallback;
        }
    }

    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Local storage write failed:', error);
            alert('Storage is full or unavailable.');
        }
    }

    init() {
        this.bindNavigation();
        this.bindForms();
        this.renderIngredients();
        this.renderRecipes();
        this.renderOrders();
        this.renderPackaging();
        this.renderDecorations();
        this.updateSummary();
        this.addRecipeIngredientRow();
        this.addOrderRecipeRow();
        this.switchTab('ingredients', document.querySelector('.nav-button[data-tab="ingredients"]'));
    }

    bindNavigation() {
        document.querySelectorAll('.nav-button').forEach((button) => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab, button);
            });
        });
    }

    switchTab(tabName, button) {
        if (!tabName) return;

        document.querySelectorAll('.tab-content').forEach((tab) => {
            tab.classList.toggle('active', tab.id === tabName);
        });

        document.querySelectorAll('.nav-button').forEach((navButton) => {
            navButton.classList.toggle('active', navButton === button || navButton.dataset.tab === tabName);
        });

        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const labelButton = document.querySelector(`.nav-button[data-tab="${tabName}"]`);
            pageTitle.textContent = labelButton ? labelButton.textContent.trim().replace(/\s+/g, ' ') : tabName;
        }
    }

    bindForms() {
        const ingredientForm = document.getElementById('ingredientForm');
        if (ingredientForm) {
            ingredientForm.addEventListener('submit', (event) => this.handleAddIngredient(event));
        }

        const recipeForm = document.getElementById('recipeForm');
        if (recipeForm) {
            recipeForm.addEventListener('submit', (event) => this.handleSaveRecipe(event));
        }

        const addRecipeRowBtn = document.getElementById('addIngrToRecipeBtn');
        if (addRecipeRowBtn) {
            addRecipeRowBtn.addEventListener('click', () => this.addRecipeIngredientRow());
        }

        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (event) => this.handleSaveOrder(event));
        }

        const addOrderRecipeBtn = document.getElementById('addRecipeToOrderBtn');
        if (addOrderRecipeBtn) {
            addOrderRecipeBtn.addEventListener('click', () => this.addOrderRecipeRow());
        }

        const packagingForm = document.getElementById('packagingForm');
        if (packagingForm) {
            packagingForm.addEventListener('submit', (event) => this.handleAddPackaging(event));
        }

        const decorationForm = document.getElementById('decorationForm');
        if (decorationForm) {
            decorationForm.addEventListener('submit', (event) => this.handleAddDecoration(event));
        }

        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.handleResetAll());
        }
    }

    handleResetAll() {
        if (!confirm('Reset all saved calculator data?')) return;

        this.ingredients = [];
        this.recipes = [];
        this.orders = [];
        this.packaging = [];
        this.decorations = [];

        Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
            this.saveToStorage(storageKey, Array.isArray(this[key]) ? this[key] : []);
        });

        this.renderIngredients();
        this.renderRecipes();
        this.renderOrders();
        this.renderPackaging();
        this.renderDecorations();
        this.updateSummary();
        document.getElementById('recipeForm')?.reset();
        document.getElementById('orderForm')?.reset();
        document.getElementById('ingredientForm')?.reset();
        document.getElementById('packagingForm')?.reset();
        document.getElementById('decorationForm')?.reset();
        alert('All data reset.');
    }

    handleAddIngredient(event) {
        event.preventDefault();

        const name = document.getElementById('ingredientName')?.value.trim();
        const category = document.getElementById('ingredientCategory')?.value;
        const unit = document.getElementById('ingredientUnit')?.value;
        const cost = parseFloat(document.getElementById('ingredientCost')?.value || '0');

        if (!name || !category || !unit || Number.isNaN(cost) || cost < 0) {
            alert('Please fill in all ingredient fields correctly.');
            return;
        }

        this.ingredients.push({
            id: Date.now(),
            name,
            category,
            unit,
            costPerUnit: cost
        });

        this.saveToStorage(STORAGE_KEYS.ingredients, this.ingredients);
        this.renderIngredients();
        this.updateSummary();

        event.target.reset();
        alert('Ingredient added successfully.');
    }

    deleteIngredient(id) {
        this.ingredients = this.ingredients.filter((ingredient) => ingredient.id !== id);
        this.saveToStorage(STORAGE_KEYS.ingredients, this.ingredients);
        this.renderIngredients();
        this.updateSummary();
    }

    renderIngredients() {
        const tableBody = document.querySelector('#ingredientTable tbody');
        if (!tableBody) return;

        if (this.ingredients.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No ingredients yet.</td></tr>';
        } else {
            tableBody.innerHTML = this.ingredients.map((ingredient) => `
                <tr>
                    <td>${ingredient.name}</td>
                    <td>${ingredient.category}</td>
                    <td>${ingredient.unit}</td>
                    <td>GH₵ ${Number(ingredient.costPerUnit || 0).toFixed(2)}</td>
                    <td>
                        <button type="button" class="btn btn-danger" data-delete-ingredient="${ingredient.id}">Delete</button>
                    </td>
                </tr>
            `).join('');
        }

        document.querySelectorAll('[data-delete-ingredient]').forEach((button) => {
            button.addEventListener('click', () => this.deleteIngredient(Number(button.dataset.deleteIngredient)));
        });

        const savedIngredientsContainer = document.getElementById('savedIngredientsContainer');
        if (savedIngredientsContainer) {
            if (this.ingredients.length === 0) {
                savedIngredientsContainer.innerHTML = '<p class="empty-message">No saved ingredients yet.</p>';
                return;
            }

            savedIngredientsContainer.innerHTML = this.ingredients.map((ingredient) => `
                <div class="item">
                    <div class="item-name">${ingredient.name}</div>
                    <div class="item-details">
                        <strong>Category:</strong> ${ingredient.category}<br>
                        <strong>Unit:</strong> ${ingredient.unit}<br>
                        <strong>Cost:</strong> GH₵ ${Number(ingredient.costPerUnit || 0).toFixed(2)}
                    </div>
                </div>
            `).join('');
        }
    }

    addRecipeIngredientRow() {
        const container = document.getElementById('recipeIngredientsContainer');
        if (!container) return;

        if (this.ingredients.length === 0) {
            container.innerHTML = '<p class="empty-message">Add ingredients first before building a recipe.</p>';
            return;
        }

        const row = document.createElement('div');
        row.className = 'recipe-entry';
        row.style.marginBottom = '12px';
        row.innerHTML = `
            <div style="display:grid; grid-template-columns: 2fr 1fr auto; gap:10px; align-items:end;">
                <div>
                    <label>Ingredient</label>
                    <select class="recipe-select" required>
                        <option value="">Select ingredient</option>
                        ${this.ingredients.map((ingredient) => `
                            <option value="${ingredient.id}">${ingredient.name} (${ingredient.unit})</option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <label>Quantity</label>
                    <input type="number" class="recipe-qty" min="0.01" step="0.01" value="1" required>
                </div>
                <button type="button" class="btn btn-danger remove-recipe-row">Remove</button>
            </div>
        `;

        row.querySelector('.remove-recipe-row').addEventListener('click', () => {
            row.remove();
        });

        container.appendChild(row);
    }

    getRecipeEntriesFromForm() {
        const rows = [...document.querySelectorAll('.recipe-entry')];
        return rows.map((row) => {
            const select = row.querySelector('.recipe-select');
            const qtyInput = row.querySelector('.recipe-qty');
            if (!select || !qtyInput) return null;

            const ingredientId = Number(select.value);
            const quantity = Number(qtyInput.value);
            if (!ingredientId || !quantity || quantity <= 0) return null;

            const ingredient = this.ingredients.find((item) => item.id === ingredientId);
            if (!ingredient) return null;

            return {
                ingredientId,
                ingredientName: ingredient.name,
                unit: ingredient.unit,
                quantity,
                cost: Number((ingredient.costPerUnit * quantity).toFixed(2))
            };
        }).filter(Boolean);
    }

    handleSaveRecipe(event) {
        event.preventDefault();

        const name = document.getElementById('recipeName')?.value.trim();
        const description = document.getElementById('recipeDescription')?.value.trim();
        const yieldText = document.getElementById('recipeYield')?.value.trim();
        const entries = this.getRecipeEntriesFromForm();

        if (!name || !yieldText || entries.length === 0) {
            alert('Please provide recipe name, yield and at least one ingredient.');
            return;
        }

        const recipe = {
            id: Date.now(),
            name,
            description,
            yieldText,
            ingredients: entries,
            totalCost: Number(entries.reduce((sum, item) => sum + item.cost, 0).toFixed(2))
        };

        this.recipes.push(recipe);
        this.saveToStorage(STORAGE_KEYS.recipes, this.recipes);
        this.renderRecipes();
        this.updateSummary();

        event.target.reset();
        const container = document.getElementById('recipeIngredientsContainer');
        if (container) {
            container.innerHTML = '';
            this.addRecipeIngredientRow();
        }
        alert('Recipe saved successfully.');
    }

    deleteRecipe(id) {
        this.recipes = this.recipes.filter((recipe) => recipe.id !== id);
        this.saveToStorage(STORAGE_KEYS.recipes, this.recipes);
        this.renderRecipes();
        this.updateSummary();
    }

    renderRecipes() {
        const tableBody = document.querySelector('#recipeTable tbody');
        if (tableBody) {
            if (this.recipes.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5">No recipes yet.</td></tr>';
            } else {
                tableBody.innerHTML = this.recipes.map((recipe) => `
                    <tr>
                        <td>${recipe.name}</td>
                        <td>${recipe.yieldText}</td>
                        <td>GH₵ ${Number(recipe.totalCost || 0).toFixed(2)}</td>
                        <td>GH₵ ${Number(recipe.totalCost / Math.max(Number(recipe.yieldText) || 1, 1)).toFixed(2)}</td>
                        <td>
                            <button type="button" class="btn btn-danger" data-delete-recipe="${recipe.id}">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        }

        document.querySelectorAll('[data-delete-recipe]').forEach((button) => {
            button.addEventListener('click', () => this.deleteRecipe(Number(button.dataset.deleteRecipe)));
        });

        const container = document.getElementById('savedRecipesContainer');
        if (container) {
            if (this.recipes.length === 0) {
                container.innerHTML = '<p class="empty-message">No saved recipes yet.</p>';
                return;
            }

            container.innerHTML = this.recipes.map((recipe) => `
                <div class="item">
                    <div class="item-name">${recipe.name}</div>
                    <div class="item-details">
                        <strong>Yield:</strong> ${recipe.yieldText}<br>
                        <strong>Ingredients:</strong> ${recipe.ingredients.length}<br>
                        <strong>Total Cost:</strong> GH₵ ${Number(recipe.totalCost || 0).toFixed(2)}
                    </div>
                </div>
            `).join('');
        }
    }

    addOrderRecipeRow() {
        const container = document.getElementById('orderRecipesContainer');
        if (!container) return;

        if (this.recipes.length === 0) {
            container.innerHTML = '<p class="empty-message">Save a recipe before adding it to an order.</p>';
            return;
        }

        const row = document.createElement('div');
        row.className = 'order-entry';
        row.style.marginBottom = '12px';
        row.innerHTML = `
            <div style="display:grid; grid-template-columns: 2fr auto; gap:10px; align-items:end;">
                <div>
                    <label>Recipe</label>
                    <select class="order-select" required>
                        <option value="">Select recipe</option>
                        ${this.recipes.map((recipe) => `
                            <option value="${recipe.id}">${recipe.name} (GH₵ ${Number(recipe.totalCost || 0).toFixed(2)})</option>
                        `).join('')}
                    </select>
                </div>
                <button type="button" class="btn btn-danger remove-order-row">Remove</button>
            </div>
        `;

        row.querySelector('.remove-order-row').addEventListener('click', () => {
            row.remove();
        });

        container.appendChild(row);
    }

    getOrderEntriesFromForm() {
        return [...document.querySelectorAll('.order-entry')].map((row) => {
            const select = row.querySelector('.order-select');
            if (!select || !select.value) return null;
            const recipeId = Number(select.value);
            const recipe = this.recipes.find((item) => item.id === recipeId);
            if (!recipe) return null;
            return recipe;
        }).filter(Boolean);
    }

    handleSaveOrder(event) {
        event.preventDefault();

        const orderName = document.getElementById('orderName')?.value.trim();
        const orderDate = document.getElementById('orderDate')?.value;
        const orderClient = document.getElementById('orderClient')?.value.trim();
        const entries = this.getOrderEntriesFromForm();
        const discount = parseFloat(document.getElementById('orderDiscount')?.value || '0');
        const discountType = document.getElementById('discountType')?.value || 'amount';
        const tax = parseFloat(document.getElementById('orderTax')?.value || '0');

        if (!orderName || entries.length === 0) {
            alert('Please provide an order name and at least one recipe.');
            return;
        }

        const subtotal = entries.reduce((sum, recipe) => sum + Number(recipe.totalCost || 0), 0);
        const discountAmount = discountType === 'percent' ? subtotal * (discount / 100) : discount;
        const taxableAmount = Math.max(subtotal - discountAmount, 0);
        const total = taxableAmount + taxableAmount * (tax / 100);

        const order = {
            id: Date.now(),
            name: orderName,
            date: orderDate || 'N/A',
            client: orderClient || 'N/A',
            recipes: entries.map((recipe) => ({
                id: recipe.id,
                name: recipe.name,
                totalCost: Number(recipe.totalCost || 0)
            })),
            subtotal,
            discountAmount,
            tax,
            totalCost: Number(total.toFixed(2))
        };

        this.orders.push(order);
        this.saveToStorage(STORAGE_KEYS.orders, this.orders);
        this.renderOrders();

        event.target.reset();
        const container = document.getElementById('orderRecipesContainer');
        if (container) {
            container.innerHTML = '';
            this.addOrderRecipeRow();
        }
        alert('Order saved successfully.');
    }

    deleteOrder(id) {
        this.orders = this.orders.filter((order) => order.id !== id);
        this.saveToStorage(STORAGE_KEYS.orders, this.orders);
        this.renderOrders();
    }

    renderOrders() {
        const tableBody = document.querySelector('#orderTable tbody');
        if (tableBody) {
            if (this.orders.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5">No orders yet.</td></tr>';
            } else {
                tableBody.innerHTML = this.orders.map((order) => `
                    <tr>
                        <td>${order.name}</td>
                        <td>${order.client}</td>
                        <td>${order.date}</td>
                        <td>GH₵ ${Number(order.totalCost || 0).toFixed(2)}</td>
                        <td>
                            <button type="button" class="btn btn-danger" data-delete-order="${order.id}">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        }

        document.querySelectorAll('[data-delete-order]').forEach((button) => {
            button.addEventListener('click', () => this.deleteOrder(Number(button.dataset.deleteOrder)));
        });

        const savedOrdersContainer = document.getElementById('savedOrdersContainer');
        if (savedOrdersContainer) {
            if (this.orders.length === 0) {
                savedOrdersContainer.innerHTML = '<p class="empty-message">No saved orders yet.</p>';
                return;
            }

            savedOrdersContainer.innerHTML = this.orders.map((order) => `
                <div class="item">
                    <div class="item-name">${order.name}</div>
                    <div class="item-details">
                        <strong>Client:</strong> ${order.client}<br>
                        <strong>Date:</strong> ${order.date}<br>
                        <strong>Recipes:</strong> ${order.recipes.length}<br>
                        <strong>Total:</strong> GH₵ ${Number(order.totalCost || 0).toFixed(2)}
                    </div>
                </div>
            `).join('');
        }
    }

    handleAddPackaging(event) {
        event.preventDefault();

        const name = document.getElementById('packagingName')?.value.trim();
        const category = document.getElementById('packagingCategory')?.value;
        const cost = parseFloat(document.getElementById('packagingCost')?.value || '0');

        if (!name || !category || Number.isNaN(cost) || cost < 0) {
            alert('Please fill in all packaging fields correctly.');
            return;
        }

        this.packaging.push({
            id: Date.now(),
            name,
            category,
            costPerUnit: cost
        });

        this.saveToStorage(STORAGE_KEYS.packaging, this.packaging);
        this.renderPackaging();
        this.updateSummary();

        event.target.reset();
        alert('Packaging item added successfully.');
    }

    deletePackaging(id) {
        this.packaging = this.packaging.filter((item) => item.id !== id);
        this.saveToStorage(STORAGE_KEYS.packaging, this.packaging);
        this.renderPackaging();
        this.updateSummary();
    }

    renderPackaging() {
        const tableBody = document.querySelector('#packagingTable tbody');
        if (!tableBody) return;

        if (this.packaging.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">No packaging items yet.</td></tr>';
            return;
        }

        tableBody.innerHTML = this.packaging.map((item) => `
            <tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>GH₵ ${Number(item.costPerUnit || 0).toFixed(2)}</td>
                <td>
                    <button type="button" class="btn btn-danger" data-delete-packaging="${item.id}">Delete</button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('[data-delete-packaging]').forEach((button) => {
            button.addEventListener('click', () => this.deletePackaging(Number(button.dataset.deletePackaging)));
        });
    }

    handleAddDecoration(event) {
        event.preventDefault();

        const name = document.getElementById('decorationName')?.value.trim();
        const category = document.getElementById('decorationCategory')?.value;
        const cost = parseFloat(document.getElementById('decorationCost')?.value || '0');

        if (!name || !category || Number.isNaN(cost) || cost < 0) {
            alert('Please fill in all decoration fields correctly.');
            return;
        }

        this.decorations.push({
            id: Date.now(),
            name,
            category,
            costPerUnit: cost
        });

        this.saveToStorage(STORAGE_KEYS.decorations, this.decorations);
        this.renderDecorations();
        this.updateSummary();

        event.target.reset();
        alert('Decoration added successfully.');
    }

    deleteDecoration(id) {
        this.decorations = this.decorations.filter((item) => item.id !== id);
        this.saveToStorage(STORAGE_KEYS.decorations, this.decorations);
        this.renderDecorations();
        this.updateSummary();
    }

    renderDecorations() {
        const tableBody = document.querySelector('#decorationTable tbody');
        if (!tableBody) return;

        if (this.decorations.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">No decorations yet.</td></tr>';
            return;
        }

        tableBody.innerHTML = this.decorations.map((item) => `
            <tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>GH₵ ${Number(item.costPerUnit || 0).toFixed(2)}</td>
                <td>
                    <button type="button" class="btn btn-danger" data-delete-decoration="${item.id}">Delete</button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('[data-delete-decoration]').forEach((button) => {
            button.addEventListener('click', () => this.deleteDecoration(Number(button.dataset.deleteDecoration)));
        });
    }

    updateSummary() {
        const totalIngredients = this.ingredients.reduce((sum, ingredient) => sum + Number(ingredient.costPerUnit || 0), 0);
        const totalPackaging = this.packaging.reduce((sum, item) => sum + Number(item.costPerUnit || 0), 0);
        const totalDecorations = this.decorations.reduce((sum, item) => sum + Number(item.costPerUnit || 0), 0);
        const grandTotal = totalIngredients + totalPackaging + totalDecorations;

        const totalIngrCost = document.getElementById('totalIngrCost');
        if (totalIngrCost) totalIngrCost.textContent = `GH₵ ${totalIngredients.toFixed(2)}`;

        const totalPackCost = document.getElementById('totalPackCost');
        if (totalPackCost) totalPackCost.textContent = `GH₵ ${totalPackaging.toFixed(2)}`;

        const totalDecCost = document.getElementById('totalDecCost');
        if (totalDecCost) totalDecCost.textContent = `GH₵ ${totalDecorations.toFixed(2)}`;

        const grandTotalNode = document.getElementById('grandTotal');
        if (grandTotalNode) grandTotalNode.textContent = `GH₵ ${grandTotal.toFixed(2)}`;

        const summaryTableBody = document.querySelector('#summaryTable tbody');
        if (summaryTableBody) {
            if (this.ingredients.length === 0) {
                summaryTableBody.innerHTML = '<tr><td colspan="5">No ingredient breakdown available.</td></tr>';
                return;
            }

            summaryTableBody.innerHTML = this.ingredients.map((ingredient) => `
                <tr>
                    <td>${ingredient.name}</td>
                    <td>${ingredient.category}</td>
                    <td>1</td>
                    <td>GH₵ ${Number(ingredient.costPerUnit || 0).toFixed(2)}</td>
                    <td>GH₵ ${Number(ingredient.costPerUnit || 0).toFixed(2)}</td>
                </tr>
            `).join('');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CakeCalculatorApp();
});

window.CakeCalculatorApp = CakeCalculatorApp;
