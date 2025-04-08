// Inizializzazione dell'applicazione quando il DOM è completamente caricato
document.addEventListener('DOMContentLoaded', function() {
  // Inizializza i gestori di eventi per le tab
  setupTabs();
  
  // Inizializza i componenti dell'app
  initializeProfileManager();
  initializeFoodDatabase();
  initializeMealPlanner();
  initializeNutritionSummary();
});

// Configurazione delle tab dell'applicazione
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabSections = document.querySelectorAll('.tab-section');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Rimuove la classe active da tutti i pulsanti e sezioni
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabSections.forEach(section => section.classList.remove('active'));
      
      // Aggiunge la classe active al pulsante cliccato
      this.classList.add('active');
      
      // Attiva la sezione corrispondente
      const tabId = this.getAttribute('data-tab');
      document.getElementById(`${tabId}-section`).classList.add('active');
    });
  });
}

// Utility per generare ID univoci
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Utility per salvare/caricare dati da localStorage
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key, defaultValue = null) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

// Calcolo del metabolismo basale (BMR) con la formula di Harris-Benedict
function calculateBMR(gender, weight, height, age) {
  if (gender === 'male') {
    // Formula per uomini
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    // Formula per donne
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

// Calcolo del fabbisogno calorico giornaliero
function calculateDailyCalories(bmr, activityLevel, goal) {
  const activityFactor = activityFactors[activityLevel].factor;
  const goalFactor = calorieGoals[goal].factor;
  
  return Math.round(bmr * activityFactor * goalFactor);
}

// Calcolo della distribuzione dei macronutrienti
function calculateMacronutrients(calories, carbRatio = 0.55, proteinRatio = 0.20, fatRatio = 0.25) {
  const carbGrams = Math.round((calories * carbRatio) / 4); // 4 kcal per g di carboidrati
  const proteinGrams = Math.round((calories * proteinRatio) / 4); // 4 kcal per g di proteine
  const fatGrams = Math.round((calories * fatRatio) / 9); // 9 kcal per g di grassi
  
  return {
    carbs: {
      grams: carbGrams,
      kcal: carbGrams * 4,
      percentage: Math.round(carbRatio * 100)
    },
    protein: {
      grams: proteinGrams,
      kcal: proteinGrams * 4,
      percentage: Math.round(proteinRatio * 100)
    },
    fat: {
      grams: fatGrams,
      kcal: fatGrams * 9,
      percentage: Math.round(fatRatio * 100)
    },
    total: {
      kcal: calories
    }
  };
}

// ============================
// GESTIONE PROFILI
// ============================
function initializeProfileManager() {
  // Carica i profili salvati
  const profiles = loadFromLocalStorage('userProfiles', []);
  const selectedProfileId = loadFromLocalStorage('selectedProfileId', null);
  
  // Aggiorna il selettore di profili
  updateProfileSelector(profiles, selectedProfileId);
  
  // Gestisce il click sul pulsante di calcolo
  document.getElementById('calculate-button').addEventListener('click', function() {
    const profileName = document.getElementById('profile-name').value.trim();
    
    if (!profileName) {
      alert('Per favore, inserisci un nome per il profilo.');
      return;
    }
    
    // Raccoglie i dati dal form
    const gender = document.getElementById('gender').value;
    const age = parseInt(document.getElementById('age').value, 10);
    const weight = parseInt(document.getElementById('weight').value, 10);
    const height = parseInt(document.getElementById('height').value, 10);
    const activityLevel = document.getElementById('activity-level').value;
    const goal = document.getElementById('goal').value;
    
    // Calcola BMR e fabbisogno calorico
    const bmr = calculateBMR(gender, weight, height, age);
    const dailyCalories = calculateDailyCalories(bmr, activityLevel, goal);
    
    // Calcola la distribuzione dei macronutrienti
    const macros = calculateMacronutrients(dailyCalories);
    
    // Crea il nuovo profilo
    const newProfile = {
      id: generateId(),
      name: profileName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gender,
      age,
      weight,
      height,
      activityLevel,
      goal,
      bmr,
      dailyCalories,
      macros
    };
    
    // Aggiunge il profilo alla lista e lo seleziona
    const updatedProfiles = [...profiles, newProfile];
    saveToLocalStorage('userProfiles', updatedProfiles);
    saveToLocalStorage('selectedProfileId', newProfile.id);
    
    // Aggiorna l'interfaccia
    updateProfileSelector(updatedProfiles, newProfile.id);
    showProfileDetails(newProfile);
    
    // Svuota il form
    document.getElementById('profile-name').value = '';
  });
}

function updateProfileSelector(profiles, selectedId) {
  const profileSelector = document.getElementById('profile-selector');
  
  if (profiles.length === 0) {
    profileSelector.innerHTML = '<p>Nessun profilo disponibile. Crea il tuo primo profilo!</p>';
    document.getElementById('profile-details').style.display = 'none';
    document.getElementById('profile-form').style.display = 'block';
    return;
  }
  
  let html = '<label for="profile-select">Seleziona Profilo:</label>';
  html += '<div style="display: flex; gap: 1rem;">';
  html += '<select id="profile-select">';
  html += '<option value="" disabled' + (selectedId ? '' : ' selected') + '>Scegli un profilo</option>';
  
  profiles.forEach(profile => {
    html += `<option value="${profile.id}"${profile.id === selectedId ? ' selected' : ''}>${profile.name}</option>`;
  });
  
  html += '</select>';
  html += '<button id="delete-profile-button" class="delete-profile-button">Elimina Profilo</button>';
  html += '</div>';
  
  profileSelector.innerHTML = html;
  
  // Mostra i dettagli del profilo selezionato
  if (selectedId) {
    const selectedProfile = profiles.find(p => p.id === selectedId);
    if (selectedProfile) {
      showProfileDetails(selectedProfile);
    }
  }
  
  // Aggiungi eventi ai nuovi elementi
  document.getElementById('profile-select')?.addEventListener('change', function() {
    const selectedId = this.value;
    saveToLocalStorage('selectedProfileId', selectedId);
    
    const selectedProfile = profiles.find(p => p.id === selectedId);
    if (selectedProfile) {
      showProfileDetails(selectedProfile);
    }
  });
  
  document.getElementById('delete-profile-button')?.addEventListener('click', function() {
    const selectedId = document.getElementById('profile-select').value;
    if (!selectedId) return;
    
    if (confirm('Sei sicuro di voler eliminare questo profilo?')) {
      const updatedProfiles = profiles.filter(p => p.id !== selectedId);
      saveToLocalStorage('userProfiles', updatedProfiles);
      
      // Seleziona il primo profilo disponibile o nessuno
      const newSelectedId = updatedProfiles.length > 0 ? updatedProfiles[0].id : null;
      saveToLocalStorage('selectedProfileId', newSelectedId);
      
      // Aggiorna l'interfaccia
      updateProfileSelector(updatedProfiles, newSelectedId);
    }
  });
}

function showProfileDetails(profile) {
  const profileDetails = document.getElementById('profile-details');
  document.getElementById('profile-form').style.display = 'none';
  profileDetails.style.display = 'block';
  
  let html = `<h3>Profilo di ${profile.name}</h3>`;
  html += '<div class="profile-info">';
  html += `<div class="info-item"><span class="info-label">Età:</span> <span class="info-value">${profile.age} anni</span></div>`;
  html += `<div class="info-item"><span class="info-label">Genere:</span> <span class="info-value">${profile.gender === 'male' ? 'Uomo' : 'Donna'}</span></div>`;
  html += `<div class="info-item"><span class="info-label">Peso:</span> <span class="info-value">${profile.weight} kg</span></div>`;
  html += `<div class="info-item"><span class="info-label">Altezza:</span> <span class="info-value">${profile.height} cm</span></div>`;
  html += `<div class="info-item"><span class="info-label">Fabbisogno Calorico:</span> <span class="info-value">${profile.dailyCalories} kcal</span></div>`;
  html += '</div>';
  
  html += '<div class="macros-summary">';
  html += '<h4>Macronutrienti</h4>';
  html += '<div class="macros-grid">';
  html += `
    <div class="macro-box">
      <div class="macro-title">Carboidrati</div>
      <div class="macro-amount">${profile.macros.carbs.grams}g</div>
      <div class="macro-percent">(${profile.macros.carbs.percentage}%)</div>
    </div>
    <div class="macro-box">
      <div class="macro-title">Proteine</div>
      <div class="macro-amount">${profile.macros.protein.grams}g</div>
      <div class="macro-percent">(${profile.macros.protein.percentage}%)</div>
    </div>
    <div class="macro-box">
      <div class="macro-title">Grassi</div>
      <div class="macro-amount">${profile.macros.fat.grams}g</div>
      <div class="macro-percent">(${profile.macros.fat.percentage}%)</div>
    </div>
  `;
  html += '</div>';
  html += '</div>';
  
  html += '<button id="edit-profile-button" class="recalculate-button">Modifica Profilo</button>';
  
  profileDetails.innerHTML = html;
  
  // Aggiungi evento al pulsante di modifica
  document.getElementById('edit-profile-button').addEventListener('click', function() {
    document.getElementById('profile-form').style.display = 'block';
    profileDetails.style.display = 'none';
    
    // Pre-compila il form con i dati del profilo
    document.getElementById('profile-name').value = profile.name;
    document.getElementById('gender').value = profile.gender;
    document.getElementById('age').value = profile.age;
    document.getElementById('weight').value = profile.weight;
    document.getElementById('height').value = profile.height;
    document.getElementById('activity-level').value = profile.activityLevel;
    document.getElementById('goal').value = profile.goal;
  });
}

// ============================
// GESTIONE DATABASE ALIMENTI
// ============================
function initializeFoodDatabase() {
  // Carica gli alimenti personalizzati
  const customFoods = loadFromLocalStorage('customFoods', {});
  
  // Popola il selettore di categorie
  const categorySelect = document.getElementById('food-category');
  let options = '';
  
  Object.keys(categoryNames).forEach(category => {
    options += `<option value="${category}">${categoryNames[category]}</option>`;
  });
  
  categorySelect.innerHTML = options;
  
  // Mostra gli alimenti della categoria selezionata
  showFoodsForCategory(categorySelect.value, customFoods);
  
  // Evento cambio categoria
  categorySelect.addEventListener('change', function() {
    showFoodsForCategory(this.value, customFoods);
  });
  
  // Evento aggiunta nuovo alimento
  document.getElementById('add-food-button').addEventListener('click', function() {
    const category = document.getElementById('food-category').value;
    const name = document.getElementById('food-name').value.trim();
    const calories = parseInt(document.getElementById('food-calories').value, 10);
    const protein = parseFloat(document.getElementById('food-protein').value);
    const carbs = parseFloat(document.getElementById('food-carbs').value);
    const fat = parseFloat(document.getElementById('food-fat').value);
    const portion = document.getElementById('food-portion').value.trim();
    
    if (!name || !portion) {
      alert('Nome e porzione sono campi obbligatori.');
      return;
    }
    
    // Crea il nuovo alimento
    const newFood = {
      id: `custom_${category}_${generateId()}`,
      name,
      calories,
      protein,
      carbs,
      fat,
      portion,
      category
    };
    
    // Aggiungi l'alimento ai cibi personalizzati
    if (!customFoods[category]) {
      customFoods[category] = [];
    }
    
    customFoods[category].push(newFood);
    saveToLocalStorage('customFoods', customFoods);
    
    // Aggiorna la visualizzazione
    showFoodsForCategory(category, customFoods);
    
    // Resetta il form
    document.getElementById('food-name').value = '';
    document.getElementById('food-calories').value = '0';
    document.getElementById('food-protein').value = '0';
    document.getElementById('food-carbs').value = '0';
    document.getElementById('food-fat').value = '0';
    document.getElementById('food-portion').value = '';
  });
}

function showFoodsForCategory(category, customFoods) {
  const foodTableContainer = document.getElementById('food-table-container');
  const categoryTitle = document.getElementById('category-title');
  
  // Imposta il titolo della categoria
  categoryTitle.textContent = `Alimenti in ${categoryNames[category]}`;
  
  // Ottiene gli alimenti predefiniti e personalizzati
  const defaultFoods = foodDatabase[category] || [];
  const userFoods = customFoods[category] || [];
  const allFoods = [...defaultFoods, ...userFoods];
  
  if (allFoods.length === 0) {
    foodTableContainer.innerHTML = '<p>Nessun alimento disponibile in questa categoria.</p>';
    return;
  }
  
  // Crea la tabella
  let html = '<table class="food-table">';
  html += `
    <thead>
      <tr>
        <th>Nome</th>
        <th>Calorie</th>
        <th>Proteine (g)</th>
        <th>Carboidrati (g)</th>
        <th>Grassi (g)</th>
        <th>Porzione</th>
      </tr>
    </thead>
    <tbody>
  `;
  
  allFoods.forEach(food => {
    const isCustom = food.id.startsWith('custom');
    html += `<tr class="${isCustom ? 'custom-food' : ''}">`;
    html += `<td>${food.name}</td>`;
    html += `<td>${food.calories}</td>`;
    html += `<td>${food.protein}</td>`;
    html += `<td>${food.carbs}</td>`;
    html += `<td>${food.fat}</td>`;
    html += `<td>${food.portion}</td>`;
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  foodTableContainer.innerHTML = html;
}

// ============================
// GESTIONE PIANO PASTI
// ============================
function initializeMealPlanner() {
  // Ottiene i giorni della settimana
  const daysOfWeek = Object.keys(weeklyPlanTemplate);
  
  // Carica il piano pasti esistente o crea uno nuovo
  let mealPlan = loadFromLocalStorage('mealPlan', null);
  
  if (!mealPlan) {
    // Crea un piano pasti vuoto
    mealPlan = {};
    daysOfWeek.forEach(day => {
      mealPlan[day] = {
        breakfast: [], // Aggiungi colazione
        lunch: [],
        dinner: [],
        snacks: []     // Aggiungi spuntini
      };
    });
    saveToLocalStorage('mealPlan', mealPlan);
  } else {
    // Aggiorna piano pasti esistente per aggiungere i nuovi pasti se mancanti
    daysOfWeek.forEach(day => {
      if (!mealPlan[day].breakfast) mealPlan[day].breakfast = [];
      if (!mealPlan[day].snacks) mealPlan[day].snacks = [];
    });
    saveToLocalStorage('mealPlan', mealPlan);
  }
  
  // Mostra il piano pasti
  renderMealPlan(mealPlan, daysOfWeek);
  
  // Gestione del modale per la selezione del cibo
  setupFoodSelectionModal(mealPlan);
}

function renderMealPlan(mealPlan, daysOfWeek) {
  const mealPlanGrid = document.getElementById('meal-plan-grid');
  let html = '';
  
  daysOfWeek.forEach(day => {
    // Contenitore per un giorno intero
    html += `<div class="day-block">`;
    
    // Intestazione del giorno
    html += `<div class="day-header"><h3>${day}</h3></div>`;
    
    // Contenitore per i pasti del giorno
    html += `<div class="day-meals">`;
    
    // Colazione
    html += `
      <div class="meal-container">
        <h4 class="meal-title">Colazione</h4>
        <div class="meal-slot breakfast-slot" data-day="${day}" data-meal-type="breakfast">
          ${renderMeals(mealPlan[day].breakfast, day, 'breakfast')}
          <button class="add-meal-button" data-day="${day}" data-meal-type="breakfast">
            + Aggiungi
          </button>
        </div>
      </div>
    `;
    
    // Pranzo
    html += `
      <div class="meal-container">
        <h4 class="meal-title">Pranzo</h4>
        <div class="meal-slot lunch-slot" data-day="${day}" data-meal-type="lunch">
          ${renderMeals(mealPlan[day].lunch, day, 'lunch')}
          <button class="add-meal-button" data-day="${day}" data-meal-type="lunch">
            + Aggiungi
          </button>
        </div>
      </div>
    `;
    
    // Cena
    html += `
      <div class="meal-container">
        <h4 class="meal-title">Cena</h4>
        <div class="meal-slot dinner-slot" data-day="${day}" data-meal-type="dinner">
          ${renderMeals(mealPlan[day].dinner, day, 'dinner')}
          <button class="add-meal-button" data-day="${day}" data-meal-type="dinner">
            + Aggiungi
          </button>
        </div>
      </div>
    `;
    
    // Spuntini
    html += `
      <div class="meal-container">
        <h4 class="meal-title">Spuntini</h4>
        <div class="meal-slot snacks-slot" data-day="${day}" data-meal-type="snacks">
          ${renderMeals(mealPlan[day].snacks, day, 'snacks')}
          <button class="add-meal-button" data-day="${day}" data-meal-type="snacks">
            + Aggiungi
          </button>
        </div>
      </div>
    `;
    
    // Chiusura del contenitore dei pasti
    html += `</div>`;
    
    // Chiusura del contenitore del giorno
    html += `</div>`;
  });
  
  mealPlanGrid.innerHTML = html;
  
  // Aggiungi eventi ai pulsanti di aggiunta pasto
  document.querySelectorAll('.add-meal-button').forEach(button => {
    button.addEventListener('click', function() {
      const day = this.getAttribute('data-day');
      const mealType = this.getAttribute('data-meal-type');
      
      // Apri il modale di selezione cibo
      openFoodSelectionModal(day, mealType);
    });
  });
  
  // Aggiungi eventi ai pulsanti di rimozione pasto
  document.querySelectorAll('.remove-meal-button').forEach(button => {
    button.addEventListener('click', function() {
      const day = this.getAttribute('data-day');
      const mealType = this.getAttribute('data-meal-type');
      const mealIndex = parseInt(this.getAttribute('data-index'), 10);
      
      // Ottiene il piano pasti corrente
      const mealPlan = loadFromLocalStorage('mealPlan');
      
      // Rimuove il pasto
      mealPlan[day][mealType].splice(mealIndex, 1);
      
      // Salva e aggiorna
      saveToLocalStorage('mealPlan', mealPlan);
      renderMealPlan(mealPlan, Object.keys(weeklyPlanTemplate));
      
      // Aggiorna il riepilogo nutrizionale
      updateNutritionSummary();
    });
  });
}

function renderMeals(meals, day, mealType) {
  if (!meals || meals.length === 0) {
    return '';
  }
  
  let html = '';
  meals.forEach((meal, index) => {
    html += `
      <div class="meal-item">
        <div class="meal-name">${meal.name}</div>
        <div class="meal-nutrition">
          <span class="calories">${meal.calories} kcal</span>
          <span class="portion">${meal.portion}</span>
        </div>
        <button 
          type="button" 
          class="remove-meal-button"
          data-day="${day}"
          data-meal-type="${mealType}"
          data-index="${index}"
        >
          &times;
        </button>
      </div>
    `;
  });
  
  return html;
}

function setupFoodSelectionModal(mealPlan) {
  const modal = document.getElementById('food-selector-modal');
  const closeButton = modal.querySelector('.close-modal-button');
  
  // Chiude il modale quando si clicca sul pulsante X
  closeButton.addEventListener('click', function() {
    modal.style.display = 'none';
  });
  
  // Chiude il modale quando si clicca fuori dal contenuto
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

function openFoodSelectionModal(day, mealType, defaultCategory = null) {
  const modal = document.getElementById('food-selector-modal');
  const modalTitle = document.getElementById('modal-title');
  const categoryTabs = document.getElementById('category-tabs');
  const foodList = document.getElementById('modal-food-list');
  
  // Imposta il titolo del modale
  modalTitle.textContent = `Seleziona Alimento per ${day} - ${mealType === 'lunch' ? 'Pranzo' : 'Cena'}`;
  
  // Crea le tab per le categorie
  let tabsHtml = '';
  Object.keys(categoryNames).forEach(category => {
    tabsHtml += `<button class="category-tab${defaultCategory === category ? ' active' : ''}" data-category="${category}">${categoryNames[category]}</button>`;
  });
  categoryTabs.innerHTML = tabsHtml;
  
  // Seleziona la categoria predefinita o la prima categoria
  const categoryToShow = defaultCategory || categoryTabs.querySelector('.category-tab').getAttribute('data-category');
  if (!defaultCategory) {
    categoryTabs.querySelector('.category-tab').classList.add('active');
  }
  
  showFoodsInModal(categoryToShow, day, mealType);
  
  // Aggiungi eventi alle tab
  categoryTabs.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      // Rimuove active da tutte le tab
      categoryTabs.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      
      // Aggiunge active alla tab cliccata
      this.classList.add('active');
      
      // Mostra gli alimenti della categoria selezionata
      const category = this.getAttribute('data-category');
      showFoodsInModal(category, day, mealType);
    });
  });
  
  // Mostra il modale
  modal.style.display = 'flex';
}

function showFoodsInModal(category, day, mealType) {
  const foodList = document.getElementById('modal-food-list');
  const customFoods = loadFromLocalStorage('customFoods', {});
  
  // Ottiene gli alimenti predefiniti e personalizzati
  const defaultFoods = foodDatabase[category] || [];
  const userFoods = customFoods[category] || [];
  const allFoods = [...defaultFoods, ...userFoods];
  
  let html = '';
  
  if (allFoods.length === 0) {
    html = '<p>Nessun alimento disponibile in questa categoria.</p>';
  } else {
    allFoods.forEach(food => {
      html += `
        <div class="food-item" data-food-id="${food.id}" data-category="${category}">
          <div class="food-name">${food.name}</div>
          <div class="food-details">
            <span class="food-calories">${food.calories} kcal</span>
            <span class="food-portion">${food.portion}</span>
          </div>
          <div class="food-macros">
            <span class="macro">C: ${food.carbs}g</span>
            <span class="macro">P: ${food.protein}g</span>
            <span class="macro">G: ${food.fat}g</span>
          </div>
        </div>
      `;
    });
  }
  
  foodList.innerHTML = html;
  
  // Aggiungi eventi agli alimenti
  foodList.querySelectorAll('.food-item').forEach(item => {
    item.addEventListener('click', function() {
      const foodId = this.getAttribute('data-food-id');
      const category = this.getAttribute('data-category');
      
      // Ottiene l'alimento selezionato
      const customFoods = loadFromLocalStorage('customFoods', {});
      const defaultFoods = foodDatabase[category] || [];
      const userFoods = customFoods[category] || [];
      const allFoods = [...defaultFoods, ...userFoods];
      const selectedFood = allFoods.find(food => food.id === foodId);
      
      if (selectedFood) {
        // Aggiunge l'alimento al piano pasti
        addFoodToMealPlan(selectedFood, day, mealType);
        
        // Chiude il modale
        document.getElementById('food-selector-modal').style.display = 'none';
      }
    });
  });
}

function addFoodToMealPlan(food, day, mealType) {
  // Ottiene il piano pasti corrente
  const mealPlan = loadFromLocalStorage('mealPlan');
  
  // Aggiunge l'alimento
  mealPlan[day][mealType].push({
    id: food.id,
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    portion: food.portion,
    category: food.category
  });
  
  // Salva e aggiorna
  saveToLocalStorage('mealPlan', mealPlan);
  renderMealPlan(mealPlan, Object.keys(weeklyPlanTemplate));
  
  // Aggiorna il riepilogo nutrizionale
  updateNutritionSummary();
  
  // Suggerisci il resto del piano pasti
  suggestMealPlan(day, mealType);
}

// ============================
// SUGGERIMENTI PIANO PASTI
// ============================
function suggestMealPlan(updatedDay, updatedMealType) {
  // Ottiene il piano pasti corrente
  const mealPlan = loadFromLocalStorage('mealPlan');
  const daysOfWeek = Object.keys(weeklyPlanTemplate);
  
  // Traccia le categorie già utilizzate nella settimana
  const usedCategories = {
    carneBianca: 0,
    pesce: 0,
    uova: 0,
    formaggi: 0,
    legumi: 0,
    cerealIntegrali: 0
  };
  
  // Conta le categorie già utilizzate
  daysOfWeek.forEach(day => {
    ['lunch', 'dinner'].forEach(mealType => {
      mealPlan[day][mealType].forEach(meal => {
        if (usedCategories.hasOwnProperty(meal.category)) {
          usedCategories[meal.category]++;
        }
      });
    });
  });
  
  // Determina la categoria principale del pasto aggiornato
  const updatedMeal = mealPlan[updatedDay][updatedMealType];
  let updatedMealCategory = null;
  
  if (updatedMeal.length > 0) {
    updatedMealCategory = updatedMeal[0].category;
  }
  
  // Suggerimenti per la cena in base al pranzo
  if (updatedMealType === 'lunch' && updatedMealCategory) {
    // Genera suggerimento per la cena dello stesso giorno
    const dinnerSuggestion = suggestComplementaryMeal(updatedMealCategory, usedCategories);
    
    if (dinnerSuggestion) {
      showSuggestionModal(updatedDay, 'dinner', dinnerSuggestion, usedCategories);
    }
  }
  
  // Suggerimenti per il resto della settimana
  const weekSuggestions = suggestWeeklyBalance(usedCategories);
  if (weekSuggestions) {
    // Mostra questi suggerimenti nella UI
    displayWeeklySuggestions(weekSuggestions);
  }
}

function suggestComplementaryMeal(category, usedCategories) {
  // Regole di abbinamento basate sulle linee guida
  const pairings = {
    cerealIntegrali: ['legumi', 'pesce', 'uova', 'formaggi'],
    carneBianca: ['verdure', 'cerealIntegrali'],
    pesce: ['verdure', 'cerealIntegrali'],
    legumi: ['cerealIntegrali', 'verdure'],
    uova: ['verdure', 'cerealIntegrali'],
    formaggi: ['verdure', 'cerealIntegrali'],
    verdure: ['carneBianca', 'pesce', 'uova', 'formaggi', 'legumi']
  };
  
  // Verifica limiti settimanali
  const limits = {
    carneBianca: 4, // 3-4 volte a settimana
    pesce: 3,      // 2-3 volte a settimana
    uova: 2,       // 1-2 volte a settimana
    formaggi: 2,   // 1-2 volte a settimana
    legumi: 4      // almeno 3 volte a settimana
  };
  
  // Ottiene i possibili abbinamenti
  const possiblePairings = pairings[category] || [];
  
  // Filtra in base ai limiti settimanali
  const validPairings = possiblePairings.filter(pairing => {
    if (limits[pairing] && usedCategories[pairing] >= limits[pairing]) {
      return false;
    }
    return true;
  });
  
  // Se ci sono abbinamenti validi, seleziona il migliore
  if (validPairings.length > 0) {
    // Priorità: prima le categorie meno utilizzate
    validPairings.sort((a, b) => {
      if (limits[a] && limits[b]) {
        // Se entrambe hanno limiti, confronta l'utilizzo rispetto al limite
        const aRatio = usedCategories[a] / limits[a];
        const bRatio = usedCategories[b] / limits[b];
        return aRatio - bRatio;
      }
      return (usedCategories[a] || 0) - (usedCategories[b] || 0);
    });
    
    return validPairings[0];
  }
  
  return null;
}

function suggestWeeklyBalance(usedCategories) {
  // Raccomandazioni per l'intera settimana
  const recommendations = {
    carneBianca: { min: 3, max: 4, current: usedCategories.carneBianca || 0 },
    pesce: { min: 2, max: 3, current: usedCategories.pesce || 0 },
    uova: { min: 1, max: 2, current: usedCategories.uova || 0 },
    formaggi: { min: 1, max: 2, current: usedCategories.formaggi || 0 },
    legumi: { min: 3, max: 5, current: usedCategories.legumi || 0 }
  };
  
  // Verifica se ci sono categorie che necessitano di essere aumentate o diminuite
  const suggestions = {};
  
  Object.keys(recommendations).forEach(category => {
    const rec = recommendations[category];
    if (rec.current < rec.min) {
      suggestions[category] = { 
        action: 'increase', 
        current: rec.current, 
        target: rec.min,
        diff: rec.min - rec.current 
      };
    } else if (rec.current > rec.max) {
      suggestions[category] = { 
        action: 'decrease', 
        current: rec.current, 
        target: rec.max,
        diff: rec.current - rec.max 
      };
    }
  });
  
  return Object.keys(suggestions).length > 0 ? suggestions : null;
}

function showSuggestionModal(day, mealType, category, usedCategories) {
  // Crea un elemento div per il modale
  const modalId = 'suggestion-modal';
  let modal = document.getElementById(modalId);
  
  // Se il modale non esiste, crealo
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 id="suggestion-title">Suggerimento</h3>
          <button class="close-modal-button">&times;</button>
        </div>
        <div id="suggestion-body" class="modal-body" style="padding: 1.5rem;">
        </div>
        <div class="modal-footer" style="display: flex; justify-content: space-between; padding: 1rem;">
          <button id="ignore-suggestion" class="cancel-button">Ignora</button>
          <button id="apply-suggestion" class="add-food-button">Applica</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Aggiungi event listener per chiudere il modale
    modal.querySelector('.close-modal-button').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Chiudi il modale cliccando fuori
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  // Aggiorna il contenuto del modale
  const categoryName = categoryNames[category];
  const mealTypeText = mealType === 'lunch' ? 'pranzo' : 'cena';
  document.getElementById('suggestion-title').textContent = `Suggerimento per ${day} - ${mealTypeText.charAt(0).toUpperCase() + mealTypeText.slice(1)}`;
  
  let additionalInfo = '';
  
  if (usedCategories[category] !== undefined) {
    const limits = {
      carneBianca: { min: 3, max: 4 },
      pesce: { min: 2, max: 3 },
      uova: { min: 1, max: 2 },
      formaggi: { min: 1, max: 2 },
      legumi: { min: 3, max: 5 }
    };
    
    if (limits[category]) {
      additionalInfo = `<p>Attualmente hai pianificato <strong>${usedCategories[category]}</strong> pasti con ${categoryName.toLowerCase()} questa settimana. La raccomandazione è di ${limits[category].min}-${limits[category].max} volte a settimana.</p>`;
    }
  }
  
  document.getElementById('suggestion-body').innerHTML = `
    <p>In base alla tua selezione per il pranzo, ti suggeriamo di aggiungere <strong>${categoryName}</strong> per la ${mealTypeText} di ${day}.</p>
    ${additionalInfo}
    <p>Questo abbinamento segue le linee guida per un'alimentazione bilanciata.</p>
  `;
  
  // Aggiorna i pulsanti
  const ignoreButton = document.getElementById('ignore-suggestion');
  const applyButton = document.getElementById('apply-suggestion');
  
  ignoreButton.onclick = () => {
    modal.style.display = 'none';
  };
  
  applyButton.onclick = () => {
    // Apre il modale di selezione cibo con la categoria suggerita
    modal.style.display = 'none';
    openFoodSelectionModal(day, mealType, category);
  };
  
  // Mostra il modale
  modal.style.display = 'flex';
}

function displayWeeklySuggestions(suggestions) {
  // Crea un elemento per mostrare i suggerimenti settimanali
  let suggestionBox = document.getElementById('weekly-suggestions');
  
  if (!suggestionBox) {
    suggestionBox = document.createElement('div');
    suggestionBox.id = 'weekly-suggestions';
    suggestionBox.className = 'nutrition-card';
    suggestionBox.style.marginTop = '1rem';
    suggestionBox.style.backgroundColor = '#f1f8e9';
    suggestionBox.style.borderLeft = '4px solid #8bc34a';
    
    // Inserisci il box dopo il piano pasti
    const mealPlanContainer = document.querySelector('.meal-plan-container');
    mealPlanContainer.parentNode.insertBefore(suggestionBox, mealPlanContainer.nextSibling);
  }
  
  let html = '<h3>Suggerimenti per la settimana</h3>';
  html += '<p>Per un piano alimentare bilanciato, considera queste raccomandazioni:</p>';
  html += '<ul style="margin-left: 1.5rem;">';
  
  Object.keys(suggestions).forEach(category => {
    const suggestion = suggestions[category];
    const categoryName = categoryNames[category];
    
    if (suggestion.action === 'increase') {
      html += `<li>Aumenta il consumo di <strong>${categoryName}</strong>: attualmente ${suggestion.current} pasti, raccomandati almeno ${suggestion.target}</li>`;
    } else if (suggestion.action === 'decrease') {
      html += `<li>Riduci il consumo di <strong>${categoryName}</strong>: attualmente ${suggestion.current} pasti, raccomandati massimo ${suggestion.target}</li>`;
    }
  });
  
  html += '</ul>';
  suggestionBox.innerHTML = html;
}

// ============================
// GESTIONE RIEPILOGO NUTRIZIONALE
// ============================
function initializeNutritionSummary() {
  // Aggiorna il riepilogo nutrizionale iniziale
  updateNutritionSummary();
}

function updateNutritionSummary() {
  const mealPlan = loadFromLocalStorage('mealPlan', {});
  const profiles = loadFromLocalStorage('userProfiles', []);
  const selectedProfileId = loadFromLocalStorage('selectedProfileId', null);
  
  // Ottiene il profilo selezionato
  const selectedProfile = selectedProfileId ? profiles.find(p => p.id === selectedProfileId) : null;
  
  // Calcola i valori nutrizionali totali
  const nutritionData = calculateNutritionData(mealPlan);
  
  // Aggiorna il riepilogo settimanale
  updateWeeklyOverview(nutritionData, selectedProfile);
  
  // Aggiorna il dettaglio giornaliero
  updateDailyBreakdown(nutritionData);
}

function calculateNutritionData(mealPlan) {
  const daysOfWeek = Object.keys(mealPlan);
  const dailyData = {};
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  daysOfWeek.forEach(day => {
    const dayData = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      meals: {
        breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        lunch: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        dinner: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        snacks: { calories: 0, protein: 0, carbs: 0, fat: 0 }
      }
    };
    
    // Calcola i valori per tutti i pasti
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
      if (mealPlan[day][mealType]) { // Verifica che il pasto esista
        mealPlan[day][mealType].forEach(meal => {
          dayData.meals[mealType].calories += meal.calories;
          dayData.meals[mealType].protein += meal.protein;
          dayData.meals[mealType].carbs += meal.carbs;
          dayData.meals[mealType].fat += meal.fat;
        });
        
        // Aggiorna i totali giornalieri
        dayData.calories += dayData.meals[mealType].calories;
        dayData.protein += dayData.meals[mealType].protein;
        dayData.carbs += dayData.meals[mealType].carbs;
        dayData.fat += dayData.meals[mealType].fat;
      }
    });
    
    // Aggiorna i totali settimanali
    totalCalories += dayData.calories;
    totalProtein += dayData.protein;
    totalCarbs += dayData.carbs;
    totalFat += dayData.fat;
    
    // Salva i dati del giorno
    dailyData[day] = dayData;
  });
  
  return {
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    dailyData
  };
}

function updateWeeklyOverview(nutritionData, selectedProfile) {
  // Aggiorna le calorie totali
  document.getElementById('total-calories').textContent = `${Math.round(nutritionData.totalCalories)} kcal`;
  
  // Aggiorna la media giornaliera
  const daysCount = Object.keys(nutritionData.dailyData).length;
  const dailyAverage = daysCount > 0 ? Math.round(nutritionData.totalCalories / daysCount) : 0;
  document.getElementById('daily-average').textContent = `Media giornaliera: ${dailyAverage} kcal`;
  
  // Aggiorna il confronto con il fabbisogno se c'è un profilo selezionato
  const targetComparison = document.getElementById('target-comparison');
  if (selectedProfile) {
    const caloriePercentage = Math.round((dailyAverage / selectedProfile.dailyCalories) * 100);
    document.getElementById('percentage-fill').style.width = `${Math.min(caloriePercentage, 100)}%`;
    document.getElementById('percentage-label').textContent = `${caloriePercentage}% del fabbisogno giornaliero`;
    targetComparison.style.display = 'block';
  } else {
    targetComparison.style.display = 'none';
  }
  
  // Aggiorna la distribuzione dei macronutrienti
  document.getElementById('carbs-amount').textContent = `${Math.round(nutritionData.totalCarbs)}g`;
  document.getElementById('protein-amount').textContent = `${Math.round(nutritionData.totalProtein)}g`;
  document.getElementById('fat-amount').textContent = `${Math.round(nutritionData.totalFat)}g`;
  
  // Calcola le percentuali dei macronutrienti
  const totalKcal = nutritionData.totalCalories;
  const carbsPercentage = totalKcal > 0 ? Math.round((nutritionData.totalCarbs * 4 / totalKcal) * 100) : 0;
  const proteinPercentage = totalKcal > 0 ? Math.round((nutritionData.totalProtein * 4 / totalKcal) * 100) : 0;
  const fatPercentage = totalKcal > 0 ? Math.round((nutritionData.totalFat * 9 / totalKcal) * 100) : 0;
  
  document.getElementById('carbs-percentage').textContent = `${carbsPercentage}%`;
  document.getElementById('protein-percentage').textContent = `${proteinPercentage}%`;
  document.getElementById('fat-percentage').textContent = `${fatPercentage}%`;
  
  // Aggiorna il grafico a torta
  updateMacrosChart(carbsPercentage, proteinPercentage, fatPercentage);
}

function updateMacrosChart(carbsPercentage, proteinPercentage, fatPercentage) {
  const ctx = document.getElementById('macros-chart').getContext('2d');
  
  // Distrugge il grafico esistente se presente
  if (window.macrosChart) {
    window.macrosChart.destroy();
  }
  
  // Crea un nuovo grafico
  window.macrosChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Carboidrati', 'Proteine', 'Grassi'],
      datasets: [{
        data: [carbsPercentage, proteinPercentage, fatPercentage],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)', // Blu per carboidrati
          'rgba(75, 192, 192, 0.6)', // Verde acqua per proteine
          'rgba(255, 159, 64, 0.6)', // Arancione per grassi
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function updateDailyBreakdown(nutritionData) {
  const daysGrid = document.getElementById('days-grid');
  const daysOfWeek = Object.keys(nutritionData.dailyData);
  
  let html = '';
  
  daysOfWeek.forEach(day => {
    const dayData = nutritionData.dailyData[day];
    
    html += `
      <div class="day-card">
        <h4>${day}</h4>
        <div class="day-total">
          Totale: ${Math.round(dayData.calories)} kcal
        </div>
        <div class="day-macros">
          <div class="macro-pill">C: ${Math.round(dayData.carbs)}g</div>
          <div class="macro-pill">P: ${Math.round(dayData.protein)}g</div>
          <div class="macro-pill">G: ${Math.round(dayData.fat)}g</div>
        </div>
        
        <div class="meals-summary">
          <div class="meal-row">
            <div class="meal-type">Colazione</div>
            <div class="meal-calories">
              ${Math.round(dayData.meals.breakfast?.calories || 0)} kcal
            </div>
          </div>
          <div class="meal-row">
            <div class="meal-type">Pranzo</div>
            <div class="meal-calories">
              ${Math.round(dayData.meals.lunch?.calories || 0)} kcal
            </div>
          </div>
          <div class="meal-row">
            <div class="meal-type">Cena</div>
            <div class="meal-calories">
              ${Math.round(dayData.meals.dinner?.calories || 0)} kcal
            </div>
          </div>
          <div class="meal-row">
            <div class="meal-type">Spuntini</div>
            <div class="meal-calories">
              ${Math.round(dayData.meals.snacks?.calories || 0)} kcal
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  daysGrid.innerHTML = html;
}
// ============================
// GESTIONE ESPORTAZIONE/IMPORTAZIONE
// ============================

// Inizializza le funzionalità di esportazione/importazione
document.addEventListener('DOMContentLoaded', function() {
  // Inizializza esportazione/importazione database alimenti
  initializeFoodExportImport();
  
  // Inizializza esportazione/importazione piano pasti
  initializeDietExportImport();
  
  // Inizializza gestione diete salvate
  initializeSavedDiets();
});

// Funzioni per esportazione/importazione database alimenti
function initializeFoodExportImport() {
  // Bottone esporta database
  document.getElementById('export-foods-button')?.addEventListener('click', function() {
    exportFoodDatabase();
  });
  
  // Input importa database
  document.getElementById('import-foods-input')?.addEventListener('change', function(event) {
    importFoodDatabase(event);
  });
}

function exportFoodDatabase() {
  // Carica il database personalizzato
  const customFoods = loadFromLocalStorage('customFoods', {});
  
  // Crea un oggetto contenente la data di esportazione e i dati
  const exportData = {
    type: 'food_database',
    date: new Date().toISOString(),
    data: customFoods
  };
  
  // Converte in JSON e crea URL per il download
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Crea un link di download e lo attiva
  const a = document.createElement('a');
  a.href = url;
  a.download = `alimenti_personalizzati_${formatDate(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFoodDatabase(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      // Verifica la validità del file importato
      if (importedData.type !== 'food_database' || !importedData.data) {
        throw new Error('Formato file non valido');
      }
      
      // Chiede conferma all'utente
      if (confirm('Importare il database? Sovrascriverà eventuali alimenti personalizzati esistenti con lo stesso ID.')) {
        // Carica il database attuale
        const currentCustomFoods = loadFromLocalStorage('customFoods', {});
        
        // Fonde i database
        const mergedFoods = { ...currentCustomFoods };
        
        // Per ogni categoria nel database importato
        Object.keys(importedData.data).forEach(category => {
          if (!mergedFoods[category]) {
            mergedFoods[category] = [];
          }
          
          // Aggiunge o sostituisce gli alimenti
          importedData.data[category].forEach(importedFood => {
            // Controlla se l'alimento esiste già
            const existingIndex = mergedFoods[category].findIndex(food => food.id === importedFood.id);
            
            if (existingIndex >= 0) {
              // Sostituisce l'alimento esistente
              mergedFoods[category][existingIndex] = importedFood;
            } else {
              // Aggiunge il nuovo alimento
              mergedFoods[category].push(importedFood);
            }
          });
        });
        
        // Salva il database aggiornato
        saveToLocalStorage('customFoods', mergedFoods);
        
        // Aggiorna la visualizzazione
        const currentCategory = document.getElementById('food-category').value;
        showFoodsForCategory(currentCategory, mergedFoods);
        
        alert('Database importato con successo!');
      }
    } catch (error) {
      alert('Errore durante l\'importazione: ' + error.message);
    }
    
    // Reset del campo file
    event.target.value = '';
  };
  
  reader.readAsText(file);
}

// Funzioni per esportazione/importazione piano pasti
function initializeDietExportImport() {
  // Bottone esporta piano
  document.getElementById('export-diet-button')?.addEventListener('click', function() {
    exportDiet();
  });
  
  // Input importa piano
  document.getElementById('import-diet-input')?.addEventListener('change', function(event) {
    importDiet(event);
  });
}

function exportDiet() {
  // Carica il piano pasti attuale
  const mealPlan = loadFromLocalStorage('mealPlan', {});
  
  // Crea un oggetto contenente la data di esportazione e i dati
  const exportData = {
    type: 'meal_plan',
    date: new Date().toISOString(),
    data: mealPlan
  };
  
  // Converte in JSON e crea URL per il download
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Crea un link di download e lo attiva
  const a = document.createElement('a');
  a.href = url;
  a.download = `piano_alimentare_${formatDate(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importDiet(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      // Verifica la validità del file importato
      if (importedData.type !== 'meal_plan' || !importedData.data) {
        throw new Error('Formato file non valido');
      }
      
      // Chiede conferma all'utente
      if (confirm('Importare il piano alimentare? Sovrascriverà il piano corrente.')) {
        // Salva il piano importato
        saveToLocalStorage('mealPlan', importedData.data);
        
        // Aggiorna la visualizzazione
        renderMealPlan(importedData.data, Object.keys(weeklyPlanTemplate));
        
        // Aggiorna il riepilogo nutrizionale
        updateNutritionSummary();
        
        alert('Piano alimentare importato con successo!');
      }
    } catch (error) {
      alert('Errore durante l\'importazione: ' + error.message);
    }
    
    // Reset del campo file
    event.target.value = '';
  };
  
  reader.readAsText(file);
}

// Funzioni per gestione diete salvate
function initializeSavedDiets() {
  // Carica le diete salvate
  updateSavedDietsSelector();
  
  // Bottone salva dieta
  document.getElementById('save-diet-button')?.addEventListener('click', function() {
    saveDiet();
  });
  
  // Bottone carica dieta
  document.getElementById('load-diet-button')?.addEventListener('click', function() {
    loadDiet();
  });
  
  // Bottone elimina dieta
  document.getElementById('delete-diet-button')?.addEventListener('click', function() {
    deleteDiet();
  });
}

function saveDiet() {
  const dietName = document.getElementById('diet-name').value.trim();
  
  if (!dietName) {
    alert('Per favore, inserisci un nome per il piano alimentare.');
    return;
  }
  
  // Carica il piano pasti attuale e le diete salvate
  const currentMealPlan = loadFromLocalStorage('mealPlan', {});
  const savedDiets = loadFromLocalStorage('savedDiets', {});
  
  // Crea l'oggetto dieta
  const diet = {
    id: generateId(),
    name: dietName,
    date: new Date().toISOString(),
    mealPlan: currentMealPlan
  };
  
  // Aggiunge la dieta alle diete salvate
  savedDiets[diet.id] = diet;
  saveToLocalStorage('savedDiets', savedDiets);
  
  // Aggiorna il selettore delle diete
  updateSavedDietsSelector();
  
  // Svuota il campo del nome
  document.getElementById('diet-name').value = '';
  
  alert('Piano alimentare salvato con successo!');
}

function loadDiet() {
  const selectedDietId = document.getElementById('saved-diets-select').value;
  
  if (!selectedDietId) {
    alert('Per favore, seleziona un piano alimentare da caricare.');
    return;
  }
  
  // Carica le diete salvate
  const savedDiets = loadFromLocalStorage('savedDiets', {});
  
  // Verifica che la dieta esista
  if (!savedDiets[selectedDietId]) {
    alert('Piano alimentare non trovato.');
    return;
  }
  
  // Chiede conferma all'utente
  if (confirm('Caricare il piano alimentare selezionato? Sovrascriverà il piano corrente.')) {
    // Salva il piano importato
    saveToLocalStorage('mealPlan', savedDiets[selectedDietId].mealPlan);
    
    // Aggiorna la visualizzazione
    renderMealPlan(savedDiets[selectedDietId].mealPlan, Object.keys(weeklyPlanTemplate));
    
    // Aggiorna il riepilogo nutrizionale
    updateNutritionSummary();
    
    alert('Piano alimentare caricato con successo!');
  }
}

function deleteDiet() {
  const selectedDietId = document.getElementById('saved-diets-select').value;
  
  if (!selectedDietId) {
    alert('Per favore, seleziona un piano alimentare da eliminare.');
    return;
  }
  
  // Carica le diete salvate
  const savedDiets = loadFromLocalStorage('savedDiets', {});
  
  // Verifica che la dieta esista
  if (!savedDiets[selectedDietId]) {
    alert('Piano alimentare non trovato.');
    return;
  }
  
  // Chiede conferma all'utente
  if (confirm('Sei sicuro di voler eliminare questo piano alimentare? Questa azione non può essere annullata.')) {
    // Elimina la dieta
    delete savedDiets[selectedDietId];
    saveToLocalStorage('savedDiets', savedDiets);
    
    // Aggiorna il selettore delle diete
    updateSavedDietsSelector();
    
    alert('Piano alimentare eliminato con successo!');
  }
}

function updateSavedDietsSelector() {
  const savedDietsSelect = document.getElementById('saved-diets-select');
  const savedDiets = loadFromLocalStorage('savedDiets', {});
  
  // Svuota il selettore
  savedDietsSelect.innerHTML = '<option value="" selected disabled>Seleziona un piano salvato</option>';
  
  // Popola il selettore con le diete salvate
  Object.values(savedDiets).sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(diet => {
    const option = document.createElement('option');
    option.value = diet.id;
    option.textContent = `${diet.name} (${formatDateShort(new Date(diet.date))})`;
    savedDietsSelect.appendChild(option);
  });
}

// Utility per formattare le date
function formatDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function formatDateShort(date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}
