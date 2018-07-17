import Vue from 'vue';
import moment from 'moment';
import WAValidator from 'wallet-address-validator';

Vue.filter('humanizeDate', (value) => {
    if (value) {
        return moment(new Date(value)).fromNow();
    }
    return '';
});

Vue.filter('capitalize', (value) => {
    if (!value) return '';
    return value.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
});

Vue.filter('uppercase', (value) => {
    if (!value) return '';
    return value.toUpperCase();
});


Vue.filter('countFormat', (num) => {
    if (num === 0) return 0;
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
    if (value) {
        value = String(value);
        if (value.indexOf('.') !== -1) {
            const stringAfterPoint = value.substr(value.indexOf('.') + 1);
            const formatStringAfterPoint = stringAfterPoint.replace(/(...)/g, '$1,');
            const stringBeforePoint = value.slice(0, value.indexOf('.'));
            const numberBeforePoint = Number(stringBeforePoint).toLocaleString();

            return `${numberBeforePoint.toString()}.${formatStringAfterPoint}`;
        }
        return Number(value).toLocaleString();
    }
    return 0;
});

Vue.filter('numberFormat', (value) => {
    if (value === 0) {
        return 0;
    }
    if (value) {
        return Number(value).toLocaleString('en-US', { maximumFractionDigits: 6 });
    }
    return 0;
});

Vue.filter('truncate', (value, length) => {
    length = length || 15;
    if (!value || typeof value !== 'string') return '';
    if (value.length <= length) return value;
    return `${value.substring(0, length)}...`;
});

Vue.filter('walletValidator', (value, coin) => {
    if (value) {
        const valid = WAValidator.validate(value, coin);
        if (valid) {
            return true;
        }
        return false;
    }
    return false;
});
