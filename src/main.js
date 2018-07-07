import Vue from 'vue';
import vueSelect from 'vue-select';
import socketIoClient from 'socket.io-client';
import jwtDecode from 'jwt-decode';
import moment from 'moment';

import './js/js-bundle';

import router from './router';
import store from './store';
import utils from './utils';

const {
    apiRootUrl,
} = utils;

const apiUrl = `${apiRootUrl}/api`;

let globalUser = null;

Vue.prototype.$request = utils.request;
Vue.prototype.$log = utils.log;

Vue.filter('humanizeDate', (value) => {
    if (value) {
        return moment(new Date(value)).fromNow();
    } else {
        return '';
    }
});

Vue.filter('capitalize', (value) => {
    if (!value) return '';
    return value.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
});

Vue.filter('countFormat', (num) => {
    if (num == 0) return 0;
    if (!num) { return ''; }
    const units = [
        { value: 1, symbol: '' },
        { value: 1E3, symbol: 'k' },
        { value: 1E6, symbol: 'M' },
        { value: 1E9, symbol: 'B' },
        { value: 1E12, symbol: 'T' },
        { value: 1E15, symbol: 'Q' },
    ];
    const regex = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = units.length - 1; i > 0; i--) {
        if (num >= units[i].value) {
            break;
        }
    }
    return (num / units[i].value).toFixed(3).replace(regex, '$1') + units[i].symbol;
});

Vue.filter('numberFormat', (value) => {
    if (value) {
        value = String(value);
        if (value.indexOf(".") !== -1) {
            let stringAfterPoint = value.substr(value.indexOf(".") + 1);
            let formatStringAfterPoint = stringAfterPoint.replace(/(...)/g, "$1,");
            let stringBeforePoint = value.slice(0, value.indexOf("."));
            let numberBeforePoint = Number(stringBeforePoint).toLocaleString();

            return numberBeforePoint.toString() + '.' + formatStringAfterPoint;
        } else {
            return Number(value).toLocaleString();
        }
    } else {
        return 0;
    }

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

                if ((!transactions[endIndex] && transactions[transactions.length - 1] !== 'end')) {
                    const url = `/transactions?user=${this.user._id}&skip=${transactions.length}&limit=${endIndex - transactions.length - 1}`;

                    utils.request('GET', url, (err, fetchedTransactions) => {
                        utils.log('done with get from transactions: ', err, fetchedTransactions);

                        if (err) {
                            utils.log('could not load transactions: ', err.response);
                            cb(err, null);
                        } else {
                            if (fetchedTransactions.length < endIndex - transactions.length - 1) {
                                fetchedTransactions.push('end');
                            }

                            cb(fetchedTransactions.slice(skip, endIndex + 1));
                        }
                    });
                }
                // cb(fetchedTransactions.slice(skip, endIndex + 1));
            },
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