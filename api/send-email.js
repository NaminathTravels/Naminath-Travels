

const DEFAULT_SENDER_EMAIL = 'naminathtravels22@gmail.com';
const DEFAULT_SENDER_NAME = 'Naminath Travels';

module.exports = async function handler(req, res) {
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, api-key');

    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({
            status: 'online',
            service: 'Safe Journeys Brevo Email Service',
            configured: Boolean(process.env.BREVO_API_KEY)
        }));
        return;
    }

    if (req.method !== 'POST') {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed. Use POST to send emails.' }));
        return;
    }

    try {
        
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) { body = {}; }
        }
        body = body || {};

        const {
            to,
            toName,
            subject,
            htmlContent,
            textContent,
            senderName,
            senderEmail,
            replyTo
        } = body;

        if (!to) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, error: 'Missing recipient email address ("to").' }));
            return;
        }

        const apiKey = process.env.BREVO_API_KEY;
        if (!apiKey) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({
                success: false,
                error: 'BREVO_API_KEY is not configured on the server. Please set it in .env or your host environment variables.'
            }));
            return;
        }

        const sender = {
            name: senderName || process.env.BREVO_SENDER_NAME || DEFAULT_SENDER_NAME,
            email: senderEmail || process.env.BREVO_SENDER_EMAIL || process.env.OWNER_EMAIL || DEFAULT_SENDER_EMAIL
        };

        const recipients = Array.isArray(to)
            ? to.map(item => (typeof item === 'string' ? { email: item } : item))
            : [{ email: to, name: toName || to.split('@')[0] }];

        const finalHtml = htmlContent || `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
                <div style="padding-bottom: 16px; border-bottom: 2px solid #0284c7; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #0f172a;">Naminath Travels</h2>
                    <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">Travel Safe, Travel Happy</p>
                </div>
                <div style="font-size: 15px; line-height: 1.7; color: #334155;">
                    ${(textContent || '').replace(/\n/g, '<br>')}
                </div>
                <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
                    Naminath Travels &bull; Ahmedabad, Gujarat &bull; Support: +91 91065 19219
                </div>
            </div>
        `;

        const brevoPayload = {
            sender: sender,
            to: recipients,
            subject: subject || 'Safe Journeys - Booking Update',
            htmlContent: finalHtml
        };

        if (textContent) {
            brevoPayload.textContent = textContent;
        }

        if (replyTo) {
            brevoPayload.replyTo = { email: replyTo };
        }

        const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey.trim(),
                'content-type': 'application/json'
            },
            body: JSON.stringify(brevoPayload)
        });

        const data = await brevoResponse.json();

        res.setHeader('Content-Type', 'application/json');
        if (!brevoResponse.ok) {
            res.statusCode = brevoResponse.status;
            res.end(JSON.stringify({
                success: false,
                error: data.message || 'Brevo API rejected the email dispatch request.',
                details: data
            }));
            return;
        }

        res.statusCode = 200;
        res.end(JSON.stringify({
            success: true,
            message: 'Email dispatched successfully via Brevo.',
            messageId: data.messageId
        }));
    } catch (err) {
        console.error('Serverless send-email handler error:', err);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 500;
        res.end(JSON.stringify({
            success: false,
            error: err.message || 'Internal error dispatching email.'
        }));
    }
};

