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
  }
];

// Rotas de autenticação
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = mockUsers.find(u => u.username === username && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

// Rotas de atividades
app.get('/api/activities', (req, res) => {
  res.json(mockActivities);
});

app.post('/api/activities', (req, res) => {
  const newActivity = {
    id: Date.now().toString(),
    ...req.body,
    status: 'Em dia'
  };
  mockActivities.push(newActivity);
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
    }
    
    res.json(mockActivities[activityIndex]);
  } else {
    res.status(404).json({ error: 'Atividade não encontrada' });
  }
});

// Rota de upload
app.post('/api/activities/:id/upload', upload.array('files'), (req, res) => {
  try {
    const files = req.files.map(file => ({
      fileName: file.originalname,
      filePath: `/uploads/${file.filename}`,
      size: file.size
    }));
    
    console.log(`📤 Upload realizado: ${files.length} arquivo(s)`);
    res.json({ message: 'Upload realizado', files });
  } catch (error) {
    console.error('Erro no upload:', error);
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
    
    res.json(fileList);
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ error: 'Erro ao listar arquivos' });
  }
});

// Rota para clientes
app.get('/api/clients', (req, res) => {
  res.json(mockClients);
});

// Fallback para SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist/public/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Sistema em manutenção');
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor funcionando na porta ${PORT}`);
  console.log(`📁 Arquivos em: /uploads/`);
  console.log(`🔗 Acesse: http://82.25.75.49:${PORT}/`);
  
  // Verificar arquivos existentes
  const uploadsPath = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadsPath)) {
    const files = fs.readdirSync(uploadsPath);
    console.log(`📋 ${files.length} arquivos encontrados`);
  }
});
