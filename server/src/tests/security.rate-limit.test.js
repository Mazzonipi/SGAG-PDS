import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { createSupabaseMock } from '../test/supabaseMock.js';
import { loginLimiter, registroLimiter } from '../config/rateLimit.js';

const holder = vi.hoisted(() => ({ supabase: null }));

vi.mock('../config/supabase.js', () => ({
  get supabaseAdmin() {
    return holder.supabase;
  },
}));

// Em testes via supertest as requisições partem do loopback local.
const IP = '::ffff:127.0.0.1';

beforeEach(() => {
  holder.supabase = createSupabaseMock();
  loginLimiter.resetKey(IP);
  registroLimiter.resetKey(IP);
});

describe('Rate limiting de seguranca', () => {
  it('bloqueia cadastro com HTTP 429 ao exceder o limite', async () => {
    const max = Number(process.env.RATE_LIMIT_REGISTER) || 10;
    let status = 0;

    for (let i = 0; i <= max; i++) {
      const res = await request(app).post('/api/auth/cadastrar').send({});
      status = res.status;
    }

    expect(status).toBe(429);
  });

  it('bloqueia login com HTTP 429 ao exceder o limite', async () => {
    const max = Number(process.env.RATE_LIMIT_LOGIN) || 20;
    let status = 0;

    for (let i = 0; i <= max; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'x@gmail.com', senha: 'senha123' });
      status = res.status;
    }

    expect(status).toBe(429);
  });
});
