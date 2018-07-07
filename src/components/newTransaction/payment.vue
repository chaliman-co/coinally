<template>
    <div id="payment" class="modal__pane">
        <!-- <div class="modal__title">
        <span>Order ID</span>: {{ id }}
    </div> -->
        <div class="payment-address__table-md">
            <div class="payment-address__table-row" v-if="isFiat">
                <div class="payment-address__table-cell payment-address__description">
                    <div class="description__fiat">
                        <div class="title">
                            Click to pay online
                        </div>
                        <div class="body">
                            <p>
                                <span>Amount:</span>
                                <i class="naira" />{{ transaction.amount | numberFormat }}
                            </p>
                        </div>
                        <button 
                        :disabled="isLoading"
                        @click="pay" 
                        class="btn-custom-astronaut-blue small description__call-to-action">
                            Pay now
                            <i
                                v-if="isLoading"
                                class="fa fa-spinner fa-pulse"/>
                        </button>
                    </div>
                </div>
                <div class="payment-address__table-cell">
                    <div class="description__fiat">
                        <div class="title">
                            OR
                        </div>
                        <div class="body">
                            <p>
                                <strong>Pay to</strong>
                                <br> {{depositAsset.depositAddress.name}}
                                <br> {{depositAsset.depositAddress.number}}
                                <br> {{depositAsset.depositAddress.bankName}}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="payment-address__table-row" v-else-if="isDigital">
                <div class="payment-address__table-cell payment-address__qr-code">
                    <img :src="`https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${depositAsset.depositAddress}`" alt="QR Code">
                </div>
                <div class="payment-address__table-cell payment-address__description">
                    <div class="description__cryptocurrency">
                        <div class="title">
                            Send to this address:
                        </div>
                        <div class="body">
                            <p>
                                {{ depositAsset.depositAddress }}
                            </p>
                            <p>
                                <span>Amount:</span> {{ transaction.amount | numberFormat }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="payment-address__table-row" v-else>
                <div class="payment-address__table-cell payment-address__description text-center">
                    <div class="description__fiat">
                        <div class="title">
                            Upload Card Details:
                        </div>
                        <div class="body">
                            <p>
                                <span>Amount:</span> {{ transaction.amount | numberFormat }}
                            </p>
                        </div>
                    </div>
                    <div class="description__fiat ">
                        <div class="body">
                            <p>Card Details</p>
                            <button class="btn-custom-astronaut-blue small">
                                Upload
                            </button>
                            <p>Card receipt (optional)</p>
                            <button class="btn-custom-astronaut-blue small">
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button
        class="call-to-action btn-custom-astronaut-blue"
        @click="start">
        Continue
        </button>
    </div>
</template>

<script>
import utils from "../../utils";
export default {
    data(){
        return {
            transaction: {

            },
            depositAsset: {},
            reference: null,
            isLoading: false
        }
    },
    computed: {
        isFiat() {
        return this.depositAsset.type === 'fiat';
        },
        isDigital() {
        return this.depositAsset.type === 'digital';
        },
    },
    methods:{
        start(){
            sessionStorage.setItem('transaction', JSON.stringify(this.transaction));
            this.$router.push('/transaction/destination')
        },
        pay(){
            this.isLoading = true;

            const url = '/transactions';
            const data = {
                depositAmount: this.transaction.amount,
                depositAssetCode: this.transaction.depositAsset.code,
                receiptAssetCode: this.transaction.receiptAsset.code,
                user: this.$store.state.user._id,
            };

            this.$request('POST', url, data, (err, result) => {
                this.isLoading = false;
                if (!err) {
                    this.reference = result._id;
                    this.transaction.id = result._id;
                    this.payWithPaystack();
                }
            });
        },
        payWithPaystack(){
            this.isLoading = true;
            const options = {
                key: utils.paystackKey,
                email: this.$store.state.user.emailAddress,
                amount: this.transaction.amount * 100,
                ref: this.reference,
                currency: this.depositAsset.code,
                callback: (response) => {
                    this.verifyPayment(response);
                },
                onClose: () => {
                    this.isLoading = false;
                }
            };

            const handler = window.PaystackPop.setup(options);
            handler.openIframe();
        },
        verifyPayment(response){
            const url = `/transactions/${this.reference}/payment/verify`;

            this.$request('PUT', url, null, (err, result) => {
                this.isLoading = false;
                if (!err) {
                    this.start();
                }
            });
        },
        initialize(){
            const transaction = sessionStorage.getItem('transaction');
            if(transaction){
                this.transaction = JSON.parse(transaction);
                this.depositAsset = this.transaction.depositAsset;
            }else{
                this.$router.go(-1)
            }
        }
    },
    created(){
        this.initialize();
    },
}
</script>
