<?php

namespace Database\Seeders;

use App\Models\GuideCategory;
use App\Models\GuidePost;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdditionalWifiGuideSeeder extends Seeder
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
                'slug' => 'goodwe-wifi-connection-via-sems-app',
                'title' => 'GoodWe Wi-Fi connection via the SEMS app',
                'excerpt' => 'A practical owner-level guide for reconnecting a GoodWe inverter to home Wi-Fi and bringing it back online in SEMS Portal.',
                'seo_keywords' => 'GoodWe WiFi setup, SEMS Portal, GoodWe Solar WiFi, inverter reconnect to router',
                'content' => <<<'HTML'
<p>This guide is based on GoodWe support material for <strong>WiFi Connection Set up via SEMS App</strong> and the company&apos;s Wi-Fi connection troubleshooting notes.</p>
<h2>Before you start</h2>
<ul>
<li>Use a <strong>2.4 GHz</strong> home Wi-Fi network.</li>
<li>Install the <strong>SEMS Portal</strong> app.</li>
<li>Have the router name and password ready.</li>
<li>Stand close to the inverter during setup.</li>
</ul>
<h2>Setup steps</h2>
<ol>
<li>Open the SEMS app and go to the Wi-Fi configuration area.</li>
<li>Join the inverter hotspot in the phone&apos;s Wi-Fi settings. GoodWe commonly labels it <strong>Solar-WiFi...</strong>.</li>
<li>Return to SEMS and choose the home router.</li>
<li>Enter the Wi-Fi password carefully and submit the settings.</li>
<li>Wait for the inverter to reconnect to the router and then confirm it reports back in SEMS Portal.</li>
</ol>
<h2>If it does not come online</h2>
<ul>
<li>Retry with mobile data turned off so the app stays on the local inverter connection.</li>
<li>Keep the phone within a few metres of the inverter.</li>
<li>If the router was replaced recently, repeat the setup from the start instead of waiting for the old credentials to work.</li>
</ul>
<h2>Official references</h2>
<p><a href="https://goodwetechnology.zendesk.com/hc/en-gb/articles/47269439794841-WiFi-Connection-Set-up-via-SEMS-App" target="_blank" rel="noreferrer">GoodWe: WiFi Connection Set up via SEMS App</a></p>
<p><a href="https://support.goodwe.com/portal/en/kb/articles/wi-fi-connection-issues" target="_blank" rel="noreferrer">GoodWe: Wi-Fi connection issues</a></p>
HTML,
            ],
            [
                'slug' => 'sungrow-isolarcloud-wifi-commissioning-guide',
                'title' => 'Sungrow iSolarCloud Wi-Fi commissioning guide',
                'excerpt' => 'How to bring a Sungrow residential inverter online through iSolarCloud and the WiNet-S or Wi-Fi logger setup flow.',
                'seo_keywords' => 'Sungrow WiFi setup, iSolarCloud, WiNet-S commissioning, Sungrow inverter router setup',
                'content' => <<<'HTML'
<p>This guide is based on Sungrow&apos;s <strong>iSolarCloud App Commissioning Guide</strong> and the company&apos;s official product help pages.</p>
<h2>What you need</h2>
<ul>
<li>The Wi-Fi dongle or WiNet device already installed.</li>
<li>The <strong>iSolarCloud</strong> app on your phone.</li>
<li>The site&apos;s 2.4 GHz Wi-Fi name and password.</li>
</ul>
<h2>Typical setup flow</h2>
<ol>
<li>Open iSolarCloud and begin device commissioning.</li>
<li>Connect the phone to the logger&apos;s local Wi-Fi when prompted.</li>
<li>Choose <strong>Router connection settings</strong> or the equivalent communication menu in the app.</li>
<li>Select the home network and enter the Wi-Fi password.</li>
<li>Save the settings and wait for the logger to complete registration with iSolarCloud.</li>
</ol>
<h2>Helpful checks</h2>
<ul>
<li>Make sure the phone joins the logger Wi-Fi first, not the homeowner&apos;s normal Wi-Fi.</li>
<li>If the commissioning flow stalls, restart the app and repeat the communication step only.</li>
<li>Keep the inverter and router on a stable 2.4 GHz connection during the initial pairing.</li>
</ul>
<h2>Official references</h2>
<p><a href="https://service.sungrowpower.com.au/files/Web_Files/FAQ/GD_202105_All_iSolarCloud%20APP%20Commissioning%20Guide_V1.1.pdf" target="_blank" rel="noreferrer">Sungrow Australia: iSolarCloud APP Commissioning Guide</a></p>
<p><a href="https://www.sungrowpower.com/sa/en/products/cloud-software/isolarcloud" target="_blank" rel="noreferrer">Sungrow: iSolarCloud product page and configuration videos</a></p>
HTML,
            ],
            [
                'slug' => 'growatt-shinewifi-configuration-guide',
                'title' => 'Growatt ShineWiFi configuration guide',
                'excerpt' => 'A homeowner-friendly path for reconnecting Growatt ShineWiFi modules and checking cloud reporting in ShinePhone.',
                'seo_keywords' => 'Growatt WiFi setup, ShineWiFi-X, ShineWiFi-S, ShinePhone, Growatt hotspot mode',
                'content' => <<<'HTML'
<p>This guide is based on Growatt New Energy Australia helpdesk instructions for <strong>ShineWiFi-X</strong> and <strong>ShineWiFi-S</strong>.</p>
<h2>Before reconnecting</h2>
<ul>
<li>Use a 2.4 GHz Wi-Fi network.</li>
<li>Install the <strong>ShinePhone</strong> app.</li>
<li>Stand near the inverter so the phone can find the module hotspot.</li>
</ul>
<h2>Common setup path</h2>
<ol>
<li>Open ShinePhone and choose the hotspot configuration method.</li>
<li>Join the inverter Wi-Fi module hotspot when prompted.</li>
<li>Return to the app, select the home router and enter the password.</li>
<li>Save the settings and wait for the module to restart and report online.</li>
</ol>
<h2>When the setup fails</h2>
<ul>
<li>Check that the serial number shown in the hotspot matches the installed Wi-Fi module.</li>
<li>Retry close to the inverter with strong phone signal to the hotspot.</li>
<li>If the router uses band steering or merges 2.4 GHz and 5 GHz poorly, try a simple 2.4 GHz SSID during setup.</li>
</ul>
<h2>Official references</h2>
<p><a href="https://growatt9160.zendesk.com/hc/en-us/articles/35782430992537-Configuration-Instructions-for-ShineWiFi-X-ShineWiFi-S" target="_blank" rel="noreferrer">Growatt Australia Helpdesk: Configuration Instructions for ShineWiFi-X / ShineWiFi-S</a></p>
<p><a href="https://www.growatt.tech/wp-content/uploads/2023/02/monitoring-user-manual.pdf" target="_blank" rel="noreferrer">Growatt monitoring user manual</a></p>
HTML,
            ],
            [
                'slug' => 'solaredge-inverter-wifi-connection-guide',
                'title' => 'SolarEdge inverter Wi-Fi connection guide',
                'excerpt' => 'How to reconnect a SolarEdge inverter to a home router using the SolarEdge app and inverter communication settings.',
                'seo_keywords' => 'SolarEdge WiFi setup, inverter communication, SetApp WiFi, SolarEdge monitoring connection',
                'content' => <<<'HTML'
<p>This guide is based on SolarEdge owner support pages and the company&apos;s Wi-Fi configuration application notes.</p>
<h2>Before you begin</h2>
<ul>
<li>Confirm the inverter has the required Wi-Fi hardware or antenna installed.</li>
<li>Use the SolarEdge app and stay close to the inverter.</li>
<li>Check that the router offers a reliable 2.4 GHz connection if required by the hardware in use.</li>
</ul>
<h2>Typical setup steps</h2>
<ol>
<li>Open the SolarEdge app and connect to the inverter locally.</li>
<li>Open <strong>Inverter Communication</strong> or the equivalent communication menu.</li>
<li>Select the home Wi-Fi network.</li>
<li>Enter the router password and save the settings.</li>
<li>Wait for the communication check to confirm the inverter is connected to the monitoring server.</li>
</ol>
<h2>Signs the setup worked</h2>
<p>SolarEdge documentation notes that a successful communication screen or status confirmation indicates the inverter has reached the monitoring server.</p>
<h2>Official references</h2>
<p><a href="https://www.solaredge.com/us/support/system-owner/configuring-inverter-communication" target="_blank" rel="noreferrer">SolarEdge: Configuring inverter communication</a></p>
<p><a href="https://knowledge-center.solaredge.com/sites/kc/files/se_application_note_wifi_configuration_using_setapp.pdf" target="_blank" rel="noreferrer">SolarEdge Wi-Fi configuration using SetApp</a></p>
HTML,
            ],
            [
                'slug' => 'fronius-solarweb-wifi-setup-guide',
                'title' => 'Fronius Solar.web Wi-Fi setup guide',
                'excerpt' => 'How to start the Fronius Wi-Fi access point, join the inverter interface, and reconnect the system to Solar.web.',
                'seo_keywords' => 'Fronius WiFi setup, Solar.web, Fronius access point, datalogger WLAN',
                'content' => <<<'HTML'
<p>This guide is based on Fronius Solar.web support pages and Fronius commissioning documents for monitoring setup.</p>
<h2>What to prepare</h2>
<ul>
<li>The inverter&apos;s display access for starting the Wi-Fi access point.</li>
<li>The homeowner&apos;s router name and password.</li>
<li>The Solar.web app or browser access to the inverter interface.</li>
</ul>
<h2>Setup outline</h2>
<ol>
<li>Start the inverter Wi-Fi access point from the display or datalogger menu.</li>
<li>Join the inverter hotspot from a phone or laptop.</li>
<li>Open the inverter user interface or Solar.web commissioning path.</li>
<li>Enter the home Wi-Fi details and enable data transfer to Fronius Solar.web.</li>
<li>Save the settings and confirm the inverter reports to Solar.web again.</li>
</ol>
<h2>Useful reminders</h2>
<ul>
<li>The datalogger ID shown on the inverter display is often needed during setup.</li>
<li>Some Fronius systems can also be configured through the Solar.start or Solar.web app rather than only through a browser.</li>
</ul>
<h2>Official references</h2>
<p><a href="https://www.fronius.com/en/solar-energy/home-owners/contact/support-for-pv-system-owners/support-for-solarweb" target="_blank" rel="noreferrer">Fronius: Support for Fronius Solar.web</a></p>
<p><a href="https://www.fronius.com/~/downloads/Solar%20Energy/Technical%20Articles/SE_TEA_Quick_guide_Commissioning_Fronius_Monitoring_EN.pdf" target="_blank" rel="noreferrer">Fronius quick guide: Commissioning Fronius monitoring</a></p>
HTML,
            ],
            [
                'slug' => 'huawei-fusionsolar-wlan-configuration-guide',
                'title' => 'Huawei FusionSolar WLAN configuration guide',
                'excerpt' => 'How to use the FusionSolar app to connect a Huawei inverter or smart dongle to the home router.',
                'seo_keywords' => 'Huawei WiFi setup, FusionSolar WLAN configuration, SUN2000 router connection settings',
                'content' => <<<'HTML'
<p>This guide is based on Huawei FusionSolar user manuals covering WLAN configuration between the inverter or smart dongle and the home router.</p>
<h2>Before you start</h2>
<ul>
<li>Install the <strong>FusionSolar</strong> app.</li>
<li>Stand near the inverter or dongle during local commissioning.</li>
<li>Use the site&apos;s 2.4 GHz Wi-Fi credentials unless the specific Huawei hardware supports a different arrangement.</li>
</ul>
<h2>Typical setup path</h2>
<ol>
<li>Open FusionSolar and enter the local commissioning or services area.</li>
<li>Join the inverter WLAN or dongle WLAN when prompted.</li>
<li>Open <strong>WLAN Configuration</strong> or <strong>Router connection settings</strong>.</li>
<li>Select the home router and enter the Wi-Fi password.</li>
<li>Save the settings and wait for the connection confirmation.</li>
</ol>
<h2>Troubleshooting notes</h2>
<ul>
<li>Huawei documents separate owner and installer paths, so choose the correct app area for your access level.</li>
<li>If the device will not hold the router connection, repeat the WLAN configuration while standing closer to the inverter.</li>
</ul>
<h2>Official references</h2>
<p><a href="https://support.huawei.com/enterprise/en/doc/EDOC1100096889/d15c6893/wlan-configuration-connection-between-the-device-and-router" target="_blank" rel="noreferrer">Huawei: WLAN Configuration (connection between the device and router)</a></p>
<p><a href="https://support.huawei.com/enterprise/en/doc/EDOC1100173984/1e446318/wlan-communication-networking" target="_blank" rel="noreferrer">Huawei: WLAN communication networking</a></p>
HTML,
            ],
            [
                'slug' => 'sma-sunny-boy-home-wifi-guide',
                'title' => 'SMA Sunny Boy home Wi-Fi guide',
                'excerpt' => 'A straightforward path for joining a Sunny Boy inverter to a home 2.4 GHz Wi-Fi network and registering it in Sunny Portal.',
                'seo_keywords' => 'SMA Sunny Boy WiFi setup, Sunny Portal, Sunny Boy home network, SMA inverter wireless',
                'content' => <<<'HTML'
<p>This guide is based on SMA technical blog material for connecting residential Sunny Boy inverters with built-in Wi-Fi to a home network.</p>
<h2>What to know first</h2>
<ul>
<li>SMA notes that the built-in Wi-Fi path supports a <strong>2.4 GHz</strong> home Wi-Fi network.</li>
<li>You may need the WLAN password written on the inverter label after the initial setup phase.</li>
</ul>
<h2>Basic setup flow</h2>
<ol>
<li>Search for the SMA inverter hotspot from a phone or laptop.</li>
<li>Join the inverter network and open the SMA installation assistant or setup page.</li>
<li>Choose the option to connect the inverter to the homeowner&apos;s existing Wi-Fi network.</li>
<li>Select the router, enter the password and complete the wizard.</li>
<li>Register or reconnect the inverter in Sunny Portal if required.</li>
</ol>
<h2>Official references</h2>
<p><a href="https://www.sma-sunny.com/us/how-to-connect-a-sunny-boy-us-inverter-to-a-home-wi-fi-network/" target="_blank" rel="noreferrer">SMA: Connecting a Sunny Boy inverter to a home Wi-Fi network</a></p>
<p><a href="https://www.sma-sunny.com/en/service-tip-how-to-connect-a-sunny-boy-inverter-with-built-in-wifi-to-a-local-wireless-network/" target="_blank" rel="noreferrer">SMA: Service tip for Sunny Boy Wi-Fi setup</a></p>
HTML,
            ],
            [
                'slug' => 'enphase-iq-gateway-wifi-setup-guide',
                'title' => 'Enphase IQ Gateway Wi-Fi setup guide',
                'excerpt' => 'How to reconnect an Enphase IQ Gateway or Envoy gateway to Wi-Fi and restore cloud communication.',
                'seo_keywords' => 'Enphase WiFi setup, IQ Gateway WiFi, Envoy reconnect, Enphase App gateway',
                'content' => <<<'HTML'
<p>This guide is based on Enphase documentation for the IQ Gateway and recent release notes that mention Wi-Fi configuration improvements through the Enphase app.</p>
<h2>Before reconnecting</h2>
<ul>
<li>Confirm the gateway has power and is already commissioned.</li>
<li>Use the <strong>Enphase App</strong> or <strong>Enphase Installer App</strong>.</li>
<li>Have the home router password ready.</li>
</ul>
<h2>Typical homeowner workflow</h2>
<ol>
<li>Open the Enphase app and navigate to gateway communication or internet settings.</li>
<li>Start the Wi-Fi configuration process and join the gateway local network if prompted.</li>
<li>Select the home Wi-Fi and enter the password.</li>
<li>Save the settings and allow the gateway to reconnect to Enphase cloud services.</li>
</ol>
<h2>Useful notes</h2>
<ul>
<li>Current Enphase release notes mention improved Wi-Fi setup messaging in the app.</li>
<li>If the app still fails, try Ethernet temporarily so the gateway can finish any pending updates before retrying Wi-Fi.</li>
</ul>
<h2>Official references</h2>
<p><a href="https://enphase.com/download/iq-gateway" target="_blank" rel="noreferrer">Enphase IQ Gateway data sheet</a></p>
<p><a href="https://enphase.com/installers/resources/documentation/communication?f%5B0%5D=document%3A217" target="_blank" rel="noreferrer">Enphase IQ Gateway software and communication documentation</a></p>
HTML,
            ],
            [
                'slug' => 'tesla-powerwall-wifi-connection-guide',
                'title' => 'Tesla Powerwall Wi-Fi connection guide',
                'excerpt' => 'How to connect a Tesla Powerwall system to Wi-Fi from the Tesla app so the site reports properly to Tesla services.',
                'seo_keywords' => 'Tesla Powerwall WiFi setup, Powerwall internet connectivity, connect Powerwall to WiFi',
                'content' => <<<'HTML'
<p>This guide is based on Tesla support pages for Powerwall internet connectivity and Wi-Fi setup.</p>
<h2>Why it matters</h2>
<p>Tesla says internet connectivity is needed for full app visibility and for the system to maintain normal remote communication.</p>
<h2>Common setup path</h2>
<ol>
<li>Open the Tesla app and go to the Powerwall settings area.</li>
<li>Select the network setup or Wi-Fi option.</li>
<li>Scan for the local router and choose the correct network.</li>
<li>Enter the Wi-Fi password and save the connection.</li>
<li>Wait for the app to confirm the Powerwall has internet connectivity.</li>
</ol>
<h2>If you have trouble</h2>
<ul>
<li>Tesla notes that installers can also configure connectivity at installation time.</li>
<li>Weak Wi-Fi signal near the Powerwall or Backup Gateway can cause the setup to fail or drop out later.</li>
</ul>
<h2>Official references</h2>
<p><a href="https://www.tesla.com/support/energy/powerwall/mobile-app/connecting-powerwall-wi-fi" target="_blank" rel="noreferrer">Tesla Support: Connecting Powerwall to Wi-Fi</a></p>
<p><a href="https://www.tesla.com/support/energy/powerwall/own/internet-connectivity" target="_blank" rel="noreferrer">Tesla Support: Powerwall internet connectivity</a></p>
HTML,
            ],
            [
                'slug' => 'solax-cloud-wifi-setup-guide',
                'title' => 'SolaX Cloud Wi-Fi setup guide',
                'excerpt' => 'How to reconnect a SolaX inverter through the Pocket WiFi module and bring it online in SolaX Cloud.',
                'seo_keywords' => 'SolaX WiFi setup, SolaX Cloud, Pocket WiFi inverter, inverter hotspot setup',
                'content' => <<<'HTML'
<p>This guide is based on SolaX support instructions for connecting an inverter to SolaX Cloud through the Pocket WiFi module.</p>
<h2>Setup checklist</h2>
<ul>
<li>Use a phone or laptop that can join the Pocket WiFi hotspot.</li>
<li>Have the home Wi-Fi password ready.</li>
<li>Confirm the inverter and Pocket WiFi module are powered.</li>
</ul>
<h2>Typical setup flow</h2>
<ol>
<li>Search for the inverter Wi-Fi signal broadcast by the Pocket WiFi module.</li>
<li>Join the hotspot and open the SolaX local setup page or the guided cloud setup path.</li>
<li>Select the home router, enter the password and save the settings.</li>
<li>Allow the inverter to reconnect and then confirm it appears in SolaX Cloud.</li>
</ol>
<h2>Official references</h2>
<p><a href="https://solaxpowerservice.zendesk.com/hc/en-001/articles/11121617132303-How-to-connect-my-inverter-to-SolaX-cloud" target="_blank" rel="noreferrer">SolaX: How to connect my inverter to SolaX Cloud</a></p>
<p><a href="https://solax-technical.zendesk.com/hc/en-us/sections/14090429673871-Inverter-Setup" target="_blank" rel="noreferrer">SolaX support: Inverter setup</a></p>
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
                    'published_at' => now()->subMinutes(90 - min($index * 4, 36)),
                ],
            );
        }
    }
}
