import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, User } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import { api } from '../services/api.js';

/**
 * Tela de cadastro do Professor (único perfil que se cadastra por conta própria).
 * Líderes e Vice-Líderes são cadastrados pelo Professor (POST /profiles).
 * Ao concluir, redireciona de volta para o login.
 *
 * @returns {JSX.Element} Tela de cadastro do professor.
 */
export default function RegisterForm() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  /**
   * Envia o formulário de cadastro e redireciona ao login em caso de sucesso.
   *
   * @param {React.FormEvent} evento Evento de submissão.
   */
  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await api('/auth/cadastrar', {
        method: 'POST',
        body: { nome, email, senha, confirmar_senha: confirmar, role: 'professor' },
      });
      navigate('/login', { state: { cadastrado: true } });
    } catch (e) {
      setErro(e.message || 'Nao foi possivel cadastrar');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </div>

        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <User className="h-10 w-10 text-secondary" />
          <h1 className="font-display text-2xl font-bold text-text">Cadastro do Professor</h1>
          <p className="text-text-muted">Preencha seus dados institucionais para criar a conta.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome completo" icon={User} value={nome} onChange={(e) => setNome(e.target.value)} required />
          <Input
            label="E-mail"
            type="email"
            icon={Mail}
            placeholder="seunome@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input label="Senha" type="password" icon={Lock} value={senha} onChange={(e) => setSenha(e.target.value)} required />
          <Input
            label="Confirmar senha"
            type="password"
            icon={Lock}
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />

          {erro && (
            <div className="rounded-lg border border-danger-soft bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
              {erro}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={carregando}>
            {carregando ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
