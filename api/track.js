export default async function handler(req, res) {
    const { campaign = 'unknown', user = 'anonymous', source = 'email' } = req.query;
    
    const trackingData = {
        campaign, 
        user, 
        source,
        timestamp: new Date().toISOString(),
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
    };
    
    console.log('🚀 Email tracking:', trackingData);
    
    // Enviar para Google Analytics via Measurement Protocol
    try {
        const gtmData = {
            'client_id': user,
            'events': [{
                'name': 'email_open',
                'params': {
                    'campaign_name': campaign,
                    'source': source,
                    'medium': 'email',
                    'content': 'pixel_tracking'
                }
            }]
        };
        
        // Chamada para GA4 Measurement Protocol
        const gaResponse = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=G-XXXXXXXXXX&api_secret=YOUR_API_SECRET`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(gtmData)
        });
        
        console.log('📊 GA4 Response:', gaResponse.status);
        
    } catch (error) {
        console.log('❌ GA4 Error:', error.message);
    }
    
    // Retornar pixel
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    
    res.end(pixel);
}
