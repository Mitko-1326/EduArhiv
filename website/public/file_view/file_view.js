// file_view.js
import { displayFilesAndFolders } from './htmlgen.js';
import { getCurrentUser } from '../utils.js';


// 2. Setup Buttons when DOM loads
window.addEventListener('DOMContentLoaded', async () => {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = '/login';
        return;
    }

    // Load initial files
    loadFiles();

    // --- Button Event Listeners ---
    const backBtn = document.querySelector('.abcdef');
    backBtn.addEventListener('click', async (e) => {
        // FIX: Fetch the user again right here to get the CURRENT path
        const user = await getCurrentUser(); 

        console.log(`Current path: ${user.path}`);

        // Safety check: If we are already at root (empty string), do nothing
        if (!user.path || user.path === '') {
            console.log("Already at root, cannot go back further.");
            return;
        }

        // 1. Split path into array
        const segments = user.path.split('/');

        // 2. Remove the last segment
        segments.pop();

        // 3. Join back into a string
        const parentPath = segments.join('/');

        console.log(`Going up to: ${parentPath}`);

        await navigateTo(parentPath);
    });


    // A. Upload Button
    const uploadBtn = document.querySelector('.uploadfile');
    // In file_view.js upload handler

    uploadBtn.addEventListener('click', async () => {
        const user = await getCurrentUser(); 
        console.log("Current user path for upload:", user.path);
        

        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const arrayBuffer = await file.arrayBuffer();
            
            // Fix path construction - handle both empty and non-empty paths
            let fullPath;
            if (!user.path || user.path === '' || user.path === '/') {
                fullPath = file.name;  // Root: just the filename
            } else {
                fullPath = `${user.path}/${file.name}`;  // Subfolder: path/filename
            }
            
            console.log('Uploading to:', fullPath);
            
            const res = await fetch(`/upload?path=${encodeURIComponent(fullPath)}`, {
                method: 'POST',
                body: arrayBuffer,
                headers: { 'Content-Type': 'application/octet-stream' }
            });

            if (res.ok) {
                loadFiles();
                return;
            }

            const err = await res.json();
            console.log('Already exists,, trying repalce');
            if (err.error.includes("replace")) {
                const res2 = await fetch(`/replace?path=${encodeURIComponent(fullPath)}`, {
                    method: 'PUT',
                    body: arrayBuffer,
                    headers: { 'Content-Type': 'application/octet-stream' }
                });

                if (res2.ok) {
                    loadFiles();
                    return;
                } else {
                    const err2 = await res2.json();
                    alert(`fail: ${err2.error}`)
                }
            }
        };
        input.click();
    });

    // B. Create Folder Button
    const folderBtn = document.querySelector('.makefolder');
    folderBtn.addEventListener('click', async () => {
        const user = await getCurrentUser(); 

        const name = prompt("Enter folder name:");
        if (!name) return;

        const res = await fetch('/mkdir', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({path: user.path, name: name })
        });

        if (res.ok) {
            loadFiles();
        } else {
            const err = await res.json();
            alert(err.error || 'Failed to create folder');
        }
    });

    // C. Delete Button
    const deleteBtn = document.querySelector('.deletefile');
    deleteBtn.addEventListener('click', async () => {
        const selected = document.querySelector('.file-card.selected');
        if (!selected) {
            alert("Please select a file or folder first by clicking it!");
            return;
        }

        const pathToDelete = selected.dataset.path;
        if (!confirm(`Are you sure you want to delete ${pathToDelete}?`)) return;

        const res = await fetch(`/delete?path=${encodeURIComponent(pathToDelete)}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            loadFiles();
        } else {
            alert('Delete failed');
        }
    });
    
    // D. Selection Logic (Event Delegation)
    const mainArea = document.querySelector('.mainarea');
    mainArea.addEventListener('click', (e) => {
        const card = e.target.closest('.file-card');
        if (!card) return;

        // Toggle selection
        const wasSelected = card.classList.contains('selected');
        // Deselect all others
        document.querySelectorAll('.file-card.selected').forEach(c => c.classList.remove('selected'));
        
        if (!wasSelected) {
            card.classList.add('selected');
        }
    });
});

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