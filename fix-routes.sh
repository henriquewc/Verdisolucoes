# Baixar arquivo routes.ts do Replit funcionando
curl -s 'https://raw.githubusercontent.com/replit-discord/replit-agent-debug/main/server/routes.ts' > server/routes.ts.new
if [ -s server/routes.ts.new ]; then
  mv server/routes.ts.new server/routes.ts
  echo "Arquivo routes.ts atualizado"
else
  echo "Erro no download - mantendo arquivo original"
fi
npm run build
pm2 restart atividades-crm
