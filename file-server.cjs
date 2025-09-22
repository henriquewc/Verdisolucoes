const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5001;

// Middleware básico
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS para desenvolvimento
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

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    console.log(`📥 Servindo arquivo: ${path}`);
  }
}));

// Servir arquivos do frontend
app.use(express.static(path.join(__dirname, 'dist/public')));

// Rota de login básica
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`🔐 Tentativa de login: ${username}`);
  
  if (username === 'admin' && password === 'admin123') {
    res.json({
      success: true,
      user: { id: 'admin-001', username: 'admin', isAdmin: true },
      message: 'Login realizado com sucesso'
    });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

// Rota para listar arquivos da pasta uploads
app.get('/api/files-list', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');
  
  try {
    if (!fs.existsSync(uploadsPath)) {
      console.log('❌ Pasta uploads não encontrada');
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
    
    console.log(`📋 Listando ${fileList.length} arquivos`);
    res.json(fileList);
  } catch (error) {
    console.error('❌ Erro ao listar arquivos:', error);
    res.status(500).json({ error: 'Erro ao listar arquivos' });
  }
});

// Rota para servir diretório de uploads (listagem)
app.get('/uploads/', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');
  
  try {
    if (!fs.existsSync(uploadsPath)) {
      return res.status(404).send('Pasta uploads não encontrada');
    }
    
    const files = fs.readdirSync(uploadsPath);
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Arquivos Uploads</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            .file-list { list-style: none; padding: 0; }
            .file-item { 
                padding: 10px; 
                margin: 5px 0; 
                background: #f5f5f5; 
                border-radius: 5px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .file-name { font-weight: bold; }
            .file-size { color: #666; font-size: 0.9em; }
            .download-btn { 
                background: #007bff; 
                color: white; 
                padding: 5px 15px; 
                text-decoration: none; 
                border-radius: 3px; 
            }
            .download-btn:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <h1>📁 Arquivos Uploads (${files.length} arquivos)</h1>
        <ul class="file-list">
    `;
    
    files.forEach(filename => {
      const filePath = path.join(uploadsPath, filename);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      
      html += `
        <li class="file-item">
            <div>
                <div class="file-name">📄 ${filename}</div>
                <div class="file-size">${sizeKB} KB - ${stats.mtime.toLocaleDateString('pt-BR')}</div>
            </div>
            <a href="/uploads/${filename}" class="download-btn" download>⬇️ Download</a>
        </li>
      `;
    });
    
    html += `
        </ul>
        <p><a href="/">← Voltar ao Sistema</a></p>
    </body>
    </html>
    `;
    
    console.log(`📂 Servindo listagem de ${files.length} arquivos`);
    res.send(html);
  } catch (error) {
    console.error('❌ Erro ao servir listagem:', error);
    res.status(500).send('Erro ao carregar arquivos');
  }
});

// Fallback para SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist/public/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Página não encontrada');
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Arquivos estáticos servidos em: /uploads/`);
  console.log(`🔗 Acesse: http://82.25.75.49:${PORT}/uploads/`);
  console.log(`📋 API de listagem: http://82.25.75.49:${PORT}/api/files-list`);
  
  // Verificar arquivos
  const uploadsPath = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadsPath)) {
    const files = fs.readdirSync(uploadsPath);
    console.log(`✅ ${files.length} arquivos encontrados na pasta uploads`);
    console.log(`📝 Primeiros arquivos: ${files.slice(0, 3).join(', ')}`);
  } else {
    console.log('❌ Pasta uploads não encontrada');
  }
});

// Rota para listar arquivos de uma atividade específica
app.get('/api/activities/:id/files', (req, res) => {
  const activityId = req.params.id;
  const uploadsPath = path.join(__dirname, 'uploads');
  
  try {
    if (!fs.existsSync(uploadsPath)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(uploadsPath);
    
    // Por enquanto, vamos simular que os arquivos pertencem à atividade
    // baseado no timestamp (arquivos mais recentes para atividades mais recentes)
    const activityFiles = files
      .filter(filename => filename.includes('.'))
      .map(filename => {
        const filePath = path.join(uploadsPath, filename);
        const stats = fs.statSync(filePath);
        
        return {
          filename,
          originalName: filename.split('.')[0] + '.' + filename.split('.').pop(),
          size: stats.size,
          uploadDate: stats.mtime.toISOString(),
          downloadUrl: `/uploads/${filename}`,
          activityId: activityId
        };
      })
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
      .slice(0, 5); // Mostrar os 5 arquivos mais recentes para esta atividade
    
    console.log(`📋 Listando ${activityFiles.length} arquivos para atividade ${activityId}`);
    res.json(activityFiles);
  } catch (error) {
    console.error('❌ Erro ao listar arquivos da atividade:', error);
    res.status(500).json({ error: 'Erro ao listar arquivos da atividade' });
  }
});
