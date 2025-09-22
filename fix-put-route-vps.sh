#!/bin/bash

echo "🔧 CORRIGINDO ROTA PUT NO VPS..."

# Navegar para diretório
cd /opt/atividades-crm

# Backup de segurança
cp server/routes.ts server/routes.ts.backup-$(date +%s)

# Encontrar linha onde adicionar a rota PUT
LINE_NUMBER=$(grep -n "api.post(\"/activities/:id/complete\"" server/routes.ts | cut -d: -f1)

if [ -z "$LINE_NUMBER" ]; then
    echo "❌ Não encontrou linha de referência"
    exit 1
fi

# Calcular linha para inserção (2 linhas antes)
INSERT_LINE=$((LINE_NUMBER - 2))

echo "📍 Inserindo rota PUT na linha $INSERT_LINE"

# Criar rota PUT
cat > put_route.txt << 'EOPUT'

  // PUT route para atualizar atividades
  api.put("/activities/:id", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.partial().parse(req.body);
      const updatedActivity = await storage.updateActivity(req.params.id, validatedData);
      if (!updatedActivity) {
        return res.status(404).json({ error: "Atividade não encontrada" });
      }
      res.json(updatedActivity);
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Dados inválidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro ao atualizar atividade" });
    }
  });
EOPUT

# Inserir no arquivo
head -n $INSERT_LINE server/routes.ts > temp_routes.ts
cat put_route.txt >> temp_routes.ts
tail -n +$((INSERT_LINE + 1)) server/routes.ts >> temp_routes.ts
mv temp_routes.ts server/routes.ts
rm put_route.txt

echo "✅ Rota PUT adicionada!"

# Reiniciar serviço
pkill -f "tsx.*server/index.ts"
sleep 3
npm run dev &
sleep 8

echo "🎉 Correção concluída! Teste a interface web."
