import { db } from './db';

/**
 * Get the patient ID to use for queries.
 * If an explicit ID is provided, use it.
 * Otherwise, fall back to the first patient in the database (for demo/personal use).
 */
export async function getDefaultPatientId(explicitId?: string | null): Promise<string | null> {
  if (explicitId) return explicitId;
  const patient = await db.patient.findFirst({ orderBy: { createdAt: 'asc' } });
  return patient?.id || null;
}
