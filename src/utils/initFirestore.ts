import organizationService from "../services/OrganizationService";

export const initializeFirestoreData = async (): Promise<void> => {
  try {
    console.log("Initializing Firestore data...");
    
    // Initialize organization data (departments, positions, offices, programs)
    await organizationService.initializeDefaultData();
    
    console.log("Firestore initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing Firestore data:", error);
    throw new Error("Failed to initialize Firestore data");
  }
};

// Call this function once when the app starts or manually through the console
// You can call this from your app's main component or from the browser console
// Example: initializeFirestoreData().then(() => console.log("Done!"));
