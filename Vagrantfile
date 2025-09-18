# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Use Ubuntu 20.04 LTS
  config.vm.box = "ubuntu/focal64"
  
  # Configure VM
  config.vm.hostname = "voice-translator-pro"
  config.vm.network "private_network", ip: "192.168.33.10"
  config.vm.network "forwarded_port", guest: 3000, host: 3000
  config.vm.network "forwarded_port", guest: 80, host: 8080
  config.vm.network "forwarded_port", guest: 443, host: 8443
  
  # VM resources
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "2048"
    vb.cpus = 2
    vb.name = "voice-translator-pro"
  end
  
  # Provisioning
  config.vm.provision "shell", inline: <<-SHELL
    # Update system
    apt-get update
    apt-get upgrade -y
    
    # Install Node.js
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
    
    # Install Nginx
    apt-get install -y nginx
    
    # Install PM2
    npm install -g pm2
    
    # Create application directory
    mkdir -p /var/www/voice-translator-pro
    chown -R www-data:www-data /var/www/voice-translator-pro
    
    # Configure Nginx
    cat > /etc/nginx/sites-available/voice-translator-pro << 'EOF'
    server {
        listen 80;
        server_name _;
        root /var/www/voice-translator-pro;
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/voice-translator-pro /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Start services
    systemctl start nginx
    systemctl enable nginx
    
    # Install SSL certificate
    apt-get install -y certbot python3-certbot-nginx
    
    echo "Setup complete! Access the application at http://192.168.33.10:8080"
  SHELL
  
  # Sync folders
  config.vm.synced_folder ".", "/var/www/voice-translator-pro", type: "nfs"
  
  # Post-up message
  config.vm.post_up_message = <<-SHELL
    Voice Translator Pro is now running!
    
    Access the application at:
    - HTTP: http://192.168.33.10:8080
    - HTTPS: https://192.168.33.10:8443
    
    To SSH into the VM:
    vagrant ssh
    
    To stop the VM:
    vagrant halt
    
    To destroy the VM:
    vagrant destroy
  SHELL
end
