import Vue from 'vue';
import vueSelect from 'vue-select';
import socketIoClient from 'socket.io-client';
import jwtDecode from 'jwt-decode';
import moment from 'moment';

import WAValidator from 'wallet-address-validator';

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

Vue.filter('nFormat', (value) => {
    console.log(value);
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

Vue.filter('numberFormat', (value) => {

    if (value) {
        return Number(value).toLocaleString('en-Us', { maximumFractionDigits: 6 });
    }
});

Vue.filter('walletValidator', (value, coin) => {
    if (value) {
        let valid = WAValidator.validate(value, coin)
        if (valid) {
            console.log('valid coin');
        } else {
            console.log('not a valid coin');
        }
    }
});

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