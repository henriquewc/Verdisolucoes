var __defProp = Object.defineProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import cookieParser from "cookie-parser";
import express from "express";
import path2 from "path";
import { fileURLToPath } from "url";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activities: () => activities,
  attachments: () => attachments,
  authLogs: () => authLogs,
  calcularDiasNaEtapa: () => calcularDiasNaEtapa,
  calcularValorPorWp: () => calcularValorPorWp,
  calculateActivityStatus: () => calculateActivityStatus,
  cidades: () => cidades,
  clients: () => clients,
  comoChegouOptions: () => comoChegouOptions,
  condicoesPagamento: () => condicoesPagamento,
  configuracoes: () => configuracoes,
  crmEtapas: () => crmEtapas,
  crmHistorico: () => crmHistorico,
  crmLeads: () => crmLeads,
  crmLeadsPerdidos: () => crmLeadsPerdidos,
  etapasPadr\u00E3o: () => etapasPadr\u00E3o,
  formatCurrency: () => formatCurrency,
  formatPercentual: () => formatPercentual,
  formatarValorContaLuz: () => formatarValorContaLuz,
  insertActivitySchema: () => insertActivitySchema,
  insertAttachmentSchema: () => insertAttachmentSchema,
  insertCidadeSchema: () => insertCidadeSchema,
  insertClientSchema: () => insertClientSchema,
  insertCondicaoPagamentoSchema: () => insertCondicaoPagamentoSchema,
  insertConfiguracaoSchema: () => insertConfiguracaoSchema,
  insertCrmEtapaSchema: () => insertCrmEtapaSchema,
  insertCrmHistoricoSchema: () => insertCrmHistoricoSchema,
  insertCrmLeadSchema: () => insertCrmLeadSchema,
  insertMargemSchema: () => insertMargemSchema,
  insertPotenciaSchema: () => insertPotenciaSchema,
  insertPropostaSchema: () => insertPropostaSchema,
  insertUsuarioSchema: () => insertUsuarioSchema,
  margens: () => margens,
  maskDocumentDigits: () => maskDocumentDigits,
  parseCurrency: () => parseCurrency,
  potencias: () => potencias,
  propostas: () => propostas,
  sanitizeClient: () => sanitizeClient,
  statusOptions: () => statusOptions,
  statusPropostaOptions: () => statusPropostaOptions,
  tipoImovelOptions: () => tipoImovelOptions,
  tipoRecorrenciaOptions: () => tipoRecorrenciaOptions,
  tipoServicoOptions: () => tipoServicoOptions,
  tipoTelhadoOptions: () => tipoTelhadoOptions,
  userLevelOptions: () => userLevelOptions,
  userSessions: () => userSessions,
  usuarios: () => usuarios,
  validateCNPJ: () => validateCNPJ,
  validateCPF: () => validateCPF,
  validateDocument: () => validateDocument,
  verificarPrazoEtapa: () => verificarPrazoEtapa
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nomeCompleto: text("nome_completo").notNull(),
  documento: text("documento").notNull().unique(),
  // CPF ou CNPJ
  endereco: text("endereco").notNull(),
  celular: text("celular").notNull(),
  numeroContrato: text("numero_contrato").notNull(),
  loginConcessionaria: text("login_concessionaria").notNull(),
  senhaConcessionaria: text("senha_concessionaria").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  tipoServico: text("tipo_servico").notNull(),
  // "Geração" | "Monitoramento" | "Envio de Dados"
  clienteId: varchar("cliente_id").references(() => clients.id).notNull(),
  dataVencimento: timestamp("data_vencimento").notNull(),
  observacoes: text("observacoes"),
  responsavel: text("responsavel"),
  tipoRecorrencia: text("tipo_recorrencia").notNull(),
  // "Mensal" | "Anual"
  intervaloRecorrencia: integer("intervalo_recorrencia").default(1).notNull(),
  // quantos meses/anos
  status: text("status").default("pendente").notNull(),
  // "pendente" | "concluida" | "atrasada"
  concluida: boolean("concluida").default(false).notNull(),
  dataConclusao: timestamp("data_conclusao"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var attachments = pgTable("attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  atividadeId: varchar("atividade_id").references(() => activities.id).notNull(),
  nomeArquivo: text("nome_arquivo").notNull(),
  urlArquivo: text("url_arquivo").notNull(),
  tipoArquivo: text("tipo_arquivo").notNull(),
  // "pdf" | "jpeg"
  tamanho: integer("tamanho").notNull(),
  // em bytes
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true
}).extend({
  documento: z.string().min(1, "Documento \xE9 obrigat\xF3rio").max(50, "Documento muito longo")
});
var insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
  status: true
}).extend({
  // Accept ISO string and convert to Date
  dataVencimento: z.union([
    z.date(),
    z.string().datetime().transform((str) => new Date(str))
  ]),
  dataConclusao: z.union([
    z.date(),
    z.string().datetime().transform((str) => new Date(str))
  ]).optional()
});
var insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true
});
var tipoServicoOptions = ["Gera\xE7\xE3o", "Monitoramento", "Envio de Dados"];
var tipoRecorrenciaOptions = ["Mensal", "Anual"];
function calculateActivityStatus(activity) {
  if (activity.concluida) {
    return "concluida";
  }
  const now = /* @__PURE__ */ new Date();
  const dueDate = new Date(activity.dataVencimento);
  const timeDiff = dueDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1e3 * 3600 * 24));
  if (daysDiff < 0) {
    return "atrasada";
  }
  if (daysDiff <= 3) {
    return "vencimento_proximo";
  }
  return "em_dia";
}
function validateCPF(cpf) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let remainder = sum * 10 % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  remainder = sum * 10 % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;
  return true;
}
function validateCNPJ(cnpj) {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(digits[12])) return false;
  const weights2 = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9];
  sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights2[i];
  }
  sum += digit1 * 2;
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(digits[13])) return false;
  return true;
}
function validateDocument(documento) {
  const digits = documento.replace(/\D/g, "");
  if (digits.length === 11) {
    return validateCPF(documento);
  } else if (digits.length === 14) {
    return validateCNPJ(documento);
  }
  return false;
}
var statusOptions = ["pendente", "concluida", "atrasada"];
function maskDocumentDigits(documento) {
  const digits = documento.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.***.${digits.slice(6, 9)}-${digits.slice(9)}`;
  } else if (digits.length === 14) {
    return `${digits.slice(0, 2)}.***.***/****-${digits.slice(12)}`;
  }
  return documento;
}
function sanitizeClient(client) {
  return {
    ...client,
    documento: maskDocumentDigits(client.documento)
  };
}
var potencias = pgTable("potencias", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  potencia: text("potencia").notNull(),
  // Ex: "5.94 kWp"
  materialAC: integer("material_ac").notNull(),
  // Preço do material AC em centavos
  descricaoEquipamentos: text("descricao_equipimentos").notNull(),
  precoCeramica: integer("preco_ceramica").notNull(),
  // Preço em centavos
  precoFibrocimento: integer("preco_fibrocimento").notNull(),
  precoLaje: integer("preco_laje").notNull(),
  precoSolo: integer("preco_solo").notNull(),
  precoMetalico: integer("preco_metalico").notNull(),
  estimativaGeracao: integer("estimativa_geracao").notNull(),
  // kWh/mês
  valorEconomia: integer("valor_economia").notNull(),
  // R$/mês em centavos
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var cidades = pgTable("cidades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull().unique(),
  custoExtraDia: integer("custo_extra_dia").notNull(),
  // Custo extra por dia em centavos
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var margens = pgTable("margens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  descricao: text("descricao").notNull(),
  percentual: integer("percentual").notNull(),
  // Percentual * 100 (ex: 1500 = 15%)
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var condicoesPagamento = pgTable("condicoes_pagamento", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  condicao: text("condicao").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var propostas = pgTable("propostas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Dados do Cliente
  nomeCliente: text("nome_cliente").notNull(),
  emailCliente: text("email_cliente").notNull(),
  telefoneCliente: text("telefone_cliente").notNull(),
  titularCliente: text("titular_cliente").notNull(),
  numeroContrato: text("numero_contrato").notNull(),
  enderecoCliente: text("endereco_cliente"),
  // Sistema Fotovoltaico
  potenciaId: varchar("potencia_id").references(() => potencias.id).notNull(),
  tipoTelhado: text("tipo_telhado").notNull(),
  // "ceramica" | "fibrocimento" | "laje" | "solo" | "metalico"
  diasInstalacao: integer("dias_instalacao").notNull(),
  // Local e Custos
  cidadeId: varchar("cidade_id").references(() => cidades.id).notNull(),
  margemId: varchar("margem_id").references(() => margens.id).notNull(),
  condicaoPagamentoId: varchar("condicao_pagamento_id").references(() => condicoesPagamento.id).notNull(),
  // Valores Calculados (em centavos)
  valorSistema: integer("valor_sistema").notNull(),
  materialAC: integer("material_ac").notNull(),
  maoObra: integer("mao_obra").notNull(),
  deslocamento: integer("deslocamento").notNull(),
  valorProjeto: integer("valor_projeto").notNull(),
  subtotal: integer("subtotal").notNull(),
  valorMargem: integer("valor_margem").notNull(),
  totalSemImposto: integer("total_sem_imposto").notNull(),
  valorImposto: integer("valor_imposto").notNull(),
  totalFinal: integer("total_final").notNull(),
  // Customizações
  valorFinalPersonalizado: integer("valor_final_personalizado"),
  margemRealObtida: integer("margem_real_obtida"),
  // Percentual * 100
  valorPorWp: integer("valor_por_wp"),
  // Valor por Wp em centavos
  // Vistoria (opcional)
  dataVistoria: timestamp("data_vistoria"),
  observacoesTecnicas: text("observacoes_tecnicas"),
  // Controle
  status: text("status").default("rascunho").notNull(),
  // "rascunho" | "enviada" | "aprovada" | "rejeitada"
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var configuracoes = pgTable("configuracoes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chave: text("chave").notNull().unique(),
  valor: text("valor").notNull(),
  descricao: text("descricao"),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertPotenciaSchema = createInsertSchema(potencias).omit({
  id: true,
  createdAt: true
}).extend({
  potencia: z.string().min(1, "Pot\xEAncia \xE9 obrigat\xF3ria"),
  materialAC: z.number().min(0, "Valor deve ser positivo"),
  precoCeramica: z.number().min(0, "Valor deve ser positivo"),
  precoFibrocimento: z.number().min(0, "Valor deve ser positivo"),
  precoLaje: z.number().min(0, "Valor deve ser positivo"),
  precoSolo: z.number().min(0, "Valor deve ser positivo"),
  precoMetalico: z.number().min(0, "Valor deve ser positivo"),
  estimativaGeracao: z.number().min(0, "Valor deve ser positivo"),
  valorEconomia: z.number().min(0, "Valor deve ser positivo")
});
var insertCidadeSchema = createInsertSchema(cidades).omit({
  id: true,
  createdAt: true
}).extend({
  nome: z.string().min(1, "Nome da cidade \xE9 obrigat\xF3rio"),
  custoExtraDia: z.number().min(0, "Valor deve ser positivo")
});
var insertMargemSchema = createInsertSchema(margens).omit({
  id: true,
  createdAt: true
}).extend({
  descricao: z.string().min(1, "Descri\xE7\xE3o \xE9 obrigat\xF3ria"),
  percentual: z.number().min(0, "Percentual deve ser positivo")
});
var insertCondicaoPagamentoSchema = createInsertSchema(condicoesPagamento).omit({
  id: true,
  createdAt: true
}).extend({
  condicao: z.string().min(1, "Condi\xE7\xE3o de pagamento \xE9 obrigat\xF3ria")
});
var insertPropostaSchema = createInsertSchema(propostas).omit({
  id: true,
  createdAt: true
}).extend({
  nomeCliente: z.string().min(1, "Nome do cliente \xE9 obrigat\xF3rio"),
  emailCliente: z.string().email("Email inv\xE1lido"),
  telefoneCliente: z.string().min(1, "Telefone \xE9 obrigat\xF3rio"),
  titularCliente: z.string().min(1, "Titular \xE9 obrigat\xF3rio"),
  numeroContrato: z.string().min(1, "N\xFAmero do contrato \xE9 obrigat\xF3rio"),
  diasInstalacao: z.number().min(1, "Dias de instala\xE7\xE3o deve ser positivo"),
  tipoTelhado: z.enum(["ceramica", "fibrocimento", "laje", "solo", "metalico"])
});
var insertConfiguracaoSchema = createInsertSchema(configuracoes).omit({
  id: true,
  updatedAt: true
}).extend({
  chave: z.string().min(1, "Chave \xE9 obrigat\xF3ria"),
  valor: z.string().min(1, "Valor \xE9 obrigat\xF3rio")
});
var tipoTelhadoOptions = ["ceramica", "fibrocimento", "laje", "solo", "metalico"];
var statusPropostaOptions = ["rascunho", "enviada", "aprovada", "rejeitada"];
function formatCurrency(centavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(centavos / 100);
}
function parseCurrency(valor) {
  const numeroLimpo = valor.replace(/[R$\s.]/g, "").replace(",", ".");
  return Math.round(parseFloat(numeroLimpo) * 100);
}
function formatPercentual(centesimos) {
  return `${(centesimos / 100).toFixed(2)}%`;
}
function calcularValorPorWp(totalFinal, potenciaKwp) {
  const potenciaWp = potenciaKwp * 1e3;
  return Math.round(totalFinal / potenciaWp);
}
var crmEtapas = pgTable("crm_etapas", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 50 }).notNull(),
  icone: varchar("icone", { length: 10 }),
  ordem: integer("ordem").notNull(),
  prazoDias: integer("prazo_dias").notNull(),
  cor: varchar("cor", { length: 7 }).default("#326E34").notNull(),
  corAlerta: varchar("cor_alerta", { length: 7 }).default("#F79633").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var crmLeads = pgTable("crm_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nomeCompleto: varchar("nome_completo", { length: 100 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  email: varchar("email", { length: 100 }),
  cidade: varchar("cidade", { length: 50 }).notNull(),
  enderecoCompleto: text("endereco_completo").notNull(),
  valorContaLuz: integer("valor_conta_luz").notNull(),
  // Em centavos
  tipoImovel: varchar("tipo_imovel", { length: 50 }),
  comoChegou: varchar("como_chegou", { length: 100 }),
  observacoes: text("observacoes"),
  etapaAtual: integer("etapa_atual").references(() => crmEtapas.id).notNull().default(1),
  valorProposta: integer("valor_proposta"),
  // Em centavos
  vendedorResponsavel: varchar("vendedor_responsavel").references(() => usuarios.id),
  dataUltimaAtualizacao: timestamp("data_ultima_atualizacao").defaultNow().notNull(),
  dataEntradaEtapa: timestamp("data_entrada_etapa").defaultNow().notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var crmHistorico = pgTable("crm_historico", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => crmLeads.id).notNull(),
  etapaAnterior: integer("etapa_anterior").references(() => crmEtapas.id),
  etapaNova: integer("etapa_nova").references(() => crmEtapas.id).notNull(),
  usuario: varchar("usuario").references(() => usuarios.id).notNull(),
  observacoes: text("observacoes"),
  dataMovimentacao: timestamp("data_movimentacao").defaultNow().notNull()
});
var crmLeadsPerdidos = pgTable("crm_leads_perdidos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => crmLeads.id).notNull(),
  motivoPerda: text("motivo_perda"),
  dataPerda: timestamp("data_perda").defaultNow().notNull(),
  usuario: varchar("usuario").references(() => usuarios.id).notNull(),
  dadosLeadJson: text("dados_lead_json").notNull()
  // Backup dos dados do lead
});
var usuarios = pgTable("usuarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  userLevel: integer("user_level").notNull().default(3),
  // 1=Admin, 2=Manager, 3=User
  isActive: boolean("is_active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  loginAttempts: integer("login_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => usuarios.id).notNull(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var authLogs = pgTable("auth_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => usuarios.id),
  action: varchar("action", { length: 50 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  details: text("details"),
  success: boolean("success").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertCrmEtapaSchema = createInsertSchema(crmEtapas).extend({
  nome: z.string().min(1, "Nome da etapa \xE9 obrigat\xF3rio"),
  ordem: z.number().min(1, "Ordem deve ser positiva"),
  prazoDias: z.number().min(1, "Prazo deve ser positivo")
});
var insertCrmLeadSchema = createInsertSchema(crmLeads).omit({
  id: true,
  createdAt: true,
  dataUltimaAtualizacao: true,
  dataEntradaEtapa: true
}).extend({
  nomeCompleto: z.string().min(1, "Nome completo \xE9 obrigat\xF3rio"),
  telefone: z.string().min(1, "Telefone \xE9 obrigat\xF3rio"),
  email: z.string().email("Email inv\xE1lido").optional(),
  cidade: z.string().min(1, "Cidade \xE9 obrigat\xF3ria"),
  enderecoCompleto: z.string().min(1, "Endere\xE7o \xE9 obrigat\xF3rio"),
  valorContaLuz: z.number().min(0, "Valor deve ser positivo")
});
var insertUsuarioSchema = createInsertSchema(usuarios).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
  loginAttempts: true,
  lockedUntil: true
}).extend({
  username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inv\xE1lido"),
  passwordHash: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  fullName: z.string().min(1, "Nome completo \xE9 obrigat\xF3rio"),
  userLevel: z.number().min(1).max(3)
});
var insertCrmHistoricoSchema = createInsertSchema(crmHistorico).omit({
  id: true,
  dataMovimentacao: true
}).extend({
  leadId: z.string().min(1, "Lead ID \xE9 obrigat\xF3rio"),
  etapaNova: z.number().min(1, "Etapa nova \xE9 obrigat\xF3ria"),
  usuario: z.string().min(1, "Usu\xE1rio \xE9 obrigat\xF3rio")
});
var userLevelOptions = [
  { value: 1, label: "Administrador" },
  { value: 2, label: "Gerente" },
  { value: 3, label: "Usu\xE1rio" }
];
var tipoImovelOptions = [
  "Residencial",
  "Comercial",
  "Industrial",
  "Rural",
  "Apartamento",
  "Casa"
];
var comoChegouOptions = [
  "Indica\xE7\xE3o",
  "Google",
  "Facebook",
  "Instagram",
  "WhatsApp",
  "Site",
  "Telefone",
  "Visita direta"
];
function calcularDiasNaEtapa(dataEntrada) {
  const agora = /* @__PURE__ */ new Date();
  const diffTime = agora.getTime() - dataEntrada.getTime();
  return Math.floor(diffTime / (1e3 * 60 * 60 * 24));
}
function verificarPrazoEtapa(dataEntrada, prazoDias) {
  const diasNaEtapa = calcularDiasNaEtapa(dataEntrada);
  const diasRestantes = prazoDias - diasNaEtapa;
  let status;
  if (diasRestantes < 0) {
    status = "atrasado";
  } else if (diasRestantes <= 1) {
    status = "alerta";
  } else {
    status = "em_dia";
  }
  return {
    diasNaEtapa,
    diasRestantes,
    status
  };
}
function formatarValorContaLuz(centavos) {
  return formatCurrency(centavos);
}
var etapasPadr\u00E3o = [
  { id: 1, nome: "Lead Novo", icone: "\u{1F4CB}", ordem: 1, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633", ativo: true },
  { id: 2, nome: "Primeiro Contato", icone: "\u{1F4DE}", ordem: 2, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633", ativo: true },
  { id: 3, nome: "Segundo Contato", icone: "\u{1F504}", ordem: 3, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633", ativo: true },
  { id: 4, nome: "Proposta/Or\xE7amento", icone: "\u{1F4B0}", ordem: 4, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633", ativo: true },
  { id: 5, nome: "Visita T\xE9cnica", icone: "\u{1F3E0}", ordem: 5, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633", ativo: true },
  { id: 6, nome: "Negocia\xE7\xE3o", icone: "\u2696", ordem: 6, prazoDias: 15, cor: "#326E34", corAlerta: "#F79633", ativo: true },
  { id: 7, nome: "Fechamento", icone: "\u2705", ordem: 7, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633", ativo: true }
];

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var isLocalConnection = process.env.DATABASE_URL?.includes("localhost") || process.env.DATABASE_URL?.includes("127.0.0.1");
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: !isLocalConnection && process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, sql as sql2 } from "drizzle-orm";
var ClientDocumentExistsError = class extends Error {
  constructor(document) {
    super(`CLIENT_DOCUMENT_EXISTS: ${document}`);
    this.name = "ClientDocumentExistsError";
  }
};
var DatabaseStorage = class {
  constructor() {
  }
  // === CLIENTS METHODS ===
  async getClient(id) {
    const result = await db.select().from(clients).where(eq(clients.id, id));
    return result[0];
  }
  async getAllClients() {
    return await db.select().from(clients);
  }
  async createClient(insertClient) {
    try {
      const existingClient = await db.select().from(clients).where(eq(clients.documento, insertClient.documento)).limit(1);
      if (existingClient.length > 0) {
        throw new ClientDocumentExistsError(insertClient.documento);
      }
      const result = await db.insert(clients).values({
        ...insertClient,
        ativo: insertClient.ativo ?? true
      }).returning();
      return result[0];
    } catch (error) {
      if (error instanceof ClientDocumentExistsError) {
        throw error;
      }
      if (error?.code === "23505" && (error?.constraint?.includes("documento") || error?.constraint === "clients_documento_unique")) {
        throw new ClientDocumentExistsError(insertClient.documento);
      }
      throw error;
    }
  }
  async updateClient(id, updateData) {
    const result = await db.update(clients).set(updateData).where(eq(clients.id, id)).returning();
    return result[0];
  }
  // === ACTIVITIES METHODS ===
  async getActivity(id) {
    const result = await db.select().from(activities).where(eq(activities.id, id));
    const activity = result[0];
    if (!activity) return void 0;
    if (!activity.concluida) {
      const calculatedStatus = calculateActivityStatus(activity);
      if (activity.status !== calculatedStatus) {
        const updatedResult = await db.update(activities).set({ status: calculatedStatus }).where(eq(activities.id, id)).returning();
        return updatedResult[0];
      }
    }
    return activity;
  }
  async getAllActivities() {
    const allActivities = await db.select().from(activities);
    const updatedActivities = [];
    for (const activity of allActivities) {
      if (!activity.concluida) {
        const calculatedStatus = calculateActivityStatus(activity);
        if (activity.status !== calculatedStatus) {
          const updatedResult = await db.update(activities).set({ status: calculatedStatus }).where(eq(activities.id, activity.id)).returning();
          updatedActivities.push(updatedResult[0]);
        } else {
          updatedActivities.push(activity);
        }
      } else {
        updatedActivities.push(activity);
      }
    }
    return updatedActivities;
  }
  async getActivitiesByClient(clientId) {
    const clientActivities = await db.select().from(activities).where(eq(activities.clienteId, clientId));
    const updatedActivities = [];
    for (const activity of clientActivities) {
      if (!activity.concluida) {
        const calculatedStatus = calculateActivityStatus(activity);
        if (activity.status !== calculatedStatus) {
          const updatedResult = await db.update(activities).set({ status: calculatedStatus }).where(eq(activities.id, activity.id)).returning();
          updatedActivities.push(updatedResult[0]);
        } else {
          updatedActivities.push(activity);
        }
      } else {
        updatedActivities.push(activity);
      }
    }
    return updatedActivities;
  }
  async createActivity(insertActivity) {
    const result = await db.insert(activities).values({
      ...insertActivity,
      intervaloRecorrencia: insertActivity.intervaloRecorrencia ?? 1,
      observacoes: insertActivity.observacoes ?? null,
      responsavel: insertActivity.responsavel ?? null,
      status: "pendente",
      concluida: false,
      dataConclusao: null
    }).returning();
    return result[0];
  }
  async updateActivity(id, updateData) {
    const result = await db.update(activities).set(updateData).where(eq(activities.id, id)).returning();
    return result[0];
  }
  async completeActivity(id) {
    const result = await db.update(activities).set({
      status: "concluida",
      concluida: true,
      dataConclusao: /* @__PURE__ */ new Date()
    }).where(eq(activities.id, id)).returning();
    return result[0];
  }
  async deleteActivity(id) {
    const result = await db.delete(activities).where(eq(activities.id, id)).returning();
    return result.length > 0;
  }
  // === POTÊNCIAS METHODS ===
  async getAllPotencias() {
    return await db.select().from(potencias).where(eq(potencias.ativo, true));
  }
  async getPotencia(id) {
    const result = await db.select().from(potencias).where(eq(potencias.id, id));
    return result[0];
  }
  async createPotencia(insertPotencia) {
    const result = await db.insert(potencias).values({
      ...insertPotencia,
      ativo: insertPotencia.ativo ?? true
    }).returning();
    return result[0];
  }
  async updatePotencia(id, updateData) {
    const result = await db.update(potencias).set(updateData).where(eq(potencias.id, id)).returning();
    return result[0];
  }
  async deletePotencia(id) {
    const result = await db.update(potencias).set({ ativo: false }).where(eq(potencias.id, id)).returning();
    return result.length > 0;
  }
  // === CIDADES METHODS ===
  async getAllCidades() {
    return await db.select().from(cidades).where(eq(cidades.ativo, true));
  }
  async getCidade(id) {
    const result = await db.select().from(cidades).where(eq(cidades.id, id));
    return result[0];
  }
  async createCidade(insertCidade) {
    const result = await db.insert(cidades).values({
      ...insertCidade,
      ativo: insertCidade.ativo ?? true
    }).returning();
    return result[0];
  }
  async updateCidade(id, updateData) {
    const result = await db.update(cidades).set(updateData).where(eq(cidades.id, id)).returning();
    return result[0];
  }
  async deleteCidade(id) {
    const result = await db.update(cidades).set({ ativo: false }).where(eq(cidades.id, id)).returning();
    return result.length > 0;
  }
  // === MARGENS METHODS ===
  async getAllMargens() {
    return await db.select().from(margens).where(eq(margens.ativo, true));
  }
  async getMargem(id) {
    const result = await db.select().from(margens).where(eq(margens.id, id));
    return result[0];
  }
  async createMargem(insertMargem) {
    const result = await db.insert(margens).values({
      ...insertMargem,
      ativo: insertMargem.ativo ?? true
    }).returning();
    return result[0];
  }
  async updateMargem(id, updateData) {
    const result = await db.update(margens).set(updateData).where(eq(margens.id, id)).returning();
    return result[0];
  }
  async deleteMargem(id) {
    const result = await db.update(margens).set({ ativo: false }).where(eq(margens.id, id)).returning();
    return result.length > 0;
  }
  // === CONDIÇÕES DE PAGAMENTO METHODS ===
  async getAllCondicoesPagamento() {
    return await db.select().from(condicoesPagamento).where(eq(condicoesPagamento.ativo, true));
  }
  async getCondicaoPagamento(id) {
    const result = await db.select().from(condicoesPagamento).where(eq(condicoesPagamento.id, id));
    return result[0];
  }
  async createCondicaoPagamento(insertCondicao) {
    const result = await db.insert(condicoesPagamento).values({
      ...insertCondicao,
      ativo: insertCondicao.ativo ?? true
    }).returning();
    return result[0];
  }
  async updateCondicaoPagamento(id, updateData) {
    const result = await db.update(condicoesPagamento).set(updateData).where(eq(condicoesPagamento.id, id)).returning();
    return result[0];
  }
  async deleteCondicaoPagamento(id) {
    const result = await db.update(condicoesPagamento).set({ ativo: false }).where(eq(condicoesPagamento.id, id)).returning();
    return result.length > 0;
  }
  // === PROPOSTAS METHODS ===
  async getAllPropostas() {
    return await db.select().from(propostas);
  }
  async getProposta(id) {
    const result = await db.select().from(propostas).where(eq(propostas.id, id));
    return result[0];
  }
  async createProposta(insertProposta) {
    const result = await db.insert(propostas).values({
      ...insertProposta,
      status: "rascunho",
      enderecoCliente: insertProposta.enderecoCliente ?? null,
      valorFinalPersonalizado: insertProposta.valorFinalPersonalizado ?? null,
      margemRealObtida: insertProposta.margemRealObtida ?? null,
      valorPorWp: insertProposta.valorPorWp ?? null,
      dataVistoria: insertProposta.dataVistoria ?? null,
      observacoesTecnicas: insertProposta.observacoesTecnicas ?? null
    }).returning();
    return result[0];
  }
  async updateProposta(id, updateData) {
    const result = await db.update(propostas).set(updateData).where(eq(propostas.id, id)).returning();
    return result[0];
  }
  async deleteProposta(id) {
    const result = await db.delete(propostas).where(eq(propostas.id, id)).returning();
    return result.length > 0;
  }
  async getPropostasStatistics() {
    const allPropostas = await db.select().from(propostas);
    const totalPropostas = allPropostas.length;
    const valorTotal = allPropostas.reduce((sum, p) => sum + (p.valorFinalPersonalizado || p.valorSistema || 0), 0);
    const valorMedio = totalPropostas > 0 ? Math.round(valorTotal / totalPropostas) : 0;
    const statusCount = allPropostas.reduce((acc, p) => {
      const status = p.status || "rascunho";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const porStatus = Object.entries(statusCount).map(([status, quantidade]) => ({
      status,
      quantidade
    }));
    return {
      totalPropostas,
      valorTotal,
      valorMedio,
      porStatus
    };
  }
  // === CONFIGURAÇÕES METHODS ===
  async getAllConfiguracoes() {
    return await db.select().from(configuracoes);
  }
  async getConfiguracao(chave) {
    const result = await db.select().from(configuracoes).where(eq(configuracoes.chave, chave));
    return result[0];
  }
  async setConfiguracao(insertConfig) {
    const existing = await this.getConfiguracao(insertConfig.chave);
    if (existing) {
      const result = await db.update(configuracoes).set({
        valor: insertConfig.valor,
        descricao: insertConfig.descricao ?? existing.descricao,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(configuracoes.chave, insertConfig.chave)).returning();
      return result[0];
    } else {
      const result = await db.insert(configuracoes).values({
        ...insertConfig,
        descricao: insertConfig.descricao ?? null,
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return result[0];
    }
  }
  // === CRM ETAPAS METHODS ===
  async getAllCrmEtapas() {
    return await db.select().from(crmEtapas).where(eq(crmEtapas.ativo, true));
  }
  async getCrmEtapa(id) {
    const result = await db.select().from(crmEtapas).where(eq(crmEtapas.id, id));
    return result[0];
  }
  async createCrmEtapa(insertEtapa) {
    const result = await db.insert(crmEtapas).values({
      ...insertEtapa,
      ativo: insertEtapa.ativo ?? true
    }).returning();
    return result[0];
  }
  async updateCrmEtapa(id, updateData) {
    const result = await db.update(crmEtapas).set(updateData).where(eq(crmEtapas.id, id)).returning();
    return result[0];
  }
  async deleteCrmEtapa(id) {
    const result = await db.update(crmEtapas).set({ ativo: false }).where(eq(crmEtapas.id, id)).returning();
    return result.length > 0;
  }
  // === CRM LEADS METHODS ===
  async getAllCrmLeads() {
    return await db.select().from(crmLeads).where(eq(crmLeads.ativo, true));
  }
  async getCrmLead(id) {
    const result = await db.select().from(crmLeads).where(eq(crmLeads.id, id));
    return result[0];
  }
  async getCrmLeadsByEtapa(etapaId) {
    return await db.select().from(crmLeads).where(and(
      eq(crmLeads.etapaAtual, etapaId),
      eq(crmLeads.ativo, true)
    ));
  }
  async createCrmLead(insertLead) {
    let vendedorId = insertLead.vendedorResponsavel;
    if (vendedorId && !vendedorId.includes("-")) {
      const user = await this.getUsuarioByUsername(vendedorId);
      vendedorId = user?.id;
    }
    const result = await db.insert(crmLeads).values({
      ...insertLead,
      vendedorResponsavel: vendedorId,
      ativo: insertLead.ativo ?? true,
      etapaAtual: insertLead.etapaAtual ?? 1
    }).returning();
    const sistemaUser = await this.getUsuarioByUsername("Sistema");
    if (!sistemaUser) {
      throw new Error("Usu\xE1rio Sistema n\xE3o encontrado");
    }
    await this.createCrmHistorico({
      leadId: result[0].id,
      etapaNova: result[0].etapaAtual,
      usuario: vendedorId || sistemaUser.id,
      // Usar o UUID já convertido
      observacoes: "Lead criado"
    });
    return result[0];
  }
  async updateCrmLead(id, updateData) {
    const result = await db.update(crmLeads).set({
      ...updateData,
      dataUltimaAtualizacao: /* @__PURE__ */ new Date()
    }).where(eq(crmLeads.id, id)).returning();
    return result[0];
  }
  async moveCrmLeadToEtapa(id, novaEtapa, usuario, observacoes) {
    const leadAtual = await this.getCrmLead(id);
    if (!leadAtual) return void 0;
    const result = await db.update(crmLeads).set({
      etapaAtual: novaEtapa,
      dataUltimaAtualizacao: /* @__PURE__ */ new Date(),
      dataEntradaEtapa: /* @__PURE__ */ new Date(),
      vendedorResponsavel: usuario
    }).where(eq(crmLeads.id, id)).returning();
    if (result[0]) {
      await this.createCrmHistorico({
        leadId: id,
        etapaAnterior: leadAtual.etapaAtual,
        etapaNova: novaEtapa,
        usuario,
        observacoes: observacoes || `Movido para etapa ${novaEtapa}`
      });
    }
    return result[0];
  }
  async deleteCrmLead(id) {
    const result = await db.update(crmLeads).set({ ativo: false }).where(eq(crmLeads.id, id)).returning();
    return result.length > 0;
  }
  // === CRM HISTÓRICO METHODS ===
  async getCrmHistoricoByLead(leadId) {
    return await db.select().from(crmHistorico).where(eq(crmHistorico.leadId, leadId));
  }
  async createCrmHistorico(insertHistorico) {
    const result = await db.insert(crmHistorico).values(insertHistorico).returning();
    return result[0];
  }
  // === USUÁRIOS METHODS ===
  async getAllUsuarios() {
    return await db.select().from(usuarios).where(eq(usuarios.isActive, true));
  }
  async getUsuario(id) {
    const result = await db.select().from(usuarios).where(eq(usuarios.id, id));
    return result[0];
  }
  async getUsuarioByUsername(username) {
    const result = await db.select().from(usuarios).where(eq(usuarios.username, username));
    return result[0];
  }
  async getUsuarioByEmail(email) {
    const result = await db.select().from(usuarios).where(eq(usuarios.email, email));
    return result[0];
  }
  async createUsuario(insertUsuario) {
    const result = await db.insert(usuarios).values({
      ...insertUsuario,
      isActive: insertUsuario.isActive ?? true,
      loginAttempts: 0
    }).returning();
    return result[0];
  }
  async updateUsuario(id, updateData) {
    const result = await db.update(usuarios).set(updateData).where(eq(usuarios.id, id)).returning();
    return result[0];
  }
  async deleteUsuario(id) {
    const result = await db.update(usuarios).set({ isActive: false }).where(eq(usuarios.id, id)).returning();
    return result.length > 0;
  }
  // === USER SESSIONS METHODS ===
  async createUserSession(userId, sessionToken, expiresAt, ipAddress, userAgent) {
    const result = await db.insert(userSessions).values({
      userId,
      sessionToken,
      expiresAt,
      ipAddress,
      userAgent,
      isActive: true
    }).returning();
    return result[0];
  }
  async getUserSession(sessionToken) {
    const result = await db.select().from(userSessions).where(and(
      eq(userSessions.sessionToken, sessionToken),
      eq(userSessions.isActive, true)
    ));
    return result[0];
  }
  async invalidateUserSession(sessionToken) {
    const result = await db.update(userSessions).set({ isActive: false }).where(eq(userSessions.sessionToken, sessionToken)).returning();
    return result.length > 0;
  }
  async cleanExpiredSessions() {
    const now = /* @__PURE__ */ new Date();
    const result = await db.update(userSessions).set({ isActive: false }).where(sql2`${userSessions.expiresAt} < ${now}`).returning();
    return result.length;
  }
  // === AUTH LOGS METHODS ===
  async createAuthLog(userId, action, success, ipAddress, userAgent, details) {
    const result = await db.insert(authLogs).values({
      userId,
      action,
      success,
      ipAddress,
      userAgent,
      details
    }).returning();
    return result[0];
  }
  async getAuthLogsByUser(userId, limit = 50) {
    return await db.select().from(authLogs).where(eq(authLogs.userId, userId)).orderBy(authLogs.createdAt).limit(limit);
  }
  // === CRM LEADS PERDIDOS METHODS ===
  async createCrmLeadPerdido(leadId, motivoPerda, usuario) {
    const lead = await this.getCrmLead(leadId);
    if (!lead) return;
    await db.insert(crmLeadsPerdidos).values({
      leadId,
      motivoPerda,
      usuario,
      dadosLeadJson: JSON.stringify(lead)
    });
    await this.deleteCrmLead(leadId);
  }
  async getCrmLeadsPerdidos() {
    const results = await db.select().from(crmLeadsPerdidos).orderBy(crmLeadsPerdidos.dataPerda);
    return results.map((result) => ({
      ...result,
      dadosLead: JSON.parse(result.dadosLeadJson)
    }));
  }
  // === SEED DATA METHODS ===
  async seedCrmEtapas() {
    const etapasDefault = [
      { nome: "Lead Novo", icone: "\u{1F4CB}", ordem: 1, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633" },
      { nome: "Primeiro Contato", icone: "\u{1F4DE}", ordem: 2, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633" },
      { nome: "Segundo Contato", icone: "\u{1F504}", ordem: 3, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633" },
      { nome: "Proposta/Or\xE7amento", icone: "\u{1F4B0}", ordem: 4, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633" },
      { nome: "Visita T\xE9cnica", icone: "\u{1F3E0}", ordem: 5, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633" },
      { nome: "Negocia\xE7\xE3o", icone: "\u2696", ordem: 6, prazoDias: 15, cor: "#326E34", corAlerta: "#F79633" },
      { nome: "Fechamento", icone: "\u2705", ordem: 7, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633" }
    ];
    const existingEtapas = await this.getAllCrmEtapas();
    if (existingEtapas.length === 0) {
      for (const etapa of etapasDefault) {
        await db.insert(crmEtapas).values({
          ...etapa,
          ativo: true
        });
      }
    }
  }
  // === CRM STATISTICS METHODS ===
  async getCrmStatistics() {
    const totalLeads = await db.select().from(crmLeads).where(eq(crmLeads.ativo, true));
    const leadsPorEtapaQuery = await db.select({
      etapaId: crmLeads.etapaAtual,
      count: sql2`COUNT(*)`.as("count")
    }).from(crmLeads).where(eq(crmLeads.ativo, true)).groupBy(crmLeads.etapaAtual);
    const etapas = await this.getAllCrmEtapas();
    const leadsPorEtapa = leadsPorEtapaQuery.map((item) => {
      const etapa = etapas.find((e) => e.id === item.etapaId);
      return {
        etapa: etapa?.nome || "Desconhecida",
        count: Number(item.count)
      };
    });
    const inicioMes = /* @__PURE__ */ new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    const leadsEstesMesQuery = await db.select().from(crmLeads).where(and(
      eq(crmLeads.ativo, true),
      sql2`${crmLeads.createdAt} >= ${inicioMes}`
    ));
    const fechamentos = totalLeads.filter((lead) => lead.etapaAtual === 7);
    const taxaConversao = totalLeads.length > 0 ? fechamentos.length / totalLeads.length * 100 : 0;
    return {
      totalLeads: totalLeads.length,
      leadsPorEtapa,
      leadsEstesMes: leadsEstesMesQuery.length,
      taxaConversao: Math.round(taxaConversao * 100) / 100
    };
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { ZodError } from "zod";

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "sistema_atividades_secret_key_2024";
function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({
        error: "Token de autentica\xE7\xE3o n\xE3o encontrado. Fa\xE7a login para continuar.",
        code: "NO_TOKEN"
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      isAdmin: decoded.isAdmin
    };
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token de autentica\xE7\xE3o inv\xE1lido ou expirado. Fa\xE7a login novamente.",
      code: "INVALID_TOKEN"
    });
  }
}
function adminMiddleware(req, res, next) {
  authMiddleware(req, res, (error) => {
    if (error) return;
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        error: "Acesso negado. Apenas administradores podem acessar esta funcionalidade.",
        code: "FORBIDDEN"
      });
    }
    next();
  });
}
function generateAuthToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    },
    JWT_SECRET,
    {
      expiresIn: "24h",
      issuer: "sistema-atividades",
      audience: "sistema-atividades-app"
    }
  );
}
function setAuthCookie(res, token) {
  res.cookie("auth_token", token, {
    httpOnly: true,
    // Não acessível via JavaScript
    secure: false,
    // DESABILITADO para VPS sem HTTPS
    sameSite: "lax",
    // Mais permissivo para VPS
    maxAge: 24 * 60 * 60 * 1e3,
    // 24 horas em ms
    path: "/",
    domain: void 0
    // Sem restrição de domínio
  });
}
function clearAuthCookie(res) {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    domain: void 0
  });
}

// server/routes.ts
import { z as z2 } from "zod";
import multer from "multer";
import path from "path";
var upload = multer({
  storage: multer.diskStorage({
    destination: "/opt/atividades-crm/uploads",
    filename: (req, file, cb) => {
      const name = Date.now() + path.extname(file.originalname);
      cb(null, name);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
});
var loginSchema = z2.object({
  username: z2.string().min(1, "Usu\xE1rio \xE9 obrigat\xF3rio"),
  password: z2.string().min(1, "Senha \xE9 obrigat\xF3ria")
});
async function registerRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      if (username === "admin" && password === "admin123") {
        const user = {
          id: "admin-001",
          username: "admin",
          isAdmin: true
        };
        const token = generateAuthToken(user);
        setAuthCookie(res, token);
        if (process.env.NODE_ENV === "development") {
          console.log(`[AUTH] Login realizado: ${username} em ${(/* @__PURE__ */ new Date()).toISOString()}`);
        }
        res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin
          },
          message: "Login realizado com sucesso"
        });
      } else {
        if (process.env.NODE_ENV === "development") {
          console.log(`[AUTH] Tentativa de login inv\xE1lida: ${username} em ${(/* @__PURE__ */ new Date()).toISOString()}`);
        }
        res.status(401).json({
          error: "Usu\xE1rio ou senha incorretos",
          code: "INVALID_CREDENTIALS"
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/auth/logout", authMiddleware, async (req, res) => {
    const authenticatedReq = req;
    if (process.env.NODE_ENV === "development") {
      console.log(`[AUTH] Logout realizado: ${authenticatedReq.user?.username} em ${(/* @__PURE__ */ new Date()).toISOString()}`);
    }
    clearAuthCookie(res);
    res.json({
      success: true,
      message: "Logout realizado com sucesso"
    });
  });
  app2.get("/api/auth/me", authMiddleware, async (req, res) => {
    const authenticatedReq = req;
    res.json({
      user: {
        id: authenticatedReq.user?.id,
        username: authenticatedReq.user?.username,
        isAdmin: authenticatedReq.user?.isAdmin
      }
    });
  });
  app2.get("/api/clients", async (req, res) => {
    try {
      const clients2 = await storage.getAllClients();
      const sanitizedClients = clients2.map((client) => sanitizeClient(client));
      res.json(sanitizedClients);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar clientes" });
    }
  });
  app2.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Cliente n\xE3o encontrado" });
      }
      res.json(sanitizeClient(client));
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar cliente" });
    }
  });
  app2.get("/api/clients/:id/activities", async (req, res) => {
    try {
      const activities2 = await storage.getActivitiesByClient(req.params.id);
      res.json(activities2);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar atividades do cliente" });
    }
  });
  app2.post("/api/clients", async (req, res) => {
    let validatedData;
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG] Criando cliente:", req.body.nomeCompleto);
      }
      validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG] Cliente criado:", client.id);
      }
      res.status(201).json(sanitizeClient(client));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[DEBUG] ERRO DETALHADO ao criar cliente:", error);
      }
      if (error instanceof ClientDocumentExistsError) {
        const document = validatedData?.documento?.replace(/\D/g, "");
        const documentType = document?.length === 11 ? "CPF" : document?.length === 14 ? "CNPJ" : "documento";
        return res.status(409).json({
          error: `${documentType} j\xE1 cadastrado no sistema`,
          code: "DOCUMENT_EXISTS"
        });
      }
      if (error?.code === "23505" && (error?.constraint?.includes("documento") || error?.constraint === "clients_documento_unique")) {
        const document = validatedData?.documento?.replace(/\D/g, "");
        const documentType = document?.length === 11 ? "CPF" : document?.length === 14 ? "CNPJ" : "documento";
        return res.status(409).json({
          error: `${documentType} j\xE1 cadastrado no sistema`,
          code: "DOCUMENT_EXISTS"
        });
      }
      if (error instanceof ZodError) {
        if (process.env.NODE_ENV === "development") {
          console.log("[DEBUG] Erro de valida\xE7\xE3o:", error.issues);
        }
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      console.error("[ERROR] Erro ao criar cliente:", process.env.NODE_ENV === "development" ? error : error.message);
      res.status(500).json({ error: "Falha interna ao criar cliente" });
    }
  });
  app2.put("/api/clients/:id", async (req, res) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG] Atualizando cliente:", req.params.id);
      }
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, validatedData);
      if (!client) {
        return res.status(404).json({ error: "Cliente n\xE3o encontrado" });
      }
      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG] Cliente atualizado:", client.id);
      }
      res.json(sanitizeClient(client));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[DEBUG] Erro ao atualizar cliente:", error);
      }
      if (error instanceof ClientDocumentExistsError) {
        const document = req.body?.documento?.replace(/\D/g, "");
        const documentType = document?.length === 11 ? "CPF" : document?.length === 14 ? "CNPJ" : "documento";
        return res.status(409).json({
          error: `${documentType} j\xE1 cadastrado no sistema`,
          code: "DOCUMENT_EXISTS"
        });
      }
      if (error?.code === "23505" && (error?.constraint?.includes("documento") || error?.constraint === "clients_documento_unique")) {
        const document = req.body?.documento?.replace(/\D/g, "");
        const documentType = document?.length === 11 ? "CPF" : document?.length === 14 ? "CNPJ" : "documento";
        return res.status(409).json({
          error: `${documentType} j\xE1 cadastrado no sistema`,
          code: "DOCUMENT_EXISTS"
        });
      }
      if (error instanceof ZodError) {
        if (process.env.NODE_ENV === "development") {
          console.log("[DEBUG] Erro de valida\xE7\xE3o:", error.issues);
        }
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      console.error("[ERROR] Erro ao atualizar cliente:", process.env.NODE_ENV === "development" ? error : error.message);
      res.status(500).json({ error: "Falha interna ao atualizar cliente" });
    }
  });
  app2.get("/api/activities", async (req, res) => {
    try {
      const activities2 = await storage.getAllActivities();
      res.json(activities2);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar atividades" });
    }
  });
  app2.get("/api/activities/:id", async (req, res) => {
    try {
      const activity = await storage.getActivity(req.params.id);
      if (!activity) {
        return res.status(404).json({ error: "Atividade n\xE3o encontrada" });
      }
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar atividade" });
    }
  });
  app2.post("/api/activities", async (req, res) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG] Criando atividade:", req.body.nome);
      }
      const validatedData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[DEBUG] Erro na atividade:", error);
      }
      if (error instanceof ZodError) {
        if (process.env.NODE_ENV === "development") {
          console.log("[DEBUG] Issues:", error.issues);
        }
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro interno ao criar atividade" });
    }
  });
  app2.post("/api/activities/:id/complete", async (req, res) => {
    try {
      const activity = await storage.completeActivity(req.params.id);
      if (!activity) {
        return res.status(404).json({ error: "Atividade n\xE3o encontrada" });
      }
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Erro ao completar atividade" });
    }
  });
  app2.delete("/api/activities/:id", async (req, res) => {
    try {
      await storage.deleteActivity(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar atividade" });
    }
  });
  app2.get("/api/crm/etapas", async (req, res) => {
    try {
      const etapas = await storage.getAllCrmEtapas();
      res.json(etapas);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar etapas do CRM" });
    }
  });
  app2.post("/api/crm/etapas", async (req, res) => {
    try {
      const validatedData = insertCrmEtapaSchema.parse(req.body);
      const etapa = await storage.createCrmEtapa(validatedData);
      res.status(201).json(etapa);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro ao criar etapa do CRM" });
    }
  });
  app2.get("/api/crm/leads", async (req, res) => {
    try {
      const leads = await storage.getAllCrmLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar leads do CRM" });
    }
  });
  app2.get("/api/crm/leads/:id", async (req, res) => {
    try {
      const lead = await storage.getCrmLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead n\xE3o encontrado" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar lead" });
    }
  });
  app2.get("/api/crm/leads/etapa/:etapaId", async (req, res) => {
    try {
      const leads = await storage.getCrmLeadsByEtapa(parseInt(req.params.etapaId));
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar leads da etapa" });
    }
  });
  app2.post("/api/crm/leads", async (req, res) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG] Criando lead:", req.body.nomeCompleto);
      }
      const validatedData = insertCrmLeadSchema.parse(req.body);
      const lead = await storage.createCrmLead(validatedData);
      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG] Lead criado:", lead?.id);
      }
      res.status(201).json(lead);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[DEBUG] Erro no lead:", error);
      }
      if (error instanceof ZodError) {
        if (process.env.NODE_ENV === "development") {
          console.log("[DEBUG] Issues:", error.issues);
        }
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro ao criar lead" });
    }
  });
  app2.put("/api/crm/leads/:id", async (req, res) => {
    try {
      const validatedData = insertCrmLeadSchema.partial().parse(req.body);
      const lead = await storage.updateCrmLead(req.params.id, validatedData);
      if (!lead) {
        return res.status(404).json({ error: "Lead n\xE3o encontrado" });
      }
      res.json(lead);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro ao atualizar lead" });
    }
  });
  app2.post("/api/crm/leads/:id/move", async (req, res) => {
    try {
      const { novaEtapa, usuario, observacoes } = req.body;
      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG] Movendo lead:", req.params.id, "para etapa:", novaEtapa, "usuario:", usuario);
      }
      if (!novaEtapa || !usuario) {
        return res.status(400).json({ error: "Nova etapa e usu\xE1rio s\xE3o obrigat\xF3rios" });
      }
      const lead = await storage.moveCrmLeadToEtapa(req.params.id, novaEtapa, usuario, observacoes);
      if (!lead) {
        return res.status(404).json({ error: "Lead n\xE3o encontrado" });
      }
      res.json(lead);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[DEBUG] Erro ao mover lead:", error);
      }
      res.status(500).json({ error: "Erro ao mover lead" });
    }
  });
  app2.delete("/api/crm/leads/:id", async (req, res) => {
    try {
      await storage.deleteCrmLead(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar lead" });
    }
  });
  app2.get("/api/crm/leads/:id/historico", async (req, res) => {
    try {
      const historico = await storage.getCrmHistoricoByLead(req.params.id);
      res.json(historico);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar hist\xF3rico do lead" });
    }
  });
  app2.get("/api/crm/usuarios", async (req, res) => {
    try {
      const usuarios2 = await storage.getAllUsuarios();
      res.json(usuarios2);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usu\xE1rios" });
    }
  });
  app2.post("/api/crm/usuarios", async (req, res) => {
    try {
      const validatedData = insertUsuarioSchema.parse(req.body);
      const usuario = await storage.createUsuario(validatedData);
      res.status(201).json(usuario);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro ao criar usu\xE1rio" });
    }
  });
  app2.get("/api/crm/statistics", async (req, res) => {
    try {
      const stats = await storage.getCrmStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar estat\xEDsticas do CRM" });
    }
  });
  app2.post("/api/crm/leads/:id/perder", async (req, res) => {
    try {
      const { motivoPerda, usuario } = req.body;
      if (!motivoPerda || !usuario) {
        return res.status(400).json({ error: "Motivo da perda e usu\xE1rio s\xE3o obrigat\xF3rios" });
      }
      await storage.createCrmLeadPerdido(req.params.id, motivoPerda, usuario);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao marcar lead como perdido" });
    }
  });
  app2.get("/api/crm/leads-perdidos", async (req, res) => {
    try {
      const leadsPerdidos = await storage.getCrmLeadsPerdidos();
      res.json(leadsPerdidos);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar leads perdidos" });
    }
  });
  app2.post("/api/crm/seed", async (req, res) => {
    try {
      await storage.seedCrmEtapas();
      res.json({ message: "Dados padr\xE3o do CRM inseridos com sucesso" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao inserir dados padr\xE3o do CRM" });
    }
  });
  app2.get("/api/propostas", async (req, res) => {
    try {
      const propostas2 = await storage.getAllPropostas();
      res.json(propostas2);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar propostas" });
    }
  });
  app2.get("/api/propostas/statistics", async (req, res) => {
    try {
      const statistics = await storage.getPropostasStatistics();
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar estat\xEDsticas" });
    }
  });
  app2.get("/api/propostas/potencias", async (req, res) => {
    try {
      const potencias2 = await storage.getAllPotencias();
      res.json(potencias2);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar pot\xEAncias" });
    }
  });
  app2.get("/api/propostas/cidades", async (req, res) => {
    try {
      const cidades2 = await storage.getAllCidades();
      res.json(cidades2);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar cidades" });
    }
  });
  app2.get("/api/propostas/margens", async (req, res) => {
    try {
      const margens2 = await storage.getAllMargens();
      res.json(margens2);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar margens" });
    }
  });
  app2.get("/api/propostas/condicoes-pagamento", async (req, res) => {
    try {
      const condicoes = await storage.getAllCondicoesPagamento();
      res.json(condicoes);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar condi\xE7\xF5es de pagamento" });
    }
  });
  app2.get("/api/propostas/:id", async (req, res) => {
    try {
      const proposta = await storage.getProposta(req.params.id);
      if (!proposta) {
        return res.status(404).json({ error: "Proposta n\xE3o encontrada" });
      }
      res.json(proposta);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar proposta" });
    }
  });
  app2.post("/api/propostas", async (req, res) => {
    try {
      const validatedData = insertPropostaSchema.parse(req.body);
      const proposta = await storage.createProposta(validatedData);
      res.status(201).json(proposta);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Dados inv\xE1lidos",
          issues: error.errors
        });
      }
      res.status(500).json({ error: "Erro ao criar proposta" });
    }
  });
  app2.put("/api/propostas/:id", async (req, res) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG] Atualizando proposta:", req.params.id, "com dados:", req.body);
      }
      const validatedData = insertPropostaSchema.partial().parse(req.body);
      const proposta = await storage.updateProposta(req.params.id, validatedData);
      if (!proposta) {
        return res.status(404).json({ error: "Proposta n\xE3o encontrada" });
      }
      res.json(proposta);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[DEBUG] Erro ao atualizar proposta:", error);
      }
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Dados inv\xE1lidos",
          issues: error.errors
        });
      }
      res.status(500).json({ error: "Erro ao atualizar proposta" });
    }
  });
  app2.delete("/api/propostas/:id", async (req, res) => {
    try {
      const success = await storage.deleteProposta(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Proposta n\xE3o encontrada" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir proposta" });
    }
  });
  app2.post("/api/propostas/potencias", async (req, res) => {
    try {
      const validatedData = insertPotenciaSchema.parse(req.body);
      const potencia = await storage.createPotencia(validatedData);
      res.status(201).json(potencia);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro ao criar pot\xEAncia" });
    }
  });
  app2.put("/api/propostas/potencias/:id", async (req, res) => {
    try {
      const validatedData = insertPotenciaSchema.partial().parse(req.body);
      const potencia = await storage.updatePotencia(req.params.id, validatedData);
      if (!potencia) {
        return res.status(404).json({ error: "Pot\xEAncia n\xE3o encontrada" });
      }
      res.json(potencia);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro ao atualizar pot\xEAncia" });
    }
  });
  app2.delete("/api/propostas/potencias/:id", async (req, res) => {
    try {
      const success = await storage.deletePotencia(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Pot\xEAncia n\xE3o encontrada" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir pot\xEAncia" });
    }
  });
  app2.post("/api/propostas/cidades", async (req, res) => {
    try {
      const validatedData = insertCidadeSchema.parse(req.body);
      const cidade = await storage.createCidade(validatedData);
      res.status(201).json(cidade);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro ao criar cidade" });
    }
  });
  app2.put("/api/propostas/cidades/:id", async (req, res) => {
    try {
      const validatedData = insertCidadeSchema.partial().parse(req.body);
      const cidade = await storage.updateCidade(req.params.id, validatedData);
      if (!cidade) {
        return res.status(404).json({ error: "Cidade n\xE3o encontrada" });
      }
      res.json(cidade);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro ao atualizar cidade" });
    }
  });
  app2.delete("/api/propostas/cidades/:id", async (req, res) => {
    try {
      const success = await storage.deleteCidade(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Cidade n\xE3o encontrada" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir cidade" });
    }
  });
  app2.post("/api/propostas/margens", async (req, res) => {
    try {
      const validatedData = insertMargemSchema.parse(req.body);
      const margem = await storage.createMargem(validatedData);
      res.status(201).json(margem);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro ao criar margem" });
    }
  });
  app2.put("/api/propostas/margens/:id", async (req, res) => {
    try {
      const validatedData = insertMargemSchema.partial().parse(req.body);
      const margem = await storage.updateMargem(req.params.id, validatedData);
      if (!margem) {
        return res.status(404).json({ error: "Margem n\xE3o encontrada" });
      }
      res.json(margem);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro ao atualizar margem" });
    }
  });
  app2.delete("/api/propostas/margens/:id", async (req, res) => {
    try {
      const success = await storage.deleteMargem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Margem n\xE3o encontrada" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir margem" });
    }
  });
  app2.post("/api/propostas/condicoes-pagamento", async (req, res) => {
    try {
      const validatedData = insertCondicaoPagamentoSchema.parse(req.body);
      const condicao = await storage.createCondicaoPagamento(validatedData);
      res.status(201).json(condicao);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro ao criar condi\xE7\xE3o de pagamento" });
    }
  });
  app2.put("/api/propostas/condicoes-pagamento/:id", async (req, res) => {
    try {
      const validatedData = insertCondicaoPagamentoSchema.partial().parse(req.body);
      const condicao = await storage.updateCondicaoPagamento(req.params.id, validatedData);
      if (!condicao) {
        return res.status(404).json({ error: "Condi\xE7\xE3o de pagamento n\xE3o encontrada" });
      }
      res.json(condicao);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro ao atualizar condi\xE7\xE3o de pagamento" });
    }
  });
  app2.delete("/api/propostas/condicoes-pagamento/:id", async (req, res) => {
    try {
      const success = await storage.deleteCondicaoPagamento(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Condi\xE7\xE3o de pagamento n\xE3o encontrada" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir condi\xE7\xE3o de pagamento" });
    }
  });
  app2.get("/api/configuracoes", authMiddleware, async (req, res) => {
    try {
      const configuracoes2 = await storage.getAllConfiguracoes();
      res.json(configuracoes2);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar configura\xE7\xF5es" });
    }
  });
  app2.get("/api/configuracoes/:chave", authMiddleware, async (req, res) => {
    try {
      const configuracao = await storage.getConfiguracao(req.params.chave);
      if (!configuracao) {
        return res.status(404).json({ error: "Configura\xE7\xE3o n\xE3o encontrada" });
      }
      res.json(configuracao);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar configura\xE7\xE3o" });
    }
  });
  app2.post("/api/configuracoes", adminMiddleware, async (req, res) => {
    try {
      const validatedData = insertConfiguracaoSchema.parse(req.body);
      const configuracao = await storage.setConfiguracao(validatedData);
      if (process.env.NODE_ENV === "development") {
        console.log(`[CONFIG] Configura\xE7\xE3o ${validatedData.chave} alterada para: ${validatedData.valor}`);
      }
      res.status(201).json(configuracao);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Dados inv\xE1lidos", issues: error.issues });
      }
      res.status(500).json({ error: "Erro ao salvar configura\xE7\xE3o" });
    }
  });
  app2.put("/api/activities/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;
      if (!dadosAtualizacao || Object.keys(dadosAtualizacao).length === 0) {
        console.log("Nenhum dado para atualizar, retornando atividade atual");
        const atividadeAtual = await storage.getActivity(id);
        return res.json(atividadeAtual || {});
      }
      const dadosLimpos = {};
      for (const [key, value] of Object.entries(dadosAtualizacao)) {
        if (value !== void 0 && value !== null && value !== "") {
          dadosLimpos[key] = value;
        }
      }
      if (Object.keys(dadosLimpos).length === 0) {
        console.log("Todos os dados est\xE3o vazios, retornando atividade atual");
        const atividadeAtual = await storage.getActivity(id);
        return res.json(atividadeAtual || {});
      }
      console.log("Dados limpos para atualiza\xE7\xE3o:", JSON.stringify(dadosLimpos, null, 2));
      const atividade = await storage.updateActivity(id, dadosLimpos);
      if (!atividade) {
        return res.status(404).json({ error: "Atividade n\xE3o encontrada" });
      }
      res.json(atividade);
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/activities/:id/upload", authMiddleware, upload.array("files", 10), async (req, res) => {
    try {
      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }
      const fileInfos = files.map((file) => ({
        fileName: file.originalname,
        filePath: file.path,
        size: file.size
      }));
      res.json({
        message: "Upload realizado",
        files: fileInfos
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({ error: "Erro no upload" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
app.use(cookieParser());
var PORT = process.env.PORT || 5001;
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use("/uploads", express.static(path2.join(__dirname, "../uploads")));
app.use(express.static(path2.join(__dirname, "../dist/public")));
try {
  registerRoutes(app);
  if (app) {
    console.log("\u2705 Rotas da API registradas com sucesso");
  } else {
    console.log("\u26A0\uFE0F Problema ao registrar rotas, continuando...");
  }
} catch (error) {
  console.error("Erro ao registrar rotas:", error);
}
app.get("/api/files-list", (req, res) => {
  const fs = __require("fs");
  const uploadsPath = path2.join(__dirname, "../uploads");
  try {
    if (!fs.existsSync(uploadsPath)) {
      return res.json([]);
    }
    const files = fs.readdirSync(uploadsPath);
    const fileList = files.map((filename) => {
      const filePath = path2.join(uploadsPath, filename);
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
    console.error("Erro ao listar arquivos:", error);
    res.status(500).json({ error: "Erro ao listar arquivos" });
  }
});
app.get("*", (req, res) => {
  const indexPath = path2.join(__dirname, "../dist/public/index.html");
  res.sendFile(indexPath);
});
app.listen(PORT, () => {
  console.log(`\u{1F680} Servidor rodando na porta ${PORT}`);
  console.log(`\u{1F4C1} Arquivos est\xE1ticos servidos em: /uploads/`);
  console.log(`\u{1F517} Acesse: http://82.25.75.49:${PORT}/`);
});
