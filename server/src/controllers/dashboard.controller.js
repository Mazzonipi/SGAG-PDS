import { asyncHandler } from '../middlewares/error.middleware.js';
import * as dashboardService from '../services/dashboard.service.js';

/**
 * GET /api/dashboard — Métricas do dashboard com filtro opcional por turma.
 */
export const obterDashboard = asyncHandler(async (req, res) => {
  const { turmaId } = req.query;
  const metricas = await dashboardService.obterMetricasDashboard({ turmaId });
  res.json(metricas);
});
