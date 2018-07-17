<template>
  <div class="dashboard-page">
    <side-bar/>
    <transaction-modal/>
    <div class="dashboard__content">
      <div class="dashboard__top-bar">
        <div class="top-bar__table-md">
          <div class="top-bar__table-row">
            <div class="top-bar__table-cell top-bar__title">
              <div class="title">
                Bank Accounts
              </div>
            </div>
            <div class="top-bar__table-cell top-bar__controls">
              <a
                href="#"
                class="btn-custom-astronaut-blue small"
                data-toggle="modal"
                data-target="#exchange-modal">
                <i class="fa fa-plus"/> New Transaction
              </a>

              <router-link
                to="/verify"
                class="btn-custom-transparent-astronaut-blue small">
                Verify Details
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="panel panel-default">
        <div class="panel-heading">
          <h4 class="panel-title">
            <button
              id="addButton"
              class="btn-custom-japanese-laurel small"
              data-toggle="collapse"
              data-target="#collapseOne">
              <i class="fa fa-plus"/> New Bank Account
            </button>
          </h4>
        </div>
        <div
          id="collapseOne"
          class="panel-collapse collapse">
          <div class="panel-body">
            <p class="text-danger error-summary">{{ errorSummary }}</p>
            <form
              class="input-fields"
              @submit.prevent="submit">
              <div class="row custom-form-group">
                <div class="textbox-component custom-form-group col-md-6 col-md-offset-3">
                  <label for="name">
                    Account Name
                    <font
                      v-if="validationFailed"
                      color="red"
                      class="input-error-message"> *{{ validationError.name }}</font>
                  </label>
                  <input
                    id="name"
                    v-model="form.address.name"
                    type="text"
                    placeholder="account name"
                    required>
                </div>
                <div class="textbox-component custom-form-group col-md-6 col-md-offset-3">
                  <label for="number">
                    Account Number
                    <font
                      v-if="validationFailed"
                      color="red"
                      class="input-error-message"> *{{ validationError.number }}</font>
                  </label>
                  <input
                    id="number"
                    v-model="form.address.number"
                    type="text"
                    pattern="\d{10}"
                    placeholder="account number..."
                    required>
                </div>
                <div class="textbox-component custom-form-group col-md-6 col-md-offset-3">
                  <label for="bank-name">
                    Bank
                    <font
                      v-if="validationFailed"
                      color="red"
                      class="input-error-message"> *{{ validationError.bankName }}</font>
                  </label>
                  <input
                    id="bank-name"
                    v-model="form.address.bankName"
                    type="text"
                    placeholder="eg. First Bank"
                    required>
                </div>
                <div class="select-component custom-form-group  col-md-6 col-md-offset-3">
                  <label for="asset">Currency</label>
                  <vue-select
                    :options="assets"
                    v-model="form.asset"
                    input-id="asset"
                    label="name">
                    <template
                      slot="option"
                      slot-scope="option">
                      <img
                        :src="$generateUrl(option.imagePath)"
                        style="height:2rem; margin-right: .3rem; margin-bottom: 0; line-height: 1">
                      {{ option.name | capitalize }}
                    </template>
                  </vue-select>
                </div>
              </div>
              <div class="custom-form-group col-md-6 col-md-offset-3">
                <button
                  :disabled="!isValidated || isWaiting"
                  type="submit"
                  style="width:100%"
                  class="call-to-action btn-custom-astronaut-blue">
                  {{ isWaiting? 'Sending...': 'Add' }}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
      <div class="dashboard__bank-account">
        <div class="bank-account__table">
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
                <template v-if="user">
                  <tr
                    v-for="(assetAccount, index) in bankAccounts"
                    v-if="assetAccount"
                    :key="index">
                    <td>{{ index + 1 }}.</td>
                    <td>{{ assetAccount.address.name }}</td>
                    <td>{{ assetAccount.address.number }}</td>
                    <td>{{ assetAccount.address.bankName }}</td>
                    <td>{{ assetAccount.isVerified? "Yes" : "No" }}</td>
                    <td>
                      <button
                        v-if="!waitingAccounts[assetAccount.index]"
                        class=" btn btn-sm btn-danger"
                        @click="removeAccount(assetAccount, assetAccount.index)"> Remove
                        <i class="fa fa-times"/>
                      </button>
                      <i
                        v-else
                        class="fa fa-spinner fa-pulse" />
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import vueSelect from 'vue-select';
import { mapState, mapActions, mapMutations } from 'vuex';
import sideBar from './../sideBar.vue';
import transactionModal from '../transactionModal.vue';

export default {
  inject: ['global'],
  components: {
    'side-bar': sideBar,
    'vue-select': vueSelect,
    transactionModal,
  },
  data() {
    return {
      validationFailed: false,
      requestErrors: {},
      errorSummary: '',
      isWaiting: false,
      waitingAccounts: [],
      form: {
        asset: undefined,
        address: {
          name: undefined,
          number: undefined,
          bankName: undefined,
        },
      },
    };
  },
  computed: {
    ...mapState({
      user: 'user',
      assets: state => state.assets.filter(a => a.type === 'fiat'),
    }),
    bankAccounts() {
      return this.user.assetAccounts.filter((account, index) => {
        if (!account) return false;
        account.index = index;
        const asset = this.assets.find(a => a._id === account.asset._id || a._id === account.asset);
        return account && asset && asset.addressType === 'bank account';
      });
    },
    isValidated() {
      return !(Object.keys(this.validationError).length);
    },
    validationError() {
      const errors = {};
      if (!this.form.asset) errors.asset = 'invalid';
      if (this.requestErrors.asset) errors.asset = this.requestErrors.asset;
      for (const field of ['name', 'bankName', 'number']) {
        if (!this.form.address[field] || this.form.address[field].isValid === false) errors[field] = 'invalid';
        if (this.requestErrors[field]) errors[field] = this.requestErrors[field];
      } console.log('errors:', errors);
      return errors;
    },
  },
  created() {
    this.loadAssets();
  },
  methods: {
    ...mapActions(['loadAssets']),
    ...mapMutations(['updateUser']),
    removeAccount(account, index) {
      const isConfirmed = window.confirm('Are you sure you want to delete this bank account?');
      if (!isConfirmed) return;

      this.waitingAccounts = Object.assign({ [index]: true }, this.waitingAccounts);

      const url = `/users/${this.global.user._id}/asset_accounts/${index}`;
      this.$request('DELETE', url, (err) => {
        this.waitingAccounts = Object.assign({ [index]: false }, this.waitingAccounts);
          if (!err) {
            const updatedUser = this.user;
            updatedUser.assetAccounts.splice(index, 1, null);
            this.updateUser(updatedUser);
          }
      });
    },
    submit() {
      if (!this.isValidated) {
        this.validationFailed = true;
        return;
      }
      this.isWaiting = true;
      const url = `/users/${this.user._id}/asset_accounts`;
      this.$request('POST', url, { ...this.form, asset: this.form.asset._id }, (err, result) => {
          this.isWaiting = false;
          if (err) {
            this.errorHandler(err);
          } else {
            this.errorSummary = '';
            this.requestErrors = {};

            const updatedUser = this.user;
            updatedUser.assetAccounts.push(result);
            this.updateUser(updatedUser);

            document.getElementById('addButton').click();
          }
      });
    },
    setSelect(inputId, modelProp, value) {
      const input = document.getElementById(inputId);
      if (!input) return;
      this[modelProp] = value;
      input.setCustomValidity(value ? '' : 'please select one');
    },
    errorHandler(err) {
      if (err.message === 'Network Error') {
        this.errorSummary = 'Network Error';
      } else {
        if (Math.floor(err.response.status / 100) === 4) {
          this.errorSummary = 'validation failed';
        } else {
          this.errorSummary = 'internal server error';
        }
        this.validationFailed = true;
        const serverResponse = err.response.data;
        Object.assign(this.requestErrors, serverResponse.errors.errorDetails);
      }
    },
  },
};
</script>

<style>
.error-summary {
    text-align: center;
}
</style>
