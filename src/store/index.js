import Vue from 'vue';
import Vuex from 'vuex';
import mutations from './mutations';
import actions from './actions';
import adminStats from './modules/adminStats';
import userStats from './modules/userStats';

Vue.use(Vuex);

const state = {
    user: {},
    assets: [],
    token: null,
};

export default new Vuex.Store({
    state,
    mutations,
    getters: {
        isAuth(stateObj) {
            return stateObj.token !== null;
        },
    },
    modules: {
        adminStats,
        userStats,
    },
    actions,
});
