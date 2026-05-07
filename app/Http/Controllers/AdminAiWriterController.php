<?php

namespace App\Http\Controllers;

use App\Models\AiWriterAccount;
use App\Models\GuideCategory;
use App\Services\OpenAiPostGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAiWriterController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Settings/AiWriter', [
            'accounts' => $this->accounts(),
            'modelSuggestions' => [
                'gpt-5.2',
                'gpt-4.1',
                'gpt-4.1-mini',
                'gpt-4o-mini',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:100'],
            'api_key' => ['required', 'string', 'max:4000'],
            'default_instructions' => ['nullable', 'string', 'max:4000'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $account = new AiWriterAccount();
        $account->fill([
            'name' => trim((string) $validated['name']),
            'provider' => 'openai',
            'model' => trim((string) $validated['model']),
            'default_instructions' => $this->nullableString($validated['default_instructions'] ?? null),
            'is_active' => (bool) ($validated['is_active'] ?? true),
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
        ]);
        $account->setApiKey($validated['api_key']);
        $account->save();

        return back()->with('success', 'AI writer account saved.');
    }

    public function update(Request $request, AiWriterAccount $account): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:100'],
            'api_key' => ['nullable', 'string', 'max:4000'],
            'default_instructions' => ['nullable', 'string', 'max:4000'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $account->fill([
            'name' => trim((string) $validated['name']),
            'model' => trim((string) $validated['model']),
            'default_instructions' => $this->nullableString($validated['default_instructions'] ?? null),
            'is_active' => (bool) ($validated['is_active'] ?? false),
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
        ]);

        if ($this->nullableString($validated['api_key'] ?? null) !== null) {
            $account->setApiKey($validated['api_key']);
        }

        $account->save();

        return back()->with('success', 'AI writer account updated.');
    }

    public function destroy(AiWriterAccount $account): RedirectResponse
    {
        $account->delete();

        return back()->with('success', 'AI writer account deleted.');
    }

    public function test(AiWriterAccount $account, OpenAiPostGenerator $generator): RedirectResponse
    {
        try {
            $generator->test($account);
        } catch (\Throwable $e) {
            return back()->with('error', 'AI account test failed: '.$e->getMessage());
        }

        return back()->with('success', 'AI writer account connected successfully.');
    }

    public function generatePost(Request $request, OpenAiPostGenerator $generator): JsonResponse
    {
        $validated = $request->validate([
            'ai_account_id' => ['required', 'exists:ai_writer_accounts,id'],
            'topic' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:guide_categories,id'],
            'keywords' => ['nullable', 'string', 'max:1000'],
            'audience' => ['nullable', 'string', 'max:255'],
            'tone' => ['nullable', 'string', 'max:100'],
            'length' => ['nullable', 'in:short,standard,detailed'],
            'notes' => ['nullable', 'string', 'max:4000'],
            'current_title' => ['nullable', 'string', 'max:255'],
            'current_excerpt' => ['nullable', 'string', 'max:1000'],
        ]);

        $account = AiWriterAccount::query()
            ->where('is_active', true)
            ->findOrFail($validated['ai_account_id']);

        $category = ! empty($validated['category_id'])
            ? GuideCategory::query()->find($validated['category_id'])
            : null;

        try {
            $draft = $generator->generate($account, [
                ...$validated,
                'category' => $category?->name ?? '',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'AI generation failed: '.$e->getMessage(),
            ], 422);
        }

        return response()->json([
            'draft' => $draft,
        ]);
    }

    private function accounts(): array
    {
        return AiWriterAccount::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (AiWriterAccount $account) => [
                'id' => $account->id,
                'name' => $account->name,
                'provider' => $account->provider,
                'model' => $account->model,
                'masked_api_key' => $account->maskedApiKey(),
                'default_instructions' => $account->default_instructions ?? '',
                'is_active' => (bool) $account->is_active,
                'sort_order' => (int) $account->sort_order,
                'last_used_at' => $account->last_used_at?->toIso8601String(),
                'created_at' => $account->created_at?->toIso8601String(),
            ])
            ->all();
    }

    private function nullableString(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value !== '' ? $value : null;
    }
}
