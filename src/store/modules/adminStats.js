import utils from '../../utils';

export default {
    state: {
        isLoaded: false,
        stats: {
            regCount: 0,
            txCount: 0,
            completedTxCount: 0,
            newOrderCount: 0,
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
        loadStats({ commit }) {
            utils.request('GET', '/stats', null, (err, result) => {
                if (!err) {
                    commit('updateStats', result);
                }
            })
        }
    },
    namespaced: true,
};