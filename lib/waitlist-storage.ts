import fs from 'fs/promises';
import path from 'path';

// Configuration de la whitelist
export const WHITELISTED_EMAILS = [
  'hugomorales125@gmail.com', // Votre email de test
  'test@ezia.ai', // Email de test supplémentaire
];

// Stockage persistant pour la liste d'attente
const STORAGE_DIR = path.join(process.cwd(), '.data');
const WAITLIST_FILE = path.join(STORAGE_DIR, 'waitlist.json');

interface WaitlistEntry {
  id: string;
  email: string;
  name: string;
  company?: string;
  message?: string;
  source?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Initialiser le dossier de stockage
async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

// Charger la liste d'attente
export async function loadWaitlist(): Promise<WaitlistEntry[]> {
  await ensureStorageDir();
  try {
    const data = await fs.readFile(WAITLIST_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Sauvegarder la liste d'attente
export async function saveWaitlist(waitlist: WaitlistEntry[]): Promise<void> {
  await ensureStorageDir();
  await fs.writeFile(WAITLIST_FILE, JSON.stringify(waitlist, null, 2));
}

// Ajouter une entrée à la liste d'attente
export async function addToWaitlist(entry: Omit<WaitlistEntry, 'id' | 'createdAt'>): Promise<WaitlistEntry> {
  const waitlist = await loadWaitlist();
  
  // Vérifier si l'email existe déjà
  const existingEntry = waitlist.find(w => w.email.toLowerCase() === entry.email.toLowerCase());
  if (existingEntry) {
    throw new Error('Cet email est déjà inscrit sur la liste d\'attente');
  }
  
  const newEntry: WaitlistEntry = {
    ...entry,
    id: `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  
  waitlist.push(newEntry);
  await saveWaitlist(waitlist);
  
  return newEntry;
}

// Vérifier si un email est whitelisté
export function isEmailWhitelisted(email: string): boolean {
  return WHITELISTED_EMAILS.includes(email.toLowerCase());
}

// Obtenir le nombre d'inscrits
export async function getWaitlistCount(): Promise<number> {
  const waitlist = await loadWaitlist();
  return waitlist.length;
}

// Vérifier si un email est déjà sur la liste d'attente
export async function isEmailInWaitlist(email: string): Promise<boolean> {
  const waitlist = await loadWaitlist();
  return waitlist.some(w => w.email.toLowerCase() === email.toLowerCase());
}