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

let apiRootUrl = 'http://localhost:9000';
const apiUrl = 'http://localhost:9000/api';
const request = (method, url, data, cb) => {

  if (!cb) {
    [cb, data] = [data, undefined];
  }
  console.log('requesting... ', {
    method,
    url,
    data,
    cb
  })
  const headers = {};
  if (!/^https?:\/\//i.test(url)) {
    url = apiUrl + url;
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
};

let globalUser = null;

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
    meta: {
      requiresUser: true
    },
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
    meta: {
      requiresUser: true
    },
  }, {
    path: '/profile',
    component: profile,
    meta: {
      requiresUser: true
    },
  }, {
    path: '/verify',
    component: verify,
    meta: {
      requiresUser: true
    },
  }, {
    path: '/users',
    component: users,
    meta: {
      requiresUser: true,
      requiresAdmin: true,
    },
  },
  {
    path: '/users/:_id',
    component: user,
    meta: {
      requiresUser: true
    },
  },
  {
    path: '/settings',
    component: settings,
    meta: {
      requiresUser: true
    },
  },
  {
    path: '/assets',
    component: assets,
    meta: {
      requiresUser: true
    },
  },
  {
    path: '/transactions',
    component: transactions,
    meta: {
      requiresUser: true
    },
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

router.beforeEach((to, from, next) => {
  console.log({
    to,
    from,
    next
  })
  const requiresUser = to.matched.some(record => record.meta.requiresUser);
  if (!app) {
    const {
      COINALLY_AUTH_TOKEN,
    } = localStorage;
    if (!COINALLY_AUTH_TOKEN) {
      if (requiresUser) {
        return next({
          path: '/login',
          query: {
            redirect: to.fullPath,
          },
        });
      }
      return next();
    }

    const userId = jwtDecode(COINALLY_AUTH_TOKEN)._id;
    console.log('from beforeEach: ', userId);

    return request('GET', `/users/${userId}`, (err, fetchedUser) => {
      console.log('done fetch')
      if (err) {
        if (requiresUser) return next({
          path: '/login',
          query: {
            redirect: to.fullPath,
          },
        });
        return next();
      }
      app.global.user = globalUser = fetchedUser;
      return next();
    });

  }
  if (app.global.user == null) {
    if (requiresUser) return next({
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    });
    return next();
  }
})


var app = new Vue({
  el: '#app',
  data: {
    global: {
      apiUrl,
      apiRootUrl,
      _usertransactions: [],
      getTransactions(skip, limit) {
        const transactions = this._usertransactions;
        const endIndex = skip + limit;
        if ((!transactions[endIndex] && transactions[transactions.length - 1] != 'end')) {
          return this.request();
        } else if (transactions[skip] && (!transactions[endIndex] || transactions[transactions.length - 1] == 'end')) {
          return this.request();
        }

      },
      user: null,
      request,
      setUser(token, cb) {
        const userId = jwtDecode(token)._id;
        console.log('from setUser: ', userId);
        this.request('GET', `/users/${userId}`, (err, fetchedUser) => {
          console.log('done with fetch from set, ', err, fetchedUser)
          if (err) console.log('could not load user: ', err.response);
          this.global.user = globalUser = fetchedUser;
        });
      },
      logOut() {
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
  created() {
    console.log('created', globalUser);
    this.global.user = globalUser;
    if (!this.global.user) return console.log('null user');
  },
  methods: {

  },
  router,
});


// router.push(location.pathname.replace('/', ''));
Vue.component('vue-select', vueSelect);

export default app;
window.socketIoClient = socketIoClient;