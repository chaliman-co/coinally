<template>
    <div class="dashboard-page">
        <div class="dashboard__sidebar">
            <span class="hamburger">
                <img src="~img/close.svg" alt="Close">
            </span>
            <img src="~img/avatar.svg" alt="Avatar" class="avatar">
            <div class="title">
                Willy Wonka
            </div>
            <div class="links">
                <a href="admindashboard.html" class="link active">
                    Dashboard
                </a>
                <a href="userlist.html" class="link">
                    Users
                </a>
                <a href="currency.html" class="link">
                    Currency Settings
                </a>
                <a href="bankaccount.html" class="link">
                    Transactions
                </a>
                <a href="/" class="link logout">
                    Logout
                </a>
            </div>
        </div>
        <div class="dashboard__content">
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
                        <div class="profile__image" v-if="user.imagePath" :style="`background-image: url('${global.apiRootUrl}/${user.imagePath.replace(/\\/g, '/')}')`"></div>
                        <div class="profile__image" v-else :style="`background-image: url('${global.apiRootUrl}/images/profile_pictures/default')`"></div>
                        <div class="profile__title">
                            {{ user.firstName }} {{user.lastName}}
                        </div>
                        <div class="profile__subtitle">
                            {{ user.emailAddress }}
                        </div>
                        <div class="profile__subtitle">
                            {{ user.phoneNumber.digits }}
                        </div>
                        <button class="btn-custom-astronaut-blue small ban" @click="changeUserStatus(user.status === 'active'? 'banned': 'active')">
                            {{user.status === "active"? "Ban": "Unban" }} this user
                        </button>
                        <div class="profile__status">
                            {{user.status === "active"? "Active": "Banned" }}
                            <span class="status__indicator"></span>
                        </div>
                    </div>
                    <div class="dashboard-pane dashboard-pane--lg">
                        <div class="dashboard-pane__header">
                            <div class="header__title">
                                Transactions
                            </div>
                            <div class="header__subtitle">
                                {{user.transactionCount}} Total Transactions
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
                                                <th>Deposit amount</th>
                                                <th>receipt amount</th>
                                                <th>Rate</th>
                                                <th>Receipt account</th>
                                                <th>Status</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(transaction, index) in userTransactions" :key="index">
                                                <td>{{index}}</td>
                                                <td>Today</td>
                                                <td>{{transaction.depositAssetCode}}</td>
                                                <td>{{transaction.receiptAssetCode}}</td>
                                                <td>{{transaction.depositAmount.toFixed(3).replace(/\.([^0]*)(0+)$/, '.$1')}} ({{transaction.depositAssetCode}})</td>
                                                <td>{{transaction.receiptAmount.toFixed(3).replace(/\.([^0]*)(0+)$/, '.$1')}} ({{transaction.receiptAssetCode}})</td>
                                                <td>{{transaction.rate.toFixed(3).replace(/\.([^0]*)(0+)$/g, '.$1')}}</td>
                                                <td>{{transaction.receiptAsset.type == 'fiat'? `${user.assetAccounts[transaction.receiptAddress].address.number}, ${user.assetAccounts[transaction.receiptAddress].address.bankName}` : transaction.receiptAsset.type == 'digital'? transaction.receiptAddress : undefined}}</td>
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
                                            <tr v-for="(assetAccount, index) in user.assetAccounts.filter(assetAccount => assetAccount && assetAccount.asset.addressType === 'bank account')" :key="index">
                                                <td>{{index + 1}}.</td>
                                                <td>{{assetAccount.address.name}}</td>
                                                <td>{{assetAccount.address.number}}</td>
                                                <td>{{assetAccount.address.bankName}}</td>
                                                <td>
                                                    <button class="btn-custom-japanese-laurel small" title="Verify" v-on:click="changeAssetAccountVerification(user.assetAccounts.indexOf(assetAccount), assetAccount.isVerified? false: true)">
                                                        <i :class="assetAccount.isVerified? 'fa fa-times' : 'fa fa-check'"></i>
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
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(verificationDetail, index) in user.verificationDetails" :key="index" v-if="verificationDetail">
                                                <td>{{index}}.</td>
                                                <td>{{verificationDetail.type}}</td>
                                                <td>{{verificationDetail.value}}</td>
                                                <td>
                                                    <img v-if="verificationDetail.imagePath" :src="`${global.apiRootUrl}/${verificationDetail.imagePath}`" alt="Image">
                                                </td>
                                                <td>
                                                    <button :class="verificationDetail.isApproved? 'btn-custom-transparent-astronaut-blue small' : 'btn-custom-japanese-laurel small'" title="Verify" v-on:click.prevent="changeVerificationDetailApproval(index, verificationDetail.isApproved? false : true)">
                                                        <i :class="verificationDetail.isApproved? 'fa fa-times' : 'fa fa-check'"></i>
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
export default {
    inject: ['global'],
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
        }
    },
    created() {
        this.global.request("GET", `/users/${this.$route.params._id}/`, (err, res) => {
            this.user = res;
            this.global.request('GET', `/transactions/?user=${this.user._id}`, (err, res) => {
                this.userTransactions = res
            });
        });
    },
    methods: {
        changeTransactionStatus(transaction, status, index) {
            this.global.request("PUT", `/transactions/${transaction._id}/status`, { status }, (err, res) => {
                transaction.status = res;
            })
        },
        changeVerificationDetailApproval(index, status) {
            this.global.request("POST", `/users/${this.user._id}/verification_details/${index}/is_approved`, { isApproved: status }, (err, res) => {
                this.user.verificationDetails[index].isApproved = res;
            });
        },
        changeAssetAccountVerification(index, status) {
            this.global.request("POST", `/users/${this.user._id}/asset_accounts/${index}/is_verified`, { isVerified: status }, (err, res) => {
                this.user.assetAccounts[index].isVerified = res;
            });
        },
        changeUserStatus(status) {
            this.global.request.open("PUT", `/users/${this.user._id}/status`, { status }, (err, res) => {
                this.user.status = res;
            });
        },
    },
    components: {
        'vue-select': vueSelect,
    }
}
</script>
