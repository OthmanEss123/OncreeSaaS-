<?php

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class AppointmentConfirmed extends Notification
{
    public function via($notifiable)
    {
        return ['mail']; // va envoyer un email
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Appointment Confirmed')
            ->greeting('Hello '.$notifiable->name)
            ->line('Your appointment has been confirmed.')
            ->action('View Appointment', url('/appointments'))
            ->line('Thank you for using OncreeSaaS!');
    }
}
