import axios from 'axios';
import NProgress from 'nprogress';
import store from './store';
import router from './router';


const apiRootUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:9000';
// const apiRootUrl = process.env.NODE_ENV === 'production' ? '' : 'http://coinally.herokuapp.com';


const apiUrl = `${apiRootUrl}/api`;

const axiosInstance = axios.create({
    baseURL: apiUrl,
});

axiosInstance.interceptors.request.use(config => {
    NProgress.start();
    return config
})

// before a response is returned stop nprogress
axiosInstance.interceptors.response.use(response => {
    NProgress.done();
    return response
})

/**
 * Log message to console
 * @param String{} message - The message to be logged
 */
const log = (...message) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(...message);
    }
};

export default {
    apiRootUrl,
    apiUrl,
    /**
     *
     * @param {String} method
     * @param {String} url
     * @param {String} data
     * @param {String} cb
     * @param {String} token
     */
    request: (method, url, data, cb) => {
        if (!cb) {
            [cb, data] = [data, undefined];
        }
        const headers = {};
        if (!/^https?:\/\//i.test(url)) {
            url = apiUrl + url;
            const bearerToken = store.state.token;

            if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;
        }
        axiosInstance({
            method,
            url,
            data,
            headers,
        }).then((response) => {
            log('response from axios', response);
            cb(null, response.data.result);
        }).catch((err) => {
            if (err.response && err.response.status === 401) {
                store.commit('signOut');
                router.push('/login');
            } else {
                log('error from axios', err);
                cb(err);
            }
        });
    },

    log,

    getStatus() {
        return ['failed', 'awaiting payment', 'payment received', 'pending', 'completed'];
    },

    paystackKey: 'pk_test_44137d56a537d63819b944e70c444e8c36f3d76f',
};