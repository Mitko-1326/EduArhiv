export async function getCurrentUser() {
  try {
    const response = await fetch('/current_user');
    const data = await response.json();
    
    console.log('getCurrentUser response:', data);  // Debug log
    
    if (!data.loggedIn) {
      return null;
    }
    
    return {
      ...data.user,
      path: data.path || ''  
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}