module.exports = {
  apps: [{
    name: 'atividades-crm',
    script: 'npx',
    args: 'tsx server/index.ts',
    env: {
      DATABASE_URL: 'postgresql://sistema_user:1WeaItrKgPgKe5ju@localhost:5432/atividades_crm_sistema',
      SESSION_SECRET: 'sua-chave-secreta-super-segura-aqui',
      NODE_ENV: 'production',
      PORT: '5001'
    }
  }]
}
