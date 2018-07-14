<template>
    
        <div class="dashboard-pane dashboard-pane--lg">
            <transaction
              ref="transaction"
              @statusChanged="changeStatus"/>
            <div class="dashboard-pane__header">
              <div class="header__title">
                Transactions
              </div>
              <div class="header__subtitle">
                
                {{ transactionsCount }} Total Transactions
              </div>
            </div>
            <div class="dashboard-pane__body is--padded">
              <div class="user-transactions__table">
                <div class="table-responsive">
                  <table class="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>I have</th>
                        <th>I want</th>
                        <th>Rate</th>
                        <th>Receipt account</th>
                        <th>Status</th>
                        <th/>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(transaction, index) in transactions"
                        :key="index">
                        <td>{{ index + 1 + pageNo }}</td>
                        <td>{{ transaction.createdAt | humanizeDate }}</td>
                        <td>{{ transaction.depositAssetCode.toUpperCase() }}</td>
                        <td>{{ transaction.receiptAssetCode.toUpperCase() }}</td>
                        <td>{{ transaction.rate.toFixed(10) | numberFormat }}</td>
                        <td>{{ transaction.receiptAsset.type == 'fiat'? `${user.assetAccounts[transaction.receiptAddress].address.number}, ${user.assetAccounts[transaction.receiptAddress].address.bankName}` : transaction.receiptAsset.type == 'digital'? transaction.receiptAddress : undefined }}</td>
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

              <pagination
              :active-page="page"
              :total-items-count="transactionsCount"
              :items-count-per-page="pageSize"
              @changePage="updatePage"
              ></pagination>
            </div>

            
        </div>

    
</template>

<script>

import moment from 'moment';
import transaction from '../transactions/transaction.vue'
  
import pagination from './../pagination';
import spinner from './../spinner';

  export default {
    
    props: [
      'user',
      // 'transactionsCount'
    ],
    components: {
      pagination,
      spinner,
      transaction
    },
    data(){
      return {
        id:this.$route.params._id,
        transactions: [],
        transactionsCount: 0,
        page: 1,
        pageSize: 5,
        pageNo: 0,
        loading: false,
      }
    }, 
    methods: {
      getTransactions(){
        this.loading = true;
        let url = `/transactions/users/${this.id}?page=${this.page}&pageSize=${this.pageSize}`;
        this.$request('GET', url, (bug, trans) => {                             
          console.log('Transactions ',trans);
            if (!bug) {
                this.transactions = trans.items;
                this.transactionsCount = trans.totalCount;
                this.loading = false;
            }
        });
      },
      changeStatus(trans, status) {
        const tx = this.userTransactions.find(t => t._id === trans._id);
        if (tx) {
          this.$set(tx, 'status', status);
        }
      },
      showTransaction(trans) {
        // console.log(this.$refs.transaction);
        this.$refs.transaction.open(trans);
      },
      updatePage(page) {
        this.pageNo = (page - 1) * this.pageSize;
        this.page = page;
        this.loading = true;
        this.transactions = [];
        this.getTransactions();
      },
    },
    created(){
      this.getTransactions()
    }
  }

</script>
