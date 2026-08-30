import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app.js';

describe('GET /health', () => {
  it('deve retornar HTTP 200 com body { status: "ok" }', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('deve responder com Content-Type JSON', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('Middlewares de seguranca', () => {
  it('deve aplicar headers de seguranca do helmet (X-Content-Type-Options)', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
