<x-mail::message>
# New Contact Enquiry

A new enquiry was submitted on Solar Support Australia.

<x-mail::panel>
Name: {{ $lead->name }}  
Email: {{ $lead->email }}  
Phone: {{ $lead->phone ?: 'Not provided' }}  
Address: {{ $lead->address_line_1 }}  
Suburb: {{ $lead->suburb ?: 'Not provided' }}  
State: {{ $lead->state ?: 'Not provided' }}  
Postcode: {{ $lead->postcode ?: 'Not provided' }}
</x-mail::panel>

Message:

{{ $lead->message }}

Thanks,  
{{ config('app.name') }}
</x-mail::message>
