<template>
  <div class="dashboard-page">
    <side-bar/>
    <div class="dashboard__content">
      <transaction ref="transaction"/>
      <div class="dashboard__top-bar">
        <div class="top-bar__table-md">
          <div class="top-bar__table-row">
            <div class="top-bar__table-cell top-bar__title">
              <div class="title">
                User
              </div>
            </div>
            <div class="top-bar__table-cell top-bar__controls">
              <!-- <a href="" class="btn-custom-astronaut-blue small" data-toggle="modal" data-target="#exchange-modal">
                                                                                                                                                            <i class="fa fa-plus"></i> New Transaction
                                                                                                                                                        </a> -->

              <!-- <a href="verify.html" class="btn-custom-transparent-astronaut-blue small">
                                                                                                                                                            Verify Details
                                                                                                                                                        </a> -->
            </div>
          </div>
        </div>
      </div>
      <div class="dashboard__body">

        <div class="admin-dashboard__user">
          <div class="user__profile">
            <div
              v-if="user.imagePath"
              :style="`background-image: url('${global.apiRootUrl}/${user.imagePath.replace(/\\/g, '/')}')`"
              class="profile__image"/>
            <div
              v-else
              :style="`background-image: url('${global.apiRootUrl}/images/profile_pictures/default')`"
              class="profile__image"/>
            <div class="profile__title">
              {{ user.firstName }} {{ user.lastName }}
            </div>
            <div class="profile__subtitle">
              {{ user.emailAddress }}
            </div>
            <div class="profile__subtitle">
              {{ user.phoneNumber.digits }}
            </div>
            <button
              class="btn-custom-astronaut-blue small ban"
              @click="changeUserStatus(user.status === 'active'? 'banned': 'active')">
              {{ user.status === "active"? "Ban": "Unban" }} this user
            </button>
            <div class="profile__status">
              {{ user.status === "active"? "Active": "Banned" }}
              <span class="status__indicator"/>
            </div>
          </div>
          <div class="dashboard-pane dashboard-pane--lg">
            <div class="dashboard-pane__header">
              <div class="header__title">
                Transactions
              </div>
              <div class="header__subtitle">
                {{ user.transactionCount }} Total Transactions
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
                        <!-- <th>Deposit amount</th>
                        <th>receipt amount</th> -->
                        <th>Rate</th>
                        <th>Receipt account</th>
                        <th>Status</th>
                        <th/>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(transaction, index) in userTransactions"
                        :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>Today</td>
                        <td>{{ transaction.depositAssetCode }}</td>
                        <td>{{ transaction.receiptAssetCode }}</td>
                        <!-- <td>{{ transaction.depositAmount.toFixed(3).replace(/\.([^0]*)(0+)$/, '.$1') }} ({{ transaction.depositAssetCode }})</td>
                        <td>{{ transaction.receiptAmount.toFixed(3).replace(/\.([^0]*)(0+)$/, '.$1') }} ({{ transaction.receiptAssetCode }})</td> -->
                        <td>{{ transaction.rate.toFixed(3).replace(/\.([^0]*)(0+)$/g, '.$1') }}</td>
                        <td>{{ transaction.receiptAsset.type == 'fiat'? `${user.assetAccounts[transaction.receiptAddress].address.number}, ${user.assetAccounts[transaction.receiptAddress].address.bankName}` : transaction.receiptAsset.type == 'digital'? transaction.receiptAddress : undefined }}</td>
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
          </div>
          <div class="dashboard-pane dashboard-pane--lg">
            <div class="dashboard-pane__header">
              <div class="header__title">
                Bank Accounts
              </div>
              <div class="header__subtitle">
                2 Bank Accounts
              </div>
            </div>
            <div class="dashboard-pane__body is--padded">
              <div class="user-bank-account__table">
                <div class="table-responsive">
                  <table class="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Account Name</th>
                        <th>Account Number</th>
                        <th>Bank</th>
                        <th>Verified</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(assetAccount, index) in user.assetAccounts.filter(assetAccount => assetAccount && assetAccount.asset.addressType === 'bank account')"
                        :key="index">
                        <td>{{ index + 1 }}.</td>
                        <td>{{ assetAccount.address.name }}</td>
                        <td>{{ assetAccount.address.number }}</td>
                        <td>{{ assetAccount.address.bankName }}</td>
                        <td>
                          <button
                            class="btn-custom-japanese-laurel small"
                            title="Verify"
                            @click="changeAssetAccountVerification(user.assetAccounts.indexOf(assetAccount), assetAccount.isVerified? false: true)">
                            <i :class="assetAccount.isVerified? 'fa fa-times' : 'fa fa-check'"/>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="dashboard-pane dashboard-pane--lg">
            <div class="dashboard-pane__header">
              <div class="header__title">
                Verification Details
              </div>
            </div>
            <div class="dashboard-pane__body is--padded">
              <div class="user-verification__table">
                <div class="table-responsive">
                  <table class="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Type</th>
                        <th>Number</th>
                        <th>Image</th>
                        <th>Approved</th>
                        <th/>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(verificationDetail, index) in user.verificationDetails"
                        v-if="verificationDetail"
                        :key="index">
                        <td>{{ index }}.</td>
                        <td>{{ verificationDetail.type }}</td>
                        <td>{{ verificationDetail.value }}</td>
                        <td>
                          <img
                            v-if="verificationDetail.imagePath"
                            :src="`${global.apiRootUrl}/${verificationDetail.imagePath}`"
                            alt="Image">
                        </td>
                        <td>
                          <button
                            :class="verificationDetail.isApproved? 'btn-custom-transparent-astronaut-blue small' : 'btn-custom-japanese-laurel small'"
                            title="Verify"
                            @click.prevent="changeVerificationDetailApproval(index, verificationDetail.isApproved? false : true)">
                            <i :class="verificationDetail.isApproved? 'fa fa-times' : 'fa fa-check'"/>
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
    </div>
  </div>
</template>

<script>
import vueSelect from 'vue-select';
import sideBar from '../sideBar.vue';
import transaction from '../transactions/transaction.vue';

export default {
    inject: ['global'],
    components: {
        'vue-select': vueSelect,
        sideBar,
        transaction,
    },
    data() {
        return {
            user: {
                phoneNumber: {},
                lastName: undefined,
                firstName: undefined,
                emailAddress: undefined,
                assetAccounts: [],
                verificationDetails: [],
                imagePath: undefined,
                country: undefined,
                transactionCount: undefined,
            },
            userTransactions: [],
            transactionStatuses: ['initialized', 'payment_received', 'completed', 'failed'],
        };
    },
    created() {
        this.$request('GET', `/users/${this.$route.params._id}/`, (err, user) => {
            if (user) {
                this.user = user;
                this.$request('GET', `/transactions/?user=${this.user._id}`, (bug, trans) => {
                    if (!bug) {
                        this.userTransactions = trans;
                    }
                });
            }
        });
    },
    methods: {
        // changeTransactionStatus(transaction, status, index) {
        //     this.global.request('PUT', `/transactions/${transaction._id}/status`, { status }, (err, res) => {
        //         transaction.status = res;
        //     });
        // },

    changeStatus(trans, status) {
      const tx = this.userTransactions.find(t => t._id === trans._id);
      if (tx) {
        this.$set(tx, 'status', status);
      }
    },
    showTransaction(trans) {
      this.$refs.transaction.open(trans);
    },
        changeVerificationDetailApproval(index, status) {
            this.global.request('POST', `/users/${this.user._id}/verification_details/${index}/is_approved`, { isApproved: status }, (err, res) => {
                this.user.verificationDetails[index].isApproved = res;
            });
        },
        changeAssetAccountVerification(index, status) {
            this.global.request('POST', `/users/${this.user._id}/asset_accounts/${index}/is_verified`, { isVerified: status }, (err, res) => {
                this.user.assetAccounts[index].isVerified = res;
            });
        },
        changeUserStatus(status) {
            this.global.request.open('PUT', `/users/${this.user._id}/status`, { status }, (err, res) => {
                this.user.status = res;
            });
        },
    },
};
</script>
