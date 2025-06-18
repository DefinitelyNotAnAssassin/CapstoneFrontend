/**
 * Utility function to reliably navigate to a route using multiple methods
 * This is a workaround for navigation issues in the app
 */
export const navigateTo = (path: string) => {
  console.log(`Navigating to: ${path}`);

  // Method 1: Direct URL change (most reliable)
  window.location.href = path;

  // If the URL already has a hash at the beginning, this will work better
  if (!path.startsWith('#') && !path.startsWith('/')) {
    window.location.href = `/${path}`;
  }

  // Note: React Router history.push() is intentionally not used here
  // as it sometimes fails in the current app environment
};
