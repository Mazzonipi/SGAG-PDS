import { asyncHandler } from '../middlewares/error.middleware.js';
import * as auditService from '../services/audit.service.js';

/**
 * GET /api/audit-logs — Histórico de alterações (professor). [BANCA-01]
 */
export const listarLogs = asyncHandler(async (req, res) => {
  const logs = await auditService.listarAuditLogs();
  res.json({ logs });
});
