import utils from '../utils';

export default {
    loadAssets({ commit, state }) {
        if (state.assets.length === 0) {
            utils.request('GET', '/assets/', (err, assets) => {
                if (!err) {
                    commit('updateAssets', assets);
                }
            });
        }
    },
};
