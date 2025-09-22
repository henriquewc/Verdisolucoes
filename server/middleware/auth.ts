import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Chave secreta para JWT (em produção, seria uma variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'sistema_atividades_secret_key_2024';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    isAdmin: boolean;
  };
}

// Interface para o payload do JWT
interface JWTPayload {
  id: string;
  username: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

// Middleware de autenticação com verificação JWT
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Verificar token JWT no cookie
    const token = req.cookies?.auth_token;
    
    if (!token) {
      return res.status(401).json({ 
        error: "Token de autenticação não encontrado. Faça login para continuar.",
        code: "NO_TOKEN" 
      });
    }
    
    // Verificar e decodificar o JWT
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Adicionar informações do usuário na requisição
    req.user = {
      id: decoded.id,
      username: decoded.username,
      isAdmin: decoded.isAdmin
    };
    
    next();
  } catch (error) {
    // Token inválido ou expirado
    return res.status(401).json({ 
      error: "Token de autenticação inválido ou expirado. Faça login novamente.",
      code: "INVALID_TOKEN" 
    });
  }
}

// Middleware específico para administradores
export function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Primeiro verificar autenticação
  authMiddleware(req, res, (error) => {
    if (error) return;
    
    // Verificar se o usuário é administrador
    if (!req.user?.isAdmin) {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas administradores podem acessar esta funcionalidade.",
        code: "FORBIDDEN" 
      });
    }
    
    next();
  });
}

// Função utilitária para gerar token JWT
export function generateAuthToken(user: { id: string; username: string; isAdmin: boolean }): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    },
    JWT_SECRET,
    { 
      expiresIn: '24h',
      issuer: 'sistema-atividades',
      audience: 'sistema-atividades-app'
    }
  );
}

// Função para definir cookie seguro - CORRIGIDA PARA VPS
export function setAuthCookie(res: Response, token: string): void {
  res.cookie('auth_token', token, {
    httpOnly: true,        // Não acessível via JavaScript
    secure: false,         // DESABILITADO para VPS sem HTTPS
    sameSite: 'lax',      // Mais permissivo para VPS
    maxAge: 24 * 60 * 60 * 1000, // 24 horas em ms
    path: '/',
    domain: undefined      // Sem restrição de domínio
  });
}

// Função para limpar cookie de autenticação
export function clearAuthCookie(res: Response): void {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    domain: undefined
  });
}
