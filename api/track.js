export default async function handler(req, res) {
    const { 
        campaign = 'newsletter_bless', 
        user = 'anonymous', 
        source = 'email',
        product = '',
        type = 'open',
        redirect = '' // Novo parâmetro para redirecionamento
    } = req.query;
    
    const timestamp = new Date().toISOString();
    
    console.log('📧 Bless Email Tracking:', { 
        campaign, 
        user, 
        email, // Adicionado o email no log
        source, 
        product,
        type,
        redirect,
        timestamp,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });
    
    // Enviar para GA4 via Measurement Protocol
    try {
        const measurementId = 'G-ZZSWBCPVTX';
        const apiSecret = '5C6odVDnQZqTOL2p-87Zlg';
        
        const clientId = user !== 'anonymous' ? user : `${Date.now()}.${Math.random()}`;
        
        const payload = {
            'client_id': clientId,
            'user_id': email || user, // Usar email como user_id se disponível
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
                    'customer_code': user, // Código do cliente
                    'customer_email': email, // Email do cliente
                    'custom_parameter_1': product,
                    'timestamp': timestamp,
                    'engagement_time_msec': 100,
                    'redirect_url': redirect || 'none'
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
        
    } catch (error) {
        console.log('❌ GA4 Error:', error.message);
    }
    
    // REDIRECIONAMENTO para cliques
    if (type === 'click' && redirect) {
        // URLs de redirecionamento baseadas no produto
        const redirectMap = {
            'botao_whatsapp': 'https://api.whatsapp.com/send?phone=5511913510728&text=Quero%20fazer%20meu%20pedidos%2C%20preciso%20de%20mais%20informa%C3%A7%C3%B5es',
            'botao_promocoes': 'https://www.blesscabeleireiros.com.br/promocoes?utm_source=email&utm_medium=newsletter&utm_campaign=mega_liquidacao_bless',
            'logo': 'https://www.blesscabeleireiros.com.br?utm_source=email&utm_medium=newsletter&utm_campaign=mega_liquidacao_bless',
            'banner_promocional': 'https://www.blesscabeleireiros.com.br/promocoes?utm_source=email&utm_medium=newsletter&utm_campaign=mega_liquidacao_bless',
            'instagram': 'https://www.instagram.com/blesscabeleireiros/',
            'facebook': 'https://www.facebook.com/blesscabeleireiros',
            'tiktok': 'https://www.tiktok.com/@blesscabeleireiros',
            'link_site_rodape': 'https://www.blesscabeleireiros.com.br?utm_source=email&utm_medium=newsletter&utm_campaign=mega_liquidacao_bless',
            'cupom_bemvindo10': 'https://www.blesscabeleireiros.com.br?utm_source=email&utm_medium=newsletter&utm_campaign=mega_liquidacao_bless&cupom=BEMVINDO10',
            'cupom_bemvindo10_destaque': 'https://www.blesscabeleireiros.com.br?utm_source=email&utm_medium=newsletter&utm_campaign=mega_liquidacao_bless&cupom=BEMVINDO10'
        };
        
        const targetUrl = redirectMap[product] || redirect;
        
        if (targetUrl) {
            console.log('🔗 Redirecting to:', targetUrl);
            res.writeHead(302, { 'Location': targetUrl });
            res.end();
            return;
        }
    }
    
    // Pixel transparente para aberturas
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const pixel = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 
        'base64'
    );
    
    res.end(pixel);
}
