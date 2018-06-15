<template>
    <div class="dashboard-page">
        <side-bar></side-bar>
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
                            <a href="" class="btn-custom-astronaut-blue small" data-toggle="modal" data-target="#exchange-modal">
                                <i class="fa fa-plus"></i> New Transaction
                            </a>

                            <a href="verify.html" class="btn-custom-transparent-astronaut-blue small">
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
                                        <td>{{formatTime(transaction.createdAt)}}</td>
                                        <td>{{transaction.depositAssetCode}}</td>
                                        <td>{{transaction.receiptAssetCode}}</td>
                                        <td>{{transaction.depositAmount.toFixed(3).replace(/\.([^0]*)(0+)$/, '.$1')}} ({{transaction.depositAssetCode}})</td>
                                        <td>{{transaction.receiptAmount.toFixed(3).replace(/\.([^0]*)(0+)$/, '.$1')}} ({{transaction.receiptAssetCode}})</td>
                                        <td>{{transaction.rate.toFixed(3).replace(/\.([^0]*)(0+)$/g, '.$1')}}</td>
                                        <td>{{transaction.receiptAsset.type == 'fiat'? `${global.user.assetAccounts[transaction.receiptAddress].address.number}, ${global.user.assetAccounts[transaction.receiptAddress].address.bankName}` : transaction.receiptAsset.type == 'digital'? transaction.receiptAddress : undefined}}</td>
                                        <td>{{transaction.status}}</td>

                                        <td>
                                            <button class="btn-custom-astronaut-blue small" data-toggle="modal" data-target="#exchange-modal">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <ul class="pagination">
                                <li class="disabled">
                                    <a href="#">&laquo;</a>
                                </li>
                                <li class="active">
                                    <a href="#">1
                                        <span class="sr-only">(current)</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#">1</a>
                                </li>
                                <li>
                                    <a href="#">2</a>
                                </li>
                                <li>
                                    <a href="#">3</a>
                                </li>
                                <li>
                                    <a href="#">4</a>
                                </li>
                                <li>
                                    <a href="#">5</a>
                                </li>
                                <li>
                                    <a href="#">&raquo;</a>
                                </li>
                            </ul>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import sideBar from './../sideBar';
window.moment = moment;
export default {
    inject: ['global'],
    data() {
        return {
            userTransactions: [],
        }
    },
    computed: {
        _userTransactions() {

        },
        // caption() {
        //     let caption = 'Total Transactions';
        //     let userCreatedAt = new Date(this.global.user.createdAt);
        //     if (userCreatedAt > } } { { January 01, 2017 - May 15, 2018 } }

        // },
    },
    methods: {
        formatTime(time) {
            return moment().calendar(new Date(time))
        }
    },
    components: {
        'side-bar': sideBar,
    },
    created() {
        this.global.getTransactions(0, Number.MAX_SAFE_INTEGER, transactions => {
            console.log({ transactions })
            if (transactions[transactions.length - 1] == 'end') transactions.splice(-1, 1);
            this.userTransactions = transactions;

        });
    }
}
</script>
