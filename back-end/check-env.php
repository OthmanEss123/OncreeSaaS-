<?php

$envFile = __DIR__ . '/.env';

if (!file_exists($envFile)) {
    die("❌ .env file not found!\n");
}

echo "📧 Mail Configuration from .env:\n";
echo "================================\n\n";

$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

foreach ($lines as $line) {
    if (strpos($line, 'MAIL_') === 0) {
        // Hide password
        if (strpos($line, 'MAIL_PASSWORD') !== false) {
            list($key, $value) = explode('=', $line, 2);
            echo $key . "=***hidden***\n";
        } else {
            echo $line . "\n";
        }
    }
}

echo "\n";




















