module.exports = function(app, API_KEY) {

    // user creation from the teacher's end will make a POST request to this endpoint, which will then call the API to create the user
    app.post('/internal_register', async (req, res) => {
        if (!req.session.isLoggedIn || req.session.user.role !== 'teacher') {
            return res.status(403).json({ error: 'You do not have access to this feature!' });
        }

        const { username, password } = req.body;

        try {
            const apiResponse = await fetch('https://api.eduarhiv.com/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY,
                    'x-role': req.session.user.role 
                },
                body: JSON.stringify({ username, password })
            });

            const result = await apiResponse.json();
        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({ error: 'Registration failed' });
        }

        if (result.success) {
            res.json({ success: true });
        } else {
            res.status(400).json({ error: result.error });
        }
    });

    app.post('/handle_login', async (req, res) => {
        // get form data
        const { username, password } = req.body;
        try {
            const apiResponse = await fetch('https://api.eduarhiv.com/auth/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY  
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await apiResponse.json();
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ error: 'Login failed' });
        }

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