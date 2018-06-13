import Vue from 'vue';
import VueRouter from 'vue-router';
import vueSelect from 'vue-select';
import Vuex from 'vuex';
import axios from 'axios';
import jQuery from 'jquery';
import Tether from 'tether';
import Bootstrap from 'bootstrap3';
import socketIoClient from 'socket.io-client';
import jwtDecode from 'jwt-decode';
import qs from 'qs';

import users from './components/users';
import transactionComponents from './components/transaction/components';
import user from './components/user';
import settings from './components/settings';
import assets from './components/assets';
import transactions from './components/transactions';
import transaction from './components/transaction';
import homePage from './components/homepage';
import profile from './components/profile';
import login from './components/login';
import loginComponents from './components/login/components';
import signup from './components/signup';
import verify from './components/verify';
import dashboard from './components/dashboard';
import account from './components/accounts';
import './js/js-bundle';

Vue.use(VueRouter);
Vue.use(Vuex);

window.jwtDecode = jwtDecode;


const routes = [{
  path: '/',
  component: homePage,
}, {
  path: '/signup',
  component: signup,
  props: true,
}, {
  path: '/login',
  component: login,
  children: [{
    path: '/',
    component: loginComponents.emailAddressInput,
  }, {
    path: 'verify',
    component: loginComponents.verificationCodeInput,
  }],
}, {
  path: '/account',
  component: account,
}, {
  path: '/transaction',
  component: transaction,
  children: [{
    path: '/',
    component: transactionComponents.selectAssets,
  }, {
    path: 'account',
    component: transactionComponents.selectAccount,
  }, {
    path: '/status',
    component: transactionComponents.status,
  }],
}, {
  path: '/dashboard',
  component: dashboard,
}, {
  path: '/profile',
  component: profile,
}, {
  path: '/verify',
  component: verify,
}, {
  path: '/users',
  component: users,
},
{
  path: '/users/:_id',
  component: user,
},
{
  path: '/settings',
  component: settings,
},
{
  path: '/assets',
  component: assets,
},
{
  path: '/transactions',
  component: transactions,
},
];
const router = new VueRouter({
  mode: 'history',
  routes,
  parseQuery: qs.parse.bind(qs),
  stringifyQuery(obj) {
    const _queryObject = queryObject(obj);
    const pairs = [];
    for (const name in _queryObject) {
      pairs.push(`${encodeURIComponent(name)}=${encodeURIComponent(_queryObject[name])}`);
    }
    return '?' + pairs.join('&');

    function queryObject(obj, query, namespace) {
      query = query || {};
      let key;
      for (const property in obj) {
        if (obj.hasOwnProperty(property)) {
          if (namespace) {
            key = `${namespace  }[${  property  }]`;
          } else {
            key = property;
          }
          if (typeof obj[property] === 'object') {
            queryObject(obj[property], query, key);
          } else {
            query[key] = obj[property];
          }
        }
      }
      return query;
    }
  },
});


const app = new Vue({
  el: '#app',
  data: {
    global: {
      apiUrl: '/api',
      apiRootUrl: '',
      user: null,
      request(method, url, data, cb) {
        if (!cb) {
          [cb, data] = [data, undefined];
        }
        const headers = {};
        if (!/^https?:\/\//i.test(url)) {
          url = this.apiUrl + url;
          const bearerToken = localStorage.COINALLY_AUTH_TOKEN;
          if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;
        }
        axios({
          method,
          url,
          data,
        }).then((response) => {
          console.log('response from axios', response);
          cb(null, response.data.result);
        }).catch((err) => {
          console.log('error from axios', err);
          cb(err);
        });
      },
      setUser(token, cb) {
        const userId = jwtDecode(token)._id;
        console.log(userId);
        this.request('GET', `/users/${userId}`, (err, user) => {
          if (err) console.log('could not load user: ', err.response);
          this.user = user;
        });
      },
      logOut() {
        this.global.user = null;
        localStorage.remove('COINALLY_AUTH_TOKEN');
      },
    },
  },
  provide() {
    return {
      global: this.global,
    };
  },
  created() {
    console.log('created');
    const {
      COINALLY_AUTH_TOKEN,
    } = localStorage;
    if (!COINALLY_AUTH_TOKEN) return console.log('not found');
    this.global.setUser(COINALLY_AUTH_TOKEN);
  },
  methods: {
    
  },
  router,
});

// router.push(location.pathname.replace('/', ''));
Vue.component('vue-select', vueSelect);

export default app;
window.socketIoClient = socketIoClient;
