// file_view.js
import { displayFilesAndFolders } from './htmlgen.js';
import { getCurrentUser } from '../utils.js';

// 2. Setup Buttons when DOM loads
window.addEventListener('DOMContentLoaded', async () => {
    console.log("[CLIENT] DOM Content Loaded. Initializing...");
    const user = await getCurrentUser();
    if (!user) {
        console.log("[CLIENT] No user found, redirecting to login");
        window.location.href = '/login';
        return;
    }


    // Load initial files
    loadFiles();

    // --- Button Event Listeners ---
    const backBtn = document.querySelector('.abcdef');
    backBtn.addEventListener('click', async (e) => {
        const user = await getCurrentUser(); 
        console.log(`[CLIENT] Back button clicked. Current path: ${user.path}`);

        if (!user.path || user.path === '') {
            console.log("[CLIENT] Already at root, cannot go back further.");
            return;
        }

        const segments = user.path.split('/');
        segments.pop();
        const parentPath = segments.join('/');
        
        console.log(`[CLIENT] Navigating up to: ${parentPath}`);
        await navigateTo(parentPath);
    });

    // A. Upload Button
    const uploadBtn = document.querySelector('.uploadfile');
    uploadBtn.addEventListener('click', async () => {
        const user = await getCurrentUser(); 
        console.log("[CLIENT] Upload button clicked. Path:", user.path);

        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const arrayBuffer = await file.arrayBuffer();
            
            let fullPath;
            if (!user.path || user.path === '' || user.path === '/') {
                fullPath = file.name;
            } else {
                fullPath = `${user.path}/${file.name}`;
            }
            
            console.log(`[CLIENT] Uploading file: ${file.name} to ${fullPath}`);
            
            const res = await fetch(`/upload?path=${encodeURIComponent(fullPath)}`, {
                method: 'POST',
                body: arrayBuffer,
                headers: { 'Content-Type': 'application/octet-stream' }
            });

            console.log(`[CLIENT] Upload response status: ${res.status}`);

            if (res.ok) {
                loadFiles();
                return;
            }

            const err = await res.json();
            console.log('[CLIENT] Upload conflict (409), attempting replace:', err);

            if (!confirm("This file already exists, uploading again will replace it\nAre you sure?")) {
                return;
            }

            if (err.error && err.error.includes("replace")) { // Check if error message contains "replace"
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
                    alert(`Replace failed: ${err2.error}`);
                }
            } else {
                 alert(`Upload failed: ${err.error}`);
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

        console.log(`[CLIENT] Creating folder: ${name} in ${user.path}`);
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

        console.log(`[CLIENT] Deleting: ${pathToDelete}`);
        const res = await fetch(`/delete?path=${encodeURIComponent(pathToDelete)}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            loadFiles();
        } else {
            alert('Delete failed');
        }
    });

    const auditButton = document.querySelector('.auditbutton');
    auditButton.addEventListener('click', async() => {
        
        const selected = document.querySelector('.file-card.selected');
        if (!selected) {
            alert("Please select a file or folder first by clicking it!");
            return;
        }
        
        const pathToInspect = selected.dataset.path;
        const res = await fetch(`/versions?path=${encodeURIComponent(pathToInspect)}`, {
            method: 'GET'
        });

        const j = await res.json();

        alert(JSON.stringify(j))

        if (!res.ok) {
            alert("failure")
        } 

    })
    
    // D. Selection Logic (Event Delegation)
    const mainArea = document.querySelector('.mainarea');
    mainArea.addEventListener('click', (e) => {
        const card = e.target.closest('.file-card');
        if (!card) return;

        const wasSelected = card.classList.contains('selected');
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
    
    console.log(`[CLIENT] Loading files for path: "${user.path}"`);
    
    // Added cache: 'no-store' to prevent browser from caching the 401 error
    const response = await fetch(`/file_listing?path=${encodeURIComponent(user.path)}`, {
        cache: 'no-store'
    });
    
    console.log(`[CLIENT] /file_listing status: ${response.status}`);
    const data = await response.json();
    
    console.log('[CLIENT] File listing response:', data);
    
    if (!data.items) {
        console.error('[CLIENT] No items in response!');
        return;
    }
    
    displayFilesAndFolders(data.items);
    
    document.getElementById('username').innerText = user.username;
    document.getElementById('userrole').innerText = user.role;
    document.getElementById('pathdisplay').innerText = `EDUARHIV/${user.path}`;
}

// Navigate to a new path
async function navigateTo(newPath) {
    console.log(`[CLIENT] Updating session path to: ${newPath}`);
    await fetch('/update_path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: newPath })
    });
    await loadFiles();
}

// Make navigateTo available globally for htmlgen.js
window.navigateTo = navigateTo;