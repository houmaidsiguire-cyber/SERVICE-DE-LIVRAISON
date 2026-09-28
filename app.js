/**
 * ====================================================================
 * LIVREUR FASO - CODE JAVASCRIPT PRINCIPAL
 * Conçu simplement pour être lisible, facile à modifier et 100% hors-ligne.
 * ====================================================================
 */

// Clé de stockage dans le téléphone (localStorage)
const STORAGE_KEY = 'livreur_faso_courses';
const SUNLIGHT_KEY = 'livreur_faso_sunlight';

// État global de l'application
let courses = [];
let activeFilter = 'all'; // 'all', 'today', 'week', 'month'
let searchQuery = '';
let courseIdToDelete = null;

// ====================================================================
// INITIALISATION DE L'APPLICATION AU CHARGEMENT DE LA PAGE
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
  initSunlightMode();
  loadCourses();
  initEventListeners();
  initDefaultDate();
  updateLiveNetProfit();
  renderCourses();
  registerServiceWorker();
});

// ====================================================================
// 1. CHARGEMENT ET SAUVEGARDE DES COURSES DANS LE TÉLÉPHONE
// ====================================================================

/**
 * Charge les courses sauvegardées dans la mémoire locale du téléphone.
 * Si c'est la toute première fois, on ajoute 2 exemples concrets à Ouaga.
 */
function loadCourses() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      courses = JSON.parse(saved);
    } catch (e) {
      console.error('Erreur lecture données:', e);
      courses = [];
    }
  } else {
    // Exemples initiaux pour tester immédiatement à Ouagadougou
    const todayStr = getTodayDateString();
    courses = [
      {
        id: 'course_demo_1',
        date: todayStr,
        client: 'Boutique FASO SHOP (70 12 34 56)',
        depart: 'Patte d\'Oie',
        arrivee: 'Ouaga 2000',
        montant: 3000,
        carburant: 500,
        autresFrais: 0,
        modePaiement: 'Orange Money',
        beneficeNet: 2500,
        createdAt: new Date().toISOString()
      },
      {
        id: 'course_demo_2',
        date: todayStr,
        client: 'M. Ouedraogo (Colis express)',
        depart: 'Gounghin',
        arrivee: 'Somgandé',
        montant: 2500,
        carburant: 600,
        autresFrais: 100,
        modePaiement: 'Espèces',
        beneficeNet: 1800,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    saveCourses();
  }
}

/**
 * Enregistre toutes les courses dans le localStorage (accessible sans internet).
 */
function saveCourses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  updateBadgesAndSummary();
}

// ====================================================================
// 2. GESTION DES DATES & CALCUL DU BÉNÉFICE NET
// ====================================================================

/**
 * Retourne la date d'aujourd'hui au format AAAA-MM-JJ (pour le champ input date)
 */
function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Initialise le champ date sur la date du jour par défaut
 */
function initDefaultDate() {
  const dateInput = document.getElementById('courseDate');
  if (dateInput && !dateInput.value) {
    dateInput.value = getTodayDateString();
  }
}

/**
 * Calcule et affiche en direct le Bénéfice Net pendant que l'utilisateur tape :
 * Bénéfice net = Montant reçu - Carburant - Autres frais
 */
function updateLiveNetProfit() {
  const montantInput = document.getElementById('courseMontant');
  const carburantInput = document.getElementById('courseCarburant');
  const autresFraisInput = document.getElementById('courseAutresFrais');

  const montant = parseFloat(montantInput.value) || 0;
  const carburant = parseFloat(carburantInput.value) || 0;
  const autresFrais = parseFloat(autresFraisInput.value) || 0;

  const benefice = montant - carburant - autresFrais;

  // Mise à jour de l'affichage dans le formulaire
  document.getElementById('formulaMontant').textContent = formatFCFA(montant);
  document.getElementById('formulaCarburant').textContent = formatFCFA(carburant);
  document.getElementById('formulaFrais').textContent = formatFCFA(autresFrais);

  const displayEl = document.getElementById('liveNetProfitValue');
  displayEl.textContent = formatFCFA(benefice);

  // Changement visuel si bénéfice négatif (alerte perte)
  const boxEl = document.getElementById('netProfitBox');
  if (benefice < 0) {
    boxEl.style.borderColor = 'var(--accent-red)';
    displayEl.style.color = '#FCA5A5';
  } else {
    boxEl.style.borderColor = 'var(--accent-green)';
    displayEl.style.color = '#FFFFFF';
  }
}

/**
 * Formate un nombre proprement avec des espaces (ex: 3 500)
 */
function formatFCFA(num) {
  return Math.round(num).toLocaleString('fr-FR');
}

/**
 * Formate une date AAAA-MM-JJ en texte français lisible (ex: Lun. 28 Sept 2026)
 */
function formatDateFr(dateStr) {
  if (!dateStr) return '';
  const todayStr = getTodayDateString();
  if (dateStr === todayStr) {
    return 'Aujourd\'hui';
  }
  try {
    const parts = dateStr.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    return dateObj.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

// ====================================================================
// 3. AFFICHAGE DE LA LISTE DES COURSES
// ====================================================================

function renderCourses() {
  const container = document.getElementById('coursesListContainer');
  const emptyState = document.getElementById('emptyState');

  // Filtrage selon l'onglet actif et la recherche
  let filtered = [...courses];

  // 1. Filtre par période (Toutes, Aujourd'hui, Cette semaine, Ce mois)
  const todayStr = getTodayDateString();
  if (activeFilter === 'today') {
    filtered = filtered.filter(c => c.date === todayStr);
  } else if (activeFilter === 'week') {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7; // 1 = lundi, 7 = dimanche
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);
    const mondayStr = monday.toISOString().split('T')[0];
    filtered = filtered.filter(c => c.date >= mondayStr && c.date <= todayStr);
  } else if (activeFilter === 'month') {
    const currentMonthPrefix = todayStr.substring(0, 7); // "2026-09"
    filtered = filtered.filter(c => c.date && c.date.startsWith(currentMonthPrefix));
  }

  // 2. Filtre par recherche textuelle (client ou quartier)
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(c => 
      (c.client && c.client.toLowerCase().includes(q)) ||
      (c.depart && c.depart.toLowerCase().includes(q)) ||
      (c.arrivee && c.arrivee.toLowerCase().includes(q)) ||
      (c.modePaiement && c.modePaiement.toLowerCase().includes(q))
    );
  }

  // 3. Tri : Les courses les plus récentes en premier
  filtered.sort((a, b) => {
    if (b.date !== a.date) {
      return b.date.localeCompare(a.date);
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  // Affichage vide ou rempli
  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    container.innerHTML = filtered.map(course => createCourseCardHTML(course)).join('');
  }

  updateBadgesAndSummary();
}

/**
 * Génère le code HTML d'une carte de course
 */
function createCourseCardHTML(course) {
  const benefice = course.beneficeNet ?? (course.montant - course.carburant - course.autresFrais);
  const totalFrais = (course.carburant || 0) + (course.autresFrais || 0);

  // Badge du mode de paiement
  let badgeClass = 'badge-autre';
  let badgeIcon = '⚪';
  if (course.modePaiement === 'Orange Money') {
    badgeClass = 'badge-orange';
    badgeIcon = '🟠';
  } else if (course.modePaiement === 'Moov Money') {
    badgeClass = 'badge-moov';
    badgeIcon = '🔵';
  } else if (course.modePaiement === 'Espèces') {
    badgeClass = 'badge-especes';
    badgeIcon = '💵';
  }

  return `
    <article class="course-card" data-id="${course.id}">
      <div class="course-card-header">
        <div class="course-date-box">
          <span>📅</span>
          <span>${formatDateFr(course.date)}</span>
        </div>
        <span class="course-payment-badge ${badgeClass}">
          <span>${badgeIcon}</span>
          <span>${escapeHTML(course.modePaiement || 'Espèces')}</span>
        </span>
      </div>

      <div class="course-client-name">
        <span>👤</span>
        <span>${escapeHTML(course.client)}</span>
      </div>

      <div class="itinerary-row">
        <span>📍 ${escapeHTML(course.depart)}</span>
        <span class="itinerary-arrow">➔</span>
        <span>🏁 ${escapeHTML(course.arrivee)}</span>
      </div>

      <div class="course-finance-row">
        <div class="finance-col">
          <span class="finance-label">Reçu</span>
          <span class="finance-amount">${formatFCFA(course.montant)} F</span>
        </div>

        <div class="finance-col">
          <span class="finance-label">Frais (Essence+)</span>
          <span class="finance-amount" style="color: var(--accent-red);">${formatFCFA(totalFrais)} F</span>
        </div>

        <div class="finance-col net-profit-badge">
          <span class="finance-label">Bénéfice Net</span>
          <span class="finance-amount">+${formatFCFA(benefice)} F</span>
        </div>
      </div>

      <div class="course-card-actions">
        <button class="btn-card-action btn-edit" onclick="editCourse('${course.id}')" title="Modifier cette course">
          ✏️ Modifier
        </button>
        <button class="btn-card-action btn-delete" onclick="askDeleteCourse('${course.id}')" title="Supprimer cette course">
          🗑️ Supprimer
        </button>
      </div>
    </article>
  `;
}

/**
 * Met à jour le compteur dans l'onglet et le bandeau de résumé rapide
 */
function updateBadgesAndSummary() {
  const countBadge = document.getElementById('coursesBadgeCount');
  if (countBadge) {
    countBadge.textContent = courses.length;
  }

  // Calcul du résumé du jour ou total
  const todayStr = getTodayDateString();
  const todayCourses = courses.filter(c => c.date === todayStr);

  const totalCoursesEl = document.getElementById('summaryTotalCourses');
  const totalNetEl = document.getElementById('summaryTotalNet');

  // Si le filtre actif est 'today', on montre les chiffres du jour, sinon le total
  let targetSet = courses;
  if (activeFilter === 'today') {
    targetSet = todayCourses;
  }

  const sumNet = targetSet.reduce((acc, c) => {
    const net = c.beneficeNet ?? (c.montant - (c.carburant || 0) - (c.autresFrais || 0));
    return acc + net;
  }, 0);

  if (totalCoursesEl) {
    totalCoursesEl.textContent = targetSet.length;
  }
  if (totalNetEl) {
    totalNetEl.textContent = `${formatFCFA(sumNet)} FCFA`;
  }
}

// ====================================================================
// 4. FORMULAIRE : AJOUT ET MODIFICATION D'UNE COURSE
// ====================================================================

function handleFormSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById('editCourseId').value;
  const date = document.getElementById('courseDate').value;
  const client = document.getElementById('courseClient').value.trim();
  const depart = document.getElementById('courseDepart').value.trim();
  const arrivee = document.getElementById('courseArrivee').value.trim();
  const montant = parseFloat(document.getElementById('courseMontant').value) || 0;
  const carburant = parseFloat(document.getElementById('courseCarburant').value) || 0;
  const autresFrais = parseFloat(document.getElementById('courseAutresFrais').value) || 0;

  // Mode de paiement sélectionné
  const paymentRadio = document.querySelector('input[name="paymentMode"]:checked');
  const modePaiement = paymentRadio ? paymentRadio.value : 'Espèces';

  // Validation simple des champs obligatoires
  if (!date || !client || !depart || !arrivee || montant <= 0) {
    showToast('⚠️ Veuillez remplir la date, le client, les quartiers et le montant reçu !');
    return;
  }

  const beneficeNet = montant - carburant - autresFrais;

  if (editId) {
    // MODIFICATION D'UNE COURSE EXISTANTE
    const index = courses.findIndex(c => c.id === editId);
    if (index !== -1) {
      courses[index] = {
        ...courses[index],
        date,
        client,
        depart,
        arrivee,
        montant,
        carburant,
        autresFrais,
        modePaiement,
        beneficeNet,
        updatedAt: new Date().toISOString()
      };
      showToast('✅ Course mise à jour avec succès !');
    }
  } else {
    // AJOUT D'UNE NOUVELLE COURSE
    const newCourse = {
      id: 'course_' + Date.now(),
      date,
      client,
      depart,
      arrivee,
      montant,
      carburant,
      autresFrais,
      modePaiement,
      beneficeNet,
      createdAt: new Date().toISOString()
    };
    courses.unshift(newCourse);
    showToast('✅ Course enregistrée avec succès ! (+ ' + formatFCFA(beneficeNet) + ' FCFA)');
  }

  saveCourses();
  resetCourseForm();
  switchTab('viewCourses');
  renderCourses();
}

/**
 * Charge une course dans le formulaire pour la modifier
 */
window.editCourse = function(courseId) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return;

  document.getElementById('editCourseId').value = course.id;
  document.getElementById('courseDate').value = course.date;
  document.getElementById('courseClient').value = course.client;
  document.getElementById('courseDepart').value = course.depart;
  document.getElementById('courseArrivee').value = course.arrivee;
  document.getElementById('courseMontant').value = course.montant;
  document.getElementById('courseCarburant').value = course.carburant;
  document.getElementById('courseAutresFrais').value = course.autresFrais;

  // Sélection du mode de paiement
  const radio = document.querySelector(`input[name="paymentMode"][value="${course.modePaiement}"]`);
  if (radio) {
    radio.checked = true;
  }

  // Changement de texte de l'en-tête et du bouton
  document.getElementById('formTitle').textContent = '✏️ Modifier la course';
  document.getElementById('btnSaveText').textContent = 'Enregistrer les modifications';
  document.getElementById('btnCancelEdit').hidden = false;

  updateLiveNetProfit();
  switchTab('viewNewCourse');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Réinitialise le formulaire à son état par défaut
 */
function resetCourseForm() {
  document.getElementById('courseForm').reset();
  document.getElementById('editCourseId').value = '';
  document.getElementById('courseCarburant').value = '0';
  document.getElementById('courseAutresFrais').value = '0';
  document.getElementById('formTitle').textContent = 'Ajouter une course';
  document.getElementById('btnSaveText').textContent = 'Enregistrer la course';
  document.getElementById('btnCancelEdit').hidden = true;
  initDefaultDate();
  updateLiveNetProfit();
}

// ====================================================================
// 5. SUPPRESSION D'UNE COURSE
// ====================================================================

window.askDeleteCourse = function(courseId) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return;

  courseIdToDelete = courseId;
  const dialog = document.getElementById('deleteConfirmDialog');
  const dialogText = document.getElementById('deleteDialogText');
  dialogText.textContent = `Voulez-vous supprimer la course de ${course.client} (${formatFCFA(course.montant)} FCFA) ?`;

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    // Fallback pour anciens navigateurs
    if (confirm(`Supprimer la course de ${course.client} ?`)) {
      confirmDelete();
    }
  }
};

function confirmDelete() {
  if (!courseIdToDelete) return;
  courses = courses.filter(c => c.id !== courseIdToDelete);
  courseIdToDelete = null;

  saveCourses();
  renderCourses();

  const dialog = document.getElementById('deleteConfirmDialog');
  if (dialog && dialog.open) {
    dialog.close();
  }
  showToast('🗑️ Course supprimée');
}

// ====================================================================
// 6. GESTION DES ONGLETS & INTERFACE
// ====================================================================

function switchTab(targetViewId) {
  // Met à jour les boutons d'onglets
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    const isTarget = tab.dataset.target === targetViewId;
    tab.classList.toggle('active', isTarget);
    tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  // Affiche la bonne vue
  const views = document.querySelectorAll('.view-panel');
  views.forEach(v => {
    v.hidden = (v.id !== targetViewId);
  });

  // Masque le FAB quand on est déjà sur le formulaire d'ajout
  const fab = document.getElementById('floatingAddBtn');
  if (fab) {
    fab.hidden = (targetViewId === 'viewNewCourse');
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ====================================================================
// 7. MODE PLEIN SOLEIL (ULTRA-LISIBLE EN PLEIN JOUR À MOTO)
// ====================================================================

function initSunlightMode() {
  const isSunlight = localStorage.getItem(SUNLIGHT_KEY) === 'true';
  applySunlightTheme(isSunlight);
}

function applySunlightTheme(enabled) {
  document.body.classList.toggle('theme-sunlight', enabled);
  const toggleBtn = document.getElementById('sunlightToggleBtn');
  if (toggleBtn) {
    toggleBtn.querySelector('.sunlight-icon').textContent = enabled ? '🌙' : '☀️';
    toggleBtn.querySelector('.sunlight-text').textContent = enabled ? 'Mode Nuit' : 'Plein Soleil';
  }
  localStorage.setItem(SUNLIGHT_KEY, enabled ? 'true' : 'false');
}

// ====================================================================
// 8. ÉCOUTEURS D'ÉVÉNEMENTS
// ====================================================================

function initEventListeners() {
  // Navigation onglets
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      if (target === 'viewNewCourse') {
        // Si on clique sur "Nouvelle Course", on nettoie le formulaire
        resetCourseForm();
      }
      switchTab(target);
    });
  });

  // Bouton flottant mobile ➕
  const fab = document.getElementById('floatingAddBtn');
  if (fab) {
    fab.addEventListener('click', () => {
      resetCourseForm();
      switchTab('viewNewCourse');
    });
  }

  // Bouton d'ajout depuis l'état vide
  const btnEmptyAdd = document.getElementById('btnGoToAddFromEmpty');
  if (btnEmptyAdd) {
    btnEmptyAdd.addEventListener('click', () => {
      resetCourseForm();
      switchTab('viewNewCourse');
    });
  }

  // Soumission du formulaire
  const form = document.getElementById('courseForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Annulation modification
  const btnCancel = document.getElementById('btnCancelEdit');
  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      resetCourseForm();
      switchTab('viewCourses');
    });
  }

  // Calcul du bénéfice net en direct à la frappe
  ['courseMontant', 'courseCarburant', 'courseAutresFrais'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateLiveNetProfit);
    }
  });

  // Filtres rapides (Chips)
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      renderCourses();
    });
  });

  // Recherche dynamique
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.hidden = searchQuery.length === 0;
      }
      renderCourses();
    });
  }
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.hidden = true;
      renderCourses();
    });
  }

  // Confirmation dialogue suppression
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');
  const btnCancelDelete = document.getElementById('btnCancelDelete');
  const deleteDialog = document.getElementById('deleteConfirmDialog');
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', confirmDelete);
  }
  if (btnCancelDelete) {
    btnCancelDelete.addEventListener('click', () => {
      courseIdToDelete = null;
      if (deleteDialog && deleteDialog.open) deleteDialog.close();
    });
  }

  // Bouton bascule Plein Soleil
  const sunlightBtn = document.getElementById('sunlightToggleBtn');
  if (sunlightBtn) {
    sunlightBtn.addEventListener('click', () => {
      const isCurrentlySunlight = document.body.classList.contains('theme-sunlight');
      applySunlightTheme(!isCurrentlySunlight);
    });
  }
}

// ====================================================================
// 9. TOAST NOTIFICATION (MESSAGE FLASH)
// ====================================================================
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toastMessage');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// ====================================================================
// 10. UTILITAIRE SÉCURITÉ XSS
// ====================================================================
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ====================================================================
// 11. PROGRESSIVE WEB APP (HORS-LIGNE & INSTALLATION TÉLÉPHONE)
// ====================================================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker enregistré:', reg.scope))
        .catch(err => console.log('Service Worker échec:', err));
    });
  }
}
