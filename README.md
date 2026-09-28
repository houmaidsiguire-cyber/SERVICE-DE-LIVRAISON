# 🛵 LIVREUR FASO - Suivi des Livraisons à Ouagadougou

Application web mobile-first et **PWA 100% hors-ligne**, spécialement conçue pour un **livreur indépendant à moto à Ouagadougou (Burkina Faso)** afin de suivre et gérer facilement ses courses quotidiennes et ses bénéfices nets.

---

## 🌟 Points Forts & Contexte
- ☀️ **Mode Plein Soleil** : Interface à très fort contraste (noir et blanc pur, bordures épaisses, grands caractères) pour une lisibilité parfaite en plein soleil au guidon de la moto.
- 📴 **100% Hors-Ligne (PWA)** : Toutes les données sont enregistrées directement dans la mémoire du téléphone (`localStorage`). Aucune connexion internet n'est nécessaire pour travailler.
- 💰 **Monnaie en FCFA** : Chiffres clairs, grands boutons tactiles (> 50px de haut) manipulables à une main ou avec des gants.
- 📍 **Quartiers de Ouagadougou intégrés** : Suggestion automatique des quartiers (*Patte d'Oie, Ouaga 2000, Gounghin, Somgandé, Tampouy, Karpala, Dassasgho, Saaba, 1200 Logements, etc.*).
- ⚡ **Calcul en direct du Bénéfice Net** :
  $$\text{Bénéfice Net} = \text{Montant reçu} - \text{Carburant} - \text{Autres frais}$$

---

## 📋 Fonctionnalités Actuelles

### 1. Formulaire d'ajout rapide (➕)
* Date du jour sélectionnée par défaut.
* Nom et contact du client.
* Quartier de départ et quartier d'arrivée.
* Montant reçu, carburant et autres frais (crevaison, gonflage, etc.).
* Sélection du mode de paiement : **Espèces 💵**, **Orange Money 🟠**, **Moov Money 🔵**, **Autre ⚪**.
* Affichage instantané du bénéfice net pendant la saisie.

### 2. Liste des courses (📋)
* Classement automatique de la plus récente à la plus ancienne.
* Résumé rapide du total des courses et du bénéfice net cumulé.
* Filtres rapides : *Toutes, Aujourd'hui, Cette semaine, Ce mois*.
* Recherche dynamique par client ou par quartier.
* Boutons d'action **✏️ Modifier** et **🗑️ Supprimer** (avec boîte de confirmation sécurisée).

---

## 🛠️ Structure du Projet

```text
├── index.html            # Structure HTML sémantique et accessible
├── style.css             # Design épuré, responsive mobile et mode Plein Soleil
├── app.js                # Logique métier, calculs FCFA et stockage local
├── manifest.json         # Manifeste PWA pour installation sur smartphone
├── sw.js                 # Service Worker pour le cache hors-ligne
├── icon.jpg              # Icône officielle de l'application
├── server.ps1            # Serveur local léger sans dépendance externe
├── demarrer_serveur.bat  # Lanceur 1-clic pour Windows
└── README.md             # Documentation du projet
```

---

## 🚀 Démarrage Rapide

### Sur Ordinateur :
- Double-cliquez simplement sur **`demarrer_serveur.bat`** (ou ouvrez directement `index.html` dans Chrome/Edge).
- L'application s'ouvre sur **`http://localhost:8080`**.

### Sur Téléphone (Android / iPhone) :
1. Ouvrez le lien de l'application dans votre navigateur mobile (Chrome ou Safari).
2. Touchez le menu du navigateur (les 3 points ou le bouton Partager).
3. Choisissez **"Ajouter à l'écran d'accueil"** ou **"Installer l'application"**.
4. L'icône de l'application apparaîtra sur votre écran et fonctionnera même sans connexion internet !

---

*Développé pour les livreurs de Ouagadougou 🇧🇫*
