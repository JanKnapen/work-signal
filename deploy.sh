#!/bin/bash

# =============================================================================
# DEPLOYMENT SCRIPT FOR WORK-SIGNAL ON UBUNTU VM (192.168.68.63)
# =============================================================================

echo "=========================================="
echo "Work Signal Deployment Script"
echo "=========================================="
echo ""

# Update system packages
echo "Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo ""
echo "Step 2: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "Docker installed successfully!"
else
    echo "Docker is already installed."
fi

# Install Docker Compose
echo ""
echo "Step 3: Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed successfully!"
else
    echo "Docker Compose is already installed."
fi

# Install Git
echo ""
echo "Step 4: Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install -y git
    echo "Git installed successfully!"
else
    echo "Git is already installed."
fi

# Create application directory
echo ""
echo "Step 5: Setting up application directory..."
cd ~
if [ ! -d "work-signal" ]; then
    echo "Cloning repository..."
    git clone https://github.com/JanKnapen/work-signal.git
    cd work-signal
else
    echo "Directory already exists. Pulling latest changes..."
    cd work-signal
    git pull
fi

# Setup environment file
echo ""
echo "Step 6: Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit the .env file and add your Signal API key:"
    echo "   nano .env"
    echo ""
    read -p "Press Enter after you've configured the .env file..."
else
    echo ".env file already exists."
fi

# Build and start containers
echo ""
echo "Step 7: Building and starting Docker containers..."
docker compose down
docker compose up -d --build

# Wait for containers to be ready
echo ""
echo "Waiting for containers to start..."
sleep 10

# Run Django migrations
echo ""
echo "Step 8: Running database migrations..."
docker compose exec -T backend python manage.py migrate

# Create superuser
echo ""
echo "Step 9: Creating Django superuser..."
echo "You'll need to create an admin user to log in to the application."
docker compose exec backend python manage.py createsuperuser

# Show status
echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Application URLs:"
echo "  Frontend: https://work-signal.janne.men"
echo "  Backend:  https://work-signal-api.janne.men"
echo "  Admin:    https://work-signal-api.janne.men/admin"
echo "  Local Frontend: http://192.168.68.63:3000"
echo "  Local Backend:  http://192.168.68.63:8000"
echo ""
echo "To view logs:"
echo "  docker compose logs -f"
echo ""
echo "To stop the application:"
echo "  docker compose down"
echo ""
echo "To restart the application:"
echo "  docker compose restart"
echo ""
