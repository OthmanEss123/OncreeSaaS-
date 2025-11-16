<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TwoFactorCodeNotification extends Notification
{

    public function __construct(
        private readonly string $code,
        private readonly int $ttlMinutes
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre code de vérification OncreeSaaS')
            ->greeting('Bonjour,')
            ->line("Votre code de vérification est : **{$this->code}**")
            ->line("Ce code expire dans {$this->ttlMinutes} minutes.")
            ->line("Si vous n'êtes pas à l'origine de cette tentative de connexion, vous pouvez ignorer cet email.")
            ->salutation("L'équipe OncreeSaaS");
    }
}
