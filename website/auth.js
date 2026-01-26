module.exports = function(app, API_KEY) {


    app.post('/handle_login', async (req, res) => {
        // get form data
        const { username, password } = req.body;
            const apiResponse = await fetch('https://api.eduarhiv.com/auth/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY  
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await apiResponse.json();

        // If login successful, save to session
        if (result.success) {
            console.log("success!!!")
            req.session.user = result.user;
            req.session.path = '';  
            req.session.isLoggedIn = true;

            res.redirect('/dashboard');
        } else {
            console.log("whoopsie")
            res.redirect('/login?error=invalid');  // Send back to login with error
        }
    });

    app.get("/current_user", (req, res) => {
        if (req.session.isLoggedIn) {
            res.json({
                loggedIn: true,
                user: req.session.user,
                path: req.session.path
            });
        } else {
            res.json({ loggedIn: false });
        }
    });

    app.post('/update_path', (req, res) => {
        if (!req.session.isLoggedIn) {
            return res.status(401).json({ error: 'Not logged in' });
        }
        
        const { path } = req.body;
        req.session.path = path || '';
        res.json({ success: true, path: req.session.path });
    });

    app.get('/download', async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    
    try {
        const filePath = req.query.path;
        const url = `https://api.eduarhiv.com/fs/download?path=${encodeURIComponent(filePath)}`;
        
        const apiResponse = await fetch(url, {
            headers: { 
                'X-API-Key': API_KEY ,
                'Content-Disposition': 'attachment; filename="' + encodeURIComponent(filePath.split('/').pop()) + '"'
            },
        });
        
        if (!apiResponse.ok) {
            return res.status(404).send('File not found');
        }
        res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(filePath.split('/').pop()) + '"');

        // Pipe the file through
        const buffer = await apiResponse.arrayBuffer();
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).send('Download failed');
    }
});
}