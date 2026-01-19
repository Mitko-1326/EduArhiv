// file_view.js
import { displayFilesAndFolders } from './htmlgen.js';

// Load files for current path
async function loadFiles() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = '/login';
        return;
    }
    
    console.log('Loading files for path:', user.path);
    
    // Fetch file listing
    const response = await fetch(`/file_listing?path=${encodeURIComponent(user.path)}`);
    const data = await response.json();
    
    console.log('File listing response:', data);  // <-- See what we got
    
    // Check if we have items
    if (!data.items) {
        console.error('No items in response!');
        return;
    }
    
    // Display files
    displayFilesAndFolders(data.items);
    
    // Update UI
    document.getElementById('username').innerText = user.username;
    document.getElementById('userrole').innerText = user.role;
    document.getElementById('pathdisplay').innerText = `EDUARHIV/${user.path}`;
}

// Navigate to a new path
async function navigateTo(newPath) {
    // Update path in session
    await fetch('/update_path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: newPath })
    });
    
    // Reload files
    await loadFiles();
}

// Make navigateTo available globally for htmlgen.js
window.navigateTo = navigateTo;

// Load on page ready
window.addEventListener('DOMContentLoaded', loadFiles);