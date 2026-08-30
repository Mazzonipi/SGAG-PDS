import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api.js';
import { ShieldCheck, RefreshCw, AlertCircle, Clock, Database, User } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/audit-logs');
      setLogs(data?.logs || []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar históricos de auditoria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLogs();
  }, []);

  const getActionBadge = (acao) => {
    switch (acao) {
      case 'INSERT':
        return <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">INSERÇÃO</span>;
      case 'UPDATE':
        return <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">ATUALIZAÇÃO</span>;
      case 'DELETE':
        return <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">EXCLUSÃO</span>;
      default:
        return <span className="bg-slate-600/20 text-slate-400 text-xs px-2.5 py-0.5 rounded-full font-medium">{acao}</span>;
    }
  };

  const formatData = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('pt-BR');
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            Trilha Imutável de Auditoria (BANCA-01)
          </h2>
          <p className="text-sm text-slate-400">
            Registro histórico imutável de criações, edições e exclusões no sistema para rastreabilidade.
          </p>
        </div>

        <button
          onClick={carregarLogs}
          disabled={loading}
          className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-lg transition-colors border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Logs
        </button>
      </div>

      {/* Alerta de erro */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Tabela de Logs */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
          <span className="inline-block animate-spin border-2 border-indigo-500 border-t-transparent rounded-full w-8 h-8" />
          Carregando trilha de auditoria...
        </div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl bg-slate-900/40">
          Nenhum registro de auditoria encontrado ainda.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Data / Hora</th>
                <th className="py-3.5 px-4 font-semibold">Ação</th>
                <th className="py-3.5 px-4 font-semibold">Tabela Afetada</th>
                <th className="py-3.5 px-4 font-semibold">ID do Registro</th>
                <th className="py-3.5 px-4 font-semibold">Executor</th>
                <th className="py-3.5 px-4 font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    {formatData(log.created_at)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getActionBadge(log.acao || log.action)}
                  </td>
                  <td className="py-3.5 px-4 text-indigo-300 font-semibold whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3 text-indigo-400" />
                      {log.tabela || log.table_name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap truncate max-w-[120px]">
                    {log.registro_id || log.record_id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      {log.usuario_id || log.executor_id || 'Sistema'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                    {log.detalhes ? JSON.stringify(log.detalhes) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
