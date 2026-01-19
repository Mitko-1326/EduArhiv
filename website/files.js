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
}