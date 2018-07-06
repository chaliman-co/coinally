import Vue from 'vue';
import VueRouter from 'vue-router';
import jwtDecode from 'jwt-decode';
import qs from 'qs';

import routes from './routes';
import utils from '../utils';
import store from '../store';

Vue.use(VueRouter);

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
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        return {
            x: 0,
            y: 0,
        };
    },
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

    const { token, user: currentUser } = store.state;

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
