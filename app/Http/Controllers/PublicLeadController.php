<?php

namespace App\Http\Controllers;

use App\Mail\ContactEnquiryNotificationMail;
use App\Mail\SolarCalculatorResultMail;
use App\Models\PublicLead;
use App\Models\SiteSetting;
use App\Services\LeadCaptureService;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PublicLeadController extends Controller
{
    private const STATE_YIELDS = [
        'NSW' => 4.2,
        'VIC' => 3.8,
        'QLD' => 4.4,
        'SA' => 4.5,
        'WA' => 4.6,
        'ACT' => 4.1,
        'TAS' => 3.6,
        'NT' => 5.0,
    ];

    public function storeCalculator(Request $request, LeadCaptureService $leadCaptureService): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'suburb' => ['required', 'string', 'max:120'],
            'state' => ['required', 'in:NSW,VIC,QLD,SA,WA,ACT,TAS,NT'],
            'postcode' => ['required', 'string', 'max:12'],
            'system_size_kw' => ['required', 'numeric', 'min:1', 'max:50'],
            'average_daily_usage_kwh' => ['required', 'numeric', 'min:1', 'max:250'],
            'electricity_rate' => ['required', 'numeric', 'min:0.05', 'max:2'],
            'feed_in_tariff' => ['required', 'numeric', 'min:0', 'max:1'],
        ]);

        $result = $this->calculate(
            (string) $validated['state'],
            (float) $validated['system_size_kw'],
            (float) $validated['average_daily_usage_kwh'],
            (float) $validated['electricity_rate'],
            (float) $validated['feed_in_tariff'],
        );

        $lead = $leadCaptureService->capture('solar_calculator', 'Solar calculator', [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address_line_1' => $validated['address_line_1'],
            'suburb' => $validated['suburb'],
            'state' => $validated['state'],
            'postcode' => $validated['postcode'],
            'payload' => [
                'system_size_kw' => (float) $validated['system_size_kw'],
                'average_daily_usage_kwh' => (float) $validated['average_daily_usage_kwh'],
                'electricity_rate' => (float) $validated['electricity_rate'],
                'feed_in_tariff' => (float) $validated['feed_in_tariff'],
            ],
            'result_summary' => $result,
        ]);

        Mail::to($lead->email)->send(new SolarCalculatorResultMail($lead, $result));
        $lead->forceFill(['emailed_at' => now()])->save();

        return back()
            ->with('calculator_success', 'The result has been sent.')
            ->withFragment('solar-calculator');
    }

    public function storeContact(Request $request, LeadCaptureService $leadCaptureService): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'suburb' => ['nullable', 'string', 'max:120'],
            'state' => ['nullable', 'in:NSW,VIC,QLD,SA,WA,ACT,TAS,NT'],
            'postcode' => ['nullable', 'string', 'max:12'],
            'message' => ['required', 'string', 'min:10', 'max:3000'],
        ]);

        $lead = $leadCaptureService->capture('contact_enquiry', 'Contact form', [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'address_line_1' => $validated['address_line_1'],
            'suburb' => $validated['suburb'] ?? null,
            'state' => $validated['state'] ?? null,
            'postcode' => $validated['postcode'] ?? null,
            'message' => $validated['message'],
        ]);

        $settings = SiteSetting::current();
        $contactRecipient = $this->validEmail($settings->contact_notification_email)
            ?: $this->validEmail($settings->mail_from_address)
            ?: 'daferxdesigns@gmail.com';

        if ($contactRecipient) {
            Mail::to($contactRecipient)->send(new ContactEnquiryNotificationMail($lead));
        }

        return back()
            ->with('contact_success', 'Thanks, your enquiry has been received.')
            ->withFragment('contact');
    }

    public function storeSubscribe(Request $request, LeadCaptureService $leadCaptureService): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        $leadCaptureService->capture('footer_subscribe', 'Footer subscribe', [
            'name' => trim((string) ($validated['name'] ?? 'Subscriber')) ?: 'Subscriber',
            'email' => $validated['email'],
            'message' => 'Requested email subscription.',
        ]);

        return back()
            ->with('subscribe_success', 'Thanks, you are subscribed.')
            ->withFragment('site-footer');
    }

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $source = trim((string) $request->query('source', ''));

        $leads = PublicLead::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('address_line_1', 'like', "%{$search}%")
                        ->orWhere('postcode', 'like', "%{$search}%");
                });
            })
            ->when($source !== '', fn ($query) => $query->where('source', $source))
            ->latest()
            ->paginate(20)
            ->through(fn (PublicLead $lead) => [
                'id' => $lead->id,
                'source' => $lead->source,
                'form_name' => $lead->form_name,
                'name' => $lead->name,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'address_line_1' => $lead->address_line_1,
                'suburb' => $lead->suburb,
                'state' => $lead->state,
                'postcode' => $lead->postcode,
                'message' => $lead->message,
                'payload' => $lead->payload,
                'result_summary' => $lead->result_summary,
                'emailed_at' => $lead->emailed_at?->toIso8601String(),
                'created_at' => $lead->created_at?->toIso8601String(),
            ])
            ->withQueryString();

        return Inertia::render('Admin/Leads/Index', [
            'leads' => $leads,
            'filters' => [
                'search' => $search,
                'source' => $source,
            ],
            'stats' => [
                'total_leads' => PublicLead::count(),
                'calculator_leads' => PublicLead::where('source', 'solar_calculator')->count(),
                'contact_leads' => PublicLead::where('source', 'contact_enquiry')->count(),
                'chat_leads' => PublicLead::where('source', 'live_chat')->count(),
                'subscribe_leads' => PublicLead::where('source', 'footer_subscribe')->count(),
                'emailed_results' => PublicLead::whereNotNull('emailed_at')->count(),
            ],
        ]);
    }

    public function export(Request $request, string $format): HttpResponse
    {
        abort_unless(in_array($format, ['csv', 'txt', 'xls'], true), 404);

        $search = trim((string) $request->query('search', ''));
        $source = trim((string) $request->query('source', ''));
        $leads = PublicLead::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($source !== '', fn ($query) => $query->where('source', $source))
            ->latest()
            ->get(['name', 'email', 'phone', 'source', 'form_name']);

        $rows = $leads->map(fn (PublicLead $lead) => [
            $lead->name,
            $lead->email,
            $lead->phone,
            $lead->form_name ?: $lead->source,
        ]);

        if ($format === 'txt') {
            $content = $rows->map(fn ($row) => implode(' | ', array_map(fn ($value) => (string) $value, $row)))->implode(PHP_EOL);

            return response($content, 200, [
                'Content-Type' => 'text/plain; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename=leads-export.txt',
            ]);
        }

        $separator = $format === 'csv' ? ',' : "\t";
        $content = collect([['Name', 'Email', 'Phone', 'Form']])
            ->concat($rows)
            ->map(function ($row) use ($separator) {
                return implode($separator, array_map(function ($value) use ($separator) {
                    $text = str_replace('"', '""', (string) $value);

                    return $separator === ',' ? "\"{$text}\"" : $text;
                }, $row));
            })
            ->implode(PHP_EOL);

        return response($content, 200, [
            'Content-Type' => $format === 'csv'
                ? 'text/csv; charset=UTF-8'
                : 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=leads-export.{$format}",
        ]);
    }

    private function calculate(
        string $state,
        float $systemSizeKw,
        float $dailyUsageKwh,
        float $electricityRate,
        float $feedInTariff,
    ): array {
        $dailyYieldPerKw = self::STATE_YIELDS[$state] ?? 4.1;
        $annualProduction = $systemSizeKw * $dailyYieldPerKw * 365 * 0.82;
        $monthlyProduction = $annualProduction / 12;
        $annualUsage = $dailyUsageKwh * 365;

        $selfUseRatio = $annualProduction > $annualUsage ? 0.48 : 0.62;
        $selfConsumed = min($annualProduction * $selfUseRatio, $annualUsage);
        $exported = max($annualProduction - $selfConsumed, 0);
        $annualSavings = ($selfConsumed * $electricityRate) + ($exported * $feedInTariff);
        $usageOffset = $annualUsage > 0 ? min(($annualProduction / $annualUsage) * 100, 100) : 0;

        return [
            'state' => $state,
            'system_size_kw' => number_format($systemSizeKw, 1, '.', ''),
            'annual_production_kwh' => number_format($annualProduction, 0, '.', ','),
            'monthly_production_kwh' => number_format($monthlyProduction, 0, '.', ','),
            'self_consumed_kwh' => number_format($selfConsumed, 0, '.', ','),
            'exported_kwh' => number_format($exported, 0, '.', ','),
            'annual_savings_aud' => number_format($annualSavings, 0, '.', ','),
            'monthly_savings_aud' => number_format($annualSavings / 12, 0, '.', ','),
            'usage_offset_percent' => number_format($usageOffset, 0, '.', ''),
            'electricity_rate' => number_format($electricityRate, 2, '.', ''),
            'feed_in_tariff' => number_format($feedInTariff, 2, '.', ''),
            'average_daily_usage_kwh' => number_format($dailyUsageKwh, 1, '.', ''),
        ];
    }

    private function nullableString(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value !== '' ? $value : null;
    }

    private function validEmail(?string $value): ?string
    {
        $email = trim((string) $value);

        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
    }
}
