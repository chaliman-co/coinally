<template>
    <div>
        <div :is="selectComponent">
        </div>
        <router-link to="/transaction/account" class="call-to-action btn-custom-astronaut-blue">Convert</router-link>
    </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex';
import vueSelect from 'vue-select';
import components from './components';
export default {
    computed: Object.assign({
        selectComponent() {
            if (!this.receiptAsset) return null;
            switch (this.receiptAsset.type) {
                case 'fiat':
                    return 'bank-account-select'
                case 'digital':
                    return 'url-select'
            }
        },
    }, mapState([
        'depositAsset',
        'receiptAsset',
        'assets',
        'amount',
        'request',
        'conversionRate']),
        mapGetters(['receiptAmount'])),
    methods: {
        commit(mutation, payload) {
            this.$store.commit(mutation, payload);
        },
        dispatch(action, payload) {
            this.$store.dispatch(action, payload);
        },
        proceed() {
            console.log('ready to proceed')
        }
    },
    components: {
        'vue-select': vueSelect,
        'bank-account-select': components.bankAccountSelect,
        'url-select': components.urlSelect,
    }
}
</script>