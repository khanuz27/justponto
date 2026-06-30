// Cliente centralizado para a API JustPonto

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('justponto_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(err.message || `Erro ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────
export async function login(email: string, senha: string) {
  return request<{ access_token: string; usuario: Usuario }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}

// ── Usuários ───────────────────────────────────────────
export async function getUsuarios(): Promise<UsuarioCompleto[]> {
  return request('/usuarios');
}

export async function criarUsuario(data: {
  nome: string;
  email: string;
  senha: string;
  perfil: 'colaborador' | 'gerente' | 'rh' | 'direcao';
}): Promise<UsuarioCompleto> {
  return request('/usuarios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function atualizarStatusUsuario(id: string, ativo: boolean): Promise<UsuarioCompleto> {
  return request(`/usuarios/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ ativo }),
  });
}

// ── Anexos ────────────────────────────────────────────
export async function getAnexosByJustificativa(justificativaId: string): Promise<Anexo[]> {
  return request(`/anexos/justificativa/${justificativaId}`);
}

export async function getAnexoDownloadUrl(anexoId: string): Promise<{ url: string }> {
  return request(`/anexos/${anexoId}/download`);
}

// Carrega todos os anexos para um conjunto de justificativas de uma vez
export async function carregarMapaAnexos(
  ids: string[]
): Promise<Record<string, Anexo[]>> {
  const resultados = await Promise.all(
    ids.map(id => getAnexosByJustificativa(id).then(a => ({ id, a })).catch(() => ({ id, a: [] as Anexo[] })))
  );
  return Object.fromEntries(resultados.map(r => [r.id, r.a]));
}

// ── Tipos de Ocorrência ──────────────────────────────────────
export async function getTiposOcorrencia(): Promise<TipoOcorrencia[]> {
  return request('/tipos-ocorrencia');
}

// ── Justificativas ───────────────────────────────────────────
export async function getMinhasJustificativas(): Promise<Justificativa[]> {
  return request('/justificativas/minhas');
}

export async function getPendentesGerente(): Promise<Justificativa[]> {
  return request('/justificativas/pendentes');
}

export async function getTodasJustificativas(params?: {
  colaboradorId?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}): Promise<Justificativa[]> {
  const qs = new URLSearchParams();
  if (params?.colaboradorId) qs.set('colaboradorId', params.colaboradorId);
  if (params?.status) qs.set('status', params.status);
  if (params?.dataInicio) qs.set('dataInicio', params.dataInicio);
  if (params?.dataFim) qs.set('dataFim', params.dataFim);
  return request(`/justificativas${qs.toString() ? '?' + qs : ''}`);
}

export async function getJustificativaDetalhe(id: string): Promise<JustificativaDetalhe> {
  return request(`/justificativas/${id}`);
}

export async function criarJustificativa(
  data: {
    tipoOcorrenciaId: string;
    dataOcorrencia: string;
    periodo?: string;
    horaInicio?: string;
    horaFim?: string;
    descricao: string;
    motivoOutros?: string;
    ocorrencias?: Array<{ tipo: string; horarioCorreto?: string }>;
  },
  arquivo?: File | null,
): Promise<Justificativa> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('justponto_token') : null;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let body: FormData | string;
  if (arquivo) {
    const form = new FormData();
    form.append('tipoOcorrenciaId', data.tipoOcorrenciaId);
    form.append('dataOcorrencia', data.dataOcorrencia);
    if (data.periodo) form.append('periodo', data.periodo);
    if (data.horaInicio) form.append('horaInicio', data.horaInicio);
    if (data.horaFim) form.append('horaFim', data.horaFim);
    form.append('descricao', data.descricao);
    if (data.motivoOutros) form.append('motivoOutros', data.motivoOutros);
    if (data.ocorrencias) form.append('ocorrencias', JSON.stringify(data.ocorrencias));
    form.append('anexo', arquivo);
    body = form;
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }

  const res = await fetch(`${API_URL}/justificativas`, {
    method: 'POST',
    headers,
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(err.message || `Erro ${res.status}`);
  }
  return res.json();
}


export async function avaliarJustificativa(
  id: string,
  data: { status: 'aprovada' | 'reprovada'; comentario?: string },
): Promise<Justificativa> {
  return request(`/justificativas/${id}/avaliar`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function marcarAjusteLancado(id: string): Promise<Justificativa> {
  return request(`/justificativas/${id}/ajuste-lancado`, { method: 'PATCH' });
}

// ── Relatórios ───────────────────────────────────────────────
export async function getRelatorioResumo(): Promise<RelatorioResumo> {
  return request('/relatorios/resumo');
}

// ── Tipos ────────────────────────────────────────────────────
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'colaborador' | 'gerente' | 'rh' | 'direcao';
}

export interface UsuarioCompleto {
  id: string;
  nome: string;
  email: string;
  perfil: 'colaborador' | 'gerente' | 'rh' | 'direcao';
  departamento?: string;
  gerenteId?: string;
  ativo: boolean;
}

export interface TipoOcorrencia {
  id: string;
  nome: string;
  descricao?: string;
  exigeAnexo: boolean;
  ativo: boolean;
}

export interface Justificativa {
  id: string;
  colaboradorId: string;
  tipoOcorrenciaId: string;
  dataOcorrencia: string;
  periodo: 'dia_inteiro' | 'parcial';
  horaInicio?: string;
  horaFim?: string;
  descricao: string;
  motivoOutros?: string;
  status: 'pendente' | 'aprovada' | 'reprovada';
  aprovadorId?: string;
  comentarioAvaliacao?: string;
  avaliadoEm?: string;
  criadoEm: string;
  atualizadoEm: string;
  ocorrencias?: JustificativaOcorrencia[];
}

export interface JustificativaOcorrencia {
  id: string;
  justificativaId: string;
  tipoOcorrencia: 'entrada' | 'saida_almoco' | 'retorno_almoco' | 'saida' | 'dia_inteiro';
  horarioCorreto?: string;
  criadoEm: string;
}

export interface JustificativaDetalhe extends Justificativa {
  ocorrencias: JustificativaOcorrencia[];
  anexos: Anexo[];
  colaboradorNome: string;
  colaboradorEmail: string;
  aprovadorNome?: string;
  tipoNome: string;
}

export interface Anexo {
  id: string;
  justificativaId: string;
  nomeArquivo: string;
  tipoMime: string;
  tamanhoBytes: number;
  caminhoStorage: string;
  criadoEm: string;
}

export interface RelatorioResumo {
  totalGeral: number;
  totalPorStatus: { pendente: number; aprovada: number; reprovada: number };
  porColaborador: Array<{
    nome: string;
    total: number;
    pendentes: number;
    aprovadas: number;
    reprovadas: number;
    diasJustificados: number;
    horasJustificadas: number;
  }>;
  rankingMotivos: Array<{ tipoId: string; nome: string; total: number }>;
}
