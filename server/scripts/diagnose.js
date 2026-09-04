import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== DIAGNÓSTICO SGAG-PDS / SUPABASE ===');
console.log('SUPABASE_URL definida:', Boolean(url));
console.log('SUPABASE_SERVICE_ROLE_KEY definida:', Boolean(key));

if (!url || !key) {
  console.log('ERRO: variáveis de ambiente ausentes em server/.env');
  process.exit(1);
}

const supabase = createClient(url, key);

const tabelas = ['profiles', 'turmas', 'grupos', 'integrantes', 'avaliacoes', 'audit_logs'];

console.log('\n--- Existência das tabelas (public) ---');
for (const tabela of tabelas) {
  const { data, error } = await supabase.from(tabela).select('*').limit(1);
  if (error) {
    const relNaoExiste = /does not exist|42P01|relation/i.test(error.message || '');
    console.log(`  ${tabela.padEnd(12)} -> ${relNaoExiste ? 'NÃO EXISTE' : `ERRO: ${error.message}`}`);
  } else {
    console.log(`  ${tabela.padEnd(12)} -> OK (${Array.isArray(data) ? data.length : 0} linhas)`);
  }
}

console.log('\n--- Verificação do trigger handle_new_user ---');
const { data: triggerData, error: triggerError } = await supabase.rpc('tabela_existe', {});
if (triggerError) {
  console.log('  (rpc de teste indisponível — ignorar)');
}

console.log('\n--- Teste de leitura de uma turma (ex.: 3A) ---');
const { data: turmas, error: turmasError } = await supabase.from('turmas').select('nome');
console.log('  turmas:', turmasError ? `ERRO: ${turmasError.message}` : JSON.stringify(turmas));

console.log('\n=== FIM DO DIAGNÓSTICO ===');
