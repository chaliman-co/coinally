<template>
    <div id="transaction-page">

        <div class="modal-component exchange-modal verified in">
            <div class="modal-dialog">
                <div class="modal-content">
                    <router-view>
                    </router-view>
                    <div class="order-details">
                        <div v-if="depositAsset && receiptAsset && conversionRate" class="transaction__type">
                            <img :src="$generateUrl(depositAsset.imagePath)" :alt="depositAsset.name"> →
                            <img :src="$generateUrl(receiptAsset.imagePath)" :alt="receiptAsset.name">
                        </div>
                        <div v-if="depositAsset && receiptAsset && conversionRate" class="expected-amount">
                            <div class="amount">
                                {{`${amount} ${depositAsset.code.toUpperCase()} (${receiptAmount}${receiptAsset.code.toUpperCase()})`}}
                            </div>
                            <div class="exchange-rate">
                                {{`1 ${depositAsset.code.toUpperCase()} = ${conversionRate.toFixed(8).replace(/(?:\.)?0+$/, "")}${receiptAsset.code.toUpperCase()}`}}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>

    </div>
</template>

<script>
import Vuex from 'vuex';
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
Vue.use(Vuex)
export default {
    inject: ['global'],
    data() {
        return {

        }
    },
    computed: {
        receiptAmount() {
            if (isNaN(this.amount) || isNaN(this.conversionRate)) return null;
            return (this.conversionRate * this.amount).toFixed(8).replace(/(?:\.)?0+$/, "")
        }

    },
    store: new Vuex.Store({
        state: {
            depositAsset: null,
            receiptAsset: null,
            assets: [],
            amount: 0,
            request: null,
            conversionRate: null,
            socket: null,
        },
        mutations: {
            'set_assets': function(state, assets) {
                state.assets = assets;
            },
            'set_socket': function(state, socket) {
                state.socket = socket;
            },
            'change_parameters': function(state, query) {
                state.socket.emit('parameter_change', query)
            },
            'set_conversionRate': function(state, rate) {
                state.conversionRate = rate;
            },
            'set_amount': function(state, amount) {
                state.amount = amount;
            },
        },
        getters: {
            receiptAmount(state, getters) {
                if (isNaN(state.amount) || isNaN(state.conversionRate)) return null;
                return (state.conversionRate * state.amount).toFixed(8).replace(/(?:\.)?0+$/, "")
            }
        },
        actions: {
            'set_receipt_asset': function(context, asset) {

                if (!(context.state.depositAsset && asset)) return context.state.receiptAsset = asset;
                updateRate(context.state.receiptAsset ? {
                    to: asset.code
                } : {
                        from: context.state.depositAsset.code,
                        to: asset.code
                    }, context);
                context.state.receiptAsset = asset;
            },
            'set_deposit_asset': function(context, asset) {
                if (!(context.state.receiptAsset && asset)) return context.state.depositAsset = asset;
                updateRate(context.state.depositAsset ? {
                    from: asset.code
                } : {
                        from: asset.code,
                        to: context.state.receiptAsset.code
                    }, context);
                context.state.depositAsset = asset;
            },
        }
    }),
    computed: Object.assign({}, mapState([
        'depositAsset',
        'receiptAsset',
        'assets',
        'amount',
        'request',
        'conversionRate']),
        mapGetters(['receiptAmount'])),
    created() {
        this.global.request("GET", `/assets/`, function(err, res) {
            if (err) console.error("couldn't load assets");
            this.$store.commit('set_assets', res); console.log(this.$route.query.deposit, this.$route.query.receipt, this.$route.query.amount)
            const preSelectedDepositAsset = this.assets.filter(asset => asset.code == this.$route.query.deposit)[0];
            const preSelectedReceiptAsset = this.assets.filter(asset => asset.code == this.$route.query.receipt)[0];
            const preSelectedAmount = this.$route.query.amount;

            if (preSelectedDepositAsset && preSelectedReceiptAsset && !isNaN(preSelectedAmount)) {
                console.log('has!1');
                this.$store.dispatch('set_deposit_asset', preSelectedDepositAsset);
                this.$store.dispatch('set_receipt_asset', preSelectedReceiptAsset);
                this.$store.commit('set_amount', preSelectedAmount);
                if (!this.global.user) return this.$router.push({
                    path: '/login',
                    query: {
                        message: 'Login to continue',
                        nextPage: {
                            path: '/transaction',
                            query: {
                                deposit: this.depositAsset.code,
                                receipt: this.receiptAsset.code,
                                amount: this.amount,
                            },
                        },
                    },
                });
                this.$router.push({ path: '/transaction/account', query: this.$route.query });
            }
        }.bind(this))
    },
}
function updateRate(query, context) {
    console.log(query)
    if (!context.state.socket) {
        const socket = new socketIoClient(`/rates`, {
            reconnectionDelay: 10000,
            query
        })
        socket
            .on("seen", (msg) => console.log("seen: ", msg))
            .on("exception", err => console.log("exception: ", err))
            .on("new_rate", rate => {
                context.commit('set_conversionRate', rate);
                console.log("new rate: ", rate);
            })
            ;
        context.commit('set_socket', socket);
    }
    else context.commit("change_parameters", query);
}
</script>

<style>
#transaction-page {
    background: url(../../img/bg.coinally.png) 50%;
    background-size: auto auto;
    background-size: cover;
    padding-top: 1px;
}
</style>
