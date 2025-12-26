<?php

/**
 * Script pour vérifier l'installation de l'extension GD
 */

echo "🔍 Vérification de l'extension GD PHP\n";
echo "=====================================\n\n";

// Vérifier si GD est chargé
if (extension_loaded('gd')) {
    echo "✅ Extension GD est INSTALLÉE\n\n";
    
    $gdInfo = gd_info();
    echo "📋 Informations GD:\n";
    foreach ($gdInfo as $key => $value) {
        echo "   $key: " . ($value ? "✅ Oui" : "❌ Non") . "\n";
    }
    
    echo "\n✅ Vous pouvez générer des PDF avec des images de signature!\n";
} else {
    echo "❌ Extension GD n'est PAS installée\n\n";
    echo "📋 Solution pour Windows:\n";
    echo "1. Trouvez votre fichier php.ini:\n";
    $iniPath = php_ini_loaded_file();
    echo "   Fichier actuel: $iniPath\n\n";
    
    echo "2. Ouvrez php.ini dans un éditeur de texte\n";
    echo "3. Recherchez la ligne: ;extension=gd\n";
    echo "4. Supprimez le point-virgule (;) au début pour activer: extension=gd\n";
    echo "5. Si la ligne n'existe pas, ajoutez: extension=gd\n";
    echo "6. Redémarrez votre serveur web/PHP\n\n";
    
    echo "📋 Alternative (installation manuelle):\n";
    echo "1. Téléchargez php_gd2.dll pour votre version PHP\n";
    echo "2. Placez-le dans le dossier 'ext' de PHP\n";
    echo "3. Ajoutez 'extension=gd' dans php.ini\n";
    echo "4. Redémarrez\n\n";
    
    echo "💡 Pour vérifier après installation:\n";
    echo "   php -m | findstr gd\n";
}

echo "\n📋 Extensions PHP actuellement chargées:\n";
$extensions = get_loaded_extensions();
sort($extensions);
foreach ($extensions as $ext) {
    echo "   - $ext\n";
}

