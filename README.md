# Work Signal

A web-based Signal messaging interface built with Django, React, and Material UI. This application provides a clean web interface to interact with your Signal messages through a private Signal Controller.

## Features

- 🔐 Secure login authentication
- 💬 List all conversations (individuals and groups)
- 👥 Create new chats with contacts
- 📱 Send and receive messages in real-time
- 👤 View contact and group profiles
- 📊 Message statistics
- 🎨 Modern Material UI design
- 🐳 Fully containerized with Docker

## Architecture

- **Backend**: Django REST Framework (port 8000)
- **Frontend**: React with Material UI (port 3000)
- **Signal Controller**: Private Signal API server

## Prerequisites

- Docker and Docker Compose
- Access to Signal Controller API
- Signal Controller API Key

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd work-signal
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your Signal API key:

```env
SIGNAL_API_KEY=your-actual-api-key-here
DJANGO_SECRET_KEY=your-secret-key-here
```

### 3. Build and start the application

```bash
docker-compose up -d --build
```

### 4. Create a Django superuser

```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### 5. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Django Admin: http://localhost:8000/admin

## Usage

1. Navigate to http://localhost:3000
2. Log in with your Django superuser credentials
3. View your conversations in the left sidebar
4. Click on a conversation to open the chat
5. Click the + button to start a new chat
6. Send messages using the input field at the bottom

## API Endpoints

### Authentication
- `POST /api/token/` - Obtain JWT token
- `POST /api/token/refresh/` - Refresh JWT token

### Messaging
- `GET /api/conversations/` - List all conversations
- `GET /api/groups/` - List group conversations
- `GET /api/messages/` - Get messages (with filters)
- `GET /api/messages/{id}/` - Get specific message
- `POST /api/send/` - Send a message

### Profile
- `GET /api/profile/` - Get user profile
- `GET /api/contact/profile/` - Get contact profile

### Statistics
- `GET /api/stats/` - Get message statistics
- `GET /api/health/` - Health check

## Development

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

## Deployment

The application is designed to run using Docker Compose. Configure your environment variables in `.env` based on `.env.example`.

## Security Notes

- Always use strong passwords for Django superuser accounts
- Keep your `DJANGO_SECRET_KEY` secret and unique
- Never commit `.env` file to version control
- Use HTTPS in production
- Regularly update dependencies

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
