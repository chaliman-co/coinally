<template>
  <div class="dashboard-page">
    <transaction
      ref="transaction"
      @statusChanged="changeStatus"/>
    <side-bar/>

    <div class="dashboard__content">
      <div class="dashboard__top-bar">
        <div class="top-bar__table-md">
          <div class="top-bar__table-row">
            <div class="top-bar__table-cell top-bar__title">
              <div class="title">
                Transactions ({{ transactions.length }})
              </div>
            </div>
            <div class="top-bar__table-cell top-bar__controls">

              <div class="select-component sort-by is--minified">
                <select
                  id="sort-by"
                  name="sort-by"
                  class="custom-select-no-title">
                  <option value="all">All Transactions</option>
                  <option value="pending">Pending Transactions</option>
                </select>
              </div>

            </div>
          </div>
        </div>
      </div>
      <div class="dashboard__body">

        <div class="admin-dashboard__transactions">
          <div class="transactions__table">

            <!-- <div class="table-responsive">
                            <table class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>User</th>
                                        <th>Date</th>
                                        <th>I have</th>
                                        <th>I want</th>
                                        <th>Deposit amount</th>
                                        <th>receipt amount</th>
                                        <th>Rate</th>
                                        <th>Receipt account</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(transaction, index) in transactions" :key="index">
                                        <td>{{index}}</td>
                                        <td>{{transaction.user.firstName}} {{transaction.user.lastName}}</td>
                                        <td>Today</td>
                                        <td>{{transaction.depositAssetCode}}</td>
                                        <td>{{transaction.receiptAssetCode}}</td>
                                        <td>{{transaction.depositAmount.toFixed(3).replace(/\.([^0]*)(0+)$/, '.$1')}} ({{transaction.depositAssetCode}})</td>
                                        <td>{{transaction.receiptAmount.toFixed(3).replace(/\.([^0]*)(0+)$/, '.$1')}} ({{transaction.receiptAssetCode}})</td>
                                        <td>{{transaction.rate.toFixed(3).replace(/\.([^0]*)(0+)$/g, '.$1')}}</td>
                                        <td>{{transaction.receiptAsset.type == 'fiat'? `${transaction.user.assetAccounts[transaction.receiptAddress].address.number}, ${transaction.user.assetAccounts[transaction.receiptAddress].address.bankName}` : transaction.receiptAsset.type == 'digital'? transaction.receiptAddress : undefined}}</td>
                                        <td>
                                            <div class="custom-form-group ">
                                                <select class="form-control custom-select" v-model="transaction.status" @change="changeTransactionStatus(transaction, $event.target.value, index)">
                                                    <option v-for="(option, index) in transactionStatuses" :key="index" :disabled="transactionStatuses.indexOf(transaction.status) >= index" :value="option">{{option}}</option>
                                                </select>
                                            </div>
                                        </td>

                                        <td>
                                            <button class="btn-custom-astronaut-blue small" data-toggle="modal" data-target="#exchange-modal">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div> -->

            <div class="table-responsive">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Deposit Asset</th>
                    <th>Receipt Asset</th>
                    <th>Deposit Amount</th>
                    <th>Created at</th>
                    <th>Last updated</th>
                    <th>Status</th>
                    <th/>
                  </tr>
                </thead>
                <tbody>

                  <tr
                    v-for="(transaction, index) in transactions"
                    :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ transaction.user.firstName }} {{ transaction.user.lastName }}</td>
                    <td>{{ transaction.depositAssetCode }}</td>
                    <td>{{ transaction.receiptAssetCode }}</td>
                    <td>{{ transaction.depositAmount.toFixed(3).replace(/\.([^0]*)(0+)$/, '.$1') }} ({{ transaction.depositAssetCode }})</td>
                    <td>{{ formatTime(transaction.createdAt) }}</td>
                    <td>{{ formatTime(transaction.lastUpdated) }}</td>
                    <td>
                      <!-- <div class="custom-form-group ">
                        <select
                          v-model="transaction.status"
                          class="form-control custom-select"
                          @change="changeTransactionStatus(transaction, $event.target.value, index)">
                          <option
                            v-for="(option, index) in transactionStatuses"
                            :key="index"
                            :disabled="transactionStatuses.indexOf(transaction.status) >= index"
                            :value="option">{{ option }}</option>
                        </select>
                      </div> -->
                      {{ transaction.status }}
                    </td>

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
  </div>
</template>

<script>
import moment from 'moment';
import transaction from './transaction.vue';
import sideBar from './../sideBar.vue';

export default {
  components: {
    'side-bar': sideBar,
    transaction,
  },
  data() {
    return {
      transactions: [],
      transactionStatuses: ['initialized', 'payment_received', 'completed', 'failed'],
    };
  },
  inject: ['global'],
  created() {
    this.global.request('GET', '/transactions/', (err, transactions) => {
      if(!err)
      this.transactions = transactions;
    });
  },
  methods: {
    // changeTransactionStatus(trans, status, index) {
    //   this.global.request('PUT', `/transactions/${trans._id}/status`, { status }, (err, response) => {
    //     if (!err) {
    //       trans.status = response;
    //     }
    //   });
    // },
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
      const tx = this.transactions.find(t => t._id === trans._id);
      if (tx) {
        this.$set(tx, 'status', status);
      }
    },
  },
};
</script>
