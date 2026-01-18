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
            req.session.user = result.user;
            console.log(result);  // Store user info in session!
            req.session.isLoggedIn = true;
            console.log('User logged in:', req.session.user);
            
            res.redirect('/dashboard');  // Send them to main page
        } else {
            res.redirect('/login?error=invalid');  // Send back to login with error
        }
    });

    app.get("/current_user", (req, res) => {
        if (req.session.isLoggedIn) {
            res.json({
                loggedIn: true,
                user: req.session.user
            });
        } else {
            res.json({ loggedIn: false });
        }
    });

    // app.get('/current_user', (req, res) => {
    //     if (req.session.isLoggedIn) {
    //         res.json({
    //         loggedIn: true,
    //         user: req.session.user
    //         });
    //     } else {
    //         res.json({ loggedIn: false });
    //     }
    // });

}