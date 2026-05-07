<?php

namespace Database\Seeders;

use App\Models\GuideCategory;
use App\Models\GuidePost;
use App\Models\User;
use Illuminate\Database\Seeder;

class MoreAustralianSolarArticlesSeeder extends Seeder
{
    public function run(): void
    {
        $newsCategory = GuideCategory::updateOrCreate(
            ['slug' => 'australian-solar-news'],
            [
                'name' => 'Australian Solar News',
                'description' => 'Australia-focused solar, battery and household energy updates.',
                'sort_order' => 4,
                'type' => 'blog',
            ],
        );

        $policyCategory = GuideCategory::updateOrCreate(
            ['slug' => 'rebates-and-tariffs'],
            [
                'name' => 'Rebates & Tariffs',
                'description' => 'Battery rebates, feed-in tariffs and electricity plan changes that affect solar households.',
                'sort_order' => 5,
                'type' => 'blog',
            ],
        );

        $homesCategory = GuideCategory::updateOrCreate(
            ['slug' => 'solar-home-upgrades'],
            [
                'name' => 'Solar Home Upgrades',
                'description' => 'Household solar, hot water, battery and electrification updates that affect Australian homes.',
                'sort_order' => 6,
                'type' => 'blog',
            ],
        );

        $rulesCategory = GuideCategory::updateOrCreate(
            ['slug' => 'solar-rules-and-compliance'],
            [
                'name' => 'Solar Rules & Compliance',
                'description' => 'Rooftop solar program rules, grid settings and compliance changes worth tracking.',
                'sort_order' => 7,
                'type' => 'blog',
            ],
        );

        $userId = User::query()->first()?->id;

        $posts = [
            [
                'slug' => 'cheaper-home-batteries-program-eligibility-after-may-2026',
                'category_id' => $policyCategory->id,
                'title' => 'Cheaper Home Batteries Program eligibility after 1 May 2026: the rules worth checking before you buy',
                'excerpt' => 'From 1 May 2026, battery buyers need to pay closer attention to approval, installer accreditation and equipment eligibility before assuming the rebate applies.',
                'seo_keywords' => 'Cheaper Home Batteries Program eligibility, battery rebate rules May 2026, DCCEEW battery eligibility',
                'content' => <<<'HTML'
<p>The battery incentive is not just about the headline discount. The Department of Climate Change, Energy, the Environment and Water says there are several eligibility conditions homeowners should check before signing off on a battery install.</p>
<h2>The key point</h2>
<p>From <strong>1 May 2026</strong>, the updated battery rules affect both how support is calculated and whether a system qualifies in the first place. That means buyers should ask not only &quot;how much is the rebate?&quot; but also &quot;is this battery and installer actually eligible?&quot;</p>
<h2>What matters most</h2>
<ul>
<li>The battery must be an eligible system under the program rules.</li>
<li>The installation must be handled by an appropriately accredited battery installer under Solar Accreditation Australia requirements.</li>
<li>The system needs to be intended for permanent use and not set up as something that will be moved or resold quickly.</li>
</ul>
<h2>Why this matters to households</h2>
<p>If a quote is based on an assumed discount but the battery or installation path does not meet the final eligibility checks, the numbers can change quickly. Asking those questions before paying a deposit can save a lot of frustration.</p>
<h2>Official references</h2>
<p><a href="https://www.dcceew.gov.au/energy/programs/cheaper-home-batteries/eligibility-information" target="_blank" rel="noreferrer">DCCEEW: Eligibility information for the Cheaper Home Batteries Program</a></p>
<p><a href="https://www.dcceew.gov.au/energy/programs/cheaper-home-batteries" target="_blank" rel="noreferrer">DCCEEW: Cheaper Home Batteries Program</a></p>
HTML,
            ],
            [
                'slug' => 'battery-stc-tiers-explained-after-1-may-2026',
                'category_id' => $policyCategory->id,
                'title' => 'Battery STC tiers explained after 1 May 2026',
                'excerpt' => 'The battery discount continues after 1 May 2026, but the STC factor now tapers across larger system sizes, which changes how some quotes should be read.',
                'seo_keywords' => 'battery STC tiers, 1 May 2026 battery discount, CER battery STC factor',
                'content' => <<<'HTML'
<p>The Clean Energy Regulator&apos;s battery pages now lay out the updated STC factors and the new tapering structure that applies from 1 May 2026.</p>
<h2>What changes</h2>
<p>The first capacity band up to 14 kWh keeps the full STC factor, but larger usable capacity bands attract lower percentages of that factor. In short, very large systems do not receive the same level of support per kilowatt-hour across the whole battery.</p>
<h2>Why it matters</h2>
<p>This means two battery quotes can look similar at first glance but behave differently once the usable size moves into the higher tapered bands. It is worth asking for the STC calculation rather than only the installed price.</p>
<h2>Official references</h2>
<p><a href="https://cer.gov.au/batteries" target="_blank" rel="noreferrer">Clean Energy Regulator: Solar batteries</a></p>
<p><a href="https://www.dcceew.gov.au/energy/programs/cheaper-home-batteries/small-scale-technology-certificates" target="_blank" rel="noreferrer">DCCEEW: Small-scale technology certificates for batteries</a></p>
HTML,
            ],
            [
                'slug' => 'community-batteries-for-household-solar-2026-what-the-program-does',
                'category_id' => $newsCategory->id,
                'title' => 'Community Batteries for Household Solar in 2026: what the program is trying to do',
                'excerpt' => 'The federal program aims to roll out 400 community batteries, which could matter for solar households that want shared storage without putting a battery at home.',
                'seo_keywords' => 'community batteries household solar 2026, federal community battery program, shared battery Australia',
                'content' => <<<'HTML'
<p>The federal <strong>Community Batteries for Household Solar</strong> program is designed to install 400 community batteries across Australia. The idea is to soak up excess daytime solar and make that storage useful at peak times.</p>
<h2>Why this matters</h2>
<p>Not every household can install rooftop solar or afford a battery. Shared storage can still help smooth solar exports, support more renewables on local networks and reduce pressure during busier periods.</p>
<h2>What households should take from it</h2>
<p>Community batteries are not a replacement for every home battery use case, but they are part of the larger direction of travel: more local storage, more rooftop solar integration and more flexible use of cheap daytime electricity.</p>
<h2>Official references</h2>
<p><a href="https://www.dcceew.gov.au/energy/renewable/community-batteries" target="_blank" rel="noreferrer">DCCEEW: Community Batteries for Household Solar program</a></p>
HTML,
            ],
            [
                'slug' => '200000-batteries-installed-in-six-months-what-that-says-about-demand',
                'category_id' => $newsCategory->id,
                'title' => '200,000 batteries installed in six months: what that says about demand in Australia',
                'excerpt' => 'Federal figures released in January 2026 suggest household and small business battery uptake has moved much faster than many people expected.',
                'seo_keywords' => '200000 batteries six months Australia, battery demand 2026, cheaper home batteries uptake',
                'content' => <<<'HTML'
<p>In January 2026, the federal government announced that the Cheaper Home Batteries program had already helped more than <strong>200,000</strong> households, small businesses and community organisations install a battery in its first six months.</p>
<h2>Why that matters</h2>
<p>Fast uptake tells us two things: batteries have moved into the mainstream faster than many expected, and households are looking for more than just solar exports. They want storage, backup value, time shifting and better control over high retail import costs.</p>
<h2>What to watch next</h2>
<p>As battery numbers climb, the more important questions become which systems are eligible, how support changes over time and whether tariff structures still reward the way people actually use stored energy.</p>
<h2>Official references</h2>
<p><a href="https://minister.dcceew.gov.au/bowen/media-releases/200000-bill-busting-batteries-installed-just-six-months" target="_blank" rel="noreferrer">Ministerial media release: 200,000 bill busting batteries installed in just six months</a></p>
HTML,
            ],
            [
                'slug' => 'cer-quarterly-report-says-small-scale-solar-could-recover-in-2026',
                'category_id' => $newsCategory->id,
                'title' => 'CER quarterly report says small-scale solar could recover in 2026',
                'excerpt' => 'The latest CER market report points to stronger solar installations in 2026 after softer 2025 numbers, helped partly by the battery program.',
                'seo_keywords' => 'CER quarterly carbon market report solar 2026, rooftop solar recovery 2026, CER battery report',
                'content' => <<<'HTML'
<p>The Clean Energy Regulator&apos;s December quarter 2025 report says small-scale solar softened in 2025 compared with 2024, but also points to a stronger 2026 outlook.</p>
<h2>What the report highlights</h2>
<ul>
<li>Battery installations ran ahead of early expectations.</li>
<li>Installer capacity shifted toward battery work in 2025.</li>
<li>Small-scale solar capacity could recover in 2026 as battery-linked demand supports new and upgraded systems.</li>
</ul>
<h2>Why this matters for households</h2>
<p>The battery boom is not happening in isolation. It is changing how people size systems, when they buy, and what they expect from solar overall. That makes 2026 an important year to watch for larger systems and more hybrid-style buying decisions.</p>
<h2>Official references</h2>
<p><a href="https://cer.gov.au/markets/reports-and-data/quarterly-carbon-market-reports/quarterly-carbon-market-report-december-quarter-2025/small-scale-renewable-energy-scheme" target="_blank" rel="noreferrer">CER quarterly carbon market report: Small-scale Renewable Energy Scheme</a></p>
HTML,
            ],
            [
                'slug' => 'victorian-midday-power-saver-is-it-worth-comparing-your-plan',
                'category_id' => $policyCategory->id,
                'title' => 'Victorian Midday Power Saver: is it worth comparing your plan before opting in?',
                'excerpt' => 'Victoria&apos;s free midday power window could be valuable, but only if the rest of the tariff still suits the way your household uses electricity.',
                'seo_keywords' => 'Victorian Midday Power Saver compare plan, free midday electricity Victoria, solar tariff comparison Victoria',
                'content' => <<<'HTML'
<p>The Midday Power Saver sounds attractive because it offers a free daytime electricity window, but the official Victorian guidance also makes a useful caution clear: households still need to compare the whole tariff.</p>
<h2>Why comparison matters</h2>
<p>If prices outside the free window are higher, the plan may not suit every household equally. Solar homes that already use a lot of power during the day may benefit in a different way from households that are out for most of the midday period.</p>
<h2>A solar household angle</h2>
<p>For homes with rooftop solar, the free window could shift the economics of self-use, battery charging, EV charging and daytime appliance scheduling. It is not automatically the best plan for everyone, but it could be very attractive for the right usage profile.</p>
<h2>Official references</h2>
<p><a href="https://www.energy.vic.gov.au/households/save-energy-and-money/victorian-midday-power-saver" target="_blank" rel="noreferrer">Energy Victoria: Victorian Midday Power Saver</a></p>
HTML,
            ],
            [
                'slug' => 'victorias-emergency-backstop-what-it-means-for-replacement-inverters',
                'category_id' => $rulesCategory->id,
                'title' => 'Victoria&apos;s emergency backstop: what it means for replacement inverters',
                'excerpt' => 'If a rooftop solar inverter is replaced in Victoria, the backstop rules may now apply unless the job fits a narrow exception.',
                'seo_keywords' => 'Victoria emergency backstop inverter replacement, distributed solar backstop Victoria, rooftop solar compliance Victoria',
                'content' => <<<'HTML'
<p>Victoria&apos;s emergency backstop applies not only to some new rooftop solar systems but also to legacy systems where the inverter is replaced, unless the replacement is like-for-like or completed under warranty in a qualifying way.</p>
<h2>Why it matters</h2>
<p>Homeowners sometimes assume an inverter swap is just a hardware replacement. In Victoria, that job can also trigger a compliance question if the replacement changes what the system must be capable of doing during a backstop event.</p>
<h2>Practical takeaway</h2>
<p>If you are replacing an inverter in Victoria, ask the installer whether the emergency backstop requirements apply to your system and how they plan to commission the replacement.</p>
<h2>Official references</h2>
<p><a href="https://www.energy.vic.gov.au/households/victorias-emergency-backstop-mechanism-for-solar/industry-guidance" target="_blank" rel="noreferrer">Energy Victoria: Industry guidance for the emergency backstop mechanism</a></p>
<p><a href="https://www.energy.vic.gov.au/__data/assets/pdf_file/0022/701905/Emergency-Backstop-Industry-Guidance.pdf" target="_blank" rel="noreferrer">Guide to meeting requirements for distributed solar under Victoria&apos;s emergency backstop mechanism</a></p>
HTML,
            ],
            [
                'slug' => 'solar-victoria-hot-water-rebate-locally-made-incentive-2026',
                'category_id' => $homesCategory->id,
                'title' => 'Solar Victoria hot water rebate in 2026: why the locally made incentive stands out',
                'excerpt' => 'Victoria&apos;s hot water rebate settings now give a higher rebate for eligible locally made products, which matters for households planning broader electrification upgrades.',
                'seo_keywords' => 'Solar Victoria hot water rebate 2026, locally made incentive Victoria, heat pump rebate Victoria',
                'content' => <<<'HTML'
<p>Solar Victoria&apos;s hot water rebate settings now include a higher rebate for eligible locally made products. For households planning to move away from gas, that can materially change upgrade costs.</p>
<h2>What changed</h2>
<p>The current guidance says some eligible locally made hot water products can attract a higher rebate than other approved systems. That makes product choice more important than many households realise.</p>
<h2>Why solar households should care</h2>
<p>Electric hot water and heat pump upgrades often work well alongside rooftop solar because more daytime generation can be used on site. For households looking at a bigger electrification plan, hot water is often one of the first high-impact upgrades to review.</p>
<h2>Official references</h2>
<p><a href="https://www.solar.vic.gov.au/hot-water-rebate/" target="_blank" rel="noreferrer">Solar Victoria: Hot water rebate</a></p>
HTML,
            ],
            [
                'slug' => 'solar-victoria-program-reporting-what-january-2026-data-shows',
                'category_id' => $homesCategory->id,
                'title' => 'Solar Victoria program reporting: what the January 2026 data release is useful for',
                'excerpt' => 'Solar Victoria&apos;s reporting pages now publish inverter, battery, PV module and hot water model data that can help people see what is actually being installed.',
                'seo_keywords' => 'Solar Victoria reporting January 2026, inverter models installed Victoria, battery models Victoria',
                'content' => <<<'HTML'
<p>Solar Victoria&apos;s program reporting pages are easy to overlook, but they are useful because they show actual installed product data by category, including solar PV modules, batteries, inverters and hot water systems.</p>
<h2>Why this matters</h2>
<p>For households trying to understand what is common in the market, reporting pages can be more helpful than generic marketing claims. They provide a broader sense of which product categories and model groups are appearing in the real rebate-backed pipeline.</p>
<h2>Official references</h2>
<p><a href="https://www.solar.vic.gov.au/solar-homes-program-reporting" target="_blank" rel="noreferrer">Solar Victoria: Solar Homes Program reporting</a></p>
HTML,
            ],
            [
                'slug' => '2026-small-scale-technology-percentage-explained-for-solar-households',
                'category_id' => $rulesCategory->id,
                'title' => 'The 2026 small-scale technology percentage explained for solar households',
                'excerpt' => 'The 2026 STP is mainly an industry and carbon market setting, but it still gives useful clues about how rooftop solar demand is being forecast this year.',
                'seo_keywords' => '2026 STP explained, small-scale technology percentage 11.67, CER rooftop solar forecast 2026',
                'content' => <<<'HTML'
<p>The 2026 small-scale technology percentage, or STP, has been set at <strong>11.67%</strong>. Most households do not need to follow this setting day to day, but it does provide a useful signal about how the market sees small-scale solar demand this year.</p>
<h2>Why it matters indirectly</h2>
<p>The Clean Energy Regulator says the 2026 STP is based on stronger expected rooftop solar activity, with the battery program likely to lift demand for new and upgraded systems. So while the STP itself is a market compliance setting, it also tells a story about where the rooftop sector may be heading.</p>
<h2>Official references</h2>
<p><a href="https://cer.gov.au/RET/Scheme-participants-and-industry/the-small-scale-technology-percentage" target="_blank" rel="noreferrer">CER: Small-scale technology percentage</a></p>
HTML,
            ],
        ];

        foreach ($posts as $index => $post) {
            GuidePost::updateOrCreate(
                ['slug' => $post['slug']],
                [
                    'guide_category_id' => $post['category_id'],
                    'user_id' => $userId,
                    'title' => $post['title'],
                    'status' => 'published',
                    'is_featured' => false,
                    'excerpt' => $post['excerpt'],
                    'seo_title' => $post['title'],
                    'seo_description' => $post['excerpt'],
                    'seo_keywords' => $post['seo_keywords'],
                    'content' => $post['content'],
                    'published_at' => now()->subMinutes(160 - min($index * 6, 54)),
                ],
            );
        }
    }
}
