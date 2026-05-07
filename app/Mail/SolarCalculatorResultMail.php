<?php

namespace App\Mail;

use App\Models\PublicLead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SolarCalculatorResultMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public PublicLead $lead,
        public array $result,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Solar Support Australia estimate',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.solar-calculator-result',
        );
    }
}
