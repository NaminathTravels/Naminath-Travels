# Safe Journeys Happy Memories — Taxi & Tour Service Website

A modern taxi and tour travel booking web application with automated Brevo (Sendinblue) transactional email delivery, interactive fleet showcase, responsive customer booking interface, and administrative management dashboard.

---

## 🚀 Deployment Guide

This project is pre-configured and ready to deploy across multiple platforms with zero extra build steps:

### Option 1: Vercel (Recommended — Instant 1-Click Deploy)
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel Dashboard](https://vercel.com/) &rarr; **Add New Project** &rarr; Import your repository.
3. Under **Environment Variables**, add:
   - `BREVO_API_KEY`: `your_brevo_api_key_from_env`
   - `OWNER_EMAIL`: `naminathtravels22@gmail.com`
4. Click **Deploy**. Vercel will automatically serve the website and execute `/api/send-email` as a Serverless function via [`vercel.json`](vercel.json).

---

### Option 2: Netlify
1. Import repository into [Netlify Dashboard](https://app.netlify.com/).
2. Under **Site Configuration &rarr; Environment Variables**, add `BREVO_API_KEY`.
3. Deploy! [`netlify.toml`](netlify.toml) automatically configures routes and functions.

---

### Option 3: Node.js Cloud (Render, Railway, Heroku, VPS)
1. Set the Start Command to:
   ```bash
   npm start
   ```
2. Add your environment variables in the platform dashboard or upload `.env`.
3. The zero-dependency server ([`server.js`](server.js)) will start on the assigned `$PORT`.

---

### Option 4: Apache / cPanel / Shared Hosting (Hostinger, GoDaddy, Namecheap)
1. Upload all files to your `public_html` directory via cPanel File Manager or FTP.
2. The included [`.htaccess`](.htaccess) file protects sensitive `.env` files and routes `/api/send-email` to [`api/send-email.php`](api/send-email.php) with PHP cURL support.

---

## 💻 Local Testing

Double-click **`start_server.bat`** or run:
```bash
npm start
```
- **Website URL:** http://localhost:8085/
- **Admin Dashboard:** http://localhost:8085/admin.html
- **API Health Check:** http://localhost:8085/api/health

---

## 📧 Email Architecture

| Event | Primary Dispatch | Fallback |
| :--- | :--- | :--- |
| **New Customer Booking** | Brevo API (`/api/send-email`) | FormSubmit.co + EmailJS |
| **Admin Booking Approval** | 1-Click Brevo API Dispatch | 1-Click Gmail Pre-filled Composer |

- **Official Business Email:** `naminathtravels22@gmail.com`
- **Customer Helpline:** `+91 98765 43210`
