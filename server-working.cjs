const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 5001;

// Middleware básico
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'dist/public')));

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, timestamp + extension);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Dados mock para demonstração
const mockUsers = [
  { id: 'admin-001', username: 'admin', password: 'admin123', isAdmin: true }
];

const mockClients = [
  { id: '1', name: 'Anderson Souza de Carvalho' },
  { id: '2', name: 'Maria Silva Santos' },
  { id: '3', name: 'João Pedro Oliveira' }
];

let mockActivities = [
  {
    id: '1',
    nome: 'Renovação do monitoramento',
    cliente: 'Anderson Souza de Carvalho',
    tipoServico: 'Monitoramento',
    dataVencimento: '2026-06-29',
    responsavel: 'Ellydy',
    status: 'Em dia',
    observacoes: 'Atividade de monitoramento mensal'
  },
  {
    id: '2', 
    nome: 'Envio de Dados Mensais',
    cliente: 'Maria Silva Santos',
    tipoServico: 'Envio de Dados',
    dataVencimento: '2025-10-15',
    responsavel: 'Ellydy',
    status: 'Pendente',
    observacoes: 'Envio mensal de relatórios'
  },
  {
    id: '3',
    nome: 'Teste Upload Funcionando',
    cliente: 'Anderson Souza de Carvalho',
    tipoServico: 'Geração',
    dataVencimento: '2025-12-31',
    responsavel: 'Sistema',
    status: 'Em dia',
    observacoes: 'Atividade de teste para upload de arquivos'
  }
];

// Rotas de autenticação
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = mockUsers.find(u => u.username === username && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
    console.log('✅ Login realizado:', username);
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    console.log('❌ Login falhou:', username);
  }
});

// Rotas de atividades
app.get('/api/activities', (req, res) => {
  console.log('📋 Listando atividades:', mockActivities.length);
  res.json(mockActivities);
});

app.post('/api/activities', (req, res) => {
  const newActivity = {
    id: Date.now().toString(),
    ...req.body,
    status: 'Em dia'
  };
  mockActivities.push(newActivity);
  console.log('➕ Nova atividade criada:', newActivity.nome);
  res.json(newActivity);
});

app.put('/api/activities/:id', (req, res) => {
  const { id } = req.params;
  const activityIndex = mockActivities.findIndex(a => a.id === id);
  
  if (activityIndex !== -1) {
    // Filtrar campos vazios
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && req.body[key] !== null && req.body[key] !== '') {
        updateData[key] = req.body[key];
      }
    });
    
    if (Object.keys(updateData).length > 0) {
      mockActivities[activityIndex] = { ...mockActivities[activityIndex], ...updateData };
      console.log('✏️ Atividade atualizada:', mockActivities[activityIndex].nome);
    } else {
      console.log('ℹ️ Nenhum dado para atualizar, retornando atividade atual');
    }
    
    res.json(mockActivities[activityIndex]);
  } else {
    res.status(404).json({ error: 'Atividade não encontrada' });
  }
});

// Rota de upload
app.post('/api/activities/:id/upload', upload.array('files'), (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files.map(file => ({
      fileName: file.originalname,
      filePath: `/uploads/${file.filename}`,
      size: file.size
    }));
    
    console.log(`📤 Upload realizado para atividade ${id}: ${files.length} arquivo(s)`);
    files.forEach(file => {
      console.log(`  - ${file.fileName} (${file.size} bytes)`);
    });
    
    res.json({ message: 'Upload realizado', files });
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({ error: 'Erro no upload' });
  }
});

// Rota para listar arquivos
app.get('/api/files-list', (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsPath)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(uploadsPath);
    const fileList = files.map(filename => {
      const filePath = path.join(uploadsPath, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        originalName: filename,
        size: stats.size,
        uploadDate: stats.mtime.toISOString(),
        downloadUrl: `/uploads/${filename}`
      };
    });
    
    console.log(`📁 Listando ${fileList.length} arquivos`);
    res.json(fileList);
  } catch (error) {
    console.error('❌ Erro ao listar arquivos:', error);
    res.status(500).json({ error: 'Erro ao listar arquivos' });
  }
});

// Rota para arquivos específicos da atividade
app.get('/api/activities/:id/files', (req, res) => {
  const activityId = req.params.id;
  
  try {
    const uploadsPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsPath)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(uploadsPath);
    
    // Simular arquivos específicos da atividade (últimos 3 arquivos)
    const activityFiles = files
      .filter(filename => filename.includes('.'))
      .map(filename => {
        const filePath = path.join(uploadsPath, filename);
        const stats = fs.statSync(filePath);
        
        return {
          filename,
          originalName: filename,
          size: stats.size,
          uploadDate: stats.mtime.toISOString(),
          downloadUrl: `/uploads/${filename}`,
          activityId: activityId
        };
      })
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
      .slice(0, 3);
    
    console.log(`📋 Listando ${activityFiles.length} arquivos para atividade ${activityId}`);
    res.json(activityFiles);
  } catch (error) {
    console.error('❌ Erro ao listar arquivos da atividade:', error);
    res.status(500).json({ error: 'Erro ao listar arquivos da atividade' });
  }
});

// Rota para clientes
app.get('/api/clients', (req, res) => {
  console.log('👥 Listando clientes:', mockClients.length);
  res.json(mockClients);
});

// Página de listagem de uploads
app.get('/uploads/', (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsPath)) {
      return res.send('<h1>Pasta de uploads não encontrada</h1>');
    }
    
    const files = fs.readdirSync(uploadsPath);
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Arquivos de Upload - Sistema CRM</title>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px; }
            .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; margin-top: 20px; }
            .file-item { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; }
            .file-name { font-weight: bold; color: #333; margin-bottom: 5px; }
            .file-info { font-size: 12px; color: #666; margin-bottom: 10px; }
            .download-btn { background: #28a745; color: white; padding: 8px 15px; text-decoration: none; border-radius: 4px; display: inline-block; }
            .download-btn:hover { background: #218838; }
            .stats { background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📁 Arquivos de Upload - Sistema CRM</h1>
            <div class="stats">
                <strong>📊 Total de arquivos:</strong> ${files.length}<br>
                <strong>📂 Localização:</strong> /opt/atividades-crm/uploads/<br>
                <strong>🔗 Sistema:</strong> <a href="/">Voltar ao CRM</a>
            </div>
            <div class="file-grid">
    `;
    
    files.forEach(filename => {
      const filePath = path.join(uploadsPath, filename);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      const date = stats.mtime.toLocaleDateString('pt-BR');
      const time = stats.mtime.toLocaleTimeString('pt-BR');
      
      const icon = filename.toLowerCase().includes('.pdf') ? '📄' : 
                  filename.toLowerCase().includes('.jpg') || filename.toLowerCase().includes('.jpeg') ? '🖼️' :
                  filename.toLowerCase().includes('.txt') ? '📝' : '📎';
      
      html += `
        <div class="file-item">
            <div class="file-name">${icon} ${filename}</div>
            <div class="file-info">
                📏 Tamanho: ${sizeKB} KB<br>
                📅 Data: ${date} às ${time}
            </div>
            <a href="/uploads/${filename}" class="download-btn" download>⬇️ Download</a>
        </div>
      `;
    });
    
    html += `
            </div>
        </div>
    </body>
    </html>
    `;
    
    res.send(html);
  } catch (error) {
    res.status(500).send('<h1>Erro ao listar arquivos</h1>');
  }
});

// Fallback para SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist/public/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <h1>Sistema CRM - Verdi Soluções</h1>
      <p>Sistema temporariamente em manutenção.</p>
      <p><a href="/uploads/">Ver arquivos de upload</a></p>
    `);
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor CRM funcionando na porta ${PORT}`);
  console.log(`📁 Arquivos estáticos: /uploads/`);
  console.log(`🔗 Acesse: http://82.25.75.49:${PORT}/`);
  console.log(`👤 Login: admin / admin123`);
  
  // Verificar arquivos existentes
  const uploadsPath = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadsPath)) {
    const files = fs.readdirSync(uploadsPath);
    console.log(`📋 ${files.length} arquivos encontrados na pasta uploads`);
    if (files.length > 0) {
      console.log(`📝 Primeiros arquivos: ${files.slice(0, 3).join(', ')}`);
    }
  } else {
    console.log('⚠️ Pasta uploads não encontrada, será criada automaticamente');
  }
  
  console.log(`📊 ${mockActivities.length} atividades mock disponíveis`);
  console.log('✅ Sistema completamente operacional!');
});
