import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import Mascot from '../components/ui/Mascot.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

/**
 * Tela de login (primeira página). Autentica o usuário e redireciona ao painel.
 *
 * @returns {JSX.Element} Tela de login.
 */
export default function Login() {
  const { session, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Redireciona ao painel assim que a sessão estiver disponível.
  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  /**
   * Envia o formulário de login.
   *
   * @param {React.FormEvent} evento Evento de submissão.
   */
  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(email, senha);
    } catch (e) {
      setErro(e.message || 'Nao foi possivel entrar');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Mascot className="h-16 w-16" />
          <h1 className="font-display text-2xl font-bold text-text">Bem-vindo!</h1>
          <p className="text-text-muted">Acesse sua conta para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            icon={Mail}
            placeholder="seunome@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <Input
              label="Senha"
              type={mostrar ? 'text' : 'password'}
              icon={Lock}
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setMostrar((v) => !v)}
              aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3.5 top-10 text-text-muted transition-colors hover:text-text"
            >
              {mostrar ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {erro && (
            <div className="rounded-lg border border-danger-soft bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
              {erro}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={carregando || !email || !senha}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </Button>

          <div className="flex items-center justify-center gap-1 pt-1">
            <span className="text-sm text-text-muted">Ainda não tem conta?</span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/cadastro/professor')}>
              Cadastre-se
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
