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
        lunch: [],
        dinner: []
      };
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
    html += `
      <div class="day-container">
        <div class="day-title">
          <h3>${day}</h3>
        </div>
        
        <!-- Pranzo -->
        <div class="meal-slot" data-day="${day}" data-meal-type="lunch">
          ${renderMeals(mealPlan[day].lunch, day, 'lunch')}
          <button class="add-meal-button" data-day="${day}" data-meal-type="lunch">
            + Aggiungi Pranzo
          </button>
        </div>
        
        <!-- Cena -->
        <div class="meal-slot" data-day="${day}" data-meal-type="dinner">
          ${renderMeals(mealPlan[day].dinner, day, 'dinner')}
          <button class="add-meal-button" data-day="${day}" data-meal-type="dinner">
            + Aggiungi Cena
          </button>
        </div>
      </div>
    `;
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

function openFoodSelectionModal(day, mealType) {
  const modal = document.getElementById('food-selector-modal');
  const modalTitle = document.getElementById('modal-title');
  const categoryTabs = document.getElementById('category-tabs');
  const foodList = document.getElementById('modal-food-list');
  
  // Imposta il titolo del modale
  modalTitle.textContent = `Seleziona Alimento per ${day} - ${mealType === 'lunch' ? 'Pranzo' : 'Cena'}`;
  
  // Crea le tab per le categorie
  let tabsHtml = '';
  Object.keys(categoryNames).forEach(category => {
    tabsHtml += `<button class="category-tab" data-category="${category}">${categoryNames[category]}</button>`;
  });
  categoryTabs.innerHTML = tabsHtml;
  
  // Seleziona la prima categoria per default
  const firstCategoryTab = categoryTabs.querySelector('.category-tab');
  if (firstCategoryTab) {
    firstCategoryTab.classList.add('active');
    showFoodsInModal(firstCategoryTab.getAttribute('data-category'), day, mealType);
  }
  
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
        lunch: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        dinner: { calories: 0, protein: 0, carbs: 0, fat: 0 }
      }
    };
    
    // Calcola i valori per pranzo e cena
    ['lunch', 'dinner'].forEach(mealType => {
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
            <div class="meal-type">Pranzo</div>
            <div class="meal-calories">
              ${Math.round(dayData.meals.lunch.calories)} kcal
            </div>
          </div>
          <div class="meal-row">
            <div class="meal-type">Cena</div>
            <div class="meal-calories">
              ${Math.round(dayData.meals.dinner.calories)} kcal
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  daysGrid.innerHTML = html;
}
