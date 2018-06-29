import axios from 'axios';
import store from './store'


const apiRootUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:9000';

const apiUrl = `${apiRootUrl}/api`;

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
    request: (method, url, data, cb, ) => {
        if (!cb) {
            [cb, data] = [data, undefined];
        }
        const headers = {};
        if (!/^https?:\/\//i.test(url)) {
            url = apiUrl + url;
            const bearerToken = store.state.token;

            if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;
        }
        axios({
            method,
            url,
            data,
            headers,
        }).then((response) => {
            console.log('response from axios', response);
            cb(null, response.data.result);
        }).catch((err) => {
            console.log('error from axios', err);
            cb(err);
        });
    },

    /**
     * Log message to console
     * @param String{} message - The message to be logged
     */
    log(message) {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(message);
        }
    },

    getStatus() {
        return ['failed', 'awaiting payment', 'payment received', 'pending', 'completed'];
    },
};
