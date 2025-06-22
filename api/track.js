export default function handler(req, res) {
    const { campaign, user, source } = req.query;
    
    // Log tracking
    console.log('Email tracking:', { campaign, user, source, timestamp: new Date() });
    
    // Headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Pixel transparente 1x1
    const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    
    res.send(pixel);
}
