export default async function handler(req, res) {
    try {
        // Extrair parâmetros da query com valores padrão
        const campaign = req.query.campaign || 'newsletter_bless';
        const user = req.query.user || 'anonymous';
        const emailParam = req.query.email || '';
        const source = req.query.source || 'email';
        const product = req.query.product || '';
        const type = req.query.type || 'open';
        
        const timestamp = new Date().toISOString();
        
        // Log para debug
        console.log('📧 Bless Email Tracking:', { 
            campaign, 
            user, 
            email: emailParam,
            source, 
            product,
            type,
            timestamp
        });
        
        // Configurações GA4
        const measurementId = 'G-ZZSWBCPVTX';
        const apiSecret = '5C6odVDnQZqTOL2p-87Zlg';
        
        // Client ID único
        const clientId = user !== 'anonymous' ? user : `${Date.now()}.${Math.random()}`;
        
        // Payload para GA4
        const payload = {
            'client_id': clientId,
            'events': [{
                'name': type === 'click' ? 'email_click' : 'email_open',
                'params': {
                    'campaign_name': campaign,
                    'source': source,
                    'medium': 'email',
                    'product_name': product,
                    'customer_code': user,
                    'customer_email': emailParam,
                    'event_category': 'Email Marketing',
                    'engagement_time_msec': 100
                }
            }]
        };
        
        // Enviar para GA4
        try {
            const gaResponse = await fetch(
                `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, 
                {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );
            
            console.log('✅ GA4 Status:', gaResponse.status);
            
        } catch (gaError) {
            console.log('❌ GA4 Error:', gaError.message);
        }
        
        // REDIRECIONAMENTOS PARA CLIQUES
        if (type === 'click') {
            const redirects = {
                'botao_whatsapp': 'https://api.whatsapp.com/send?phone=5511913510728&text=Quero%20fazer%20meu%20pedidos%2C%20preciso%20de%20mais%20informa%C3%A7%C3%B5es',
                'botao_promocoes': 'https://www.blesscabeleireiros.com.br/promocoes?utm_source=email&utm_medium=newsletter&utm_campaign=mega_liquidacao_bless',
                'logo': 'https://www.blesscabeleireiros.com.br?utm_source=email&utm_medium=newsletter&utm_campaign=mega_liquidacao_bless',
                'banner_promocional': 'https://www.blesscabeleireiros.com.br/promocoes?utm_source=email&utm_medium=newsletter&utm_campaign=mega_liquidacao_bless',
                'instagram': 'https://www.instagram.com/blesscabeleireiros/',
                'facebook': 'https://www.facebook.com/blesscabeleireiros',
                'tiktok': 'https://www.tiktok.com/@blesscabeleireiros',
                'link_site_rodape': 'https://www.blesscabeleireiros.com.br?utm_source=email&utm_medium=newsletter&utm_campaign=mega_liquidacao_bless',
                'cupom_bemvindo10': 'https://www.blesscabeleireiros.com.br?utm_source=email&utm_medium=newsletter&utm_campaign=mega_liquidacao_bless&cupom=BEMVINDO10',
                'cupom_bemvindo10_destaque': 'https://www.blesscabeleireiros.com.br?utm_source=email&utm_medium=newsletter&utm_campaign=mega_liquidacao_bless&cupom=BEMVINDO10',
                'unsubscribe': 'https://www.blesscabeleireiros.com.br/descadastro'
            };
            
            const targetUrl = redirects[product];
            
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
        
        // Pixel 1x1 transparente
        const pixel = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 
            'base64'
        );
        
        res.status(200).end(pixel);
        
    } catch (error) {
        console.error('🚨 Function Error:', error);
        
        // Retornar pixel mesmo em caso de erro para não quebrar email
        res.setHeader('Content-Type', 'image/png');
        const pixel = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 
            'base64'
        );
        res.status(200).end(pixel);
    }
}
