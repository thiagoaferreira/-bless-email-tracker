export default async function handler(req, res) {
    const { 
        campaign = 'newsletter_bless', 
        user = 'anonymous', 
        source = 'email',
        product = '',
        type = 'open'
    } = req.query;
    
    const timestamp = new Date().toISOString();
    
    console.log('📧 Bless Email Tracking:', { 
        campaign, 
        user, 
        source, 
        product,
        type,
        timestamp,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });
    
    // Enviar DIRETO para GA4 via Measurement Protocol
    try {
        const measurementId = 'G-ZZSWBCPVTX'; // Seu Measurement ID
        const apiSecret = '5C6odVDnQZqTOL2p-87Zlg'; // API Secret do GA4
        
        // Gerar client_id único baseado no user ou criar um novo
        const clientId = user !== 'anonymous' ? user : `${Date.now()}.${Math.random()}`;
        
        const payload = {
            'client_id': clientId,
            'events': [{
                'name': type === 'click' ? 'email_click' : 'email_open',
                'params': {
                    'campaign_name': campaign,
                    'source': source,
                    'medium': 'email',
                    'campaign_medium': 'email',
                    'campaign_source': 'bless_newsletter',
                    'product_name': product,
                    'event_category': 'Email Marketing',
                    'event_label': `${campaign} - ${type}`,
                    'custom_parameter_1': product,
                    'timestamp': timestamp,
                    'engagement_time_msec': 100 // Tempo mínimo de engajamento
                }
            }]
        };
        
        const response = await fetch(
            `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, 
            {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': req.headers['user-agent'] || 'Bless-Email-Tracker/1.0'
                },
                body: JSON.stringify(payload)
            }
        );
        
        console.log('✅ GA4 Response Status:', response.status);
        console.log('✅ GA4 Response OK:', response.ok);
        
        if (!response.ok) {
            console.log('❌ GA4 Error Details:', await response.text());
        }
        
    } catch (error) {
        console.log('❌ GA4 Error:', error.message);
        console.log('❌ Full Error:', error);
    }
    
    // Opcional: Enviar também para um webhook ou banco de dados próprio
    try {
        // Aqui você pode adicionar seu próprio sistema de tracking
        // Por exemplo, salvar em uma planilha Google Sheets ou banco de dados
        
        // Exemplo para Google Sheets (se configurado):
        // await sendToGoogleSheets({ campaign, user, source, product, type, timestamp });
        
    } catch (error) {
        console.log('📊 Internal tracking error:', error.message);
    }
    
    // Retornar pixel transparente 1x1
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Pixel transparente base64
    const pixel = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 
        'base64'
    );
    
    res.end(pixel);
}
