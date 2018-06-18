import Vue from 'vue';
import vueSelect from 'vue-select';
import socketIoClient from 'socket.io-client';
import jwtDecode from 'jwt-decode';

import './js/js-bundle';

import router from './router';
import store from './store';
import utils from './utils';

const apiRootUrl = 'http://localhost:9000';

const apiUrl = `${apiRootUrl}/api`;

let globalUser = null;

Vue.prototype.$request = utils.request;
Vue.prototype.$log = utils.log;

Vue.filter('capitalize', (value) => {
    if (!value) return '';

    return value.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
});

const app = new Vue({
    el: '#app',
    data: {
        global: {
            apiUrl,
            apiRootUrl,
            _usertransactions: [],
            getTransactions(skip, limit, cb) {
                const transactions = this._usertransactions;

                const endIndex = skip + limit;
                this.$log(this);
                if ((!transactions[endIndex] && transactions[transactions.length - 1] !== 'end')) {
                    const url = `/transactions?user=${this.user._id}&skip=${transactions.length}&limit=${endIndex - transactions.length - 1}`;

                    return this.request('GET', url, (err, fetchedTransactions) => {
                        console.log('done with get from transactions: ', err, fetchedTransactions);

                        if (err) return console.log('could not load transactions: ', err.response);

                        if (fetchedTransactions.length < endIndex - transactions.length - 1) {
                            fetchedTransactions.push('end');
                        }

                        return cb(fetchedTransactions.slice(skip, endIndex + 1));
                    });
                }
                // cb(fetchedTransactions.slice(skip, endIndex + 1));
            },
            user: null,
            request: utils.request,
            setUser(token, cb) {
                console.log(token);
                if (token) {
                    const userId = jwtDecode(token)._id;

                    utils.request('GET', `/users/${userId}`, (err, fetchedUser) => {
                        if (err) {
                            console.log('could not load user: ', err.response);
                            cb(err, null);
                        }

                        this.user = globalUser = fetchedUser || null;

                        cb(null, fetchedUser);
                    });
                } else {
                    cb(new Error('No token found'), null);
                }
            },
            logOut() {
                console.log(this.global, this);
                this.global.user = globalUser = null;
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

        const token = this.$store.state.token;

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