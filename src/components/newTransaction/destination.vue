<template>
  <select-account
    :asset="asset"
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
    };
  },
  created() {
    this.transaction = JSON.parse(sessionStorage.getItem('transaction'));
    this.asset = this.transaction.receiptAsset;
  },
  methods: {
    onDone(destinationAccount) {
      this.transaction.destinationAccount = destinationAccount;
      sessionStorage.setItem('transaction', JSON.stringify(this.transaction));
      this.$router.push('/transaction/refund');
    },
  },
};
</script>

