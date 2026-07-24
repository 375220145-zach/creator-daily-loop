import os from 'node:os';
import path from 'node:path';

export const VAULT_PATH =
  process.env.VAULT_PATH || path.join(os.homedir(), 'Documents', 'Vault');

export const PORT = parseInt(process.env.PORT || '3002', 10);

export const CRON_FILE = path.join(os.homedir(), '.claude', 'scheduled_tasks.json');
