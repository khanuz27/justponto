"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JUSTIFICATIVAS_SEED = exports.TIPOS_SEED = exports.USUARIOS_SEED = exports.SEED_IDS = void 0;
const uuid_1 = require("uuid");
const perfil_usuario_enum_1 = require("../../common/enums/perfil-usuario.enum");
const status_justificativa_enum_1 = require("../../common/enums/status-justificativa.enum");
const periodo_enum_1 = require("../../common/enums/periodo.enum");
exports.SEED_IDS = {
    direcao: (0, uuid_1.v4)(),
    rh: (0, uuid_1.v4)(),
    gerente: (0, uuid_1.v4)(),
    colaborador: (0, uuid_1.v4)(),
    tipo_atestado: (0, uuid_1.v4)(),
    tipo_consulta: (0, uuid_1.v4)(),
    tipo_transporte: (0, uuid_1.v4)(),
    tipo_esquecimento: (0, uuid_1.v4)(),
    tipo_falha: (0, uuid_1.v4)(),
    tipo_externo: (0, uuid_1.v4)(),
    tipo_licenca: (0, uuid_1.v4)(),
    tipo_outros: (0, uuid_1.v4)(),
    just1: (0, uuid_1.v4)(),
    just2: (0, uuid_1.v4)(),
};
const SENHA_HASH = '$2b$10$d8V.sdplbhfSqIN2fDGevubnqKIs/IuASdm22/G//8fgE8T21szda';
exports.USUARIOS_SEED = [
    {
        id: exports.SEED_IDS.direcao,
        nome: 'Direção Geral',
        email: 'direcao@empresa.com',
        senhaHash: SENHA_HASH,
        perfil: perfil_usuario_enum_1.PerfilUsuario.DIRECAO,
        gerenteId: undefined,
        departamento: 'Diretoria',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
    },
    {
        id: exports.SEED_IDS.rh,
        nome: 'RH Central',
        email: 'rh@empresa.com',
        senhaHash: SENHA_HASH,
        perfil: perfil_usuario_enum_1.PerfilUsuario.RH,
        gerenteId: undefined,
        departamento: 'Recursos Humanos',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
    },
    {
        id: exports.SEED_IDS.gerente,
        nome: 'João Gerente',
        email: 'gerente@empresa.com',
        senhaHash: SENHA_HASH,
        perfil: perfil_usuario_enum_1.PerfilUsuario.GERENTE,
        gerenteId: undefined,
        departamento: 'TI',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
    },
    {
        id: exports.SEED_IDS.colaborador,
        nome: 'Maria Colab',
        email: 'colaborador@empresa.com',
        senhaHash: SENHA_HASH,
        perfil: perfil_usuario_enum_1.PerfilUsuario.COLABORADOR,
        gerenteId: exports.SEED_IDS.gerente,
        departamento: 'TI',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
    },
];
exports.TIPOS_SEED = [
    { id: exports.SEED_IDS.tipo_atestado, nome: 'Atestado médico', descricao: 'Ausência justificada por atestado médico', exigeAnexo: true, ativo: true, criadoEm: new Date() },
    { id: exports.SEED_IDS.tipo_consulta, nome: 'Consulta médica', descricao: 'Consulta ou exame agendado', exigeAnexo: true, ativo: true, criadoEm: new Date() },
    { id: exports.SEED_IDS.tipo_transporte, nome: 'Problema de transporte', descricao: 'Greve, acidente ou falha no transporte público', exigeAnexo: false, ativo: true, criadoEm: new Date() },
    { id: exports.SEED_IDS.tipo_esquecimento, nome: 'Esquecimento de registro', descricao: 'Compareceu mas esqueceu de registrar o ponto', exigeAnexo: false, ativo: true, criadoEm: new Date() },
    { id: exports.SEED_IDS.tipo_falha, nome: 'Falha no relógio de ponto', descricao: 'Equipamento indisponível ou com defeito', exigeAnexo: false, ativo: true, criadoEm: new Date() },
    { id: exports.SEED_IDS.tipo_externo, nome: 'Trabalho externo', descricao: 'Atividade externa previamente autorizada', exigeAnexo: false, ativo: true, criadoEm: new Date() },
    { id: exports.SEED_IDS.tipo_licenca, nome: 'Licença / Folga', descricao: 'Folga ou licença acordada com a gestão', exigeAnexo: false, ativo: true, criadoEm: new Date() },
    { id: exports.SEED_IDS.tipo_outros, nome: 'Outros', descricao: 'Outros motivos (detalhar no campo justificativa)', exigeAnexo: false, ativo: true, criadoEm: new Date() },
];
exports.JUSTIFICATIVAS_SEED = [
    {
        id: exports.SEED_IDS.just1,
        colaboradorId: exports.SEED_IDS.colaborador,
        tipoOcorrenciaId: exports.SEED_IDS.tipo_esquecimento,
        dataOcorrencia: '2024-06-10',
        periodo: periodo_enum_1.Periodo.DIA_INTEIRO,
        horaInicio: undefined,
        horaFim: undefined,
        descricao: 'Esqueci de registrar o ponto na entrada.',
        status: status_justificativa_enum_1.StatusJustificativa.PENDENTE,
        aprovadorId: undefined,
        comentarioAvaliacao: undefined,
        avaliadoEm: undefined,
        criadoEm: new Date('2024-06-10T09:00:00Z'),
        atualizadoEm: new Date('2024-06-10T09:00:00Z'),
    },
    {
        id: exports.SEED_IDS.just2,
        colaboradorId: exports.SEED_IDS.colaborador,
        tipoOcorrenciaId: exports.SEED_IDS.tipo_transporte,
        dataOcorrencia: '2024-06-05',
        periodo: periodo_enum_1.Periodo.PARCIAL,
        horaInicio: '08:00',
        horaFim: '10:00',
        descricao: 'Atraso devido à greve do metrô.',
        status: status_justificativa_enum_1.StatusJustificativa.APROVADA,
        aprovadorId: exports.SEED_IDS.gerente,
        comentarioAvaliacao: 'Confirmado pelo noticiário.',
        avaliadoEm: new Date('2024-06-06T14:00:00Z'),
        criadoEm: new Date('2024-06-05T11:00:00Z'),
        atualizadoEm: new Date('2024-06-06T14:00:00Z'),
    },
];
//# sourceMappingURL=mock.seed.js.map