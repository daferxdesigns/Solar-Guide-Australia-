<?php

namespace Database\Seeders;

use App\Models\GuideCategory;
use App\Models\GuidePost;
use App\Models\User;
use Illuminate\Database\Seeder;

class AustralianSolarNewsSeeder extends Seeder
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

        $userId = User::query()->first()?->id;

        $posts = [
            [
                'slug' => 'federal-battery-rebate-reduction-from-1-may-2026',
                'category_id' => $policyCategory->id,
                'title' => 'Federal battery rebate reduction from 1 May 2026: what Australian households need to know',
                'excerpt' => 'Australia’s battery incentive does not disappear on 1 May 2026, but the value changes and larger systems can be affected more noticeably.',
                'seo_keywords' => 'battery rebate May 2026, federal battery rebate reduction, Clean Energy Regulator battery STCs, Australia battery rebate changes',
                'content' => <<<'HTML'
<p>Australia’s federal battery incentive changes on <strong>1 May 2026</strong>. The main point for homeowners is simple: the support is still there, but the way it is calculated changes, and that matters more for some systems than others.</p>
<h2>What actually changes in May?</h2>
<p>According to the Clean Energy Regulator, the rebate becomes <strong>tiered by battery size</strong> from 1 May 2026. That means the number of small-scale technology certificates (STCs) available is no longer treated in exactly the same way across all battery capacities.</p>
<p>In practical terms, households looking at larger batteries may see a more noticeable change in value after the new rules begin.</p>
<h2>The date that matters is the installation date</h2>
<p>This is the part many customers miss. The CER has been very clear that rebate value is based on the <strong>installation date</strong>, not the date you paid a deposit or signed a contract. If a job slips past 1 May 2026, the claim can still be eligible, but it may receive fewer STCs under the updated settings.</p>
<h2>Why this matters for homeowners</h2>
<ul>
<li>If you are comparing quotes, make sure each installer explains the battery size, expected STCs and the assumed install date.</li>
<li>If your project is close to the deadline, ask whether the contractor can genuinely deliver on time rather than simply promising it.</li>
<li>Do not let anyone rush an unsafe installation just to chase the earlier rebate settings.</li>
</ul>
<h2>Why this matters for installers and sales teams</h2>
<p>The CER has also warned retailers and installers to avoid misleading marketing around the change. If a business sells a job using pre-May pricing but cannot complete the installation in time, the customer may end up with a smaller incentive than expected.</p>
<h2>Best next step</h2>
<p>If you are planning a battery, use the official CER calculator and get the installer to show you the numbers they used. That gives you a better basis for comparing quotes than relying on headline rebate claims.</p>
<h2>Source notes</h2>
<p>This article is an original summary based on Clean Energy Regulator updates published on 18 March 2026 and 9 April 2026.</p>
<p><a href="https://cer.gov.au/news-and-media/media/2026/march/battery-rebates-are-changing-1-may-2026" target="_blank" rel="noreferrer">Clean Energy Regulator: Battery rebates are changing 1 May 2026</a></p>
<p><a href="https://cer.gov.au/news-and-media/media/2026/april/be-prepared-clean-energy-regulator-calls-solar-and-battery-retailers-to-be-ready-1-may-deadline" target="_blank" rel="noreferrer">Clean Energy Regulator: 1 May deadline reminder for industry</a></p>
<p><a href="https://cer.gov.au/schemes/renewable-energy-target/small-scale-renewable-energy-scheme/small-scale-renewable-energy-systems/solar-batteries" target="_blank" rel="noreferrer">Clean Energy Regulator: Solar batteries</a></p>
HTML,
            ],
            [
                'slug' => 'victoria-three-hours-free-electricity-from-october-2026',
                'category_id' => $newsCategory->id,
                'title' => 'Victoria’s three hours of free electricity: what it could mean for solar households from 1 October 2026',
                'excerpt' => 'Victoria says eligible households will be able to opt into a Midday Power Saver offer from 1 October 2026, with a free or deeply discounted daytime window.',
                'seo_keywords' => 'Victoria free electricity 3 hours, Midday Power Saver, Victoria solar households, free daytime power Victoria',
                'content' => <<<'HTML'
<p>The Victorian Government has announced a <strong>Midday Power Saver</strong> offer that is expected to begin on <strong>1 October 2026</strong>. The headline idea is straightforward: households that opt in would get a free or heavily discounted block of electricity in the middle of the day.</p>
<h2>Why the daytime window matters</h2>
<p>Victoria already has very strong rooftop solar output during daylight hours. The government says more than <strong>850,000 Victorian households</strong> already have small-scale rooftop solar, which helps push down wholesale prices when the sun is out.</p>
<p>The new offer is designed to encourage people to move flexible electricity use into that solar-rich part of the day.</p>
<h2>Who could benefit most?</h2>
<ul>
<li>Households with electric hot water, heat pumps or EV charging that can be scheduled during the free window.</li>
<li>Work-from-home households that can run appliances during the middle of the day.</li>
<li>Solar-and-battery homes that want to reduce evening imports even further.</li>
</ul>
<h2>What to watch out for</h2>
<p>Energy Victoria also warns that a free three-hour block does not automatically make the plan best for everyone. Some retailers may charge more outside that daytime period, so households should compare the entire tariff, not just the promotional headline.</p>
<h2>Practical solar advice</h2>
<p>If you are already on solar, this kind of tariff may favour daytime appliance shifting over pure export. Running the dishwasher, washing machine, heat pump water heater or EV charger in the free window could be worth more than chasing a small feed-in credit.</p>
<h2>Important dates</h2>
<ul>
<li>Announcement made: <strong>25 March 2026</strong></li>
<li>Planned start date: <strong>1 October 2026</strong></li>
<li>More tariff details were flagged for release in <strong>May 2026</strong></li>
</ul>
<h2>Source notes</h2>
<p>This article is an original summary based on Victorian Government and Energy Victoria material published in March 2026.</p>
<p><a href="https://www.energy.vic.gov.au/households/save-energy-and-money/victorian-midday-power-saver" target="_blank" rel="noreferrer">Energy Victoria: Victorian Midday Power Saver</a></p>
<p><a href="https://www.premier.vic.gov.au/sites/default/files/2026-03/260325-Three-Hours-Of-Free-Power-Every-Day.pdf" target="_blank" rel="noreferrer">Victorian Government media release: Three Hours Of Free Power Every Day</a></p>
HTML,
            ],
            [
                'slug' => 'victoria-feed-in-tariff-after-1-july-2025',
                'category_id' => $policyCategory->id,
                'title' => 'Victoria feed-in tariffs after 1 July 2025: what changed for solar exports',
                'excerpt' => 'Victoria no longer has a regulator-set minimum solar feed-in tariff, which changes how households should compare retail plans.',
                'seo_keywords' => 'Victoria feed in tariff 2026, Victoria no minimum feed in tariff, Victorian solar export rates, ESC Victoria feed in tariff',
                'content' => <<<'HTML'
<p>From <strong>1 July 2025</strong>, Victoria moved away from a regulator-set minimum solar feed-in tariff. That is a big change for households that used to treat the minimum rate as a floor under every retail offer.</p>
<h2>What changed?</h2>
<p>The Essential Services Commission says it no longer sets minimum feed-in tariffs after changes to the law. Retailers can now set their own solar export rates, provided those rates are <strong>not below zero</strong>.</p>
<h2>Why did this happen?</h2>
<p>Both the ESC and Energy Victoria point to the same broad reason: solar-weighted wholesale prices have been falling during the middle of the day. In other words, that is exactly when most rooftop systems are exporting, so the market value of that exported electricity has been reduced.</p>
<h2>What this means for Victorian solar owners</h2>
<ul>
<li>You need to compare the full electricity plan, not only the export credit.</li>
<li>A high feed-in tariff can still be paired with higher import charges.</li>
<li>Self-consumption is often more valuable than export, because avoided retail power costs are usually much higher than feed-in credits.</li>
</ul>
<h2>The practical takeaway</h2>
<p>If you have solar in Victoria, the biggest wins often come from running appliances during the day, charging batteries strategically, and matching your tariff to your usage pattern. Export income still matters, but it should not be the only number you look at.</p>
<h2>Source notes</h2>
<p>This article is an original summary based on Essential Services Commission and Energy Victoria pages updated in 2025.</p>
<p><a href="https://www.esc.vic.gov.au/electricity-and-gas/prices-tariffs-and-benchmarks/minimum-feed-tariff/minimum-feed-tariff-review-2025-26" target="_blank" rel="noreferrer">Essential Services Commission: Minimum feed-in tariff review 2025-26</a></p>
<p><a href="https://www.energy.vic.gov.au/households/solar-victorian-feed-in-tariff" target="_blank" rel="noreferrer">Energy Victoria: Solar feed-in tariff</a></p>
HTML,
            ],
            [
                'slug' => 'nsw-solar-feed-in-tariff-benchmark-2025-26',
                'category_id' => $policyCategory->id,
                'title' => 'NSW solar feed-in tariff benchmark for 2025–26: what the official range tells you',
                'excerpt' => 'IPART’s 2025–26 benchmark range gives NSW households a useful reference point when comparing solar export offers from retailers.',
                'seo_keywords' => 'NSW feed in tariff benchmark 2025-26, IPART solar tariff, NSW solar export rate',
                'content' => <<<'HTML'
<p>NSW does not force retailers to pay a fixed minimum solar feed-in tariff, but the state regulator still publishes a benchmark range to help households judge whether an offer is in the ballpark.</p>
<h2>The current benchmark</h2>
<p>IPART says the <strong>all-day benchmark for 2025–26 is 4.8 to 7.3 c/kWh</strong> for the period from <strong>1 July 2025 to 30 June 2026</strong>.</p>
<h2>What the benchmark is for</h2>
<p>The benchmark is not a compulsory tariff. It is a guide to the underlying value of typical solar exports. Retailers can offer more, less, or no feed-in tariff at all, depending on the plan.</p>
<h2>What households should do with that number</h2>
<ul>
<li>Use it as a reference point, not a guarantee.</li>
<li>Compare the import tariff, daily charge and export conditions at the same time.</li>
<li>Watch for export caps or special conditions attached to higher advertised rates.</li>
</ul>
<h2>The larger lesson</h2>
<p>IPART also reinforces a point that matters right across Australia: the biggest financial benefit of solar usually comes from <strong>using your own generation</strong> rather than exporting it. The avoided retail price is often worth much more than the export credit.</p>
<h2>Source notes</h2>
<p>This article is an original summary based on IPART’s fact sheet dated 26 May 2025.</p>
<p><a href="https://www.ipart.nsw.gov.au/sites/default/files/cm9_documents/Fact-Sheet-All-day-solar-feed-in-tariff-benchmarks-2025-26-May-2025.PDF" target="_blank" rel="noreferrer">IPART fact sheet: Solar feed-in tariff benchmark for 2025-26</a></p>
HTML,
            ],
            [
                'slug' => 'victorian-default-offer-draft-2026-27-lower-bills',
                'category_id' => $newsCategory->id,
                'title' => 'Victorian Default Offer draft for 2026–27 points to lower power bills',
                'excerpt' => 'A March 2026 draft decision from Victoria’s regulator proposes modest bill reductions for households on the Victorian Default Offer.',
                'seo_keywords' => 'Victorian Default Offer 2026-27, electricity prices Victoria 2026, ESC VDO draft decision',
                'content' => <<<'HTML'
<p>Victoria’s Essential Services Commission released a draft decision in March 2026 proposing lower Victorian Default Offer prices for the next financial year.</p>
<h2>What the draft decision says</h2>
<p>According to the commission, annual VDO prices for domestic customers would fall by around <strong>$43 to $48 per year</strong> compared with 2025–26, depending on the distribution zone.</p>
<h2>Why this matters to solar households</h2>
<p>Even if you already have solar, the standing-offer benchmark still matters. It shapes the reference point for energy plans, affects households on embedded networks, and helps explain the economics of self-consumption versus grid imports.</p>
<h2>Important caution</h2>
<p>This is a <strong>draft</strong> decision, not the final one. The commission notes that final network charges can still affect the end result before the 2026–27 prices are locked in.</p>
<h2>The practical takeaway</h2>
<p>Small bill reductions are helpful, but they do not replace the need to compare plans carefully. For solar homes, the more meaningful savings may still come from using daytime generation effectively, choosing the right retailer plan, and deciding whether batteries or load shifting make sense.</p>
<h2>Source notes</h2>
<p>This article is an original summary based on Essential Services Commission material published in March 2026.</p>
<p><a href="https://www.esc.vic.gov.au/media-centre/victorian-regulator-publishes-draft-default-electricity-price" target="_blank" rel="noreferrer">Essential Services Commission media release: Victorian regulator publishes draft default electricity price</a></p>
<p><a href="https://www.esc.vic.gov.au/electricity-and-gas/prices-tariffs-and-benchmarks/victorian-default-offer/victorian-default-offer-price-review-2026-27" target="_blank" rel="noreferrer">Essential Services Commission: Victorian Default Offer price review 2026-27</a></p>
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
                    'published_at' => now()->subMinutes(40 - min($index * 5, 20)),
                ],
            );
        }
    }
}
