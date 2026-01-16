module.exports = function(app, API_KEY) {


    app.post('/handle_login', async (req, res) => {
        // get form data
        const { username, password } = req.body;
        
        // STEP 2: Call your API backend (with API key)
        const apiResponse = await fetch('https://api.eduarhiv.com/auth/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY  // Your API key protection
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await apiResponse.json();
        
        // STEP 3: If login successful, save to session
        if (result.success) {
            req.session.user = result.user;  // Store user info in session!
            req.session.isLoggedIn = true;
            
            res.redirect('/dashboard');  // Send them to main page
        } else {
            res.redirect('/login?error=invalid');  // Send back to login with error
        }
    });
}