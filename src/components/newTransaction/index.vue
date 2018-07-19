<template>
  <div id="transaction-page">
    <div class="modal-component exchange-modal verified in">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header clearfix">
            <span class="modal-title">
              <!-- Verified -->
            </span>
            <button
              type="button"
              data-dismiss="modal"
              @click="goBack"/>
          </div>
          <div class="modal-body">
            <div class="modal-body__container">
              <router-view/>
            </div>
            <div class="order-details">
              <div
                v-if="depositAsset && receiptAsset && conversionRate"
                class="transaction__type">
                <img
                  :src="$generateUrl(depositAsset.imagePath)"
                  :alt="depositAsset.name"> →
                <img
                  :src="$generateUrl(receiptAsset.imagePath)"
                  :alt="receiptAsset.name">
              </div>
              <div
                v-if="depositAsset && receiptAsset && conversionRate"
                class="expected-amount">
                <div class="amount">
                  <span title="Deposit">D:</span>{{ amount | numberFormat }} {{ depositAsset.code.toUpperCase() }},
                  <span title="Receive">R:</span>{{ receiptAmount | numberFormat }} {{ receiptAsset.code.toUpperCase() }}
                </div>
                <div class="exchange-rate">
                  1 {{ depositAsset.code.toUpperCase() }} =
                  {{ conversionRate | numberFormat }}
                  {{ receiptAsset.code.toUpperCase() }}
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

export default {
  data() {
    return {
      depositAsset: {

      },
      receiptAsset: {

      },
      amount: 0,
      conversionRate: 0,
      socket: null,
      transaction: {},
    };
  },
  computed: {
    isValidated() {
      return !!(this.depositAsset && this.receiptAsset);
    },
    receiptAmount() {
      return this.amount * this.conversionRate;
    },
  },
  created() {
    this.initializeProps();
    this.initializeSocket();
  },
  inject: ['global'],
  destroyed() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
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

        // socket.on('exception', err => console.log('exception: ', err));
        // socket.on('error', (...args) => console.log('error event: ', ...args));
        // socket.on('connect_timeout', (...args) => console.log('timeout: ', ...args));

        socket.on('new_rate', (rate) => {
          this.conversionRate = rate;

          const transaction = sessionStorage.getItem('transaction');

          if (transaction) {
            this.transaction = JSON.parse(transaction);
            this.transaction.rate = rate;
            sessionStorage.setItem('transaction', JSON.stringify(this.transaction));
          } else {
            this.$router.push('/');
          }
        });
        this.socket = socket;
      }
    },
    initializeProps() {
      const sessionData = sessionStorage.getItem('transaction');

      if (!sessionData) {
        return this.$router.push('/');
      }

      this.transaction = JSON.parse(sessionData);

      this.depositAsset = this.transaction.depositAsset;
      this.receiptAsset = this.transaction.receiptAsset;
      this.amount = this.transaction.amount;
      this.conversionRate = this.transaction.rate;

      return true;
    },
  },
};
</script>
