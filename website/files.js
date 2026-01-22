module.exports = function(app, API_KEY) {
    app.get("/crumbs", async (req, res) => {
        try {
            const path = req.query.path || '';
            const url = `https://api.eduarhiv.com/fs/path_from_root?path=${encodeURIComponent(path)}`; // Changed!
        
            const apiResponse = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY
                }
            });
            
            if (!apiResponse.ok) {
                return res.status(apiResponse.status).json({ 
                    error: 'API request failed' 
                });
            }
            
            const data = await apiResponse.json();
            res.json(data);
        } catch (error) {
            console.error('Crumbs error:', error);
            res.status(500).json({ error: 'Failed to fetch breadcrumbs' });
        }
    });

    app.get("/file_listing", async (req, res) => {
        try {
            const path = req.query.path || '';
            const url = `https://api.eduarhiv.com/fs/listing?path=${encodeURIComponent(path)}`; // Changed!
            
            const apiResponse = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY
                }
            });
            
            if (!apiResponse.ok) {
                return res.status(apiResponse.status).json({ 
                    error: 'API request failed' 
                });
            }
            
            const data = await apiResponse.json();
            res.json(data);
        } catch (error) {
            console.error('File listing error:', error);
            res.status(500).json({ error: 'Failed to fetch file listing' });
        }
    });
    // 1. Upload Endpoint
    app.post('/upload', async (req, res) => {
        if (!req.session.isLoggedIn) return res.status(401).send('Unauthorized');

        try {
            const { path } = req.query; // Get path from query string
            
            // We need to pipe the raw body from client to API
            // Note: express.json() in index.js might interfere if we aren't careful.
            // We assume the client sends binary/octet-stream
            
            const url = `https://api.eduarhiv.com/fs/upload?path=${encodeURIComponent(path)}`;
            
            const apiResponse = await fetch(url, {
                method: 'POST',
                headers: { 
                    'X-API-Key': API_KEY,
                    'Content-Type': 'application/octet-stream' 
                },
                body: req.body // Forward the raw buffer
            });
            
            const data = await apiResponse.json();
            if (!apiResponse.ok) return res.status(apiResponse.status).json(data);
            
            res.json(data);
        } catch (error) {
            console.error('Upload proxy error:', error);
            res.status(500).json({ error: 'Upload failed' });
        }
    });

    app.put('/replace', async (req, res) => {
        if (!req.session.isLoggedIn) return res.status(401).send('Unauthorized');

        try {
            const { path } = req.query; // Get path from query string
            
            const url = `https://api.eduarhiv.com/fs/replace?path=${encodeURIComponent(path)}`;
            
            const apiResponse = await fetch(url, {
                method: 'PUT',
                headers: { 
                    'X-API-Key': API_KEY,
                    'Content-Type': 'application/octet-stream' 
                },
                body: req.body // Forward the raw buffer
            });
            
            const data = await apiResponse.json();
            if (!apiResponse.ok) return res.status(apiResponse.status).json(data);
            
            res.json(data);
        } catch (error) {
            console.error('Upload proxy error:', error);
            res.status(500).json({ error: 'Upload failed' });
        }
    });

    // 2. Create Folder Endpoint
    app.post('/mkdir', async (req, res) => {
        if (!req.session.isLoggedIn) return res.status(401).send('Unauthorized');
        
        try {
            // We expect body: { path: "/current/path", name: "NewFolder" }
            const { path, name } = req.body;
            
            if (!name) return res.status(400).json({ error: 'Folder name required' });

            // Construct the full new path
            const newPath = path.endsWith('/') ? path + name : path + '/' + name;
            
            const url = `https://api.eduarhiv.com/fs/mkdir?path=${encodeURIComponent(newPath)}`;
            
            const apiResponse = await fetch(url, {
                method: 'POST',
                headers: { 
                    'X-API-Key': API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await apiResponse.json();
            if (!apiResponse.ok) return res.status(apiResponse.status).json(data);
            
            res.json(data);
        } catch (error) {
            console.error('Create folder proxy error:', error);
            res.status(500).json({ error: 'Failed to create folder' });
        }
    });

    // 3. Delete Endpoint
    app.delete('/delete', async (req, res) => {
        if (!req.session.isLoggedIn) return res.status(401).send('Unauthorized');
        
        try {
            const filePath = req.query.path;
            const url = `https://api.eduarhiv.com/fs/delete?path=${encodeURIComponent(filePath)}`;
            
            const apiResponse = await fetch(url, {
                method: 'DELETE',
                headers: { 'X-API-Key': API_KEY }
            });
            
            const data = await apiResponse.json();
            if (!apiResponse.ok) return res.status(apiResponse.status).json(data);
            
            res.json(data);
        } catch (error) {
            console.error('Delete proxy error:', error);
            res.status(500).json({ error: 'Delete failed' });
        }
    });
}