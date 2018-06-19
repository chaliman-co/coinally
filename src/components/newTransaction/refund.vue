<template>
  <select-account
    :asset="asset"
    :is-loading="isLoading"
    type="refund"
    next-url="/transaction/status"
    @done="onDone"/>
</template>

<script>
import selectAccount from './selectAccount.vue';

export default {
  components: {
    selectAccount,
  },
  data() {
    return {
      asset: {},
      transaction: {},
      isLoading: false,
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
  mounted() {
    this.updateTransaction();
    if (this.transaction.destinationAccount) {
      this.asset = this.transaction.depositAsset;
    } else {
      this.$router.push('/transaction/destination');
    }
  },
  methods: {
    updateTransaction() {
      this.transaction = JSON.parse(sessionStorage.getItem('transaction'));
    },
    onDone(refundAccount) {
      this.updateTransaction();

      this.isLoading = true;

      const url = '/transactions';
      const data = {
        depositAmount: this.transaction.amount,
        // receiptAmount: this.transaction.amount * this.transaction.rate,
        // rate: this.transaction.rate,
        depositAssetCode: this.transaction.depositAsset.code,
        receiptAssetCode: this.transaction.receiptAsset.code,
        // depositAsset: this.transaction.depositAsset._id,
        // receiptAsset: this.transaction.receiptAsset._id,
        user: this.user._id,
        receiptAddress: this.transaction.destinationAccount,
        refundAddress: refundAccount,
      };

      this.$request('POST', url, data, (err, result) => {
        this.isLoading = false;
        if (!err) {
          sessionStorage.removeItem('transaction');
          this.$router.push(`/transactions/status/${result._id}`);
        }
      });
    },
  },
};
</script>
