/**
 * Classe de erro de aplicação com código HTTP explícito e mensagem segura
 * para a interface (sem stack traces nem detalhes internos do banco).
 */
export class AppError extends Error {
  /**
   * @param {number} statusCode Código HTTP (400, 401, 403, 404, 409...).
   * @param {string} message Mensagem de erro exibida ao cliente.
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

/**
 * Wrapper que encaminha rejeições de handlers assíncronos ao middleware de erro.
 *
 * @param {Function} fn Handler Express (req, res, next).
 * @returns {Function} Handler assíncrono seguro.
 */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Middleware de rota não encontrada.
 */
export const notFound = (req, res, next) => {
  next(new AppError(404, 'Rota nao encontrada'));
};

/**
 * Middleware central de tratamento de erros.
 * Nunca expõe stack traces ou detalhes internos do banco ao cliente.
 *
 * @param {Error} err Erro capturado.
 * @param {import('express').Request} req Requisição.
 * @param {import('express').Response} res Resposta.
 * @param {Function} next Próximo middleware.
 * @returns {import('express').Response} Resposta JSON com erro mascarado.
 */
export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err?.name === 'ZodError') {
    return res.status(400).json({ error: 'Dados invalidos', issues: err.issues });
  }

  if (err?.code === '23505') {
    return res.status(409).json({ error: 'Registro duplicado' });
  }

  if (err?.code === '23514') {
    return res.status(400).json({ error: 'Violacao de regra de negocio' });
  }

  console.error('[ERRO INTERNO DO SERVIDOR]', err);
  return res.status(500).json({ error: 'Erro interno no servidor' });
};
