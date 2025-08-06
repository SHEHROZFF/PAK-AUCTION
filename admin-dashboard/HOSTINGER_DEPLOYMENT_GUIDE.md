# Admin Dashboard Deployment Guide for Hostinger

## Prerequisites
- Node.js installed on your local machine
- Access to your Hostinger control panel
- Backend API already deployed (currently: pak-auc-back.com.phpnode.net)

## Step 1: Environment Setup

Create a `.env.local` file in the `admin-dashboard` directory:

```env
# Production Environment Configuration
NEXT_PUBLIC_API_URL=https://pak-auc-back.com.phpnode.net
```

If your backend is deployed on a different URL, update the `NEXT_PUBLIC_API_URL` accordingly.

## Step 2: Install Dependencies

Navigate to the admin-dashboard directory and install dependencies:

```bash
cd admin-dashboard
npm install
```

## Step 3: Build for Production

Run the build command to create the production build:

```bash
npm run build
```

This will create an `out` folder with all the static files ready for deployment.

## Step 4: Upload to Hostinger

### Method 1: File Manager (Recommended for small sites)

1. **Access Hostinger Control Panel**
   - Log into your Hostinger account
   - Go to the hosting control panel

2. **Navigate to File Manager**
   - Open the File Manager
   - Navigate to `public_html` (or your domain's root directory)

3. **Upload Files**
   - Zip the contents of the `out` folder (not the folder itself)
   - Upload the zip file to `public_html`
   - Extract the files directly in `public_html`

### Method 2: FTP/SFTP Upload

1. **Get FTP Credentials**
   - In Hostinger control panel, find FTP/SSH details
   - Note down: hostname, username, password, port

2. **Upload via FTP Client**
   - Use FileZilla, WinSCP, or similar FTP client
   - Connect using your credentials
   - Upload all files from the `out` folder to `public_html`

## Step 5: Configure Domain/Subdomain

### For Main Domain
- Upload files directly to `public_html`
- Your admin dashboard will be accessible at `https://yourdomain.com`

### For Subdomain (Recommended)
1. **Create Subdomain**
   - In Hostinger control panel, go to Subdomains
   - Create subdomain: `admin.yourdomain.com`

2. **Upload to Subdomain**
   - Upload files to the subdomain's directory (usually `public_html/admin`)

## Step 6: Verify Deployment

1. **Check Website Access**
   - Visit your domain/subdomain
   - Verify the admin dashboard loads correctly

2. **Test API Connection**
   - Try logging in to verify backend connectivity
   - Check if all features work properly

## Step 7: SSL Certificate (Important for Production)

1. **Enable SSL**
   - In Hostinger control panel, go to SSL
   - Enable SSL for your domain/subdomain
   - Wait for SSL activation (usually 10-15 minutes)

2. **Force HTTPS**
   - Enable "Force HTTPS" option in control panel
   - This ensures all traffic uses secure connections

## Troubleshooting

### Common Issues:

1. **404 Error on Page Refresh**
   - Add a `.htaccess` file to handle client-side routing:
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

2. **API Connection Issues**
   - Verify the `NEXT_PUBLIC_API_URL` is correct
   - Ensure CORS is configured on your backend
   - Check SSL certificates on both frontend and backend

3. **Images Not Loading**
   - Verify image URLs in the Next.js config
   - Check if your backend allows cross-origin image requests

## Environment Variables for Different Environments

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Production (.env.production)
```env
NEXT_PUBLIC_API_URL=https://pak-auc-back.com.phpnode.net
```

## Build Commands Reference

```bash
# Development
npm run dev

# Production build (static export)
npm run build

# Combined build and export
npm run build:export

# Start production server (if not using static export)
npm run start
```

## Additional Security Considerations

1. **Admin Access Control**
   - Consider IP whitelisting for admin dashboard
   - Implement strong authentication
   - Use HTTPS only

2. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different API URLs for staging/production

## Support

If you encounter issues:
1. Check Hostinger documentation
2. Verify your backend API is accessible
3. Check browser console for JavaScript errors
4. Ensure all environment variables are set correctly

---

**Note:** This guide assumes static export deployment. If you need server-side features, you'll need Node.js hosting instead of standard web hosting.