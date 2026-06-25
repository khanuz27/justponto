import { v4 as uuidv4 } from 'uuid';
import { Usuario } from '../../common/entities/usuario.entity';
import { TipoOcorrencia } from '../../common/entities/tipo-ocorrencia.entity';
import { Justificativa } from '../../common/entities/justificativa.entity';
import { PerfilUsuario } from '../../common/enums/perfil-usuario.enum';
import { StatusJustificativa } from '../../common/enums/status-justificativa.enum';
import { Periodo } from '../../common/enums/periodo.enum';

// ── IDs fixos para referência cruzada ──────────────────────────────────────
export const SEED_IDS = {
  direcao: uuidv4(),
  rh: uuidv4(),
  gerente: uuidv4(),
  colaborador: uuidv4(),
  tipo_atestado: uuidv4(),
  tipo_consulta: uuidv4(),
  tipo_transporte: uuidv4(),
  tipo_esquecimento: uuidv4(),
  tipo_falha: uuidv4(),
  tipo_externo: uuidv4(),
  tipo_licenca: uuidv4(),
  tipo_outros: uuidv4(),
  just1: uuidv4(),
  just2: uuidv4(),
};

// Senha "senha123" — bcrypt hash gerado com bcrypt@6 (custo 10)
const SENHA_HASH = '$2b$10$d8V.sdplbhfSqIN2fDGevubnqKIs/IuASdm22/G//8fgE8T21szda';

export const USUARIOS_SEED: Usuario[] = [
  {
    id: SEED_IDS.direcao,
    nome: 'Direção Geral',
    email: 'direcao@empresa.com',
    senhaHash: SENHA_HASH,
    perfil: PerfilUsuario.DIRECAO,
    gerenteId: undefined,
    departamento: 'Diretoria',
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: SEED_IDS.rh,
    nome: 'RH Central',
    email: 'rh@empresa.com',
    senhaHash: SENHA_HASH,
    perfil: PerfilUsuario.RH,
    gerenteId: undefined,
    departamento: 'Recursos Humanos',
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: SEED_IDS.gerente,
    nome: 'João Gerente',
    email: 'gerente@empresa.com',
    senhaHash: SENHA_HASH,
    perfil: PerfilUsuario.GERENTE,
    gerenteId: undefined,
    departamento: 'TI',
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: SEED_IDS.colaborador,
    nome: 'Maria Colab',
    email: 'colaborador@empresa.com',
    senhaHash: SENHA_HASH,
    perfil: PerfilUsuario.COLABORADOR,
    gerenteId: SEED_IDS.gerente,
    departamento: 'TI',
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
];

export const TIPOS_SEED: TipoOcorrencia[] = [
  { id: SEED_IDS.tipo_atestado, nome: 'Atestado médico', descricao: 'Ausência justificada por atestado médico', exigeAnexo: true, ativo: true, criadoEm: new Date() },
  { id: SEED_IDS.tipo_consulta, nome: 'Consulta médica', descricao: 'Consulta ou exame agendado', exigeAnexo: true, ativo: true, criadoEm: new Date() },
  { id: SEED_IDS.tipo_transporte, nome: 'Problema de transporte', descricao: 'Greve, acidente ou falha no transporte público', exigeAnexo: false, ativo: true, criadoEm: new Date() },
  { id: SEED_IDS.tipo_esquecimento, nome: 'Esquecimento de registro', descricao: 'Compareceu mas esqueceu de registrar o ponto', exigeAnexo: false, ativo: true, criadoEm: new Date() },
  { id: SEED_IDS.tipo_falha, nome: 'Falha no relógio de ponto', descricao: 'Equipamento indisponível ou com defeito', exigeAnexo: false, ativo: true, criadoEm: new Date() },
  { id: SEED_IDS.tipo_externo, nome: 'Trabalho externo', descricao: 'Atividade externa previamente autorizada', exigeAnexo: false, ativo: true, criadoEm: new Date() },
  { id: SEED_IDS.tipo_licenca, nome: 'Licença / Folga', descricao: 'Folga ou licença acordada com a gestão', exigeAnexo: false, ativo: true, criadoEm: new Date() },
  { id: SEED_IDS.tipo_outros, nome: 'Outros', descricao: 'Outros motivos (detalhar no campo justificativa)', exigeAnexo: false, ativo: true, criadoEm: new Date() },
];

export const JUSTIFICATIVAS_SEED: Justificativa[] = [
  {
    id: SEED_IDS.just1,
    colaboradorId: SEED_IDS.colaborador,
    tipoOcorrenciaId: SEED_IDS.tipo_esquecimento,
    dataOcorrencia: '2024-06-10',
    periodo: Periodo.DIA_INTEIRO,
    horaInicio: undefined,
    horaFim: undefined,
    descricao: 'Esqueci de registrar o ponto na entrada.',
    status: StatusJustificativa.PENDENTE,
    aprovadorId: undefined,
    comentarioAvaliacao: undefined,
    avaliadoEm: undefined,
    criadoEm: new Date('2024-06-10T09:00:00Z'),
    atualizadoEm: new Date('2024-06-10T09:00:00Z'),
  },
  {
    id: SEED_IDS.just2,
    colaboradorId: SEED_IDS.colaborador,
    tipoOcorrenciaId: SEED_IDS.tipo_transporte,
    dataOcorrencia: '2024-06-05',
    periodo: Periodo.PARCIAL,
    horaInicio: '08:00',
    horaFim: '10:00',
    descricao: 'Atraso devido à greve do metrô.',
    status: StatusJustificativa.APROVADA,
    aprovadorId: SEED_IDS.gerente,
    comentarioAvaliacao: 'Confirmado pelo noticiário.',
    avaliadoEm: new Date('2024-06-06T14:00:00Z'),
    criadoEm: new Date('2024-06-05T11:00:00Z'),
    atualizadoEm: new Date('2024-06-06T14:00:00Z'),
  },
];
