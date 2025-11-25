# Work Signal - Production Deployment Checklist

## Security Configuration

### 1. Environment Variables (.env)
Make sure your `.env` file has proper values:

```bash
# Django
DJANGO_SECRET_KEY=<generate-a-random-50-char-string>
DEBUG=0  # Set to 0 in production!

# Signal API
SIGNAL_API_URL=http://your-signal-controller-ip:9000
SIGNAL_API_KEY=your-actual-api-key

# Your Signal Number
MY_SIGNAL_NUMBER=+1234567890

# Allowed Hosts (your actual domains and IPs)
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com,192.168.1.100,localhost

# CORS Origins (IMPORTANT: Only list your actual frontend URLs)
# Format: protocol://domain:port (no trailing slash)
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# React App
REACT_APP_API_URL=https://api.yourdomain.com
```

### 2. CORS Security

**IMPORTANT**: Only add the domains you actually use to `CORS_ALLOWED_ORIGINS`.

Example for Cloudflare setup:
```
CORS_ALLOWED_ORIGINS=https://work-signal.yourdomain.com
```

Example for local network:
```
CORS_ALLOWED_ORIGINS=http://192.168.1.100:3000
```

Example for both:
```
CORS_ALLOWED_ORIGINS=https://work-signal.yourdomain.com,http://192.168.1.100:3000
```

### 3. Generate Django Secret Key

```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### 4. Check Your Configuration

After deployment, check logs:
```bash
docker compose logs backend | grep DEBUG
```

You should see:
```
DEBUG: CORS allowed origins: ['https://yourdomain.com']
DEBUG: Allowed hosts: ['yourdomain.com', 'api.yourdomain.com']
```

### 5. Test CORS

Open browser console on your frontend and try to login. If you see CORS errors:
1. Check that the frontend URL matches what's in `CORS_ALLOWED_ORIGINS`
2. Check that protocol (http/https) matches
3. Check for trailing slashes (don't use them)
4. Check for typos

### 6. Production Settings

When `DEBUG=0`:
- CORS is strictly enforced (only listed origins)
- Django serves production-ready static files
- Error pages don't show sensitive info

### 7. Firewall Rules

If using a firewall, allow:
- Port 8000 (backend API)
- Port 3000 (frontend)
- Or just expose via Cloudflare Tunnel (recommended)

## Common Issues

### "CORS error" in browser
→ Add your frontend URL to `CORS_ALLOWED_ORIGINS` in `.env`

### "Invalid Host header" 
→ Add your domain to `ALLOWED_HOSTS` in `.env`

### Backend can't reach Signal Controller
→ Check `SIGNAL_API_URL` and network connectivity

### Login fails with no error
→ Check backend logs: `docker compose logs backend`
→ Make sure you created a superuser: `docker compose exec backend python manage.py createsuperuser`
