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
                  v-model="status"
                  name="sort-by"
                  class="custom-select-no-title pull-right">
                  <option
                    v-for="(transactionStatus, index) in transactionsStatus"
                    :key="index"
                    :value="transactionStatus" >
                    {{ transactionStatus | capitalize }}
                  </option>
                  <!-- <option value="pending">Pending Transactions</option> -->
                </select>
              </div>

            </div>
          </div>
        </div>
      </div>
      <div class="dashboard__body">
        <!-- {{ transactions }} -->
        <div class="admin-dashboard__transactions">
          <div class="transactions__table">
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
                  <tr v-if="transactions.length == 0 && !loading"><p>No {{ this.status | capitalize }} transactions</p></tr>

                  <tr
                    v-for="(transaction, index) in transactions"
                    :key="index">
                    <td>{{ index + 1 + pageNo }}</td>
                    <td>{{ `${transaction.user.firstName} ${transaction.user.lastName}` | capitalize }}</td>
                    <td>{{ transaction.depositAssetCode | uppercase }}</td>
                    <td>{{ transaction.receiptAssetCode | uppercase }}</td>
                    <td>{{ transaction.depositAmount | numberFormat }} ({{ transaction.depositAssetCode | uppercase }})</td>
                    <td>{{ transaction.createdAt | humanizeDate }}</td>
                    <td>{{ transaction.updatedAt | humanizeDate }}</td>
                    <td>
                      {{ transaction.status | capitalize }}
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

        <pagination
          v-if="!loading && transactionsCount > 0"
          :active-page="page"
          :total-items-count="transactionsCount"
          :items-count-per-page="pageSize"
          @changePage="updatePage"
        />

      </div>
    </div>
  </div>
</template>

<script>
import transaction from './transaction.vue';
import sideBar from './../sideBar.vue';

import pagination from './../pagination.vue';
import spinner from './../spinner.vue';

export default {
  components: {
    'side-bar': sideBar,
    transaction,
    pagination,
    spinner,
  },
  data() {
    return {
      loading: false,
      transactions: [],
      transactionsStatus: ['all', 'failed', 'awaiting payment', 'payment received', 'pending', 'completed'],
      status: 'all',
      page: 1,
      pageSize: 10,
      transactionsCount: 0,
      pageNo: 0,
      st: this.$getStatus,
    };
  },
  inject: ['global'],
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
  watch: {
    status() {
      this.page = 1;
      this.pageNo = (this.page - 1) * this.pageSize;
      this.loading = true;
      this.transactions = [];
      this.getTransactions();
    },
  },
  created() {
    this.getTransactions();
  },
  methods: {
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
    getTransactions() {
      this.loading = true;
      // let getStatus = this.status;
      // if(getStatus){
      //   getStatus = null;
      // }

      let url = `/transactions?page=${this.page}&pageSize=${this.pageSize}`;
      if (this.status !== 'all') {
        url += `&status=${this.status}`;
      }
      // const url = `/transactions?page=${this.page}&pageSize=${this.pageSize}`;

      this.$request('GET', url, (err, response) => {
        if (!err) {
          this.transactions = response.items;
          this.transactionsCount = response.totalCount;
          this.loading = false;
        }
      });
    },
    updatePage(page) {
      this.pageNo = (page - 1) * this.pageSize;
      this.page = page;
      this.loading = true;
      this.transactions = [];
      this.getTransactions();
    },
  },
};
</script>
