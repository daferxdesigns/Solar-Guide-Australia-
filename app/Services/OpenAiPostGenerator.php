<?php

namespace App\Services;

use App\Models\AiWriterAccount;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class OpenAiPostGenerator
{
    /**
     * @throws ConnectionException
     */
    public function generate(AiWriterAccount $account, array $attributes): array
    {
        $apiKey = $account->apiKey();

        if (! $apiKey) {
            throw new RuntimeException('This AI account does not have a readable API key.');
        }

        $payload = [
            'model' => $account->model ?: 'gpt-5.2',
            'store' => false,
            'instructions' => $this->instructions($account),
            'input' => $this->input($attributes),
            'max_output_tokens' => 4500,
            'text' => [
                'format' => [
                    'type' => 'json_schema',
                    'name' => 'solar_guide_post',
                    'strict' => true,
                    'schema' => $this->schema(),
                ],
            ],
        ];

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->timeout(120)
            ->retry(1, 500)
            ->post('https://api.openai.com/v1/responses', $payload);

        if (! $response->successful()) {
            $message = $response->json('error.message') ?: $response->body();

            throw new RuntimeException(Str::limit($message, 500));
        }

        $data = $this->decodeOutput($response->json());

        $account->forceFill(['last_used_at' => now()])->save();

        return [
            'title' => Str::limit(trim((string) ($data['title'] ?? '')), 255, ''),
            'slug' => Str::slug((string) ($data['slug'] ?? $data['title'] ?? '')),
            'excerpt' => Str::limit(trim((string) ($data['excerpt'] ?? '')), 240),
            'content' => $this->cleanHtml((string) ($data['content'] ?? '')),
            'seo_title' => Str::limit(trim((string) ($data['seo_title'] ?? '')), 255, ''),
            'seo_description' => Str::limit(trim((string) ($data['seo_description'] ?? '')), 300, ''),
            'seo_keywords' => Str::limit(trim((string) ($data['seo_keywords'] ?? '')), 1000, ''),
            'featured_image_alt' => Str::limit(trim((string) ($data['featured_image_alt'] ?? '')), 255, ''),
        ];
    }

    /**
     * @throws ConnectionException
     */
    public function test(AiWriterAccount $account): void
    {
        $apiKey = $account->apiKey();

        if (! $apiKey) {
            throw new RuntimeException('This AI account does not have a readable API key.');
        }

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->timeout(45)
            ->post('https://api.openai.com/v1/responses', [
                'model' => $account->model ?: 'gpt-5.2',
                'store' => false,
                'input' => 'Reply with exactly: AI writer connected',
                'max_output_tokens' => 20,
            ]);

        if (! $response->successful()) {
            $message = $response->json('error.message') ?: $response->body();

            throw new RuntimeException(Str::limit($message, 500));
        }
    }

    private function instructions(AiWriterAccount $account): string
    {
        $custom = trim((string) $account->default_instructions);

        return trim(implode("\n\n", array_filter([
            'You are the article drafting assistant for Solar Support Australia. Write practical, accurate Australian English for solar installers, admin teams, and homeowners. Generate helpful drafts only; do not claim live prices, current rebates, or laws unless the user supplied those facts. Use a calm support tone, concrete troubleshooting steps, and clear warnings where a licensed electrician or installer is required.',
            'Return only valid JSON that matches the requested schema. The content field must be safe HTML using h2, h3, p, ul, ol, li, strong, em, blockquote, and table elements where useful. Do not include h1, script, iframe, style, or external tracking code.',
            $custom !== '' ? $custom : null,
        ])));
    }

    private function input(array $attributes): string
    {
        $topic = trim((string) ($attributes['topic'] ?? ''));
        $category = trim((string) ($attributes['category'] ?? ''));
        $keywords = trim((string) ($attributes['keywords'] ?? ''));
        $audience = trim((string) ($attributes['audience'] ?? 'Australian solar customers and installers'));
        $tone = trim((string) ($attributes['tone'] ?? 'practical'));
        $length = trim((string) ($attributes['length'] ?? 'detailed'));
        $notes = trim((string) ($attributes['notes'] ?? ''));
        $currentTitle = trim((string) ($attributes['current_title'] ?? ''));
        $currentExcerpt = trim((string) ($attributes['current_excerpt'] ?? ''));

        return <<<PROMPT
Draft a guide article for the Solar Support Australia website.

Topic: {$topic}
Category: {$category}
Target keywords: {$keywords}
Audience: {$audience}
Tone: {$tone}
Length: {$length}
Existing title, if any: {$currentTitle}
Existing excerpt, if any: {$currentExcerpt}
Extra notes and facts to respect: {$notes}

Make the article useful for search and human readers. Prefer Australian terminology. Include a short intro, scannable headings, practical steps, common mistakes, safety notes, and a closing support paragraph. Avoid pretending to have inspected a customer's system.
PROMPT;
    }

    private function schema(): array
    {
        return [
            'type' => 'object',
            'additionalProperties' => false,
            'required' => [
                'title',
                'slug',
                'excerpt',
                'content',
                'seo_title',
                'seo_description',
                'seo_keywords',
                'featured_image_alt',
            ],
            'properties' => [
                'title' => ['type' => 'string'],
                'slug' => ['type' => 'string'],
                'excerpt' => ['type' => 'string'],
                'content' => ['type' => 'string'],
                'seo_title' => ['type' => 'string'],
                'seo_description' => ['type' => 'string'],
                'seo_keywords' => ['type' => 'string'],
                'featured_image_alt' => ['type' => 'string'],
            ],
        ];
    }

    private function decodeOutput(array $response): array
    {
        $json = $response['output_text'] ?? null;

        if (! is_string($json) || trim($json) === '') {
            foreach (($response['output'] ?? []) as $output) {
                foreach (($output['content'] ?? []) as $content) {
                    if (($content['type'] ?? null) === 'output_text' && isset($content['text'])) {
                        $json = $content['text'];
                        break 2;
                    }
                }
            }
        }

        $decoded = json_decode((string) $json, true);

        if (! is_array($decoded)) {
            throw new RuntimeException('The AI response could not be parsed. Try again with a shorter prompt.');
        }

        return $decoded;
    }

    private function cleanHtml(string $html): string
    {
        $html = preg_replace('#<(script|iframe|style)\b[^>]*>.*?</\1>#is', '', $html) ?? $html;
        $html = preg_replace('/\son[a-z]+\s*=\s*(".*?"|\'.*?\'|[^\s>]+)/i', '', $html) ?? $html;

        return trim($html);
    }
}
