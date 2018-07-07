import utils from '../../utils';

export default {
    state: {
        isLoaded: false,
        stats: {
            recentOrders: [],
            transactionStats: []
        },
    },
    mutations: {
        updateStats(state, stats) {
            Object.assign(state.stats, stats)
            state.isLoaded = true;
        }
    },
    actions: {
        loadStats({ commit }, userId) {
            utils.request('GET', `/stats/users/${userId}`, null, (err, result) => {
                if (!err) {
                    commit('updateStats', result);
                }
            })
        }
    },
    namespaced: true,
};