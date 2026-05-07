<?php

namespace App\Mail;

use App\Models\PublicLead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactEnquiryNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public PublicLead $lead) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Contact Enquiry - Solar Support Australia',
            replyTo: filter_var($this->lead->email, FILTER_VALIDATE_EMAIL)
                ? [new Address($this->lead->email, $this->lead->name ?: '')]
                : [],
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.contact-enquiry-notification',
            with: [
                'lead' => $this->lead,
            ],
        );
    }
}
