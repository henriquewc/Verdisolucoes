import { 
  type Client, type InsertClient, type Activity, type InsertActivity, 
  type Potencia, type InsertPotencia, type Cidade, type InsertCidade,
  type Margem, type InsertMargem, type CondicaoPagamento, type InsertCondicaoPagamento,
  type Proposta, type InsertProposta, type Configuracao, type InsertConfiguracao,
  type CrmEtapa, type InsertCrmEtapa, type CrmLead, type InsertCrmLead,
  type Usuario, type InsertUsuario, type CrmHistorico, type InsertCrmHistorico,
  type UserSession, type AuthLog,
  calculateActivityStatus,
  clients, activities, attachments, potencias, cidades, margens, condicoesPagamento, propostas, configuracoes,
  crmEtapas, crmLeads, crmHistorico, crmLeadsPerdidos, usuarios, userSessions, authLogs
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

// Custom error classes for client validation
export class ClientDocumentExistsError extends Error {
  constructor(document: string) {
    super(`CLIENT_DOCUMENT_EXISTS: ${document}`);
    this.name = 'ClientDocumentExistsError';
  }
}

export class ClientValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientValidationError';
  }
}

export interface IStorage {
  // Clients
  getClient(id: string): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  
  // Activities
  getActivity(id: string): Promise<Activity | undefined>;
  getAllActivities(): Promise<Activity[]>;
  getActivitiesByClient(clientId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: string, activity: Partial<Activity>): Promise<Activity | undefined>;
  completeActivity(id: string): Promise<Activity | undefined>;
  deleteActivity(id: string): Promise<boolean>;

  // Propostas System
  // Potências
  getAllPotencias(): Promise<Potencia[]>;
  getPotencia(id: string): Promise<Potencia | undefined>;
  createPotencia(potencia: InsertPotencia): Promise<Potencia>;
  updatePotencia(id: string, potencia: Partial<InsertPotencia>): Promise<Potencia | undefined>;
  deletePotencia(id: string): Promise<boolean>;

  // Cidades
  getAllCidades(): Promise<Cidade[]>;
  getCidade(id: string): Promise<Cidade | undefined>;
  createCidade(cidade: InsertCidade): Promise<Cidade>;
  updateCidade(id: string, cidade: Partial<InsertCidade>): Promise<Cidade | undefined>;
  deleteCidade(id: string): Promise<boolean>;

  // Margens
  getAllMargens(): Promise<Margem[]>;
  getMargem(id: string): Promise<Margem | undefined>;
  createMargem(margem: InsertMargem): Promise<Margem>;
  updateMargem(id: string, margem: Partial<InsertMargem>): Promise<Margem | undefined>;
  deleteMargem(id: string): Promise<boolean>;

  // Condições de Pagamento
  getAllCondicoesPagamento(): Promise<CondicaoPagamento[]>;
  getCondicaoPagamento(id: string): Promise<CondicaoPagamento | undefined>;
  createCondicaoPagamento(condicao: InsertCondicaoPagamento): Promise<CondicaoPagamento>;
  updateCondicaoPagamento(id: string, condicao: Partial<InsertCondicaoPagamento>): Promise<CondicaoPagamento | undefined>;
  deleteCondicaoPagamento(id: string): Promise<boolean>;

  // Propostas
  getAllPropostas(): Promise<Proposta[]>;
  getProposta(id: string): Promise<Proposta | undefined>;
  createProposta(proposta: InsertProposta): Promise<Proposta>;
  updateProposta(id: string, proposta: Partial<Proposta>): Promise<Proposta | undefined>;
  deleteProposta(id: string): Promise<boolean>;
  getPropostasStatistics(): Promise<{
    totalPropostas: number;
    valorTotal: number;
    valorMedio: number;
    porStatus: { status: string; quantidade: number }[];
  }>;

  // Configurações
  getAllConfiguracoes(): Promise<Configuracao[]>;
  getConfiguracao(chave: string): Promise<Configuracao | undefined>;
  setConfiguracao(config: InsertConfiguracao): Promise<Configuracao>;

  // === CRM SYSTEM (GESTUS.PRO INTEGRATION) ===
  
  // CRM Etapas
  getAllCrmEtapas(): Promise<CrmEtapa[]>;
  getCrmEtapa(id: number): Promise<CrmEtapa | undefined>;
  createCrmEtapa(etapa: InsertCrmEtapa): Promise<CrmEtapa>;
  updateCrmEtapa(id: number, etapa: Partial<InsertCrmEtapa>): Promise<CrmEtapa | undefined>;
  deleteCrmEtapa(id: number): Promise<boolean>;

  // CRM Leads
  getAllCrmLeads(): Promise<CrmLead[]>;
  getCrmLead(id: string): Promise<CrmLead | undefined>;
  getCrmLeadsByEtapa(etapaId: number): Promise<CrmLead[]>;
  createCrmLead(lead: InsertCrmLead): Promise<CrmLead>;
  updateCrmLead(id: string, lead: Partial<InsertCrmLead>): Promise<CrmLead | undefined>;
  moveCrmLeadToEtapa(id: string, novaEtapa: number, usuario: string, observacoes?: string): Promise<CrmLead | undefined>;
  deleteCrmLead(id: string): Promise<boolean>;

  // CRM Histórico
  getCrmHistoricoByLead(leadId: string): Promise<CrmHistorico[]>;
  createCrmHistorico(historico: InsertCrmHistorico): Promise<CrmHistorico>;

  // Usuários
  getAllUsuarios(): Promise<Usuario[]>;
  getUsuario(id: string): Promise<Usuario | undefined>;
  getUsuarioByUsername(username: string): Promise<Usuario | undefined>;
  getUsuarioByEmail(email: string): Promise<Usuario | undefined>;
  createUsuario(usuario: InsertUsuario): Promise<Usuario>;
  updateUsuario(id: string, usuario: Partial<InsertUsuario>): Promise<Usuario | undefined>;
  deleteUsuario(id: string): Promise<boolean>;

  // User Sessions
  createUserSession(userId: string, sessionToken: string, expiresAt: Date, ipAddress?: string, userAgent?: string): Promise<UserSession>;
  getUserSession(sessionToken: string): Promise<UserSession | undefined>;
  invalidateUserSession(sessionToken: string): Promise<boolean>;
  cleanExpiredSessions(): Promise<number>; // Returns count of cleaned sessions

  // Auth Logs
  createAuthLog(userId: string | null, action: string, success: boolean, ipAddress?: string, userAgent?: string, details?: string): Promise<AuthLog>;
  getAuthLogsByUser(userId: string, limit?: number): Promise<AuthLog[]>;
}

// Implementação com banco PostgreSQL real
export class DatabaseStorage implements IStorage {
  constructor() {
    // Database connection is already initialized in db.ts
  }

  // === CLIENTS METHODS ===
  async getClient(id: string): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.id, id));
    return result[0];
  }

  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    try {
      // Check if document already exists
      const existingClient = await db.select()
        .from(clients)
        .where(eq(clients.documento, insertClient.documento))
        .limit(1);
      
      if (existingClient.length > 0) {
        throw new ClientDocumentExistsError(insertClient.documento);
      }

      const result = await db.insert(clients).values({
        ...insertClient,
        ativo: insertClient.ativo ?? true,
      }).returning();
      return result[0];
    } catch (error: any) {
      // If it's already our custom error, re-throw it
      if (error instanceof ClientDocumentExistsError) {
        throw error;
      }
      
      // Handle database constraint violations as fallback for race conditions
      if (error?.code === '23505' && 
          (error?.constraint?.includes('documento') || error?.constraint === 'clients_documento_unique')) {
        throw new ClientDocumentExistsError(insertClient.documento);
      }
      throw error;
    }
  }

  async updateClient(id: string, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const result = await db.update(clients)
      .set(updateData)
      .where(eq(clients.id, id))
      .returning();
    return result[0];
  }

  // === ACTIVITIES METHODS ===
  async getActivity(id: string): Promise<Activity | undefined> {
    const result = await db.select().from(activities).where(eq(activities.id, id));
    const activity = result[0];
    
    if (!activity) return undefined;
    
    // Update status based on due date if not completed
    if (!activity.concluida) {
      const calculatedStatus = calculateActivityStatus(activity);
      if (activity.status !== calculatedStatus) {
        const updatedResult = await db.update(activities)
          .set({ status: calculatedStatus })
          .where(eq(activities.id, id))
          .returning();
        return updatedResult[0];
      }
    }
    return activity;
  }

  async getAllActivities(): Promise<Activity[]> {
    const allActivities = await db.select().from(activities);
    
    // Update statuses based on due dates and return updated activities
    const updatedActivities: Activity[] = [];
    for (const activity of allActivities) {
      if (!activity.concluida) {
        const calculatedStatus = calculateActivityStatus(activity);
        if (activity.status !== calculatedStatus) {
          const updatedResult = await db.update(activities)
            .set({ status: calculatedStatus })
            .where(eq(activities.id, activity.id))
            .returning();
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

  async getActivitiesByClient(clientId: string): Promise<Activity[]> {
    const clientActivities = await db.select()
      .from(activities)
      .where(eq(activities.clienteId, clientId));
    
    // Update statuses based on due dates
    const updatedActivities: Activity[] = [];
    for (const activity of clientActivities) {
      if (!activity.concluida) {
        const calculatedStatus = calculateActivityStatus(activity);
        if (activity.status !== calculatedStatus) {
          const updatedResult = await db.update(activities)
            .set({ status: calculatedStatus })
            .where(eq(activities.id, activity.id))
            .returning();
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

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values({
      ...insertActivity,
      intervaloRecorrencia: insertActivity.intervaloRecorrencia ?? 1,
      observacoes: insertActivity.observacoes ?? null,
      responsavel: insertActivity.responsavel ?? null,
      status: "pendente",
      concluida: false,
      dataConclusao: null,
    }).returning();
    return result[0];
  }

  async updateActivity(id: string, updateData: Partial<Activity>): Promise<Activity | undefined> {
    const result = await db.update(activities)
      .set(updateData)
      .where(eq(activities.id, id))
      .returning();
    return result[0];
  }

  async completeActivity(id: string): Promise<Activity | undefined> {
    const result = await db.update(activities)
      .set({
        status: "concluida",
        concluida: true,
        dataConclusao: new Date(),
      })
      .where(eq(activities.id, id))
      .returning();
    return result[0];
  }

  async deleteActivity(id: string): Promise<boolean> {
    const result = await db.delete(activities)
      .where(eq(activities.id, id))
      .returning();
    return result.length > 0;
  }

  // === POTÊNCIAS METHODS ===
  async getAllPotencias(): Promise<Potencia[]> {
    return await db.select().from(potencias).where(eq(potencias.ativo, true));
  }

  async getPotencia(id: string): Promise<Potencia | undefined> {
    const result = await db.select().from(potencias).where(eq(potencias.id, id));
    return result[0];
  }

  async createPotencia(insertPotencia: InsertPotencia): Promise<Potencia> {
    const result = await db.insert(potencias).values({
      ...insertPotencia,
      ativo: insertPotencia.ativo ?? true,
    }).returning();
    return result[0];
  }

  async updatePotencia(id: string, updateData: Partial<InsertPotencia>): Promise<Potencia | undefined> {
    const result = await db.update(potencias)
      .set(updateData)
      .where(eq(potencias.id, id))
      .returning();
    return result[0];
  }

  async deletePotencia(id: string): Promise<boolean> {
    const result = await db.update(potencias)
      .set({ ativo: false })
      .where(eq(potencias.id, id))
      .returning();
    return result.length > 0;
  }

  // === CIDADES METHODS ===
  async getAllCidades(): Promise<Cidade[]> {
    return await db.select().from(cidades).where(eq(cidades.ativo, true));
  }

  async getCidade(id: string): Promise<Cidade | undefined> {
    const result = await db.select().from(cidades).where(eq(cidades.id, id));
    return result[0];
  }

  async createCidade(insertCidade: InsertCidade): Promise<Cidade> {
    const result = await db.insert(cidades).values({
      ...insertCidade,
      ativo: insertCidade.ativo ?? true,
    }).returning();
    return result[0];
  }

  async updateCidade(id: string, updateData: Partial<InsertCidade>): Promise<Cidade | undefined> {
    const result = await db.update(cidades)
      .set(updateData)
      .where(eq(cidades.id, id))
      .returning();
    return result[0];
  }

  async deleteCidade(id: string): Promise<boolean> {
    const result = await db.update(cidades)
      .set({ ativo: false })
      .where(eq(cidades.id, id))
      .returning();
    return result.length > 0;
  }

  // === MARGENS METHODS ===
  async getAllMargens(): Promise<Margem[]> {
    return await db.select().from(margens).where(eq(margens.ativo, true));
  }

  async getMargem(id: string): Promise<Margem | undefined> {
    const result = await db.select().from(margens).where(eq(margens.id, id));
    return result[0];
  }

  async createMargem(insertMargem: InsertMargem): Promise<Margem> {
    const result = await db.insert(margens).values({
      ...insertMargem,
      ativo: insertMargem.ativo ?? true,
    }).returning();
    return result[0];
  }

  async updateMargem(id: string, updateData: Partial<InsertMargem>): Promise<Margem | undefined> {
    const result = await db.update(margens)
      .set(updateData)
      .where(eq(margens.id, id))
      .returning();
    return result[0];
  }

  async deleteMargem(id: string): Promise<boolean> {
    const result = await db.update(margens)
      .set({ ativo: false })
      .where(eq(margens.id, id))
      .returning();
    return result.length > 0;
  }

  // === CONDIÇÕES DE PAGAMENTO METHODS ===
  async getAllCondicoesPagamento(): Promise<CondicaoPagamento[]> {
    return await db.select().from(condicoesPagamento).where(eq(condicoesPagamento.ativo, true));
  }

  async getCondicaoPagamento(id: string): Promise<CondicaoPagamento | undefined> {
    const result = await db.select().from(condicoesPagamento).where(eq(condicoesPagamento.id, id));
    return result[0];
  }

  async createCondicaoPagamento(insertCondicao: InsertCondicaoPagamento): Promise<CondicaoPagamento> {
    const result = await db.insert(condicoesPagamento).values({
      ...insertCondicao,
      ativo: insertCondicao.ativo ?? true,
    }).returning();
    return result[0];
  }

  async updateCondicaoPagamento(id: string, updateData: Partial<InsertCondicaoPagamento>): Promise<CondicaoPagamento | undefined> {
    const result = await db.update(condicoesPagamento)
      .set(updateData)
      .where(eq(condicoesPagamento.id, id))
      .returning();
    return result[0];
  }

  async deleteCondicaoPagamento(id: string): Promise<boolean> {
    const result = await db.update(condicoesPagamento)
      .set({ ativo: false })
      .where(eq(condicoesPagamento.id, id))
      .returning();
    return result.length > 0;
  }

  // === PROPOSTAS METHODS ===
  async getAllPropostas(): Promise<Proposta[]> {
    return await db.select().from(propostas);
  }

  async getProposta(id: string): Promise<Proposta | undefined> {
    const result = await db.select().from(propostas).where(eq(propostas.id, id));
    return result[0];
  }

  async createProposta(insertProposta: InsertProposta): Promise<Proposta> {
    const result = await db.insert(propostas).values({
      ...insertProposta,
      status: "rascunho",
      enderecoCliente: insertProposta.enderecoCliente ?? null,
      valorFinalPersonalizado: insertProposta.valorFinalPersonalizado ?? null,
      margemRealObtida: insertProposta.margemRealObtida ?? null,
      valorPorWp: insertProposta.valorPorWp ?? null,
      dataVistoria: insertProposta.dataVistoria ?? null,
      observacoesTecnicas: insertProposta.observacoesTecnicas ?? null,
    }).returning();
    return result[0];
  }

  async updateProposta(id: string, updateData: Partial<Proposta>): Promise<Proposta | undefined> {
    const result = await db.update(propostas)
      .set(updateData)
      .where(eq(propostas.id, id))
      .returning();
    return result[0];
  }

  async deleteProposta(id: string): Promise<boolean> {
    const result = await db.delete(propostas)
      .where(eq(propostas.id, id))
      .returning();
    return result.length > 0;
  }

  async getPropostasStatistics(): Promise<{
    totalPropostas: number;
    valorTotal: number;
    valorMedio: number;
    porStatus: { status: string; quantidade: number }[];
  }> {
    const allPropostas = await db.select().from(propostas);
    
    const totalPropostas = allPropostas.length;
    const valorTotal = allPropostas.reduce((sum, p) => sum + (p.valorFinalPersonalizado || p.valorSistema || 0), 0);
    const valorMedio = totalPropostas > 0 ? Math.round(valorTotal / totalPropostas) : 0;

    // Agrupar por status
    const statusCount = allPropostas.reduce((acc, p) => {
      const status = p.status || 'rascunho';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
  async getAllConfiguracoes(): Promise<Configuracao[]> {
    return await db.select().from(configuracoes);
  }

  async getConfiguracao(chave: string): Promise<Configuracao | undefined> {
    const result = await db.select().from(configuracoes).where(eq(configuracoes.chave, chave));
    return result[0];
  }

  async setConfiguracao(insertConfig: InsertConfiguracao): Promise<Configuracao> {
    // Try to update existing configuration first
    const existing = await this.getConfiguracao(insertConfig.chave);
    
    if (existing) {
      // Update existing configuration
      const result = await db.update(configuracoes)
        .set({
          valor: insertConfig.valor,
          descricao: insertConfig.descricao ?? existing.descricao,
          updatedAt: new Date(),
        })
        .where(eq(configuracoes.chave, insertConfig.chave))
        .returning();
      return result[0];
    } else {
      // Create new configuration
      const result = await db.insert(configuracoes).values({
        ...insertConfig,
        descricao: insertConfig.descricao ?? null,
        updatedAt: new Date(),
      }).returning();
      return result[0];
    }
  }

  // === CRM ETAPAS METHODS ===
  async getAllCrmEtapas(): Promise<CrmEtapa[]> {
    return await db.select().from(crmEtapas).where(eq(crmEtapas.ativo, true));
  }

  async getCrmEtapa(id: number): Promise<CrmEtapa | undefined> {
    const result = await db.select().from(crmEtapas).where(eq(crmEtapas.id, id));
    return result[0];
  }

  async createCrmEtapa(insertEtapa: InsertCrmEtapa): Promise<CrmEtapa> {
    const result = await db.insert(crmEtapas).values({
      ...insertEtapa,
      ativo: insertEtapa.ativo ?? true,
    }).returning();
    return result[0];
  }

  async updateCrmEtapa(id: number, updateData: Partial<InsertCrmEtapa>): Promise<CrmEtapa | undefined> {
    const result = await db.update(crmEtapas)
      .set(updateData)
      .where(eq(crmEtapas.id, id))
      .returning();
    return result[0];
  }

  async deleteCrmEtapa(id: number): Promise<boolean> {
    const result = await db.update(crmEtapas)
      .set({ ativo: false })
      .where(eq(crmEtapas.id, id))
      .returning();
    return result.length > 0;
  }

  // === CRM LEADS METHODS ===
  async getAllCrmLeads(): Promise<CrmLead[]> {
    return await db.select().from(crmLeads).where(eq(crmLeads.ativo, true));
  }

  async getCrmLead(id: string): Promise<CrmLead | undefined> {
    const result = await db.select().from(crmLeads).where(eq(crmLeads.id, id));
    return result[0];
  }

  async getCrmLeadsByEtapa(etapaId: number): Promise<CrmLead[]> {
    return await db.select().from(crmLeads)
      .where(and(
        eq(crmLeads.etapaAtual, etapaId),
        eq(crmLeads.ativo, true)
      ));
  }

  async createCrmLead(insertLead: InsertCrmLead): Promise<CrmLead> {
    // Se vendedorResponsavel é um username, converter para UUID
    let vendedorId = insertLead.vendedorResponsavel;
    if (vendedorId && !vendedorId.includes('-')) {
      // É um username, buscar o UUID
      const user = await this.getUsuarioByUsername(vendedorId);
      vendedorId = user?.id;
    }

    const result = await db.insert(crmLeads).values({
      ...insertLead,
      vendedorResponsavel: vendedorId,
      ativo: insertLead.ativo ?? true,
      etapaAtual: insertLead.etapaAtual ?? 1,
    }).returning();

    // Buscar usuário "Sistema" dinamicamente
    const sistemaUser = await this.getUsuarioByUsername("Sistema");
    if (!sistemaUser) {
      throw new Error("Usuário Sistema não encontrado");
    }

    // Registrar no histórico
    await this.createCrmHistorico({
      leadId: result[0].id,
      etapaNova: result[0].etapaAtual,
      usuario: vendedorId || sistemaUser.id, // Usar o UUID já convertido
      observacoes: "Lead criado"
    });

    return result[0];
  }

  async updateCrmLead(id: string, updateData: Partial<InsertCrmLead>): Promise<CrmLead | undefined> {
    const result = await db.update(crmLeads)
      .set({
        ...updateData,
        dataUltimaAtualizacao: new Date(),
      })
      .where(eq(crmLeads.id, id))
      .returning();
    return result[0];
  }

  async moveCrmLeadToEtapa(id: string, novaEtapa: number, usuario: string, observacoes?: string): Promise<CrmLead | undefined> {
    // Buscar lead atual
    const leadAtual = await this.getCrmLead(id);
    if (!leadAtual) return undefined;

    // Atualizar etapa do lead
    const result = await db.update(crmLeads)
      .set({
        etapaAtual: novaEtapa,
        dataUltimaAtualizacao: new Date(),
        dataEntradaEtapa: new Date(),
        vendedorResponsavel: usuario,
      })
      .where(eq(crmLeads.id, id))
      .returning();

    if (result[0]) {
      // Registrar movimento no histórico
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

  async deleteCrmLead(id: string): Promise<boolean> {
    const result = await db.update(crmLeads)
      .set({ ativo: false })
      .where(eq(crmLeads.id, id))
      .returning();
    return result.length > 0;
  }

  // === CRM HISTÓRICO METHODS ===
  async getCrmHistoricoByLead(leadId: string): Promise<CrmHistorico[]> {
    return await db.select().from(crmHistorico)
      .where(eq(crmHistorico.leadId, leadId));
  }

  async createCrmHistorico(insertHistorico: InsertCrmHistorico): Promise<CrmHistorico> {
    const result = await db.insert(crmHistorico).values(insertHistorico).returning();
    return result[0];
  }

  // === USUÁRIOS METHODS ===
  async getAllUsuarios(): Promise<Usuario[]> {
    return await db.select().from(usuarios).where(eq(usuarios.isActive, true));
  }

  async getUsuario(id: string): Promise<Usuario | undefined> {
    const result = await db.select().from(usuarios).where(eq(usuarios.id, id));
    return result[0];
  }

  async getUsuarioByUsername(username: string): Promise<Usuario | undefined> {
    const result = await db.select().from(usuarios).where(eq(usuarios.username, username));
    return result[0];
  }

  async getUsuarioByEmail(email: string): Promise<Usuario | undefined> {
    const result = await db.select().from(usuarios).where(eq(usuarios.email, email));
    return result[0];
  }

  async createUsuario(insertUsuario: InsertUsuario): Promise<Usuario> {
    const result = await db.insert(usuarios).values({
      ...insertUsuario,
      isActive: insertUsuario.isActive ?? true,
      loginAttempts: 0,
    }).returning();
    return result[0];
  }

  async updateUsuario(id: string, updateData: Partial<InsertUsuario>): Promise<Usuario | undefined> {
    const result = await db.update(usuarios)
      .set(updateData)
      .where(eq(usuarios.id, id))
      .returning();
    return result[0];
  }

  async deleteUsuario(id: string): Promise<boolean> {
    const result = await db.update(usuarios)
      .set({ isActive: false })
      .where(eq(usuarios.id, id))
      .returning();
    return result.length > 0;
  }

  // === USER SESSIONS METHODS ===
  async createUserSession(userId: string, sessionToken: string, expiresAt: Date, ipAddress?: string, userAgent?: string): Promise<UserSession> {
    const result = await db.insert(userSessions).values({
      userId,
      sessionToken,
      expiresAt,
      ipAddress,
      userAgent,
      isActive: true,
    }).returning();
    return result[0];
  }

  async getUserSession(sessionToken: string): Promise<UserSession | undefined> {
    const result = await db.select().from(userSessions)
      .where(and(
        eq(userSessions.sessionToken, sessionToken),
        eq(userSessions.isActive, true)
      ));
    return result[0];
  }

  async invalidateUserSession(sessionToken: string): Promise<boolean> {
    const result = await db.update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.sessionToken, sessionToken))
      .returning();
    return result.length > 0;
  }

  async cleanExpiredSessions(): Promise<number> {
    const now = new Date();
    const result = await db.update(userSessions)
      .set({ isActive: false })
      .where(sql`${userSessions.expiresAt} < ${now}`)
      .returning();
    return result.length;
  }

  // === AUTH LOGS METHODS ===
  async createAuthLog(userId: string | null, action: string, success: boolean, ipAddress?: string, userAgent?: string, details?: string): Promise<AuthLog> {
    const result = await db.insert(authLogs).values({
      userId,
      action,
      success,
      ipAddress,
      userAgent,
      details,
    }).returning();
    return result[0];
  }

  async getAuthLogsByUser(userId: string, limit: number = 50): Promise<AuthLog[]> {
    return await db.select().from(authLogs)
      .where(eq(authLogs.userId, userId))
      .orderBy(authLogs.createdAt)
      .limit(limit);
  }

  // === CRM LEADS PERDIDOS METHODS ===
  async createCrmLeadPerdido(leadId: string, motivoPerda: string, usuario: string): Promise<void> {
    // Buscar dados do lead antes de perder
    const lead = await this.getCrmLead(leadId);
    if (!lead) return;

    // Salvar lead perdido com backup dos dados
    await db.insert(crmLeadsPerdidos).values({
      leadId,
      motivoPerda,
      usuario,
      dadosLeadJson: JSON.stringify(lead),
    });

    // Marcar lead como inativo
    await this.deleteCrmLead(leadId);
  }

  async getCrmLeadsPerdidos(): Promise<any[]> {
    const results = await db.select().from(crmLeadsPerdidos)
      .orderBy(crmLeadsPerdidos.dataPerda);
    
    return results.map(result => ({
      ...result,
      dadosLead: JSON.parse(result.dadosLeadJson)
    }));
  }

  // === SEED DATA METHODS ===
  async seedCrmEtapas(): Promise<void> {
    const etapasDefault = [
      { nome: "Lead Novo", icone: "📋", ordem: 1, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633" },
      { nome: "Primeiro Contato", icone: "📞", ordem: 2, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633" },
      { nome: "Segundo Contato", icone: "🔄", ordem: 3, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633" },
      { nome: "Proposta/Orçamento", icone: "💰", ordem: 4, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633" },
      { nome: "Visita Técnica", icone: "🏠", ordem: 5, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633" },
      { nome: "Negociação", icone: "⚖", ordem: 6, prazoDias: 15, cor: "#326E34", corAlerta: "#F79633" },
      { nome: "Fechamento", icone: "✅", ordem: 7, prazoDias: 3, cor: "#326E34", corAlerta: "#F79633" },
    ];

    // Verificar se já existem etapas
    const existingEtapas = await this.getAllCrmEtapas();
    if (existingEtapas.length === 0) {
      // Inserir etapas padrão
      for (const etapa of etapasDefault) {
        await db.insert(crmEtapas).values({
          ...etapa,
          ativo: true,
        });
      }
    }
  }

  // === CRM STATISTICS METHODS ===
  async getCrmStatistics(): Promise<{
    totalLeads: number;
    leadsPorEtapa: { etapa: string; count: number; }[];
    leadsEstesMes: number;
    taxaConversao: number;
  }> {
    const totalLeads = await db.select().from(crmLeads).where(eq(crmLeads.ativo, true));
    
    // Leads por etapa
    const leadsPorEtapaQuery = await db
      .select({
        etapaId: crmLeads.etapaAtual,
        count: sql`COUNT(*)`.as('count')
      })
      .from(crmLeads)
      .where(eq(crmLeads.ativo, true))
      .groupBy(crmLeads.etapaAtual);

    const etapas = await this.getAllCrmEtapas();
    const leadsPorEtapa = leadsPorEtapaQuery.map(item => {
      const etapa = etapas.find(e => e.id === item.etapaId);
      return {
        etapa: etapa?.nome || 'Desconhecida',
        count: Number(item.count)
      };
    });

    // Leads deste mês
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    
    const leadsEstesMesQuery = await db.select().from(crmLeads)
      .where(and(
        eq(crmLeads.ativo, true),
        sql`${crmLeads.createdAt} >= ${inicioMes}`
      ));

    // Taxa de conversão (fechamentos / total)
    const fechamentos = totalLeads.filter(lead => lead.etapaAtual === 7);
    const taxaConversao = totalLeads.length > 0 ? (fechamentos.length / totalLeads.length) * 100 : 0;

    return {
      totalLeads: totalLeads.length,
      leadsPorEtapa,
      leadsEstesMes: leadsEstesMesQuery.length,
      taxaConversao: Math.round(taxaConversao * 100) / 100
    };
  }
}

export const storage = new DatabaseStorage();