import dbConnect from '@/lib/mongodb';
import Waitlist, { IWaitlist } from '@/models/Waitlist';

export interface WaitlistEntry {
  id?: string;
  email: string;
  name: string;
  company?: string;
  message?: string;
  profile?: string;
  needs?: string;
  urgency?: string;
  source?: string;
  createdAt?: string;
  metadata?: Record<string, any>;
}

// Ajouter une entrée à la waitlist
export async function addToWaitlist(data: WaitlistEntry): Promise<WaitlistEntry> {
  await dbConnect();
  
  try {
    const entry = await Waitlist.create({
      email: data.email.toLowerCase(),
      name: data.name,
      company: data.company,
      message: data.message,
      profile: data.profile || 'other',
      needs: data.needs,
      urgency: data.urgency || 'exploring',
      source: data.source || 'website',
      metadata: data.metadata || {}
    });

    return {
      id: entry._id.toString(),
      email: entry.email,
      name: entry.name,
      company: entry.company,
      message: entry.message,
      profile: entry.profile,
      needs: entry.needs,
      urgency: entry.urgency,
      source: entry.source,
      createdAt: entry.createdAt.toISOString(),
      metadata: entry.metadata
    };
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error('Cet email est déjà inscrit sur la liste d\'attente');
    }
    throw error;
  }
}

// Vérifier si un email est déjà inscrit
export async function isEmailInWaitlist(email: string): Promise<boolean> {
  await dbConnect();
  
  const count = await Waitlist.countDocuments({ 
    email: email.toLowerCase() 
  });
  
  return count > 0;
}

// Obtenir le nombre total d'inscrits
export async function getWaitlistCount(): Promise<number> {
  await dbConnect();
  return await Waitlist.countDocuments();
}

// Charger toute la waitlist
export async function loadWaitlist(): Promise<WaitlistEntry[]> {
  await dbConnect();
  
  const entries = await Waitlist.find({})
    .sort({ createdAt: -1 })
    .lean();
  
  return entries.map(entry => ({
    id: entry._id.toString(),
    email: entry.email,
    name: entry.name,
    company: entry.company,
    message: entry.message,
    profile: entry.profile,
    needs: entry.needs,
    urgency: entry.urgency,
    source: entry.source,
    createdAt: entry.createdAt.toISOString(),
    metadata: entry.metadata
  }));
}

// Obtenir les statistiques
export async function getWaitlistStats() {
  await dbConnect();
  
  const [
    total,
    byProfile,
    byUrgency,
    bySource,
    lastWeek,
    lastMonth
  ] = await Promise.all([
    Waitlist.countDocuments(),
    Waitlist.aggregate([
      { $group: { _id: '$profile', count: { $sum: 1 } } }
    ]),
    Waitlist.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]),
    Waitlist.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]),
    Waitlist.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }),
    Waitlist.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })
  ]);
  
  return {
    total,
    byProfile: Object.fromEntries(byProfile.map(p => [p._id, p.count])),
    byUrgency: Object.fromEntries(byUrgency.map(u => [u._id, u.count])),
    bySource: Object.fromEntries(bySource.map(s => [s._id, s.count])),
    lastWeek,
    lastMonth
  };
}

// Supprimer une entrée (pour admin)
export async function removeFromWaitlist(email: string): Promise<boolean> {
  await dbConnect();
  
  const result = await Waitlist.deleteOne({ 
    email: email.toLowerCase() 
  });
  
  return result.deletedCount > 0;
}

// Rechercher dans la waitlist
export async function searchWaitlist(query: string): Promise<WaitlistEntry[]> {
  await dbConnect();
  
  const searchRegex = new RegExp(query, 'i');
  
  const entries = await Waitlist.find({
    $or: [
      { email: searchRegex },
      { name: searchRegex },
      { company: searchRegex }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(50)
  .lean();
  
  return entries.map(entry => ({
    id: entry._id.toString(),
    email: entry.email,
    name: entry.name,
    company: entry.company,
    message: entry.message,
    profile: entry.profile,
    needs: entry.needs,
    urgency: entry.urgency,
    source: entry.source,
    createdAt: entry.createdAt.toISOString(),
    metadata: entry.metadata
  }));
}

// Exporter pour CSV
export async function exportWaitlistToCSV(): Promise<string> {
  await dbConnect();
  
  const entries = await Waitlist.find({})
    .sort({ createdAt: -1 })
    .lean();
  
  const headers = ['Date', 'Nom', 'Email', 'Profil', 'Besoins', 'Urgence', 'Entreprise', 'Source'];
  const rows = entries.map(entry => [
    entry.createdAt.toLocaleDateString('fr-FR'),
    entry.name,
    entry.email,
    entry.profile || 'Non spécifié',
    entry.needs || 'Non spécifié',
    entry.urgency || 'Non spécifié',
    entry.company || '',
    entry.source || 'website'
  ]);
  
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csv;
}