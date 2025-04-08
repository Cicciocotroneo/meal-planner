// Database di alimenti predefinito
const foodDatabase = {
  // Cereali integrali
  cerealIntegrali: [
    { 
      id: 'c1', 
      name: 'Pasta integrale al pomodoro fresco e basilico',
      calories: 320,
      protein: 12,
      carbs: 62,
      fat: 6,
      portion: '80g pasta cruda',
      category: 'cerealIntegrali'
    },
    { 
      id: 'c2', 
      name: 'Riso integrale con zucchine e curcuma',
      calories: 300,
      protein: 8,
      carbs: 60,
      fat: 5,
      portion: '70g riso crudo',
      category: 'cerealIntegrali'
    },
    { 
      id: 'c3', 
      name: 'Farro con verdure di stagione e erbe aromatiche',
      calories: 310,
      protein: 10,
      carbs: 58,
      fat: 6,
      portion: '70g farro crudo',
      category: 'cerealIntegrali'
    },
    { 
      id: 'c4', 
      name: 'Orzo con piselli e carote',
      calories: 290,
      protein: 9,
      carbs: 56,
      fat: 5,
      portion: '70g orzo crudo',
      category: 'cerealIntegrali'
    },
    { 
      id: 'c5', 
      name: 'Gnocchi di patate con salsa di pomodoro leggera',
      calories: 280,
      protein: 6,
      carbs: 55,
      fat: 4,
      portion: '150g gnocchi',
      category: 'cerealIntegrali'
    }
  ],
  
  // Carne bianca
  carneBianca: [
    { 
      id: 'cb1', 
      name: 'Petto di pollo alla griglia con limone e rosmarino',
      calories: 180,
      protein: 35,
      carbs: 0,
      fat: 4,
      portion: '120g',
      category: 'carneBianca'
    },
    { 
      id: 'cb2', 
      name: 'Tacchino al forno con erbe aromatiche',
      calories: 170,
      protein: 34,
      carbs: 0,
      fat: 3,
      portion: '120g',
      category: 'carneBianca'
    },
    { 
      id: 'cb3', 
      name: 'Scaloppine di pollo al limone',
      calories: 190,
      protein: 33,
      carbs: 2,
      fat: 6,
      portion: '120g',
      category: 'carneBianca'
    },
    { 
      id: 'cb4', 
      name: 'Straccetti di tacchino con rucola e pomodorini',
      calories: 180,
      protein: 32,
      carbs: 3,
      fat: 5,
      portion: '120g',
      category: 'carneBianca'
    },
    { 
      id: 'cb5', 
      name: 'Coniglio in umido con erbe aromatiche',
      calories: 200,
      protein: 33,
      carbs: 2,
      fat: 7,
      portion: '120g',
      category: 'carneBianca'
    }
  ],
  
  // Pesce
  pesce: [
    { 
      id: 'p1', 
      name: 'Filetto di branzino al forno con pomodorini',
      calories: 160,
      protein: 30,
      carbs: 2,
      fat: 4,
      portion: '150g',
      category: 'pesce'
    },
    { 
      id: 'p2', 
      name: 'Orata al cartoccio con erbe aromatiche',
      calories: 170,
      protein: 28,
      carbs: 0,
      fat: 6,
      portion: '150g',
      category: 'pesce'
    },
    { 
      id: 'p3', 
      name: 'Merluzzo al vapore con prezzemolo e limone',
      calories: 120,
      protein: 26,
      carbs: 0,
      fat: 1,
      portion: '150g',
      category: 'pesce'
    },
    { 
      id: 'p4', 
      name: 'Salmone al forno con aneto',
      calories: 220,
      protein: 25,
      carbs: 0,
      fat: 14,
      portion: '150g',
      category: 'pesce'
    },
    { 
      id: 'p5', 
      name: 'Trota al forno con mandorle',
      calories: 200,
      protein: 28,
      carbs: 2,
      fat: 10,
      portion: '150g',
      category: 'pesce'
    }
  ],
  
  // Legumi
  legumi: [
    { 
      id: 'l1', 
      name: 'Zuppa di lenticchie con carote e sedano',
      calories: 230,
      protein: 15,
      carbs: 40,
      fat: 2,
      portion: '70g lenticchie crude',
      category: 'legumi'
    },
    { 
      id: 'l2', 
      name: 'Hummus di ceci con crudités di verdure',
      calories: 250,
      protein: 12,
      carbs: 30,
      fat: 10,
      portion: '60g ceci crudi',
      category: 'legumi'
    },
    { 
      id: 'l3', 
      name: 'Insalata di fagioli cannellini con tonno e cipolla rossa',
      calories: 280,
      protein: 22,
      carbs: 35,
      fat: 6,
      portion: '60g fagioli crudi',
      category: 'legumi'
    },
    { 
      id: 'l4', 
      name: 'Burger di ceci e zucchine al forno',
      calories: 260,
      protein: 14,
      carbs: 35,
      fat: 8,
      portion: '1 burger (120g)',
      category: 'legumi'
    },
    { 
      id: 'l5', 
      name: 'Crema di piselli con crostini integrali',
      calories: 220,
      protein: 12,
      carbs: 38,
      fat: 3,
      portion: '70g piselli secchi',
      category: 'legumi'
    }
  ],
  
  // Uova
  uova: [
    { 
      id: 'u1', 
      name: 'Frittata al forno con zucchine e cipolla',
      calories: 220,
      protein: 16,
      carbs: 4,
      fat: 15,
      portion: '2 uova + verdure',
      category: 'uova'
    },
    { 
      id: 'u2', 
      name: 'Uova strapazzate con spinaci',
      calories: 180,
      protein: 14,
      carbs: 3,
      fat: 12,
      portion: '2 uova + spinaci',
      category: 'uova'
    },
    { 
      id: 'u3', 
      name: 'Omelette con funghi e erbe aromatiche',
      calories: 200,
      protein: 15,
      carbs: 4,
      fat: 14,
      portion: '2 uova + funghi',
      category: 'uova'
    },
    { 
      id: 'u4', 
      name: 'Uova sode in insalata con verdure miste',
      calories: 190,
      protein: 15,
      carbs: 6,
      fat: 12,
      portion: '2 uova + verdure',
      category: 'uova'
    },
    { 
      id: 'u5', 
      name: 'Frittata con asparagi',
      calories: 210,
      protein: 16,
      carbs: 5,
      fat: 14,
      portion: '2 uova + asparagi',
      category: 'uova'
    }
  ],
  
  // Formaggi
  formaggi: [
    { 
      id: 'f1', 
      name: 'Insalata caprese con mozzarella leggera',
      calories: 200,
      protein: 14,
      carbs: 4,
      fat: 15,
      portion: '80g mozzarella light + pomodori',
      category: 'formaggi'
    },
    { 
      id: 'f2', 
      name: 'Ricotta con verdure grigliate e erbe aromatiche',
      calories: 180,
      protein: 12,
      carbs: 5,
      fat: 12,
      portion: '100g ricotta + verdure',
      category: 'formaggi'
    },
    { 
      id: 'f3', 
      name: 'Primo sale con insalata mista e noci',
      calories: 230,
      protein: 16,
      carbs: 3,
      fat: 18,
      portion: '70g primo sale + insalata',
      category: 'formaggi'
    },
    { 
      id: 'f4', 
      name: 'Fiocchi di latte con pomodorini e basilico',
      calories: 160,
      protein: 18,
      carbs: 4,
      fat: 8,
      portion: '100g fiocchi di latte + pomodorini',
      category: 'formaggi'
    },
    { 
      id: 'f5', 
      name: 'Caprino fresco con verdure crude',
      calories: 190,
      protein: 13,
      carbs: 2,
      fat: 14,
      portion: '80g caprino + verdure',
      category: 'formaggi'
    }
  ],
  
  // Verdure
  verdure: [
    { 
      id: 'v1', 
      name: 'Insalata mista con carote, pomodori, sedano',
      calories: 60,
      protein: 2,
      carbs: 10,
      fat: 1,
      portion: '200g',
      category: 'verdure'
    },
    { 
      id: 'v2', 
      name: 'Verdure grigliate (zucchine, melanzane, peperoni)',
      calories: 80,
      protein: 3,
      carbs: 12,
      fat: 2,
      portion: '200g',
      category: 'verdure'
    },
    { 
      id: 'v3', 
      name: 'Spinaci saltati con aglio e limone',
      calories: 70,
      protein: 4,
      carbs: 8,
      fat: 2,
      portion: '200g',
      category: 'verdure'
    },
    { 
      id: 'v4', 
      name: 'Broccoli al vapore con limone',
      calories: 65,
      protein: 5,
      carbs: 10,
      fat: 1,
      portion: '200g',
      category: 'verdure'
    },
    { 
      id: 'v5', 
      name: 'Caponata di verdure leggera',
      calories: 100,
      protein: 2,
      carbs: 15,
      fat: 4,
      portion: '200g',
      category: 'verdure'
    }
  ],
  
  // Grassi sani
  grassiSani: [
    { 
      id: 'g1', 
      name: 'Olio extravergine d\'oliva',
      calories: 90,
      protein: 0,
      carbs: 0,
      fat: 10,
      portion: '1 cucchiaio (10g)',
      category: 'grassiSani'
    },
    { 
      id: 'g2', 
      name: 'Avocado a fette',
      calories: 80,
      protein: 1,
      carbs: 4,
      fat: 7,
      portion: '1/4 avocado (50g)',
      category: 'grassiSani'
    },
    { 
      id: 'g3', 
      name: 'Noci tritate',
      calories: 90,
      protein: 2,
      carbs: 2,
      fat: 9,
      portion: '15g (circa 3-4 noci)',
      category: 'grassiSani'
    },
    { 
      id: 'g4', 
      name: 'Mandorle',
      calories: 85,
      protein: 3,
      carbs: 3,
      fat: 7,
      portion: '15g (circa 10 mandorle)',
      category: 'grassiSani'
    },
    { 
      id: 'g5', 
      name: 'Semi di lino macinati',
      calories: 55,
      protein: 2,
      carbs: 3,
      fat: 4,
      portion: '10g',
      category: 'grassiSani'
    }
  ]

// Aggiungi prima della chiusura dell'oggetto foodDatabase
colazione: [
  { 
    id: 'col1', 
    name: 'Yogurt greco con miele e frutta secca',
    calories: 220,
    protein: 15,
    carbs: 20,
    fat: 10,
    portion: '150g yogurt + 10g miele + 15g frutta secca',
    category: 'colazione'
  },
  { 
    id: 'col2', 
    name: 'Fette biscottate integrali con marmellata',
    calories: 180,
    protein: 4,
    carbs: 35,
    fat: 3,
    portion: '3 fette biscottate + 20g marmellata',
    category: 'colazione'
  },
  { 
    id: 'col3', 
    name: 'Porridge di avena con frutta fresca',
    calories: 250,
    protein: 8,
    carbs: 40,
    fat: 6,
    portion: '50g fiocchi d\'avena + 150ml latte + frutta',
    category: 'colazione'
  },
  { 
    id: 'col4', 
    name: 'Frutta fresca con frutta secca',
    calories: 150,
    protein: 3,
    carbs: 25,
    fat: 5,
    portion: '200g frutta fresca + 15g frutta secca',
    category: 'colazione'
  },
  { 
    id: 'col5', 
    name: 'Tè verde con biscotti integrali',
    calories: 120,
    protein: 2,
    carbs: 22,
    fat: 3,
    portion: '3 biscotti integrali + tè',
    category: 'colazione'
  }
],
spuntini: [
  { 
    id: 'sp1', 
    name: 'Frutta fresca di stagione',
    calories: 80,
    protein: 1,
    carbs: 20,
    fat: 0,
    portion: '1 frutto medio',
    category: 'spuntini'
  },
  { 
    id: 'sp2', 
    name: 'Yogurt naturale',
    calories: 100,
    protein: 10,
    carbs: 8,
    fat: 2,
    portion: '125g',
    category: 'spuntini'
  },
  { 
    id: 'sp3', 
    name: 'Frutta secca mista',
    calories: 170,
    protein: 5,
    carbs: 7,
    fat: 14,
    portion: '30g',
    category: 'spuntini'
  },
  { 
    id: 'sp4', 
    name: 'Barretta di cereali',
    calories: 120,
    protein: 3,
    carbs: 20,
    fat: 4,
    portion: '1 barretta (30g)',
    category: 'spuntini'
  },
  { 
    id: 'sp5', 
    name: 'Gallette di riso con formaggio spalmabile light',
    calories: 90,
    protein: 4,
    carbs: 15,
    fat: 2,
    portion: '2 gallette + 10g formaggio',
    category: 'spuntini'
  }
]

};

// Sostituisci l'oggetto categoryNames esistente con questo
const categoryNames = {
  cerealIntegrali: 'Cereali Integrali',
  carneBianca: 'Carne Bianca',
  pesce: 'Pesce',
  legumi: 'Legumi',
  uova: 'Uova',
  formaggi: 'Formaggi',
  verdure: 'Verdure',
  grassiSani: 'Grassi Sani',
  colazione: 'Colazione',
  spuntini: 'Spuntini'
};

// Linee guida per la pianificazione settimanale
const weeklyPlanTemplate = {
  'Lunedì': {
    lunch: { type: 'cerealIntegrali+legumi' },
    dinner: { type: 'pesce+verdure' }
  },
  'Martedì': {
    lunch: { type: 'carneBianca+verdure' },
    dinner: { type: 'cerealIntegrali+legumi' }
  },
  'Mercoledì': {
    lunch: { type: 'cerealIntegrali+formaggi' },
    dinner: { type: 'legumi+verdure' }
  },
  'Giovedì': {
    lunch: { type: 'pesce+verdure' },
    dinner: { type: 'cerealIntegrali+uova' }
  },
  'Venerdì': {
    lunch: { type: 'cerealIntegrali+legumi' },
    dinner: { type: 'carneBianca+verdure' }
  },
  'Sabato': {
    lunch: { type: 'formaggi+verdure' },
    dinner: { type: 'libero' }
  },
  'Domenica': {
    lunch: { type: 'cerealIntegrali+uova' },
    dinner: { type: 'carneBianca+verdure' }
  }
};

// Fattori di attività fisica per il calcolo del fabbisogno calorico
const activityFactors = {
  sedentary: { factor: 1.2, description: 'Attività minima o nulla (lavoro sedentario, no esercizio)' },
  lightlyActive: { factor: 1.375, description: 'Attività leggera (1-3 giorni di esercizio/settimana)' },
  moderatelyActive: { factor: 1.55, description: 'Attività moderata (3-5 giorni di esercizio/settimana)' },
  veryActive: { factor: 1.725, description: 'Attività intensa (6-7 giorni di esercizio/settimana)' },
  extraActive: { factor: 1.9, description: 'Attività molto intensa (atleti, 2 allenamenti/giorno)' }
};

// Obiettivi calorici
const calorieGoals = {
  maintenance: { factor: 1.0, description: 'Mantenimento del peso attuale' },
  mildWeightLoss: { factor: 0.9, description: 'Dimagrimento leggero (circa 0.25-0.5 kg/settimana)' },
  moderateWeightLoss: { factor: 0.8, description: 'Dimagrimento moderato (circa 0.5-1 kg/settimana)' },
  mildWeightGain: { factor: 1.1, description: 'Aumento di peso leggero' }
};
