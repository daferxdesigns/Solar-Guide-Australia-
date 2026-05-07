<?php

namespace Database\Seeders;

use App\Models\GuideCategory;
use App\Models\GuidePost;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $troubleshooting = GuideCategory::updateOrCreate(
            ['slug' => 'troubleshooting'],
            [
                'name' => 'Troubleshooting',
                'description' => 'Fault finding guides for inverters, batteries, isolators, and monitoring systems.',
                'sort_order' => 1,
                'type' => 'guide',
            ],
        );

        GuideCategory::updateOrCreate(
            ['slug' => 'installation-guides'],
            [
                'name' => 'Installation Guides',
                'description' => 'Commissioning, setup, handover, and install workflow articles.',
                'sort_order' => 2,
                'type' => 'guide',
            ],
        );

        GuidePost::updateOrCreate(
            ['slug' => 'how-to-troubleshoot-a-solar-inverter-that-shows-no-production'],
            [
                'guide_category_id' => $troubleshooting->id,
                'user_id' => User::query()->first()?->id,
                'title' => 'How to troubleshoot a solar inverter that shows no production',
                'status' => 'published',
                'is_featured' => true,
                'excerpt' => 'A practical walk-through for checking alarms, DC input, AC isolation, monitoring data, and common inverter restart issues.',
                'seo_title' => 'How to troubleshoot a solar inverter that shows no production',
                'seo_description' => 'A practical solar inverter troubleshooting guide covering alarms, DC checks, AC isolation, monitoring data and common no-production faults.',
                'seo_keywords' => 'solar inverter troubleshooting, solar inverter no production, inverter fault finding, solar system no output, inverter alarm guide',
                'content' => <<<'HTML'
<h2>Start with safety</h2>
<p>Before touching the system, isolate power where required and follow site safety procedures.</p>
<h2>Check the inverter display</h2>
<p>Review the screen for fault codes, warnings, and recent production history. Take a screenshot or photo for your notes.</p>
<h2>Inspect DC and AC isolators</h2>
<p>Confirm isolators are on, undamaged, and not showing signs of heat or water ingress.</p>
<h2>Review monitoring data</h2>
<p>Compare today's generation against recent days. If the system is online but flatlining, note the time the drop started.</p>
<h2>Confirm grid availability</h2>
<p>No grid supply can stop export entirely. Check the switchboard, breaker positions, and site supply status.</p>
<h2>Document the outcome</h2>
<p>Record findings, upload photos, and note whether the issue points to inverter hardware, cabling, shutdown, or monitoring only.</p>
HTML,
                'published_at' => now(),
                'featured_image_alt' => 'Technician troubleshooting a solar inverter display',
            ],
        );

        $this->call(WifiGuideSeeder::class);
        $this->call(AdditionalWifiGuideSeeder::class);
        $this->call(AustralianSolarNewsSeeder::class);
        $this->call(MoreAustralianSolarArticlesSeeder::class);
        $this->call(GuideFeaturedImageSeeder::class);
    }
}
