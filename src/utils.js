import axios from 'axios';


const apiRootUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:9000';

const apiUrl = `${apiRootUrl}/api`;


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
    request: (method, url, data, cb, token) => {
        if (!cb) {
            [cb, data] = [data, undefined];
        }
        const headers = {};
        if (!/^https?:\/\//i.test(url)) {
            url = apiUrl + url;
            const bearerToken = token || localStorage.getItem('token');

            if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;
        }
        axios({
            method,
            url,
            data,
        }).then((response) => {
            log('response from axios', response);
            cb(null, response.data.result);
        }).catch((err) => {
            log('error from axios', err);
            cb(err);
        });
    },

    log,

    getStatus() {
        return ['failed', 'awaiting payment', 'payment received', 'pending', 'completed'];
    },
};