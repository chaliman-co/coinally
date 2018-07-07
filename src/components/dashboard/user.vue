<template>
    <div class="dashboard__content">
              <transaction-modal/>
    <transaction
      ref="transaction"
      @statusChanged="changeStatus"/>
      <div class="dashboard__top-bar">
        <div class="top-bar__table-md">
          <div class="top-bar__table-row">
            <div class="top-bar__table-cell top-bar__title">
              <div class="title">
                Dashboard
              </div>
            </div>
            <div class="top-bar__table-cell top-bar__controls">

        <a href="" class="btn-custom-astronaut-blue small" data-toggle="modal" data-target="#exchange-modal">
            <i class="fa fa-plus"></i> New Transaction
        </a>
              <router-link
                              to="/verify"
                class="btn-custom-transparent-astronaut-blue small">
                Verify Details
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="dashboard__body">

        <div class="dashboard__transactions">
          <div class="transactions__summary">
            <div class="title">
              Total Transactions from {{formatDate(user.createdAt)}} to {{formatDate(new Date())}}
            </div>
            <div class="body">
              <template v-for="(stat, i) in stats.transactionStats" v-if="stat.totalDeposit > 0">
                {{stat.totalDeposit | countFormat}} 
                <span :key="i">{{stat.code.toUpperCase()}}</span>
                <template v-if="i !== stats.transactionStats.length - 1">,</template>
              </template>
            </div>
          </div>
          <div class="transactions__table">
            <div class="table-responsive">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>I have</th>
                    <th>I want</th>
                    <th>Rate</th>
                    <th>Receipt Account</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(transaction, index) in stats.recentOrders"
                    :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ transaction.createdAt | humanizeDate }}</td>
                    <td>{{ transaction.depositAssetCode.toUpperCase() }}</td>
                    <td>{{ transaction.receiptAssetCode.toUpperCase() }}</td>
                    <!-- <td>{{ transaction.depositAmount.toFixed(3).replace(/\.([^0]*)(0+)$/, '.$1') }} ({{ transaction.depositAssetCode }})</td>
                    <td>{{ transaction.receiptAmount.toFixed(3).replace(/\.([^0]*)(0+)$/, '.$1') }} ({{ transaction.receiptAssetCode }})</td> -->
                    <td>{{ transaction.rate.toFixed(8).replace(/\.([^0]*)(0+)$/g, '.$1') | numberFormat }}</td>
                    <td :title="transaction.receiptAsset.type === 'digital' ? transaction.receiptAddress: ''">
                      {{ getReceiptAccount(transaction) }}
                    </td>
                    <td>{{ transaction.status | capitalize }}</td>

                    <td>
                      <button
                        class="btn-custom-astronaut-blue small"
                        @click="showTransaction(transaction)">
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
</template>

<script>
import moment from 'moment';
import transaction from '../transactions/transaction.vue';
import sideBar from './../sideBar';
import transactionModal from '../transactionModal.vue';
import {mapState, mapActions, mapGetters} from 'vuex';

window.moment = moment;
export default {
  inject: ['global'],
  components: {
    'side-bar': sideBar,
    transaction,
    transactionModal
  },
  data() {
    return {
      userTransactions: [],
    };
  },
  computed: Object.assign({
    _userTransactions() {

    },
  },
    mapState({
        user:'user',
        stats: (state) => state.userStats.stats,
})
  ),
  created() {
    this.loadStats(this.user._id)
  },
  methods: Object.assign({
    getReceiptAccount(tx){
      switch(tx.receiptAsset.type){
        case 'fiat':
        return `${this.user.assetAccounts[tx.receiptAddress].address.number}, 
                      ${this.user.assetAccounts[tx.receiptAddress].address.bankName}`;
        case 'digital':
          return tx.receiptAddress ? (tx.receiptAddress.substr(0, 10) + '...') : '';
        default:
          return '';
      }
    },
    formatDate(date){
      return moment(date).format('ll');
    },
    showTransaction(trans) {
      this.$refs.transaction.open(trans);
    },
    close() {
      this.$refs.transaction.close();
    },
    changeStatus(trans, status) {
      const tx = this.userTransactions.find(t => t._id === trans._id);
      if (tx) {
        this.$set(tx, 'status', status);
      }
    },
  }, mapActions('userStats', ['loadStats'])),
};
</script>
