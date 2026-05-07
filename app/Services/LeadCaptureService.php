<?php

namespace App\Services;

use App\Models\PublicLead;

class LeadCaptureService
{
    public function capture(string $source, string $formName, array $attributes): PublicLead
    {
        return PublicLead::create([
            'source' => $source,
            'form_name' => $formName,
            'name' => trim((string) ($attributes['name'] ?? 'Website visitor')),
            'email' => strtolower(trim((string) ($attributes['email'] ?? ''))),
            'phone' => $this->nullableString($attributes['phone'] ?? null),
            'address_line_1' => $this->nullableString($attributes['address_line_1'] ?? null),
            'suburb' => $this->nullableString($attributes['suburb'] ?? null),
            'state' => $this->nullableString($attributes['state'] ?? null),
            'postcode' => $this->nullableString($attributes['postcode'] ?? null),
            'message' => $this->nullableString($attributes['message'] ?? null),
            'payload' => $attributes['payload'] ?? null,
            'result_summary' => $attributes['result_summary'] ?? null,
            'emailed_at' => $attributes['emailed_at'] ?? null,
        ]);
    }

    private function nullableString(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value !== '' ? $value : null;
    }
}
