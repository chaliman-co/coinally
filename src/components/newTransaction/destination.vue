<template>
  <select-account
    :asset="asset"
    :is-loading="isLoading"
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
      isEditing: false,
      isLoading: false,
    };
  },
  created() {
    this.transaction = JSON.parse(sessionStorage.getItem('transaction'));
    this.asset = this.transaction.receiptAsset;
    if(this.transaction.id){
      this.isEditing = true;
    }
  },
  // methods: {
  //   onDone(destinationAccount) {
  //     this.transaction.destinationAccount = destinationAccount;
  //     sessionStorage.setItem('transaction', JSON.stringify(this.transaction));
  //     this.$router.push('/transaction/refund');
  //   },
  // },
  
  methods: {
    refreshTransaction() {
      this.transaction = JSON.parse(sessionStorage.getItem('transaction'));
    },
    onDone(destAccount) {
      this.refreshTransaction();

      this.isLoading = true;

      let url = '/transactions';

      const data = {
        receiptAddress: destAccount,
      };

      if(!this.isEditing){
        data.depositAmount = this.transaction.amount;
        data.depositAssetCode = this.transaction.depositAsset.code;
        data.receiptAssetCode = this.transaction.receiptAsset.code;
        data.user = this.$store.state.user._id;
      }else{
        url += `/${this.transaction.id}/receiptAddress`;
      }

      this.$request(this.isEditing ? 'PUT' : 'POST', url, data, (err, result) => {
        this.isLoading = false;
        if (!err) {
          sessionStorage.removeItem('transaction');
          this.$router.push(`/transactions/status/${this.isEditing ? this.transaction.id : result._id}`);
        }
      });
    },
  }
};
</script>

