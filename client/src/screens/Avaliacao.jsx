import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Save, UserX } from 'lucide-react';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { api } from '../services/api.js';
import { useAuth } from '../auth/AuthContext.jsx';

/** Critérios de avaliação (0,00 a 0,20 cada; soma máxima 1,00). */
const CRITERIOS = [
  { key: 'interesse', rotulo: 'Interesse' },
  { key: 'entrega_prazo', rotulo: 'Entrega no prazo' },
  { key: 'participacao', rotulo: 'Participação' },
  { key: 'qualidade_trabalho', rotulo: 'Qualidade no trabalho' },
  { key: 'respeito_grupo', rotulo: 'Respeito no grupo' },
];

/** Valores vazios padrão para cada critério. */
const vazio = () => Object.fromEntries(CRITERIOS.map((c) => [c.key, '']));

/**
 * Tela de avaliação do Líder/Vice-Líder sobre o seu grupo.
 * O Líder/Vice avalia cada integrante (inclusive a si mesmo) nos 5 critérios,
 * cuja soma gera uma nota de no máximo 1,00.
 *
 * @returns {JSX.Element} Tela de avaliação.
 */
export default function Avaliacao() {
  const { session } = useAuth();
  const token = session?.token;
  const nomeUsuario = session?.user?.nome || '';

  const [grupo, setGrupo] = useState(null);
  const [integrantes, setIntegrantes] = useState([]);
  const [permissao, setPermissao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  /** Carrega o grupo do usuário e o estado das avaliações. */
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const { grupo: meuGrupo } = await api('/grupos/me', { token });
      const data = await api(`/grupos/${meuGrupo.id}/avaliacoes`, { token });
      setGrupo(meuGrupo);
      setIntegrantes(data.integrantes);
      setPermissao(data.permissao);
    } catch (e) {
      setErro(e.message || 'Nao foi possivel carregar a avaliacao.');
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (carregando) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (erro || !grupo) {
    return (
      <Card className="p-8 text-center text-text-muted">
        <UserX className="mx-auto mb-2 h-8 w-8" />
        {erro || 'Nenhum grupo encontrado para o seu perfil.'}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do grupo */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-text">{grupo.nome}</h2>
          {grupo.turma_nome && (
            <div className="mt-1">
              <Badge tone="professor">Turma {grupo.turma_nome}</Badge>
            </div>
          )}
        </div>
        <p className="text-sm text-text-muted">Avalie cada integrante de 0,00 a 0,20 por critério.</p>
      </div>

      {/* Aviso de permissão (Vice em modo somente leitura) */}
      {permissao && !permissao.podeEditar && (
        <div className="rounded-lg border border-warning-soft bg-warning-soft px-3 py-2 text-sm font-medium text-warning">
          {permissao.motivo || 'Modo somente leitura.'}
        </div>
      )}

      {/* Lista de avaliação */}
      {integrantes.length === 0 ? (
        <Card className="p-8 text-center text-text-muted">Nenhum integrante no grupo.</Card>
      ) : (
        <div className="space-y-4">
          {integrantes.map((integrante) => {
            const ehVoce = nomeUsuario && integrante.nome_aluno === nomeUsuario;
            return (
              <Card key={integrante.id} className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Avatar name={integrante.nome_aluno} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text">
                      {integrante.nome_aluno}
                      {ehVoce && <span className="text-primary"> (você)</span>}
                    </p>
                  </div>
                  {integrante.avaliacao && (
                    <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
                      Salva · {Number(integrante.avaliacao.nota_total).toFixed(2)}
                    </span>
                  )}
                </div>

                <AvaliaIntegrante
                  integranteId={integrante.id}
                  grupoId={grupo.id}
                  valoresIniciais={integrante.avaliacao ? deAvaliacao(integrante.avaliacao) : vazio()}
                  podeEditar={permissao?.podeEditar ?? false}
                  onSalva={carregar}
                />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Converte uma avaliação existente em valores de critérios (strings).
 *
 * @param {Object} avaliacao Avaliação retornada pela API.
 * @returns {Object} Mapa critério -> string.
 */
function deAvaliacao(avaliacao) {
  const valores = {};
  for (const c of CRITERIOS) {
    const v = avaliacao[c.key];
    valores[c.key] = v === null || v === undefined ? '' : String(v);
  }
  return valores;
}

/**
 * Formulário de avaliação de um integrante (5 critérios + total + salvar).
 *
 * @param {Object} props Propriedades do formulário.
 * @param {string} props.integranteId UUID do integrante.
 * @param {string} props.grupoId UUID do grupo.
 * @param {Object} props.valoresIniciais Valores iniciais dos critérios.
 * @param {boolean} props.podeEditar Indica se pode editar.
 * @param {Function} props.onSalva Callback após salvar.
 * @returns {JSX.Element} Formulário de avaliação.
 */
function AvaliaIntegrante({ integranteId, grupoId, valoresIniciais, podeEditar, onSalva }) {
  const { session } = useAuth();
  const [valores, setValores] = useState(valoresIniciais);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState('');

  const numeros = CRITERIOS.map((c) => Number(valores[c.key]));
  const total = numeros.reduce((soma, n) => soma + (Number.isFinite(n) ? n : 0), 0);
  const todosValidos = numeros.every((n) => Number.isFinite(n) && n >= 0 && n <= 0.2);

  /**
   * Salva a avaliação do integrante.
   */
  async function salvar() {
    setSalvando(true);
    setFeedback('');
    try {
      const corpo = {};
      for (const c of CRITERIOS) corpo[c.key] = Number(valores[c.key]);
      await api(`/grupos/${grupoId}/avaliacoes/${integranteId}`, {
        method: 'PUT',
        token: session?.token,
        body: corpo,
      });
      setFeedback('Avaliação salva!');
      onSalva();
    } catch (e) {
      setFeedback(e.message || 'Falha ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {CRITERIOS.map((c) => (
          <label key={c.key} className="block">
            <span className="mb-1 block text-xs font-semibold text-text">{c.rotulo}</span>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="0.2"
                step="0.05"
                disabled={!podeEditar}
                value={valores[c.key]}
                onChange={(e) => setValores((atual) => ({ ...atual, [c.key]: e.target.value }))}
                className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-base text-text transition-all disabled:opacity-60 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
              />
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text">Nota total:</span>
          <span className="font-display text-lg font-extrabold text-primary">
            {Number.isFinite(total) ? total.toFixed(2) : '0,00'}
          </span>
          <span className="text-sm text-text-muted">/ 1,00</span>
        </div>
        {podeEditar && (
          <Button variant="success" size="sm" onClick={salvar} disabled={!todosValidos || salvando}>
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {salvando ? 'Salvando...' : 'Salvar avaliação'}
          </Button>
        )}
      </div>

      {feedback && (
        <p className="mt-2 flex items-center gap-1 text-sm font-medium text-success">
          <Check className="h-4 w-4" /> {feedback}
        </p>
      )}

      <p className="mt-1 text-xs text-text-muted">
        A soma dos critérios gera a nota final do integrante (no máximo 1,00).
      </p>
    </div>
  );
}
