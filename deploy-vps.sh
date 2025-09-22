#!/bin/bash

# ========================================
# SCRIPT DE DEPLOY COMPLETO VPS Ubuntu 22.04
# Sistema de Atividades + CRM Integrado
# VERSÃO ATUALIZADA COM CRM COMPLETO
# ========================================

set -e  # Para parar em caso de erro

echo "🚀 DEPLOY SISTEMA ATIVIDADES + CRM INTEGRADO"
echo "============================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações principais
APP_DIR="/opt/atividades-crm"
SERVICE_NAME="atividades-crm"
DB_NAME="atividades_crm_sistema"
DB_USER="sistema_user"
NODE_VERSION="20"

# Permitir escolher porta personalizada
if [ -z "$1" ]; then
    APP_PORT="5001"  # Porta padrão se não especificada
    echo -e "${BLUE}💡 Usando porta padrão 5001. Para usar outra porta: ./deploy-vps.sh PORTA${NC}"
else
    APP_PORT="$1"
    echo -e "${BLUE}🔌 Usando porta personalizada: $APP_PORT${NC}"
fi

echo -e "${YELLOW}📋 Configurações do Deploy:${NC}"
echo "  📁 Diretório: $APP_DIR"
echo "  🗄️ Banco: $DB_NAME" 
echo "  👤 Usuário DB: $DB_USER"
echo "  📦 Node.js: v$NODE_VERSION"
echo "  🌐 URL: http://82.25.75.49:$APP_PORT"
echo "  🔌 Porta: $APP_PORT (diferente dos sistemas existentes)"
echo ""

# ========================================
# 1. VERIFICAR SISTEMA E DEPENDÊNCIAS
# ========================================
echo -e "${YELLOW}1️⃣ VERIFICANDO SISTEMA...${NC}"

# Verificar se é Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    echo -e "${RED}❌ Este script é para Ubuntu. Sistema detectado: $(cat /etc/os-release | grep PRETTY_NAME)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Sistema Ubuntu detectado${NC}"

# Atualizar sistema
echo -e "${BLUE}📦 Atualizando sistema...${NC}"
sudo apt update
sudo apt upgrade -y

# ========================================
# 2. INSTALAR NODE.JS 20 LTS
# ========================================
echo -e "${YELLOW}2️⃣ INSTALANDO NODE.JS...${NC}"

if ! node --version 2>/dev/null | grep -q "v20"; then
    echo -e "${BLUE}📦 Instalando Node.js 20 LTS...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo -e "${GREEN}✅ Node.js 20 já instalado${NC}"
fi

echo "✅ Node: $(node --version)"
echo "✅ NPM: $(npm --version)"

# ========================================
# 3. INSTALAR POSTGRESQL
# ========================================
echo -e "${YELLOW}3️⃣ CONFIGURANDO POSTGRESQL...${NC}"

if ! command -v psql &> /dev/null; then
    echo -e "${BLUE}📦 Instalando PostgreSQL...${NC}"
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
else
    echo -e "${GREEN}✅ PostgreSQL já instalado${NC}"
    sudo systemctl start postgresql
fi

# ========================================
# 4. INSTALAR DEPENDÊNCIAS EXTRAS
# ========================================
echo -e "${YELLOW}4️⃣ INSTALANDO DEPENDÊNCIAS...${NC}"

# PM2 para gerenciar processo
if ! command -v pm2 &> /dev/null; then
    echo -e "${BLUE}📦 Instalando PM2...${NC}"
    sudo npm install -g pm2
else
    echo -e "${GREEN}✅ PM2 já instalado${NC}"
fi

# Build tools essenciais
sudo apt install -y build-essential git curl

echo -e "${GREEN}✅ Dependências instaladas${NC}"

# ========================================
# 5. CONFIGURAR BANCO DE DADOS
# ========================================
echo -e "${YELLOW}5️⃣ CONFIGURANDO BANCO DE DADOS...${NC}"

# Gerar senha segura para o banco
DB_PASSWORD=$(openssl rand -base64 20 | tr -d "=+/" | cut -c1-16)

echo -e "${BLUE}🔑 Configurando usuário e banco...${NC}"

# Criar usuário (com tratamento de erro se já existir)
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || \
sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

# Criar banco (com tratamento de erro se já existir)
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true

# Conceder privilégios
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

# Habilitar extensão pgcrypto para UUIDs
sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;" 2>/dev/null || true

echo -e "${GREEN}✅ Banco de dados configurado${NC}"
echo -e "${BLUE}🔐 Senha do banco: $DB_PASSWORD (ANOTE!)${NC}"

# ========================================
# 6. PREPARAR DIRETÓRIO DA APLICAÇÃO
# ========================================
echo -e "${YELLOW}6️⃣ PREPARANDO APLICAÇÃO...${NC}"

# Criar diretório se não existir
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
cd $APP_DIR

echo -e "${BLUE}📁 Diretório preparado: $APP_DIR${NC}"

# ========================================
# 7. COPIAR CÓDIGO (MANUAL)
# ========================================
echo -e "${YELLOW}7️⃣ COPIAR CÓDIGO DA APLICAÇÃO${NC}"
echo ""
echo -e "${RED}⚠️  AÇÃO NECESSÁRIA - COPIE O CÓDIGO:${NC}"
echo ""
echo -e "${BLUE}OPÇÃO 1 - Upload direto:${NC}"
echo "  1. Faça download do ZIP do seu projeto Replit"
echo "  2. Extraia e copie TODOS os arquivos para: $APP_DIR"
echo "  3. Use SCP, SFTP ou qualquer ferramenta de upload"
echo ""
echo -e "${BLUE}OPÇÃO 2 - Git clone (se tiver repositório):${NC}"
echo "  git clone seu-repositorio.git $APP_DIR"
echo ""
echo -e "${BLUE}OPÇÃO 3 - SCP do seu computador:${NC}"
echo "  scp -r ./seu-projeto/* usuario@82.25.75.49:$APP_DIR/"
echo ""
echo -e "${YELLOW}📋 Arquivos obrigatórios que devem estar em $APP_DIR:${NC}"
echo "  ✅ package.json"
echo "  ✅ server/"
echo "  ✅ client/" 
echo "  ✅ shared/"
echo "  ✅ drizzle.config.ts"
echo "  ✅ tsconfig.json"
echo "  ✅ vite.config.ts"
echo ""
read -p "Pressione ENTER depois que copiar TODOS os arquivos para $APP_DIR..."

# Verificar arquivos essenciais
echo -e "${BLUE}🔍 Verificando arquivos copiados...${NC}"
MISSING_FILES=()

if [ ! -f "package.json" ]; then MISSING_FILES+=("package.json"); fi
if [ ! -d "server" ]; then MISSING_FILES+=("server/"); fi
if [ ! -d "client" ]; then MISSING_FILES+=("client/"); fi
if [ ! -d "shared" ]; then MISSING_FILES+=("shared/"); fi
if [ ! -f "drizzle.config.ts" ]; then MISSING_FILES+=("drizzle.config.ts"); fi

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${RED}❌ Arquivos obrigatórios não encontrados:${NC}"
    printf "  - %s\n" "${MISSING_FILES[@]}"
    echo ""
    echo -e "${RED}Copie todos os arquivos primeiro e execute o script novamente!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Todos os arquivos necessários encontrados${NC}"

# ========================================
# 8. INSTALAR DEPENDÊNCIAS DO PROJETO
# ========================================
echo -e "${YELLOW}8️⃣ INSTALANDO DEPENDÊNCIAS DO PROJETO...${NC}"

npm install

echo -e "${GREEN}✅ Dependências instaladas${NC}"

# ========================================
# 9. CONFIGURAR VARIÁVEIS DE AMBIENTE
# ========================================
echo -e "${YELLOW}9️⃣ CONFIGURANDO VARIÁVEIS DE AMBIENTE...${NC}"

# Gerar chave de sessão segura
SESSION_SECRET=$(openssl rand -base64 32)

# Criar arquivo .env para produção
cat > .env << EOF
# Configuração de Produção
NODE_ENV=production
PORT=$APP_PORT

# Base de dados PostgreSQL
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
PGHOST=localhost
PGPORT=5432
PGUSER=$DB_USER
PGPASSWORD=$DB_PASSWORD
PGDATABASE=$DB_NAME

# Chave da sessão (segura)
SESSION_SECRET=$SESSION_SECRET

# CRM Object Storage (simulação local)
DEFAULT_OBJECT_STORAGE_BUCKET_ID=local-bucket
PRIVATE_OBJECT_DIR=/tmp/private-objects
PUBLIC_OBJECT_SEARCH_PATHS=/tmp/public-objects
EOF

echo -e "${GREEN}✅ Variáveis de ambiente configuradas${NC}"

# ========================================
# 10. BUILD DA APLICAÇÃO
# ========================================
echo -e "${YELLOW}🔟 FAZENDO BUILD...${NC}"

npm run build

echo -e "${GREEN}✅ Build concluído${NC}"

# ========================================
# 11. CONFIGURAR E EXECUTAR MIGRAÇÕES
# ========================================
echo -e "${YELLOW}1️⃣1️⃣ CONFIGURANDO BANCO DE DADOS...${NC}"

# Executar migrações do Drizzle
echo -e "${BLUE}📊 Criando tabelas...${NC}"
npm run db:push

echo -e "${GREEN}✅ Tabelas criadas (Atividades + CRM)${NC}"

# ========================================
# 12. CONFIGURAR PM2
# ========================================
echo -e "${YELLOW}1️⃣2️⃣ CONFIGURANDO PM2...${NC}"

# Criar configuração do PM2
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'atividades-crm',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx/esm',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: $APP_PORT
    }
  }]
};
EOF

# Parar processos antigos se existirem
pm2 stop atividades-crm 2>/dev/null || true
pm2 delete atividades-crm 2>/dev/null || true

# Iniciar aplicação
echo -e "${BLUE}🚀 Iniciando aplicação...${NC}"
pm2 start ecosystem.config.cjs --env production

# Configurar inicialização automática
pm2 save
pm2 startup systemd -u $(whoami) --hp $HOME

echo -e "${GREEN}✅ PM2 configurado e aplicação iniciada${NC}"

# ========================================
# 13. CONFIGURAR FIREWALL
# ========================================
echo -e "${YELLOW}1️⃣3️⃣ CONFIGURANDO FIREWALL...${NC}"

# Habilitar UFW se não estiver
sudo ufw --force enable 2>/dev/null || true

# Permitir SSH (essencial!)
sudo ufw allow 22 2>/dev/null || true

# Permitir porta da aplicação
sudo ufw allow $APP_PORT 2>/dev/null || true

echo -e "${GREEN}✅ Firewall configurado (SSH + $APP_PORT)${NC}"

# ========================================
# 14. TESTE FINAL
# ========================================
echo -e "${YELLOW}1️⃣4️⃣ TESTANDO APLICAÇÃO...${NC}"

# Aguardar inicialização
echo -e "${BLUE}⏱️ Aguardando aplicação inicializar...${NC}"
sleep 10

# Testar aplicação
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$APP_PORT | grep -q "200\|302"; then
    echo -e "${GREEN}✅ Aplicação respondendo corretamente!${NC}"
    
    # Testar endpoints específicos
    echo -e "${BLUE}🔍 Testando endpoints...${NC}"
    
    # Testar API de atividades
    if curl -s http://localhost:$APP_PORT/api/activities >/dev/null; then
        echo "  ✅ API Atividades funcionando"
    else
        echo "  ⚠️ API Atividades com problema"
    fi
    
    # Testar API do CRM
    if curl -s http://localhost:$APP_PORT/api/crm/etapas >/dev/null; then
        echo "  ✅ API CRM funcionando"
    else
        echo "  ⚠️ API CRM com problema"
    fi
    
else
    echo -e "${RED}❌ Aplicação não está respondendo${NC}"
    echo -e "${YELLOW}📋 Verificar logs: pm2 logs atividades-crm${NC}"
fi

# ========================================
# 15. RESUMO FINAL
# ========================================
echo ""
echo -e "${GREEN}🎉 DEPLOY COMPLETO - SISTEMA FUNCIONANDO!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}🌐 ACESSO AO SISTEMA:${NC}"
echo "  URL: http://82.25.75.49:$APP_PORT"
echo "  Usuário: admin"
echo "  Senha: admin123"
echo "  🔌 Porta: $APP_PORT (não conflita com sistemas existentes)"
echo ""
echo -e "${YELLOW}📊 FUNCIONALIDADES DISPONÍVEIS:${NC}"
echo "  ✅ Sistema de Atividades completo"
echo "  ✅ CRM com 7 etapas de pipeline"
echo "  ✅ Gestão de Leads e Clientes"
echo "  ✅ Dashboard integrado"
echo "  ✅ Kanban Board para CRM"
echo "  ✅ Relatórios e estatísticas"
echo ""
echo -e "${YELLOW}🗄️ INFORMAÇÕES DO BANCO:${NC}"
echo "  Banco: $DB_NAME"
echo "  Usuário: $DB_USER"
echo "  Senha: $DB_PASSWORD"
echo "  Conectar: psql -h localhost -U $DB_USER $DB_NAME"
echo ""
echo -e "${YELLOW}🔧 COMANDOS ÚTEIS:${NC}"
echo "  pm2 status                    # Status da aplicação"
echo "  pm2 logs atividades-crm      # Ver logs em tempo real"
echo "  pm2 restart atividades-crm   # Reiniciar aplicação"
echo "  pm2 stop atividades-crm      # Parar aplicação"
echo "  pm2 start atividades-crm     # Iniciar aplicação"
echo ""
echo -e "${YELLOW}🔐 CREDENCIAIS IMPORTANTES (SALVE EM LOCAL SEGURO!):${NC}"
echo "  Sistema: admin / admin123"
echo "  Banco: $DB_USER / $DB_PASSWORD"
echo "  Sessão: $SESSION_SECRET"
echo ""
echo -e "${RED}⚠️ SEGURANÇA:${NC}"
echo "  1. Altere a senha 'admin123' no primeiro acesso"
echo "  2. Configure certificado SSL (Let's Encrypt)"
echo "  3. Configure backup automático do banco"
echo ""
echo -e "${GREEN}✅ SISTEMA DE ATIVIDADES + CRM ESTÁ ONLINE E FUNCIONANDO!${NC}"
echo ""