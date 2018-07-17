import Vue from 'vue';
import vueSelect from 'vue-select';
import socketIoClient from 'socket.io-client';
import jwtDecode from 'jwt-decode';

import './js/js-bundle';

import router from './router';
import store from './store';
import utils from './utils';
import './filters';

const {
    apiRootUrl,
} = utils;

const apiUrl = `${apiRootUrl}/api`;

let globalUser = null;

Vue.prototype.$request = utils.request;
Vue.prototype.$log = utils.log;

Vue.prototype.$generateUrl = (value) => {
    if (!value) {
        return '';
    }
    if (value.startsWith('http')) {
        return value;
    }
    return `${apiRootUrl}/${value}`;
};

Vue.prototype.$capitalize = (value) => {
    if (!value) return '';
    return value.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const app = new Vue({
    el: '#app',
    data: {
        global: {
            apiUrl,
            apiRootUrl,
            user: null,
            request: utils.request,
            setUser(token, cb) {
                if (token) {
                    const userId = jwtDecode(token)._id;

                    utils.request('GET', `/users/${userId}`, (err, fetchedUser) => {
                        if (err) {
                            utils.log('could not load user: ', err.response);
                            cb(err, null);
                        } else {
                            this.user = fetchedUser;
                            globalUser = this.user;

                            cb(null, fetchedUser);
                        }
                    });
                } else {
                    cb(new Error('No token found'), null);
                }
            },
            logOut() {
                utils.log(this.global, this);
                globalUser = null;
                this.global.user = globalUser;
                localStorage.remove('COINALLY_AUTH_TOKEN');
            },
        },
    },
    provide() {
        return {
            global: this.global,
        };
    },
    mounted() {
        this.$store.commit('setAuth');

        const {
            token,
        } = this.$store.state;

        if (token) {
            this.global.user = this.$store.state.user;

            this.global.setUser(token, (err, result) => {
                if (!err && result) {
                    this.$store.commit('updateUser', result);
                }
            });
        }
    },
    created() {},
    methods: {},
    router,
    store,
});

// router.push(location.pathname.replace('/', ''));
Vue.component('vue-select', vueSelect);

export default app;
window.socketIoClient = socketIoClient;
