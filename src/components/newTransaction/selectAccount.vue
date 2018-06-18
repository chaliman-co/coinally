<template>
  <div
    id="destination"
    class="modal__pane">
    <div class="modal__title">
      {{ capitalize(type) }} Address
    </div>
    <div class="input-fields">

      <!-- IF CRYPTOCURRENCY, REMOVE HIDDEN FROM FOLLOWING DIV -->
      <div
        v-if="!isFiat"
        class="textbox-component custom-form-group">
        <label :for="`${type}-address`">
          Your {{ asset.name }} {{ type }} address
        </label>
        <input
          :id="`${type}-address`"
          v-model="depositAddress"
          :placeholder="`${capitalize(type)} address`"
          type="text">
      </div>

      <!-- IF BANK ACCOUNT, REMOVE HIDDEN FROM FOLLOWING DIV -->
      <div
        v-else
        class="bank-account">
        <div class="select-component form-group existing-account">
          <label for="bank-name">
            Select an existing account
          </label>
          <select
            id="bank-name"
            v-model="selectedAccount"
            name="bank-name"
            class="custom-select">
            <option
              v-for="(account, index) in assetAccounts"
              :key="index"
              :value="account">{{ account.address.bankName }}, {{ account.address.number }}</option>
          </select>
        </div>
        <button
          class="btn-custom-japanese-laurel add-new-account__button small custom-form-group"
          @click="isAdding = !isAdding">
          <i class="fa fa-plus"/>
          Add New
        </button>
        <div
          v-if="isAdding"
          class="add-new-account">
          <p
            v-if="errorMessage"
            class="text-danger">{{ errorMessage }}</p>
          <div class="select-component custom-form-group">
            <label for="bank-name">
              Bank Name
            </label>
            <select
              id="bank-name"
              v-model="newAccount.bankName"
              name="bank-name"
              class="custom-select">
              <option selected>Access Bank</option>
              <option>Diamond Bank</option>
              <option>Ecobank</option>
              <option>GT Bank</option>
              <option>UBA</option>
              <option>Zenith Bank</option>
            </select>
          </div>
          <div
            v-if="assets.length > 1"
            class="select-component custom-form-group">
            <label for="bank-name">
              Select Currency
            </label>
            <select
              id="bank-name"
              v-model="newAccount.asset"
              name="bank-name"
              class="custom-select">
              <option
                v-for="asset in assets"
                :key="asset._id"
                :value="asset._id">{{ asset.name }}</option>
            </select>
          </div>
          <div class="select-component custom-form-group">
            <label for="account-type">
              Account Type
            </label>
            <select
              id="account-type"
              v-model="newAccount.type"
              name="account-type"
              class="custom-select">
              <option selected>Current</option>
              <option>Savings</option>
            </select>
          </div>
          <div class="textbox-component custom-form-group">
            <label for="account-name">
              Account Name
            </label>
            <input
              id="account-name"
              v-model="newAccount.name"
              placeholder="John Doe"
              type="text">
          </div>
          <div class="textbox-component custom-form-group">
            <label for="account-number">
              10-Digit NUBAN Account Number
            </label>
            <input
              id="account-number"
              v-model="newAccount.number"
              max="10"
              placeholder="0..."
              type="number">
          </div>
        </div>
      </div>
    </div>

    <!-- REMOVE THE toggle-pane CLASS IN PRODUCTION -->
    <button
      :disabled="!isValid || isLoading || isSaving"
      class="call-to-action btn-custom-astronaut-blue"
      @click="start">
      Start Transaction
      <i
        v-if="isSaving || isLoading"
        class="fa fa-spinner fa-pulse"/>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'destination',
    },
    asset: {
      type: Object,
      required: true,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectedAccount: {},
      depositAddress: null,
      isAdding: false,
      isSaving: false,
      errorMessage: null,
      newAccount: {
        name: null,
        number: null,
        bankName: null,
        asset: null,
      },
      assets: [],
    };
  },
  computed: {
    assetAccounts() {
      return this.user.assetAccounts.filter(acc => acc != null && typeof (acc.address) === 'object');
    },
    user() {
      return this.$store.state.user;
    },
    isValid() {
      if (this.isAdding) {
        return Object.values(this.newAccount).indexOf(null) === -1;
      }

      if (!this.isFiat) {
        return this.depositAddress != null;
      }

      return this.selectedAccount != null;
    },
    isFiat() {
      return this.asset.type === 'fiat';
    },
  },
  mounted() {
    if (this.isFiat) {
      const url = '/assets?type=fiat';

      this.$request('GET', url, null, (err, assets) => {
        if (!err) {
          this.assets = assets;
          if (this.assets.length > 0) {
            this.newAccount.asset = this.assets[0]._id;
          }
        }
      });
    }
  },
  methods: {
    capitalize(word) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    },
    start() {
      if (this.isAdding) {
        this.saveAccount();
      } else {
        this.goToNext();
      }
    },
    goToNext() {
      const address = this.isFiat ?
        this.user.assetAccounts.findIndex(acc => acc._id === this.selectedAccount._id)
        : this.depositAddress;

      this.$emit('done', address);
    },
    saveAccount() {
      this.isSaving = true;
      const url = `/users/${this.user._id}/asset_accounts`;
      const data = {
        asset: this.newAccount.asset,
        address: this.newAccount,
      };
      this.$request('POST', url, data, (err, result) => {
        this.isSaving = false;

        if (err) {
          this.errorMessage = 'An unexpected error occured. Please, try again later';
          return;
        }

        console.log(result);
        this.selectedAccount = result;

        const user = this.user;
        user.assetAccounts.push(result);
        this.$store.commit('updateUser', user);
        this.goToNext();
      });
    },
  },
};
</script>

