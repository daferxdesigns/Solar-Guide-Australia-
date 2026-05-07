<!DOCTYPE html>
<html lang="en">
    <body style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Your solar estimate</h1>

        <p>Hello {{ $lead->name }},</p>

        <p>Thanks for using Solar Support Australia. Here is a summary of the estimate based on the details you entered.</p>

        <table cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse; margin: 20px 0; width: 100%; max-width: 640px;">
            <tr>
                <td style="border-bottom: 1px solid #e2e8f0;"><strong>System size</strong></td>
                <td style="border-bottom: 1px solid #e2e8f0;">{{ $result['system_size_kw'] }} kW</td>
            </tr>
            <tr>
                <td style="border-bottom: 1px solid #e2e8f0;"><strong>Location</strong></td>
                <td style="border-bottom: 1px solid #e2e8f0;">{{ $result['state'] }}</td>
            </tr>
            <tr>
                <td style="border-bottom: 1px solid #e2e8f0;"><strong>Estimated annual production</strong></td>
                <td style="border-bottom: 1px solid #e2e8f0;">{{ $result['annual_production_kwh'] }} kWh</td>
            </tr>
            <tr>
                <td style="border-bottom: 1px solid #e2e8f0;"><strong>Estimated monthly production</strong></td>
                <td style="border-bottom: 1px solid #e2e8f0;">{{ $result['monthly_production_kwh'] }} kWh</td>
            </tr>
            <tr>
                <td style="border-bottom: 1px solid #e2e8f0;"><strong>Estimated self-consumed solar</strong></td>
                <td style="border-bottom: 1px solid #e2e8f0;">{{ $result['self_consumed_kwh'] }} kWh</td>
            </tr>
            <tr>
                <td style="border-bottom: 1px solid #e2e8f0;"><strong>Estimated exported solar</strong></td>
                <td style="border-bottom: 1px solid #e2e8f0;">{{ $result['exported_kwh'] }} kWh</td>
            </tr>
            <tr>
                <td style="border-bottom: 1px solid #e2e8f0;"><strong>Estimated annual bill savings</strong></td>
                <td style="border-bottom: 1px solid #e2e8f0;">${{ $result['annual_savings_aud'] }}</td>
            </tr>
            <tr>
                <td style="border-bottom: 1px solid #e2e8f0;"><strong>Estimated monthly savings</strong></td>
                <td style="border-bottom: 1px solid #e2e8f0;">${{ $result['monthly_savings_aud'] }}</td>
            </tr>
            <tr>
                <td><strong>Estimated usage offset</strong></td>
                <td>{{ $result['usage_offset_percent'] }}%</td>
            </tr>
        </table>

        <p style="margin-top: 20px;">This estimate is a guide only. Actual production and savings vary depending on roof design, shading, installation quality, tariff structure, export arrangements, equipment choice and site conditions.</p>

        <p>Regards,<br>Solar Support Australia</p>
    </body>
</html>
