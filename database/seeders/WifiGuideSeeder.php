<?php

namespace Database\Seeders;

use App\Models\GuideCategory;
use App\Models\GuidePost;
use App\Models\User;
use Illuminate\Database\Seeder;

class WifiGuideSeeder extends Seeder
{
    public function run(): void
    {
        $category = GuideCategory::updateOrCreate(
            ['slug' => 'wifi-configuration'],
            [
                'name' => 'Wi-Fi Configuration',
                'description' => 'How to connect solar inverters and monitoring modules to Wi-Fi and cloud platforms.',
                'sort_order' => 3,
                'type' => 'guide',
            ],
        );

        $userId = User::query()->first()?->id;

        $posts = [
            [
                'slug' => 'solis-inverter-wifi-configuration-guide',
                'title' => 'Solis inverter Wi-Fi configuration guide',
                'excerpt' => 'How to connect common Solis Wi-Fi dongles to a 2.4 GHz router and bring the inverter online in SolisCloud.',
                'seo_keywords' => 'Solis WiFi setup, SolisCloud, S2-WL-ST, S3-WIFI-ST, S4-WiFi-ST, S5-WiFi-ST',
                'content' => <<<'HTML'
<p>This guide is based on Solis documentation for the <strong>S2-WL-ST</strong>, <strong>S3-WIFI-ST</strong>, <strong>S4-WiFi-ST</strong>, and <strong>S5-WiFi-ST</strong> dataloggers. Exact screens can vary by firmware, but the workflow is consistent.</p>
<h2>Before you start</h2>
<ul>
<li>Have the home Wi-Fi name and password ready.</li>
<li>Use a <strong>2.4 GHz</strong> Wi-Fi network during setup.</li>
<li>Stand close to the inverter while commissioning.</li>
<li>Install or sign in to <strong>SolisCloud</strong>.</li>
</ul>
<h2>Setup steps</h2>
<ol>
<li>Turn off mobile data on the phone so the app stays on the inverter connection.</li>
<li>Forget the home Wi-Fi temporarily if the phone keeps jumping back to it.</li>
<li>Open Wi-Fi settings and connect to the logger SSID, usually <strong>Solis_...</strong> or <strong>D_...</strong>.</li>
<li>For older firmware, the default password is <strong>123456789</strong>. Some newer firmware asks you to use a custom password instead.</li>
<li>Open the SolisCloud setup flow and choose the local router.</li>
<li>Enter the site Wi-Fi password and save the configuration.</li>
<li>Wait for the logger to reconnect to the router and then confirm the inverter appears online in SolisCloud.</li>
</ol>
<h2>If it will not connect</h2>
<ul>
<li>Confirm the router is not 5 GHz only.</li>
<li>Check that the dongle SSID matches the logger serial number.</li>
<li>Retry with the phone within 1 to 2 metres of the inverter.</li>
<li>If the logger was previously configured, recheck whether the password was changed from the default.</li>
</ul>
<h2>Official references</h2>
<p><a href="https://solis-service.solisinverters.com/en/support/solutions/articles/44002156150-solis-wi-fi-configuration-for-s2-wl-st-s3-wifi-st-s4-wifi-st-and-s5-wifi-st-dataloggers" target="_blank" rel="noreferrer">Solis Wi-Fi configuration for S2-WL-ST, S3-WIFI-ST, S4-WiFi-ST and S5-WiFi-ST dataloggers</a></p>
<p><a href="https://solis-service.solisinverters.com/en/support/solutions/articles/44002762205-troubleshooting-for-wifi-dataloggers-network-connection" target="_blank" rel="noreferrer">Solis troubleshooting for WiFi dataloggers network connection</a></p>
HTML,
            ],
            [
                'slug' => 'delta-solar-inverter-wifi-setup-mydeltasolar',
                'title' => 'Delta solar inverter Wi-Fi setup in MyDeltaSolar',
                'excerpt' => 'A practical setup flow for pairing a Delta inverter to Wi-Fi and completing plant registration in the MyDeltaSolar app.',
                'seo_keywords' => 'Delta inverter WiFi setup, MyDeltaSolar, Delta solar inverter app',
                'content' => <<<'HTML'
<p>This guide is based on Delta's official <strong>MyDeltaSolar</strong> app manuals. The exact menu names can vary by inverter series, but the app-led setup path is very similar across supported Delta models.</p>
<h2>Before you start</h2>
<ul>
<li>Install the <strong>MyDeltaSolar</strong> app.</li>
<li>Have the inverter serial number and site Wi-Fi password ready.</li>
<li>Use the home <strong>2.4 GHz</strong> Wi-Fi if your router splits 2.4 GHz and 5 GHz.</li>
</ul>
<h2>Typical setup flow</h2>
<ol>
<li>Open MyDeltaSolar and sign in or create an account.</li>
<li>Choose <strong>Inverter setup</strong>.</li>
<li>Create a new plant or add the inverter to an existing plant.</li>
<li>Select the plant type, enter or scan the inverter serial number, and choose the Wi-Fi router for internet access.</li>
<li>The app checks the inverter and router connection.</li>
<li>Set the plant name, country, and location details.</li>
<li>Complete any grid code or installer-confirmation screens shown by the inverter.</li>
</ol>
<h2>Direct connection method</h2>
<p>Some Delta manuals show the phone connecting first to the inverter SSID, usually in the format <strong>Delta-serial-number</strong>. A documented default password is <strong>DELTASOL</strong>, after which the app continues with commissioning and password change prompts.</p>
<h2>Troubleshooting tips</h2>
<ul>
<li>If the app cannot find the inverter, join the inverter SSID manually in Wi-Fi settings first.</li>
<li>Make sure the inverter is powered and already past basic electrical commissioning.</li>
<li>If the phone does not know the router password, the app may prompt for it again during setup.</li>
</ul>
<h2>Official references</h2>
<p><a href="https://mydeltasolar.deltaww.com/manual/product/mobile_app/en-us/MyDeltaSolar_APP.pdf" target="_blank" rel="noreferrer">Delta MyDeltaSolar app manual</a></p>
<p><a href="https://mydeltasolar.deltaww.com/manual/eng/APP_user.pdf" target="_blank" rel="noreferrer">Delta app user guide</a></p>
HTML,
            ],
            [
                'slug' => 'solplanet-inverter-wifi-configuration-guide',
                'title' => 'Solplanet inverter Wi-Fi configuration guide',
                'excerpt' => 'How to register the dongle, select the site Wi-Fi, and confirm cloud connection for Solplanet inverters.',
                'seo_keywords' => 'Solplanet WiFi setup, Solplanet app, AISWEI cloud, Solplanet inverter internet connection',
                'content' => <<<'HTML'
<p>This article is based on Solplanet's Wi-Fi stick and Solplanet App guides. Solplanet documents the setup through the app and AISWEI cloud workflow.</p>
<h2>What you need</h2>
<ul>
<li>The inverter Wi-Fi stick installed and powered.</li>
<li>The <strong>Solplanet App</strong> available on the phone.</li>
<li>The site Wi-Fi name and password.</li>
</ul>
<h2>Typical commissioning flow</h2>
<ol>
<li>Open the Solplanet App and create or modify a plant.</li>
<li>Scan the Wi-Fi dongle QR code or manually enter the serial number and registration code if required.</li>
<li>Go into <strong>Network configuration</strong>.</li>
<li>Enable Wi-Fi.</li>
<li>Select the local network from the list or add the SSID manually if it does not appear.</li>
<li>Enter the Wi-Fi password and tap <strong>Continue</strong>.</li>
<li>When the app reports success, return to the higher-level page and tap <strong>Save</strong> so the configuration takes effect.</li>
</ol>
<h2>LED and confirmation checks</h2>
<p>Solplanet quick guides note that after network configuration, you should follow the prompts and confirm the dongle status before finishing. If the status screen does not confirm success, repeat the Wi-Fi selection and password steps.</p>
<h2>Common issues</h2>
<ul>
<li>If the SSID does not appear, try manual SSID entry.</li>
<li>Keep the phone near the inverter during commissioning.</li>
<li>If the inverter still stays offline, reopen the network configuration page and save again after the successful connection message.</li>
</ul>
<h2>Official references</h2>
<p><a href="https://solplanet.net/s-a/products/wifi-and-4g-connect-and-monitor" target="_blank" rel="noreferrer">Solplanet Wi-Fi product page</a></p>
<p><a href="https://solplanet.net/wp-content/uploads/2023/04/QG0031_Solplanet-App_EN_V04_1123.pdf" target="_blank" rel="noreferrer">Solplanet App quick installation guide</a></p>
<p><a href="https://solplanet.net/wp-content/uploads/2023/02/UM0072_Solplanet-App_EN_V02_0225.pdf" target="_blank" rel="noreferrer">Solplanet App manual</a></p>
HTML,
            ],
            [
                'slug' => 'alphaess-wifi-configuration-guide',
                'title' => 'AlphaESS Wi-Fi configuration guide',
                'excerpt' => 'How to join the AlphaESS system hotspot, enter the default hotspot password, and move the system onto the home Wi-Fi.',
                'seo_keywords' => 'AlphaESS WiFi setup, AlphaESS app, AlphaESS hotspot password, AlphaESS inverter internet connection',
                'content' => <<<'HTML'
<p>This guide is based on AlphaESS installation manuals that document Wi-Fi commissioning through the AlphaESS app.</p>
<h2>Before you begin</h2>
<ul>
<li>Install the AlphaESS app and log in with the correct installer or owner account.</li>
<li>Have the home Wi-Fi password ready.</li>
<li>Stay close to the system so the phone can join the AlphaESS hotspot.</li>
</ul>
<h2>Setup flow</h2>
<ol>
<li>Open the commissioning process in the AlphaESS app.</li>
<li>If the phone has not already connected to the system hotspot, open Wi-Fi settings and join the hotspot named with the product serial number.</li>
<li>Use the documented default hotspot password <strong>12345678</strong>.</li>
<li>Return to the app and continue to the Wi-Fi step.</li>
<li>Select the home Wi-Fi, enter the password, and submit the network configuration.</li>
<li>Complete the remaining parameter screens in the app so the system can report online correctly.</li>
</ol>
<h2>Important note</h2>
<p>AlphaESS manuals explicitly note that the system will not be able to connect to the internet until the Wi-Fi configuration is completed.</p>
<h2>If the system stays offline</h2>
<ul>
<li>Reconnect to the AlphaESS hotspot and repeat the Wi-Fi step.</li>
<li>Confirm the home router has a usable 2.4 GHz signal at the inverter location.</li>
<li>Double-check that the app returns all the way through the final submit step.</li>
</ul>
<h2>Official references</h2>
<p><a href="https://www.alphaess.com/Public/Uploads/uploadfile/files/20221122/4.InstallationManual_EN_SMILE-S5_series_V0220220930.pdf" target="_blank" rel="noreferrer">AlphaESS SMILE-S5 installation manual</a></p>
<p><a href="https://www.alphaess.com/Public/Uploads/uploadfile/files/20221114/4.Installation%26Operation%26MaintenanceManual_SMILE5-INV_S_V01.20221103-590.pdf" target="_blank" rel="noreferrer">AlphaESS installation and operation manual</a></p>
HTML,
            ],
            [
                'slug' => 'sofar-inverter-wifi-stick-setup-guide',
                'title' => 'SOFAR inverter Wi-Fi stick setup guide',
                'excerpt' => 'How to connect a SOFAR Wi-Fi stick using either the SofarCloud app or the stick web browser wizard.',
                'seo_keywords' => 'SOFAR WiFi setup, SofarCloud, SOFAR WiFi stick, 10.10.100.254',
                'content' => <<<'HTML'
<p>This guide combines the two official SOFAR methods: app-based setup and browser-based setup.</p>
<h2>Method 1: SofarCloud app</h2>
<ol>
<li>Install <strong>SofarCloud</strong> and sign in.</li>
<li>Create a new system in the app.</li>
<li>Scan the barcode of the Wi-Fi stick logger to assign it to the system.</li>
<li>Open the new system and choose the logger configuration option.</li>
<li>Press the Wi-Fi stick button for about <strong>1 second</strong> to activate connection mode.</li>
<li>Select the local Wi-Fi network and enter the Wi-Fi password.</li>
<li>Wait for the stick to complete configuration and then allow a few minutes for data to report to SofarCloud.</li>
</ol>
<h2>Method 2: Browser wizard</h2>
<ol>
<li>Connect a phone or laptop to the Wi-Fi stick hotspot, typically <strong>AP + serial number</strong>.</li>
<li>Open a browser and go to <strong>10.10.100.254</strong>.</li>
<li>Log in with the default username <strong>admin</strong> and password <strong>admin</strong>.</li>
<li>Open the <strong>Wizard</strong> page and enter the site Wi-Fi details.</li>
<li>Save the changes and allow the stick to reconnect to the router.</li>
</ol>
<h2>Important checks</h2>
<ul>
<li>SOFAR states the Wi-Fi network must support <strong>2.4 GHz</strong>.</li>
<li>Some routers may need outgoing TCP port <strong>10000</strong> available for logger traffic.</li>
<li>After successful configuration, give the logger a few minutes to report back to the cloud.</li>
</ul>
<h2>Official references</h2>
<p><a href="https://www2.sofarsolar.com/upload/file/20250814/1755136950679033958.pdf" target="_blank" rel="noreferrer">SOFAR manual with app-based Wi-Fi stick setup</a></p>
<p><a href="https://www1.sofarsolar.com/upload/file/20250616/1750066443223060487.pdf" target="_blank" rel="noreferrer">SOFAR manual with browser-based Wi-Fi stick setup</a></p>
HTML,
            ],
            [
                'slug' => 'saj-inverter-wifi-configuration-guide',
                'title' => 'SAJ inverter Wi-Fi configuration guide',
                'excerpt' => 'A practical SAJ workflow for getting the communication module online through Elekeeper or eSAJ Home, depending on the module generation.',
                'seo_keywords' => 'SAJ WiFi setup, SAJ inverter app, Elekeeper, eSAJ Home, SAJ communication module',
                'content' => <<<'HTML'
<p>SAJ publishes Wi-Fi setup instructions by communication module generation rather than one single inverter document. This guide brings the common workflow together for current SAJ monitoring modules used with residential inverters such as the R5 and R6 series.</p>
<h2>Which app should you use?</h2>
<ul>
<li>Some current SAJ modules use <strong>Elekeeper</strong>.</li>
<li>Some newer AIO3 Pro style modules use <strong>eSAJ Home</strong>.</li>
<li>If the label on the module or quick guide names one app specifically, follow that app.</li>
</ul>
<h2>Typical commissioning flow</h2>
<ol>
<li>Install the communication module in the inverter communication port.</li>
<li>Download the matching app and sign in.</li>
<li>Enable Bluetooth on the phone.</li>
<li>Open the remote configuration or Bluetooth setup area in the app.</li>
<li>Select the SAJ module from the device list, often identified by the last digits of the serial number or BlueLink name.</li>
<li>Choose <strong>Wi-Fi configuration</strong>.</li>
<li>Select the site Wi-Fi and enter the password.</li>
<li>Save the settings and wait for the module LED state to indicate normal server connection.</li>
</ol>
<h2>Good practice on site</h2>
<ul>
<li>Confirm whether the module quick guide requires Elekeeper or eSAJ Home before starting.</li>
<li>Stay near the inverter during Bluetooth pairing.</li>
<li>If the first attempt fails, remove and reinsert the communication module and repeat the Bluetooth connection.</li>
</ul>
<h2>Official references</h2>
<p><a href="https://us.saj-electric.com/en-us/residential-on-grid-inverter" target="_blank" rel="noreferrer">SAJ R5 and R6 residential on-grid inverter page</a></p>
<p><a href="https://www.saj-electric.com/hubfs/Guides%20and%20Manuals/eSolar/eSolar_Wi-Fi_Pro_Quick_Guide_en.pdf" target="_blank" rel="noreferrer">SAJ eSolar Wi-Fi Pro quick guide</a></p>
<p><a href="https://www.saj-electric.com/hubfs/crm-properties-file-values/eSolar_AIO3_Pro%20_Quick_Guide_en_EU-3.pdf" target="_blank" rel="noreferrer">SAJ AIO3 Pro quick guide</a></p>
HTML,
            ],
        ];

        foreach ($posts as $index => $post) {
            GuidePost::updateOrCreate(
                ['slug' => $post['slug']],
                [
                    'guide_category_id' => $category->id,
                    'user_id' => $userId,
                    'title' => $post['title'],
                    'status' => 'published',
                    'is_featured' => false,
                    'excerpt' => $post['excerpt'],
                    'seo_title' => $post['title'],
                    'seo_description' => $post['excerpt'],
                    'seo_keywords' => $post['seo_keywords'],
                    'content' => $post['content'],
                    'published_at' => now()->subMinutes(30 - min($index * 3, 27)),
                ],
            );
        }
    }
}
