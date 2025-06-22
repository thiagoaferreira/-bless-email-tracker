export default function handler(req, res) {
    const { campaign = 'unknown', user = 'anonymous', source = 'email' } = req.query;
    
    console.log('🚀 Email tracking:', { campaign, user, source, timestamp: new Date() });
    
    // Criar script que injeta no dataLayer quando a página carrega
    const gtmScript = `
    <script>
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'server_email_open',
            'email_campaign': '${campaign}',
            'email_user': '${user}',
            'email_source': '${source}',
            'email_timestamp': '${new Date().toISOString()}'
        });
        console.log('📊 DataLayer atualizado:', window.dataLayer);
    </script>
    `;
    
    // Se é requisição de imagem, retornar pixel
    if (req.headers.accept && req.headers.accept.includes('image')) {
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-cache');
        
        const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
        res.end(pixel);
    } else {
        // Se é requisição normal, retornar HTML com script
        res.setHeader('Content-Type', 'text/html');
        res.end(`
        <!DOCTYPE html>
        <html><head><title>Email Tracking</title></head>
        <body>
            ${gtmScript}
            <img src="/api/track?campaign=${campaign}&user=${user}&source=${source}" width="1" height="1" style="display:none;">
        </body></html>
        `);
    }
}
