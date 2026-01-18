// wait for page to load
window.addEventListener('DOMContentLoaded', async () => {
    const user = await getCurrentUser();
    if (user) {
        document.getElementById('username').innerText = `${user.username}`;
        document.getElementById('userrole').innerText = `${user.role}`;
    }


});
