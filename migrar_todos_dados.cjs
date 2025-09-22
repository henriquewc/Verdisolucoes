const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando migração completa de dados...');

// 1. Ler dados de atividades JSON
const atividades = JSON.parse(fs.readFileSync('atividades.json', 'utf8'));
console.log(`📋 Encontradas ${atividades.length} atividades para migrar`);

// 2. Conectar ao banco SQLite antigo
const dbAntigo = new sqlite3.Database('/var/www/gestus.pro/verdi_backup.db');

// 3. Conectar ao banco atual
const dbAtual = new sqlite3.Database('dev.db');

// 4. Criar tabelas no banco atual
dbAtual.serialize(() => {
    // Tabela de clientes
    dbAtual.run(`CREATE TABLE IF NOT EXISTS clientes (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        telefone TEXT,
        email TEXT,
        endereco TEXT,
        celpe_login TEXT,
        celpe_password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de atividades
    dbAtual.run(`CREATE TABLE IF NOT EXISTS atividades (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        tipoServico TEXT,
        clienteId TEXT,
        dataVencimento DATETIME,
        observacoes TEXT,
        responsavel TEXT,
        tipoRecorrencia TEXT,
        intervaloRecorrencia INTEGER,
        status TEXT,
        concluida BOOLEAN DEFAULT 0,
        dataConclusao DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (clienteId) REFERENCES clientes (id)
    )`);

    // Tabela de leads CRM
    dbAtual.run(`CREATE TABLE IF NOT EXISTS crm_leads (
        id TEXT PRIMARY KEY,
        nome_completo TEXT NOT NULL,
        telefone TEXT NOT NULL,
        email TEXT,
        cidade TEXT NOT NULL,
        endereco_completo TEXT NOT NULL,
        valor_conta_luz DECIMAL(10,2),
        tipo_imovel TEXT,
        como_chegou TEXT,
        observacoes TEXT,
        etapa_atual INTEGER DEFAULT 1,
        valor_proposta DECIMAL(10,2),
        vendedor_responsavel TEXT,
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_entrada_etapa DATETIME DEFAULT CURRENT_TIMESTAMP,
        ativo BOOLEAN DEFAULT 1
    )`);

    console.log('✅ Tabelas criadas no banco atual');

    // 5. Migrar atividades
    console.log('📋 Migrando atividades...');
    const stmtAtividade = dbAtual.prepare(`INSERT OR REPLACE INTO atividades 
        (id, nome, tipoServico, clienteId, dataVencimento, observacoes, responsavel, 
         tipoRecorrencia, intervaloRecorrencia, status, concluida, dataConclusao, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    atividades.forEach(atividade => {
        stmtAtividade.run([
            atividade.id,
            atividade.nome,
            atividade.tipoServico,
            atividade.clienteId,
            atividade.dataVencimento,
            atividade.observacoes,
            atividade.responsavel,
            atividade.tipoRecorrencia,
            atividade.intervaloRecorrencia,
            atividade.status,
            atividade.concluida ? 1 : 0,
            atividade.dataConclusao,
            atividade.createdAt
        ]);
    });
    stmtAtividade.finalize();
    console.log(`✅ ${atividades.length} atividades migradas`);

    // 6. Migrar leads do CRM
    console.log('🎯 Migrando leads do CRM...');
    dbAntigo.all("SELECT * FROM crm_leads", (err, rows) => {
        if (err) {
            console.error('❌ Erro ao ler leads:', err);
            return;
        }

        const stmtLead = dbAtual.prepare(`INSERT OR REPLACE INTO crm_leads 
            (id, nome_completo, telefone, email, cidade, endereco_completo, 
             valor_conta_luz, tipo_imovel, como_chegou, observacoes, etapa_atual, 
             valor_proposta, vendedor_responsavel, data_criacao, data_ultima_atualizacao, 
             data_entrada_etapa, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        rows.forEach(lead => {
            const uuid = require('crypto').randomUUID();
            stmtLead.run([
                uuid,
                lead.nome_completo,
                lead.telefone,
                lead.email,
                lead.cidade,
                lead.endereco_completo,
                lead.valor_conta_luz,
                lead.tipo_imovel,
                lead.como_chegou,
                lead.observacoes,
                lead.etapa_atual,
                lead.valor_proposta,
                lead.vendedor_responsavel,
                lead.data_criacao,
                lead.data_ultima_atualizacao,
                lead.data_entrada_etapa,
                lead.ativo
            ]);
        });
        stmtLead.finalize();
        console.log(`✅ ${rows.length} leads migrados`);

        // 7. Verificar migração
        dbAtual.get("SELECT COUNT(*) as total FROM atividades", (err, row) => {
            console.log(`📊 Total atividades no sistema: ${row.total}`);
        });

        dbAtual.get("SELECT COUNT(*) as total FROM crm_leads", (err, row) => {
            console.log(`📊 Total leads no sistema: ${row.total}`);
            console.log('🎉 MIGRAÇÃO COMPLETA!');
            
            dbAntigo.close();
            dbAtual.close();
        });
    });
});
