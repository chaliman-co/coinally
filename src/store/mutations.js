import * as types from './mutation_types';

const USER = 'user';
const TOKEN = 'token';

export const mutations = {
    signIn(state, token, user) {
        state.token = token;
        state.user = user;

        localStorage.setItem(TOKEN, token);
        localStorage.setItem(USER, user);
    },
    updateUser(state, user) {
        state.user = user;

        localStorage.setItem(USER, user);
    },
    setAuth(state) {
        state.token = localStorage.getItem(TOKEN);
        state.user = localStorage.getItem(USER);
    },
    signOut(state) {
        state.user = {};
        state.token = null;
        localStorage.clear();
    },
}