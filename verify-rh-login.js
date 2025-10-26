#!/usr/bin/env node

/**
 * Script de vérification rapide du système de login RH
 * Usage: node verify-rh-login.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Vérification du système de login RH...\n');
console.log('='.repeat(60));

let allGood = true;

// Vérifier les fichiers essentiels
const files = [
  {
    path: 'frant-end/app/rh/page.tsx',
    check: 'useRouter',
    name: 'Page RH principale'
  },
  {
    path: 'frant-end/app/rh/dashboard/page.tsx',
    check: 'RHDashboard',
    name: 'Page RH dashboard'
  },
  {
    path: 'frant-end/app/login/page.tsx',
    check: 'router.push("/rh/dashboard")',
    name: 'Redirection login'
  },
  {
    path: 'frant-end/lib/api.ts',
    check: 'me: () => cachedGet<Rh>',
    name: 'API RH.me()'
  },
  {
    path: 'back-end/routes/api.php',
    check: '/rh/me',
    name: 'Route backend /rh/me'
  }
];

console.log('\n📁 Vérification des fichiers:\n');

files.forEach(file => {
  const filePath = path.join(process.cwd(), file.path);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(file.check)) {
      console.log(`   ✅ ${file.name}`);
      console.log(`      📄 ${file.path}`);
      console.log(`      🔍 Contient: "${file.check.substring(0, 40)}..."`);
    } else {
      console.log(`   ⚠️  ${file.name} - ATTENTION`);
      console.log(`      📄 ${file.path}`);
      console.log(`      ❌ Ne contient pas: "${file.check}"`);
      allGood = false;
    }
  } else {
    console.log(`   ❌ ${file.name} - FICHIER MANQUANT`);
    console.log(`      📄 ${file.path}`);
    allGood = false;
  }
  console.log('');
});

console.log('='.repeat(60));

// Vérifier la structure de sécurité
console.log('\n🔐 Vérification de la sécurité:\n');

const rhPagePath = path.join(process.cwd(), 'frant-end/app/rh/page.tsx');
if (fs.existsSync(rhPagePath)) {
  const content = fs.readFileSync(rhPagePath, 'utf8');
  
  const securityChecks = [
    { check: 'localStorage.getItem(\'authToken\')', name: 'Vérification du token' },
    { check: 'userType !== \'rh\'', name: 'Vérification du type d\'utilisateur' },
    { check: 'router.push(\'/login\')', name: 'Redirection si non authentifié' },
    { check: 'const router = useRouter()', name: 'Hook useRouter initialisé' }
  ];
  
  securityChecks.forEach(check => {
    if (content.includes(check.check)) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ${check.name} - MANQUANT`);
      allGood = false;
    }
  });
}

console.log('\n' + '='.repeat(60));

// Résultat final
if (allGood) {
  console.log('\n✅ TOUT EST BON !');
  console.log('\n🚀 Vous pouvez maintenant tester:');
  console.log('   1. npm run dev (dans frant-end/)');
  console.log('   2. php artisan serve (dans back-end/)');
  console.log('   3. Ouvrez http://localhost:3000/login');
  console.log('   4. Connectez-vous avec: othmanrayb@gmail.com / password123\n');
} else {
  console.log('\n⚠️  ATTENTION - Certains éléments manquent');
  console.log('   Veuillez vérifier les fichiers marqués avec ❌\n');
}

console.log('='.repeat(60) + '\n');

process.exit(allGood ? 0 : 1);




