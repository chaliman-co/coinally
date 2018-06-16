import axios from 'axios';


const apiRootUrl = 'http://localhost:9000';

const apiUrl = `${apiRootUrl}/api`;

export default {
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
            console.log('response from axios', response);
            cb(null, response.data.result);
        }).catch((err) => {
            console.log('error from axios', err);
            cb(err);
        });
    },
}