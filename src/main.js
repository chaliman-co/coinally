import Vue from 'vue';
import vueSelect from 'vue-select';
import socketIoClient from 'socket.io-client';
import jwtDecode from 'jwt-decode';

import './js/js-bundle';
import './utils';

const apiRootUrl = 'http://localhost:9000';

const apiUrl = `${apiRootUrl}/api`;

const request = utils.request;

let globalUser = null;

import router from './router';
import store from './store';
import utils from './utils';

Vue.prototype.$request = request;

var app = new Vue({
    el: '#app',
    data: {
        global: {
            apiUrl,
            apiRootUrl,
            _usertransactions: [],
            getTransactions(skip, limit, cb) {
                const transactions = this._usertransactions;

                const endIndex = skip + limit;
                console.log(this);
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
            request,
            setUser(token, cb) {
                const userId = jwtDecode(token)._id;

                this.request('GET', `/users/${userId}`, (err, fetchedUser) => {
                    if (err) {
                        console.log('could not load user: ', err.response);
                        cb(err, null)
                    }

                    this.user = globalUser = fetchedUser || null;

                    return cb(null, fetchedUser);
                });
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
        this.global.user = this.$store.state.user;

        this.global.setUser(this.$store.state.token, (err, result) => {
            if (!err && result) {
                this.$store.commit('updateUser', result);
            }
        });
    },
    created() {},
    methods: {},
    router,
    store
});


Vue.prototype.$request = request;
// router.push(location.pathname.replace('/', ''));
Vue.component('vue-select', vueSelect);

export default app;
window.socketIoClient = socketIoClient;