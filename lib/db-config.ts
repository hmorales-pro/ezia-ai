// Configuration pour basculer entre MongoDB et la base de données en mémoire

let forceMemoryDB = false;

export function setForceMemoryDB(value: boolean) {
  forceMemoryDB = value;
  if (value) {
    console.log("Forcing memory database due to MongoDB connection issues");
  }
}

export function shouldUseMemoryDB() {
  return forceMemoryDB || !process.env.MONGODB_URI || process.env.MONGODB_URI.trim() === '';
}

// Fonction pour tester la connexion MongoDB au démarrage
export async function testMongoDBConnection() {
  if (!process.env.MONGODB_URI) {
    console.log("No MongoDB URI configured, using memory database");
    return false;
  }

  try {
    const dbConnect = (await import("./mongodb")).default;
    await dbConnect();
    console.log("MongoDB connection test successful");
    return true;
  } catch (error) {
    console.error("MongoDB connection test failed:", error);
    console.log("Will use memory database as fallback");
    setForceMemoryDB(true);
    return false;
  }
}