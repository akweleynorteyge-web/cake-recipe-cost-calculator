// ==========================================
// CAKE RECIPE COST CALCULATOR - GHANA
// ==========================================

class RecipeCostCalculator {
    constructor() {
        this.ingredients = this.loadFromStorage('ingredients') || [];
        this.savedRecipes = this.loadFromStorage('savedRecipes') || [];
        this.decorations = this.loadFromStorage('decorations') || [];
        this.packaging = this.loadFromStorage('packaging') || this.initializePackaging();
        this.currentRecipe = {
            id: null,
            name: '',
            servings: '',
            ingredients: [],
            ingredientCost: 0
        };
        this.init();
    }

    // ==========================================
    // STORAGE MANAGEMENT
    // ==========================================
    
    loadFromStorage(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (e) {
            console.error(`Error loading ${key}:`, e);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving ${key}:`, e);
            alert('Failed to save data. Please check your storage space.');
        }
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    initializePackaging() {
        return {
            'boxes': [
                { name: '6-inch box', price: 0 },
                { name: '8-inch box', price: 0 },
                { name: '10-inch box', price: 0 },
                { name: '12-inch box', price: 0 }
            ],
            'boards': [
                { name: '8-inch cake board', price: 0 },
                { name: '10-inch cake board', price: 0 },
                { name: '12-inch cake board', price: 0 },
                { name: 'Cake drum', price: 0 }
            ],
            'other': [
                { name: 'Ribbon', price: 0 },
                { name: 'Dowels', price: 0 }
            ]
        };
    }

    init() {
        this.setupEventListeners();
        this.renderIngredients();
        this.renderDecorations();
        this.renderPackaging();
        this.renderSavedRecipes();
        this.updateRecipeIngredientsList();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Ingredients tab
        document.getElementById('ingredientForm').addEventListener('submit', (e) => this.addIngredient(e));

        // Recipe tab
        document.getElementById('recipeIngredientForm').addEventListener('submit', (e) => this.addToRecipe(e));
        document.getElementById('recipeName').addEventListener('input', (e) => {
            this.currentRecipe.name = e.target.value;
        });
        document.getElementById('recipeServings').addEventListener('input', (e) => {
            this.currentRecipe.servings = e.target.value;
        });

        // Decorations tab
        document.getElementById('decorationForm').addEventListener('submit', (e) => this.addDecoration(e));

        // Production costs form
        document.querySelectorAll('#productionCostsForm input').forEach(input => {
            input.addEventListener('change', () => this.updateCostSummary());
        });

        // Packaging prices
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('packaging-price-input')) {
                this.updatePackagingPrice(e.target);
            }
        });
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabName).classList.add('active');

        // Add active class to clicked button
        event.target.classList.add('active');
    }

    // ==========================================
    // INGREDIENTS MANAGEMENT
    // ==========================================

    addIngredient(e) {
        e.preventDefault();

        const ingredient = {
            id: Date.now(),
            name: document.getElementById('ingredientName').value,
            category: document.getElementById('ingredientCategory').value,
            purchasePrice: parseFloat(document.getElementById('purchasePrice').value),
            purchaseQuantity: parseFloat(document.getElementById('purchaseQuantity').value),
            purchaseUnit: document.getElementById('purchaseUnit').value
        };

        if (!ingredient.name || !ingredient.category || ingredient.purchasePrice <= 0 || 
            ingredient.purchaseQuantity <= 0 || !ingredient.purchaseUnit) {
            alert('Please fill in all fields with valid values');
            return;
        }

        this.ingredients.push(ingredient);
        this.saveToStorage('ingredients', this.ingredients);
        this.renderIngredients();
        this.updateRecipeIngredientsList();

        // Reset form
        document.getElementById('ingredientForm').reset();
        alert('Ingredient added successfully!');
    }

    deleteIngredient(id) {
        if (confirm('Are you sure you want to delete this ingredient?')) {
            this.ingredients = this.ingredients.filter(ing => ing.id !== id);
            this.saveToStorage('ingredients', this.ingredients);
            this.renderIngredients();
            this.updateRecipeIngredientsList();
        }
    }

    renderIngredients() {
        const list = document.getElementById('ingredientsList');
        
        if (this.ingredients.length === 0) {
            list.innerHTML = '<p class="empty-message">No ingredients added yet. Add your first ingredient above!</p>';
            return;
        }

        list.innerHTML = this.ingredients.map(ing => `
            <div class="item">
                <div class="item-info">
                    <div class="item-name">${ing.name}</div>
                    <div class="item-details">
                        <strong>Category:</strong> ${this.getCategoryLabel(ing.category)}<br>
                        <strong>Price:</strong> GH₵${ing.purchasePrice.toFixed(2)} for ${ing.purchaseQuantity} ${ing.purchaseUnit}
                        <br><strong>Unit price:</strong> GH₵${(ing.purchasePrice / ing.purchaseQuantity).toFixed(3)}/${ing.purchaseUnit}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-edit btn-small" onclick="calculator.editIngredient(${ing.id})">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="calculator.deleteIngredient(${ing.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    editIngredient(id) {
        const ingredient = this.ingredients.find(ing => ing.id === id);
        if (!ingredient) return;

        document.getElementById('ingredientName').value = ingredient.name;
        document.getElementById('ingredientCategory').value = ingredient.category;
        document.getElementById('purchasePrice').value = ingredient.purchasePrice;
        document.getElementById('purchaseQuantity').value = ingredient.purchaseQuantity;
        document.getElementById('purchaseUnit').value = ingredient.purchaseUnit;

        // Change button text and function
        const form = document.getElementById('ingredientForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Update Ingredient';

        // Remove old listener and add new one
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        newForm.addEventListener('submit', (e) => {
            e.preventDefault();

            ingredient.name = document.getElementById('ingredientName').value;
            ingredient.category = document.getElementById('ingredientCategory').value;
            ingredient.purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
            ingredient.purchaseQuantity = parseFloat(document.getElementById('purchaseQuantity').value);
            ingredient.purchaseUnit = document.getElementById('purchaseUnit').value;

            this.saveToStorage('ingredients', this.ingredients);
            this.renderIngredients();
            this.updateRecipeIngredientsList();
            this.updateCostSummary();

            newForm.reset();
            const btn = newForm.querySelector('button[type="submit"]');
            btn.textContent = 'Add Ingredient';
            this.setupEventListeners();
            alert('Ingredient updated successfully!');
        });
    }

    getCategoryLabel(category) {
        const labels = {
            'dry': 'Dry Ingredients',
            'wet': 'Wet Ingredients',
            'decoration': 'Decorations',
            'packaging': 'Packaging'
        };
        return labels[category] || category;
    }

    // ==========================================
    // RECIPE CALCULATOR
    // ==========================================

    updateRecipeIngredientsList() {
        const datalist = document.getElementById('ingredientsList-datalist');
        datalist.innerHTML = this.ingredients.map(ing => 
            `<option value="${ing.name}" data-id="${ing.id}"></option>`
        ).join('');
    }

    addToRecipe(e) {
        e.preventDefault();

        const ingredientName = document.getElementById('recipeIngredient').value.trim();
        const quantity = parseFloat(document.getElementById('recipeQuantity').value);
        const unit = document.getElementById('recipeUnit').value;

        if (!ingredientName || quantity <= 0 || !unit) {
            alert('Please fill in all recipe fields');
            return;
        }

        // Find or create ingredient
        let ingredient = this.ingredients.find(ing => ing.name.toLowerCase() === ingredientName.toLowerCase());
        
        if (!ingredient) {
            alert('Ingredient not found. Please add it to your ingredients database first.');
            return;
        }

        const recipeIngredient = {
            id: Date.now(),
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            quantity: quantity,
            unit: unit,
            cost: this.calculateCost(ingredient, quantity, unit)
        };

        this.currentRecipe.ingredients.push(recipeIngredient);
        this.renderRecipeIngredients();
        this.updateCostSummary();

        // Reset form
        document.getElementById('recipeIngredientForm').reset();
    }

    calculateCost(ingredient, quantity, unit) {
        // Convert everything to base unit
        const conversionFactors = {
            'kg': 1000,    // to g
            'g': 1,
            'litre': 1000, // to ml
            'ml': 1,
            'cup': 237,    // to ml
            'tablespoon': 14.787,  // to ml
            'teaspoon': 4.929,     // to ml
            'each': 1
        };

        const ingredientBaseQuantity = ingredient.purchaseQuantity * (conversionFactors[ingredient.purchaseUnit] || 1);
        const usedQuantityInBase = quantity * (conversionFactors[unit] || 1);
        const costPerBase = ingredient.purchasePrice / ingredientBaseQuantity;
        const totalCost = usedQuantityInBase * costPerBase;

        return totalCost;
    }

    removeRecipeIngredient(id) {
        this.currentRecipe.ingredients = this.currentRecipe.ingredients.filter(ing => ing.id !== id);
        this.renderRecipeIngredients();
        this.updateCostSummary();
    }

    renderRecipeIngredients() {
        const list = document.getElementById('recipeIngredientsList');
        
        if (this.currentRecipe.ingredients.length === 0) {
            list.innerHTML = '<p class="empty-message">No ingredients added to recipe yet.</p>';
            return;
        }

        list.innerHTML = this.currentRecipe.ingredients.map(ing => `
            <div class="item recipe-item">
                <div class="item-info">
                    <div class="item-name">${ing.ingredientName}</div>
                    <div class="item-details">
                        Amount: ${ing.quantity} ${ing.unit} | Cost: GH₵${ing.cost.toFixed(2)}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-danger btn-small" onclick="calculator.removeRecipeIngredient(${ing.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }

    // ==========================================
    // SAVE/LOAD RECIPES
    // ==========================================

    saveRecipe() {
        if (!this.currentRecipe.name.trim()) {
            alert('Please enter a recipe name');
            return;
        }

        if (this.currentRecipe.ingredients.length === 0) {
            alert('Please add at least one ingredient to the recipe');
            return;
        }

        const recipeToSave = {
            id: Date.now(),
            name: this.currentRecipe.name,
            servings: this.currentRecipe.servings,
            ingredients: JSON.parse(JSON.stringify(this.currentRecipe.ingredients)),
            ingredientCost: this.currentRecipe.ingredients.reduce((sum, ing) => sum + ing.cost, 0),
            savedAt: new Date().toLocaleString()
        };

        this.savedRecipes.push(recipeToSave);
        this.saveToStorage('savedRecipes', this.savedRecipes);
        this.renderSavedRecipes();
        alert(`Recipe "${recipeToSave.name}" saved successfully!`);
    }

    clearRecipe() {
        if (confirm('Clear the current recipe?')) {
            this.currentRecipe = {
                id: null,
                name: '',
                servings: '',
                ingredients: [],
                ingredientCost: 0
            };
            document.getElementById('recipeName').value = '';
            document.getElementById('recipeServings').value = '';
            this.renderRecipeIngredients();
            this.updateCostSummary();
        }
    }

    loadRecipe(recipeId) {
        const recipe = this.savedRecipes.find(r => r.id === recipeId);
        if (!recipe) return;

        this.currentRecipe = {
            id: recipe.id,
            name: recipe.name,
            servings: recipe.servings,
            ingredients: JSON.parse(JSON.stringify(recipe.ingredients)),
            ingredientCost: recipe.ingredientCost
        };

        document.getElementById('recipeName').value = recipe.name;
        document.getElementById('recipeServings').value = recipe.servings;
        this.renderRecipeIngredients();
        this.updateCostSummary();

        // Switch to recipe tab
        this.switchTab('recipe');
        alert(`Recipe "${recipe.name}" loaded!`);
    }

    deleteRecipe(recipeId) {
        if (confirm('Are you sure you want to delete this recipe?')) {
            this.savedRecipes = this.savedRecipes.filter(r => r.id !== recipeId);
            this.saveToStorage('savedRecipes', this.savedRecipes);
            this.renderSavedRecipes();
        }
    }

    renderSavedRecipes() {
        const list = document.getElementById('savedRecipesList');
        
        if (this.savedRecipes.length === 0) {
            list.innerHTML = '<p class="empty-message">No recipes saved yet. Create and save a recipe first!</p>';
            return;
        }

        list.innerHTML = this.savedRecipes.map(recipe => `
            <div class="item saved-recipe-card">
                <div class="item-info">
                    <div class="item-name">🎂 ${recipe.name}</div>
                    <div class="item-details">
                        <strong>Servings/Size:</strong> ${recipe.servings || 'Not specified'}<br>
                        <strong>Ingredients:</strong> ${recipe.ingredients.length} items<br>
                        <strong>Ingredient Cost:</strong> GH₵${recipe.ingredientCost.toFixed(2)}<br>
                        <strong>Saved:</strong> ${recipe.savedAt}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-primary btn-small" onclick="calculator.loadRecipe(${recipe.id})">📋 Load</button>
                    <button class="btn btn-danger btn-small" onclick="calculator.deleteRecipe(${recipe.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // ==========================================
    // DECORATIONS MANAGEMENT
    // ==========================================

    addDecoration(e) {
        e.preventDefault();

        const decoration = {
            id: Date.now(),
            name: document.getElementById('decorationName').value,
            price: parseFloat(document.getElementById('decorationPrice').value)
        };

        if (!decoration.name || decoration.price < 0) {
            alert('Please fill in all fields with valid values');
            return;
        }

        this.decorations.push(decoration);
        this.saveToStorage('decorations', this.decorations);
        this.renderDecorations();

        document.getElementById('decorationForm').reset();
        alert('Decoration added successfully!');
    }

    deleteDecoration(id) {
        if (confirm('Are you sure you want to delete this decoration?')) {
            this.decorations = this.decorations.filter(dec => dec.id !== id);
            this.saveToStorage('decorations', this.decorations);
            this.renderDecorations();
        }
    }

    renderDecorations() {
        const list = document.getElementById('decorationsList');
        
        if (this.decorations.length === 0) {
            list.innerHTML = '<p class="empty-message">No decorations added yet.</p>';
            return;
        }

        list.innerHTML = this.decorations.map(dec => `
            <div class="item">
                <div class="item-info">
                    <div class="item-name">${dec.name}</div>
                    <div class="item-details">Price: GH₵${dec.price.toFixed(2)}</div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-edit btn-small" onclick="calculator.editDecoration(${dec.id})">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="calculator.deleteDecoration(${dec.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    editDecoration(id) {
        const decoration = this.decorations.find(dec => dec.id === id);
        if (!decoration) return;

        const newPrice = prompt(`Edit price for "${decoration.name}" (GH₵):`, decoration.price);
        if (newPrice !== null && !isNaN(newPrice) && newPrice >= 0) {
            decoration.price = parseFloat(newPrice);
            this.saveToStorage('decorations', this.decorations);
            this.renderDecorations();
        }
    }

    // ==========================================
    // PACKAGING MANAGEMENT
    // ==========================================

    renderPackaging() {
        // Render boxes
        const boxesContainer = document.getElementById('packagingBoxes');
        boxesContainer.innerHTML = this.packaging.boxes.map((box, index) => `
            <div class="packaging-item">
                <label>${box.name}</label>
                <input type="number" step="0.01" min="0" value="${box.price}" 
                       class="packaging-price-input" data-category="boxes" data-index="${index}">
            </div>
        `).join('');

        // Render boards
        const boardsContainer = document.getElementById('packagingBoards');
        boardsContainer.innerHTML = this.packaging.boards.map((board, index) => `
            <div class="packaging-item">
                <label>${board.name}</label>
                <input type="number" step="0.01" min="0" value="${board.price}" 
                       class="packaging-price-input" data-category="boards" data-index="${index}">
            </div>
        `).join('');

        // Render other items
        const otherContainer = document.getElementById('packagingOther');
        otherContainer.innerHTML = this.packaging.other.map((item, index) => `
            <div class="packaging-item">
                <label>${item.name}</label>
                <input type="number" step="0.01" min="0" value="${item.price}" 
                       class="packaging-price-input" data-category="other" data-index="${index}">
            </div>
        `).join('');
    }

    updatePackagingPrice(input) {
        const category = input.dataset.category;
        const index = parseInt(input.dataset.index);
        const newPrice = parseFloat(input.value) || 0;

        this.packaging[category][index].price = newPrice;
        this.saveToStorage('packaging', this.packaging);
        this.updateCostSummary();
    }

    // ==========================================
    // COST SUMMARY
    // ==========================================

    updateCostSummary() {
        // Calculate ingredient cost
        const ingredientCost = this.currentRecipe.ingredients.reduce((sum, ing) => sum + ing.cost, 0);
        this.currentRecipe.ingredientCost = ingredientCost;
        document.getElementById('summaryIngredientCost').textContent = ingredientCost.toFixed(2);
        document.getElementById('ingredientCostTotal').textContent = ingredientCost.toFixed(2);

        // Get costs from form
        const packagingCost = parseFloat(document.getElementById('summaryPackagingCost').value) || 0;
        const electricity = parseFloat(document.getElementById('summaryElectricity').value) || 0;
        const gas = parseFloat(document.getElementById('summaryGas').value) || 0;
        const water = parseFloat(document.getElementById('summaryWater').value) || 0;
        const labour = parseFloat(document.getElementById('summaryLabour').value) || 0;
        const transport = parseFloat(document.getElementById('summaryTransport').value) || 0;
        const decorationCost = parseFloat(document.getElementById('summaryDecorationCost').value) || 0;
        const profitPercentage = parseFloat(document.getElementById('profitPercentage').value) || 0;

        // Calculate utilities
        const utilities = electricity + gas + water;

        // Update display
        document.getElementById('summaryDecorationDisplay').textContent = decorationCost.toFixed(2);
        document.getElementById('summaryPackagingDisplay').textContent = packagingCost.toFixed(2);
        document.getElementById('summaryLabourDisplay').textContent = labour.toFixed(2);
        document.getElementById('summaryUtilitiesDisplay').textContent = utilities.toFixed(2);
        document.getElementById('summaryTransportDisplay').textContent = transport.toFixed(2);

        // Calculate total production cost
        const totalProduction = ingredientCost + packagingCost + electricity + gas + water + labour + transport + decorationCost;
        document.getElementById('summaryTotalProduction').textContent = totalProduction.toFixed(2);

        // Calculate profit and final price
        const profit = totalProduction * (profitPercentage / 100);
        const finalPrice = totalProduction + profit;

        document.getElementById('summaryProfit').textContent = profit.toFixed(2);
        document.getElementById('summaryFinalPrice').textContent = finalPrice.toFixed(2);
    }
}

// ==========================================
// INITIALIZE APP
// ==========================================
let calculator;

document.addEventListener('DOMContentLoaded', () => {
    calculator = new RecipeCostCalculator();
    calculator.updateCostSummary();
});