// Script de test pour la récupération de mot de passe
// À exécuter dans la console du navigateur sur la page /forgot-password

// Test 1: Email valide
async function testValidEmail() {
  try {
    const response = await fetch('http://localhost:8000/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'jean.dupont@trocair.com'
      })
    });
    
    const data = await response.json();
    console.log('Test email valide:', data);
    
    if (data.reset_url) {
      console.log('URL de réinitialisation:', data.reset_url);
    }
  } catch (error) {
    console.error('Erreur test email valide:', error);
  }
}

// Test 2: Email invalide
async function testInvalidEmail() {
  try {
    const response = await fetch('http://localhost:8000/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'inexistant@example.com'
      })
    });
    
    const data = await response.json();
    console.log('Test email invalide:', data);
  } catch (error) {
    console.error('Erreur test email invalide:', error);
  }
}

// Test 3: Réinitialisation avec token
async function testResetPassword(token) {
  try {
    const response = await fetch('http://localhost:8000/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        password: 'nouveau_mot_de_passe_123'
      })
    });
    
    const data = await response.json();
    console.log('Test réinitialisation:', data);
  } catch (error) {
    console.error('Erreur test réinitialisation:', error);
  }
}

// Exécuter les tests
console.log('=== Tests de récupération de mot de passe ===');
testValidEmail();
testInvalidEmail();

// Pour tester la réinitialisation, utilisez le token retourné par testValidEmail
// testResetPassword('votre_token_ici');













