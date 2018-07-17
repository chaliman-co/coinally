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
          </div>
        </div>
      </div>
      <div class="dashboard__body">

        <div class="admin-dashboard__user">
          <div class="user__profile">
            <div
              v-if="user.imagePath"
              :style="`background-image: url('${$generateUrl(user.imagePath.replace(/\\/g, '/'))}')`"
              class="profile__image"/>
            <div
              v-else
              :style="`background-image: url('${$generateUrl('images/profile_pictures/avatar.svg')}`"
              class="profile__image"/>
            <div class="profile__title">
              {{ `${user.firstName} ${user.lastName}` | capitalize }}
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
          <!-- User Transactions -->

          <user-transaction :user="user"/>
          <!-- End of User Transactions -->

          <div class="dashboard-pane dashboard-pane--lg">
            <div class="dashboard-pane__header">
              <div class="header__title">
                Bank Accounts
              </div>
              <div class="header__subtitle">
                {{ user.assetAccounts.length }} Bank Accounts
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
              <div class="header__subtitle">
                {{ user.verificationDetails.length }} Verification Details
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
                        <td>{{ index + 1 }}</td>
                        <td>
                          {{ verificationDetail.type | capitalize }}
                          {{ verificationDetail.name ? `(${verificationDetail.name})`: '' }}
                        </td>
                        <td>{{ verificationDetail.number }}</td>
                        <td>
                          <img
                            v-if="verificationDetail.imagePath"
                            :src="$generateUrl(verificationDetail.imagePath)"
                            alt="Image">
                        </td>
                        <td>
                          <button
                            :class="verificationDetail.isApproved ?
                            'btn-custom-transparent-astronaut-blue small' : 'btn-custom-japanese-laurel small'"
                            title="Verify"
                            @click.prevent="changeVerificationDetailApproval(index, !verificationDetail.isApproved)">
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
// import transaction from '../transactions/transaction.vue';

import userTransaction from './usertransaction.vue';

export default {
  inject: ['global'],
  components: {
    'vue-select': vueSelect,
    sideBar,
    // transaction,
    userTransaction,
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
      transactionsStatus: ['all', 'failed', 'awaiting payment', 'payment received', 'pending', 'completed'],
      // transactionStatuses: ['initialized', 'payment_received', 'completed', 'failed'],
    };
  },
  created() {
    this.getTransactionsAndUser();
  },
  methods: {
    getTransactionsAndUser() {
      this.$request('GET', `/users/${this.$route.params._id}/`, (err, user) => {
        if (user) {
          this.user = user;
        }
      });
    },
    changeVerificationDetailApproval(index, status) {
      const url = `/users/${this.user._id}/verification_details/${index}/is_approved`;
      this.global.request('POST', url, {
        isApproved: status,
      }, (err, res) => {
        this.user.verificationDetails[index].isApproved = res;
      });
    },
    changeAssetAccountVerification(index, status) {
      const url = `/users/${this.user._id}/asset_accounts/${index}/is_verified`;
      this.global.request('POST', url, {
        isVerified: status,
      }, (err, res) => {
        this.user.assetAccounts[index].isVerified = res;
      });
    },
    changeUserStatus(status) {
      this.global.request.open('PUT', `/users/${this.user._id}/status`, {
        status,
      }, (err, res) => {
        this.user.status = res;
      });
    },
  },
};
</script>
