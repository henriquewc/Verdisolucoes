# Substituir linha 306-333 com código correto
sed -i '306,333c\
  app.delete("/api/activities/:id", async (req, res) => {\
    try {\
      await storage.deleteActivity(req.params.id);\
      res.status(204).send();\
    } catch (error) {\
      res.status(500).json({ error: "Erro ao deletar atividade" });\
    }\
  });\
\
  // Upload de arquivos\
  app.post("/api/activities/:id/upload", authMiddleware, upload.array("files", 10), async (req, res) => {\
    try {\
      const files = req.files as Express.Multer.File[];\
      if (!files || files.length === 0) {\
        return res.status(400).json({ error: "Nenhum arquivo enviado" });\
      }\
\
      const results = files.map(file => ({\
        fileName: file.originalname,\
        filePath: file.path,\
        size: file.size\
      }));\
\
      res.json({ message: "Upload realizado", files: results });\
    } catch (error) {\
      res.status(500).json({ error: "Erro no upload" });\
    }\
  });' server/routes.ts
