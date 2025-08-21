import fs from 'fs/promises';
import path from 'path';

// Stockage persistant sur le système de fichiers
const STORAGE_DIR = path.join(process.cwd(), '.data');
const PROJECTS_FILE = path.join(STORAGE_DIR, 'projects.json');
const BUSINESSES_FILE = path.join(STORAGE_DIR, 'businesses.json');

// Initialiser le dossier de stockage
async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

// Gestion des projets
export async function loadProjects(): Promise<Record<string, any[]>> {
  await ensureStorageDir();
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function saveProjects(projects: Record<string, any[]>): Promise<void> {
  await ensureStorageDir();
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

export async function getUserProjects(userId: string): Promise<any[]> {
  const projects = await loadProjects();
  return projects[userId] || [];
}

export async function addUserProject(userId: string, project: any): Promise<void> {
  const projects = await loadProjects();
  if (!projects[userId]) {
    projects[userId] = [];
  }
  projects[userId].push(project);
  await saveProjects(projects);
}

export async function deleteUserProject(userId: string, projectId: string): Promise<boolean> {
  const projects = await loadProjects();
  if (!projects[userId]) return false;
  
  const initialLength = projects[userId].length;
  projects[userId] = projects[userId].filter(p => p.id !== projectId);
  
  if (projects[userId].length < initialLength) {
    await saveProjects(projects);
    return true;
  }
  return false;
}

export async function updateUserProject(userId: string, projectId: string, updates: any): Promise<any | null> {
  const projects = await loadProjects();
  if (!projects[userId]) return null;
  
  const projectIndex = projects[userId].findIndex(p => p.id === projectId);
  if (projectIndex === -1) return null;
  
  projects[userId][projectIndex] = {
    ...projects[userId][projectIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await saveProjects(projects);
  return projects[userId][projectIndex];
}

// Gestion des businesses
export async function loadBusinesses(): Promise<any[]> {
  await ensureStorageDir();
  try {
    const data = await fs.readFile(BUSINESSES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveBusinesses(businesses: any[]): Promise<void> {
  await ensureStorageDir();
  await fs.writeFile(BUSINESSES_FILE, JSON.stringify(businesses, null, 2));
}

// Synchroniser les données en mémoire avec le fichier au démarrage
export async function syncMemoryWithFile() {
  // Charger les projets depuis le fichier
  const fileProjects = await loadProjects();
  if (Object.keys(fileProjects).length > 0) {
    global.userProjects = fileProjects;
  }
  
  // Charger les businesses depuis le fichier
  const fileBusinesses = await loadBusinesses();
  if (fileBusinesses.length > 0) {
    global.businesses = fileBusinesses;
  }
}

// Synchroniser le fichier avec les données en mémoire
export async function syncFileWithMemory() {
  // Sauvegarder les projets uniquement s'il y a des données
  if (global.userProjects && Object.keys(global.userProjects).length > 0) {
    await saveProjects(global.userProjects);
  } else {
    console.warn('Skipping projects save - no data in memory');
  }
  
  // Sauvegarder les businesses uniquement s'il y a des données
  if (global.businesses && global.businesses.length > 0) {
    await saveBusinesses(global.businesses);
  } else {
    console.warn('Skipping businesses save - no data in memory');
  }
}