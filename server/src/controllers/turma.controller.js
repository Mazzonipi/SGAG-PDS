import { asyncHandler } from '../middlewares/error.middleware.js';
import * as turmaService from '../services/turma.service.js';

/**
 * GET /api/turmas — Lista as turmas cadastradas.
 */
export const listarTurmas = asyncHandler(async (req, res) => {
  const turmas = await turmaService.listarTurmas();
  res.json({ turmas });
});
