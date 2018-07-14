import users from '../components/users/index.vue';
// import transactionComponents from './components/transaction/components';
import user from '../components/user/index.vue';
import settings from '../components/settings/index.vue';
import assets from '../components/assets/index.vue';
import transactions from '../components/transactions/index.vue';
// import transaction from './components/transaction/index.vue';
import homePage from '../components/homepage/index.vue';
import aboutPage from '../components/homepage/about.vue';
import profile from '../components/profile/index.vue';
import login from '../components/login/index.vue';
import loginComponents from '../components/login/components';
import signup from '../components/signup/index.vue';
import verify from '../components/verify/index.vue';
import dashboard from '../components/dashboard/index.vue';
import account from '../components/accounts/index.vue';

import newTransaction from '../components/newTransaction/index';
import notFoundComponent from '../components/404.vue';

export default [{
        path: '/',
        component: homePage,
    }, {
        path: '/about',
        component: aboutPage,
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
            path: 'payment',
            component: newTransaction.payment,
        }, {
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
    {
        path: '*',
        component: notFoundComponent,
    },
];