const USER = 'user';
const TOKEN = 'token';

export default {
    signIn(state, { token, user }) {
        state.token = token;
        state.user = user;

        localStorage.setItem(TOKEN, token);
        localStorage.setItem(USER, JSON.stringify(user));
        sessionStorage.removeItem('emailAddress');
    },
    updateUser(state, user) {
        state.user = user;
        localStorage.setItem(USER, JSON.stringify(user));
    },
    updateAssets(state, assets) {
        state.assets = assets;
    },
    updateToken(state, token) {
        state.token = token;
        localStorage.setItem(TOKEN, token);
    },
    setAuth(state) {
        // console.log(localStorage.getItem(USER))
        state.token = localStorage.getItem(TOKEN);
        state.user = JSON.parse(localStorage.getItem(USER));
    },
    signOut(state) {
        state.user = {};
        state.token = null;
        localStorage.clear();
    },
};