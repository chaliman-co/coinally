<template>
    <div class="dashboard__content">
            <div class="dashboard__top-bar">
                <div class="top-bar__table-md">
                    <div class="top-bar__table-row">
                        <div class="top-bar__table-cell top-bar__title">
                            <div class="title">
                                Dashboard
                            </div>
                        </div>
                        <div class="top-bar__table-cell top-bar__controls">
                        </div>
                    </div>
                </div>
            </div>
            <div class="dashboard__body">

                <div class="dashboard__table-md admin-dashboard__dashboard">
                    <div class="dashboard__table-row">
                        <div class="dashboard__table-cell dashboard__left-col">
                            <div class="dashboard-pane dashboard-pane--lg newest-orders">
                                <div class="dashboard-pane__header">
                                    <div class="header__title">
                                        Latest Orders
                                    </div>
                                    <div class="header__subtitle hidden">
                                        23
                                    </div>
                                </div>
                                <div class="dashboard-pane__body">
                                    <div class="order-item new" v-for="(tx, i) in stats.recentOrders" :key="i">
                                        <div class="order-item__title">
                                            {{tx.depositAmount | numberFormat}} {{tx.depositAsset.code.toUpperCase() }} to {{tx.receiptAsset.code.toUpperCase()}}
                                        </div>
                                        <div class="order-item__subtitle">
                                            {{tx.createdAt | humanizeDate}} - {{`${tx.user.firstName} ${tx.user.lastName}` | capitalize}}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--lg order-charts hidden">
                                <div class="dashboard-pane__header">
                                    <div class="header__title">
                                        Order Charts
                                    </div>
                                    <div class="header__subtitle">
                                        01 Jan. 2018 to 05 Mar. 2018
                                    </div>
                                </div>
                                <div class="dashboard-pane__body">
                                    <div class="order-chart">
                                        <img class="placeholder-image" src="https://datavizcatalogue.com/methods/images/top_images/bar_chart.png" alt="Dunno which chart library you'll be using so I'm using an image"
                                            title="Dunno which chart library you'll be using so I'm using an image">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="dashboard__table-cell dashboard__right-col">
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="~img/cart.svg" class="dashboard-pane__icon" alt="Cart" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        {{stats.newOrderCount | countFormat}}
                                    </div>
                                    <div class="body__subtitle">
                                        New orders
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="~img/chart.svg" class="dashboard-pane__icon" alt="" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        {{(saleStats * 100).toFixed(2)}}%
                                    </div>
                                    <div class="body__subtitle">
                                        Sale Stats
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="~img/new-user.svg" class="dashboard-pane__icon" alt="" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        {{stats.regCount | countFormat}}
                                    </div>
                                    <div class="body__subtitle">
                                        User registrations
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="~img/money.svg" class="dashboard-pane__icon" alt="" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        ${{getAssetTotal('usd') | countFormat}}
                                    </div>
                                    <div class="body__subtitle">
                                        Processed
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="https://shapeshift.io/images/coins/ether.png" class="dashboard-pane__icon" alt="" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        ETH {{getAssetTotal('eth') | countFormat}}
                                    </div>
                                    <div class="body__subtitle">
                                        Processed
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="https://shapeshift.io/images/coins/bitcoin.png" class="dashboard-pane__icon" alt="" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        BTC {{getAssetTotal('btc') | countFormat}}
                                    </div>
                                    <div class="body__subtitle">
                                        Processed
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="~img/money.svg" class="dashboard-pane__icon" alt="" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        NGN {{getAssetTotal('ngn') | countFormat}}
                                    </div>
                                    <div class="body__subtitle">
                                        Processed
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="https://shapeshift.io/images/coins/bitcoincash.png" class="dashboard-pane__icon" alt="" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        BCH {{getAssetTotal('bch') | countFormat}}
                                    </div>
                                    <div class="body__subtitle">
                                        Processed
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
</template>

<script>
import transactionModal from '../transactionModal.vue';
import {mapState, mapActions} from 'vuex';
import {txStatus} from '../../enums';
import moment from 'moment';
export default {
    components: {
    transactionModal
    },
    computed: Object.assign({
        saleStats(){
            const stats = this.stats.completedTxCount/this.stats.txCount;

            if(isNaN(stats)) return 0;
            else return stats;
        }
    },
    mapState('adminStats', ['stats'])),
    methods: Object.assign({
        isNew(tx){
            return tx.status === txStatus.AWAITING_PAYMENT;
        },
        getAssetTotal(asset){
            const stat = this.stats.transactionStats.find(x => x.code === asset);
            if(stat){
                return stat.totalDeposit;
            }else{
                return 0;
            }
        },
    },
    mapActions('adminStats', ['loadStats'])),
    created(){
        this.loadStats();
    }
}
</script>
