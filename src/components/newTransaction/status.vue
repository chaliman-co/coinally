<template>
  <div id="transaction-page">
    <div class="modal-component exchange-modal verified in">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header clearfix">
            <span class="modal-title">
              Verified
            </span>
            <button
              v-if="!id"
              type="button"
              data-dismiss="modal"
              @click="goBack"/>
          </div>
          <div class="modal-body">
            <div class="modal-body__container" v-if="transaction">
              <div
                id="payment"
                class="modal__pane">
                <div class="modal__title">
                  <span>Order ID</span>: {{ id }}
                </div>
                <div class="payment-address__table-md" v-if="!hasPaid">
            <div class="payment-address__table-row" v-if="isFiat">
                <div class="payment-address__table-cell payment-address__description">
                    <div class="description__fiat">
                        <div class="title">
                            Click to pay online
                        </div>
                        <div class="body">
                            <p>
                                <span>Amount:</span>
                                <i class="naira" />{{ amount | numberFormat }}
                            </p>
                        </div>
                        <button 
                        :disabled="isLoading"
                        @click="payWithPaystack" 
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
                                <span>Amount:</span> {{ amount | numberFormat }}
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
                                <span>Amount:</span> {{ amount | numberFormat }}
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
                <div class="progress__indicator">
                  <div class="indicator__label">
                    {{ status | capitalize }}
                  </div>
                  <div class="indicator__composite">
                    <div class="indicator__bg"/>
                    <div
                      class="indicator__progress"
                      :style="{width: `${progress}%`}"/>
                  </div>
                  <div class="indicator__progress-value">
                    {{progress}}%
                  </div>
                </div>
              </div>
            </div>
            <div class="order-details">
              <div
                v-if="depositAsset && receiptAsset && conversionRate"
                class="transaction__type">
                <img
                  :src="global.apiRootUrl + '/' + depositAsset.imagePath"
                  :alt="depositAsset.name"> →
                <img
                  :src="global.apiRootUrl + '/' + receiptAsset.imagePath"
                  :alt="receiptAsset.name">
              </div>
              <div
                v-if="depositAsset && receiptAsset && conversionRate"
                class="expected-amount">
                <div class="amount">
                  {{amount | numberFormat}}
                  {{depositAsset.code.toUpperCase()}} ({{receiptAmount.toFixed(8) | numberFormat}} {{receiptAsset.code.toUpperCase()}})
                </div>
                <div class="exchange-rate">
                  {{ `1 ${depositAsset.code.toUpperCase()} = ${conversionRate.toFixed(8)}${receiptAsset.code.toUpperCase()}` }}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
    #transaction-page {
        height: 100%;
        background: url(/assets/bg.coinally.png?611e37f…) 50%;
        background-size: auto auto;
        background-size: cover;
        padding-top: 1px;
    }
</style>

<script>
import socketIoClient from 'socket.io-client';
import utils from '../../utils';
import { txStatus } from '../../enums';

export default {
  props: {
    id: {
      type: String, required: true,
    },
  },
  data() {
    return {
      transaction: {

      },
      conversionRate: 0,
      socket: null,
      depositAsset: {},
      receiptAsset: {},
      amount: 0,
      status: null,
      statuses: utils.getStatus(),
      isLoading: false,
    };
  },
  computed: {
    receiptAmount() {
      return this.conversionRate * this.amount;
    },
    isFiat() {
      return this.depositAsset.type === 'fiat';
    },
    isDigital() {
      return this.depositAsset.type === 'digital';
    },
    progress() {
      if(!this.status) return 0;

      const index = this.statuses.indexOf(this.status);

      if (index === 0) return 0;

      return (index / (this.statuses.length - 1)) * 100;
    },
    hasPaid(){
      return this.status !== txStatus.AWAITING_PAYMENT;
    }
  },
  created() {
    const url = `/transactions/${this.id}`;
    this.$request('GET', url, null, (err, result) => {
      if (!err) {
        this.transaction = result;
        this.depositAsset = result.depositAsset;
        this.receiptAsset = result.receiptAsset;
        this.conversionRate = result.rate;
        this.amount = result.depositAmount;
        this.status = result.status;
      }
    });
  },
  methods: {
    initializeSocket() {
      if (!this.socket) {
        const query = {
          from: this.depositAsset.code,
          to: this.receiptAsset.code,
        };
        const socket = socketIoClient(`${this.global.apiRootUrl}/rates`, {
          reconnectionDelay: 10000,
          query,
        });
        socket.on('seen', msg => console.log('seen: ', msg));
        socket.on('exception', err => console.log('exception: ', err));
        socket.on('error', (...args) => console.log('error event: ', ...args));
        socket.on('connect_timeout', (...args) => console.log('timeout: ', ...args));
        socket.on('new_rate', (rate) => {
          this.conversionRate = rate;
          console.log('new rate: ', rate);
        });
        this.socket = socket;
      }
    },
    payWithPaystack(){
        this.isLoading = true;
        const options = {
            key: utils.paystackKey,
            email: this.transaction.user.emailAddress,
            amount: this.transaction.depositAmount * 100,
            ref: this.transaction._id,
            currency: this.transaction.depositAsset.code,
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
        const url = `/transactions/${this.transaction._id}/payment/verify`;

        this.$request('PUT', url, null, (err, result) => {
            this.isLoading = false;
            if (!err) {
                this.status = txStatus.PAYMENT_RECEIVED;
            }
        });
    },
  },
  inject: ['global'],
};
</script>
