<template>
    <div class="dashboard__content">
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
              <a
                href=""
                class="btn-custom-astronaut-blue small"
                data-toggle="modal" 
                data-target="#exchange-modal">
                <i class="fa fa-plus"/> New Transaction
              </a>

              <a
                href="verify.html"
                class="btn-custom-transparent-astronaut-blue small">
                Verify Details
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="dashboard__body">

        <div class="dashboard__transactions">
          <div class="transactions__summary">
            <div class="title">
              <!-- Total Transactions {{Date(global.user.createdAt) >   from}} {{January 01, 2017 - May 15, 2018}} -->
            </div>
            <div class="body">
              25
              <span>ETH</span>, 10
              <span>BTC</span>
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
                    v-for="(transaction, index) in userTransactions"
                    :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ formatTime(transaction.createdAt) }}</td>
                    <td>{{ transaction.depositAssetCode }}</td>
                    <td>{{ transaction.receiptAssetCode }}</td>
                    <!-- <td>{{ transaction.depositAmount.toFixed(3).replace(/\.([^0]*)(0+)$/, '.$1') }} ({{ transaction.depositAssetCode }})</td>
                    <td>{{ transaction.receiptAmount.toFixed(3).replace(/\.([^0]*)(0+)$/, '.$1') }} ({{ transaction.receiptAssetCode }})</td> -->
                    <td>{{ transaction.rate.toFixed(3).replace(/\.([^0]*)(0+)$/g, '.$1') }}</td>
                    <td>{{ transaction.receiptAsset.type == 'fiat'? `${user.assetAccounts[transaction.receiptAddress].address.number}, ${user.assetAccounts[transaction.receiptAddress].address.bankName}` : transaction.receiptAsset.type == 'digital'? transaction.receiptAddress : undefined }}</td>
                    <td>{{ transaction.status }}</td>

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
import {mapState, mapGetters} from 'vuex';

window.moment = moment;
export default {
  inject: ['global'],
  components: {
    'side-bar': sideBar,
    transaction
  },
  data() {
    return {
      userTransactions: [],
    };
  },
  computed: Object.assign({
    _userTransactions() {

    }
  },
    mapState([
        'user'
    ]),
    // caption() {
    //     let caption = 'Total Transactions';
    //     let userCreatedAt = new Date(this.global.user.createdAt);
    //     if (userCreatedAt > } } { { January 01, 2017 - May 15, 2018 } }

    // },
  ),
  created() {
    console.log(this.user);
    const url = `/transactions?user=${this.user._id}&skip=0&limit=10`;
    this.global.request('GET', url, null, (err, transactions) => {
      if(!err){
        this.userTransactions = transactions;
      }
    })
  },
  methods: {
    formatTime(time) {
      return moment().calendar(new Date(time));
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
  },
};
</script>
