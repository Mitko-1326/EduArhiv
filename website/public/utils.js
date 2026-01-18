async function getCurrentUser() {
    const response = await fetch('/current_user');
    const data = await response.json();

    if (!data.loggedIn) {
        window.location.href = '/login';
        return null;
    }

    return data.user;
}