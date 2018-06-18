import Vue from 'vue';
import VueRouter from 'vue-router';


import jwtDecode from 'jwt-decode';
import qs from 'qs';

import users from './components/users/index.vue';
// import transactionComponents from './components/transaction/components';
import user from './components/user/index.vue';
import settings from './components/settings/index.vue';
import assets from './components/assets/index.vue';
import transactions from './components/transactions/index.vue';
// import transaction from './components/transaction/index.vue';
import homePage from './components/homepage/index.vue';
import profile from './components/profile/index.vue';
import login from './components/login/index.vue';
import loginComponents from './components/login/components';
import signup from './components/signup/index.vue';
import verify from './components/verify/index.vue';
import dashboard from './components/dashboard/index.vue';
import account from './components/accounts/index.vue';

import newTransaction from './components/newTransaction/index';

import utils from './utils';
import store from './store';

Vue.use(VueRouter);

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
            requiresUser: true,
        },
    }, {
        //     path: '/transaction',
        //     component: transaction,
        //     children: [{
        //         path: '/',
        //         component: transactionComponents.selectAssets,
        //     }, {
        //         path: 'account',
        //         component: transactionComponents.selectAccount,
        //     }, {
        //         path: '/status',
        //         component: transactionComponents.status,
        //     }],
        // }, {
        path: '/transaction',
        component: newTransaction.index,
        children: [{
            path: 'refund',
            component: newTransaction.refund,
        }, {
            path: 'destination',
            component: newTransaction.destination,
        }],
    }, {
        path: '/transactions/status/:id',
        component: newTransaction.status,
        props: true,
    }, {
        path: '/dashboard',
        component: dashboard,
        meta: {
            requiresUser: true,
        },
    }, {
        path: '/profile',
        component: profile,
        meta: {
            requiresUser: true,
        },
    }, {
        path: '/verify',
        component: verify,
        meta: {
            requiresUser: true,
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
            requiresUser: true,
        },
    },
    {
        path: '/settings',
        component: settings,
        meta: {
            requiresUser: true,
        },
    },
    {
        path: '/assets',
        component: assets,
        meta: {
            requiresUser: true,
        },
    },
    {
        path: '/transactions',
        component: transactions,
        meta: {
            requiresUser: true,
        },
    },
];

function queryObject(obj, query = {}, namespace) {
    let key;
    for (const property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (namespace) {
                key = `${namespace}[${property}]`;
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

const router = new VueRouter({
    mode: 'history',
    routes,
    parseQuery: qs.parse.bind(qs),
    stringifyQuery(obj) {
        const _queryObject = queryObject(obj);
        const keys = Object.keys(_queryObject);
        const pairs = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(_queryObject[key])}`);
        }
        if (pairs.length > 0) {
            return `?${pairs.join('&')}`;
        }
        return '';
    },
});

router.beforeEach((to, from, next) => {
    store.commit('setAuth');

    const token = store.state.token;
    const currentUser = store.state.user;

    const requiresUser = to.matched.some(record => record.meta.requiresUser);

    if (!requiresUser) return next();

    if (!token) {
        return next({
            path: '/login',
            query: {
                redirect: to.fullPath,
            },
        });
    } else if (!currentUser) {
        const userId = jwtDecode(token)._id;

        return utils.request('GET', `/users/${userId}`, (err, fetchedUser) => {
            if (err) {
                return next({
                    path: '/login',
                    query: {
                        redirect: to.fullPath,
                    },
                });
            }
            store.commit('updateUser', fetchedUser);
            return next();
        });
    }
    return next();
});

export default router;