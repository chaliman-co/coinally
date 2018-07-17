<template>

  <div
    id="asset-select"
    class="header__table-cell header__cta-form">
    <div class="cta-form">
      <!-- <p v-for="asset in assets">{{asset}} <hr></p> -->

      <div class="cta-form__assets-selection">
        <div class="title">
          Choose which assets to trade
        </div>
        <form
          class="input-fields"
          @submit.prevent="proceed">
          <div class="select-component custom-form-group">
            <label for="deposit">Deposit</label>
            <!-- {{depositAsset}} -->
            <vue-select
              :options="depositAssets"
              v-model="depositAsset"
              input-id="deposit"
              label="name">
              <template
                slot="option"
                slot-scope="option">
                <img
                  :src="$generateUrl(option.imagePath)"
                  style="height:2rem; margin-right: .3rem; margin-bottom: 0; line-height: 1"> {{ option.name | capitalize }}
              </template>
            </vue-select>
          </div>
          <div class="select-component custom-form-group">
            <label for="receipt">Receive</label>
            <vue-select
              :options="receiptAssets"
              v-model="receiptAsset"
              input-id="receipt"
              label="name">
              <template
                slot="option"
                slot-scope="option">
                <img
                  :src="$generateUrl(option.imagePath)"
                  style="height:2rem; margin-right: .3rem; margin-bottom: 0; line-height: 1"> {{ option.name | capitalize }}
              </template>
            </vue-select>
          </div>
          <div class="textbox-component">
            <label for="amount">
              Amount (Min: {{ minValue | numberFormat }} Max: {{ maxValue | numberFormat }})
            </label>
            <input
              id="amount"
              v-model="amount"
              :min="minValue"
              :max="maxValue"
              type="number"
              placeholder="0"
              step="0.0000001">
            <p
              v-if="inputError"
              class="text-danger">{{ inputError }}</p>
          </div>
          <button
            id="submitbutton"
            type="submit"
            class="hidden" />
        </form>
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
        <label
          :disabled="!isValidated"
          for="submitbutton"
          tabindex="0"
          class="convert btn-custom-astronaut-blue">
          Convert
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import vueSelect from 'vue-select';
import socketIoClient from 'socket.io-client';

export default {
  inject: ['global'],
  components: {
    'vue-select': vueSelect,
  },
  data() {
    return {
      depositAsset: null,
      receiptAsset: null,
      assets: [],
      amount: 0,
      socket: null,
      request: null,
      conversionRate: null,
      inputError: false,
    };
  },
  computed: {
    receiptAmount() {
      if (isNaN(this.amount) || isNaN(this.conversionRate)) return null;
      return this.conversionRate * this.amount;
    },
    isValidated() {
      return this.depositAsset && this.receiptAsset;
    },
    receiptAssets() {
      let receiptAssets = [];
      if (this.depositAsset && this.depositAsset.code !== 'ngn') {
        receiptAssets = this.assets.filter(asset => asset.code === 'ngn');
        [this.receiptAsset] = receiptAssets;
      } else {
        receiptAssets = this.assets
        .filter(asset => (this.depositAsset === null || asset._id !== this.depositAsset._id) && asset.buyable);
      }
      return receiptAssets;
    },
    depositAssets() {
      let depositAssets = [];
      if (false && this.receiptAsset && this.receiptAsset.code !== 'ngn') {
        depositAssets = this.assets.filter(asset => asset.code === 'ngn');
        [this.depositAsset] = depositAssets;
      } else {
        depositAssets = this.assets.filter(asset => asset.sellable);
      }
      return depositAssets;
    },
    minValue() {
      if (this.depositAsset === null) {
        return '';
      }
        return this.depositAsset.minDepositAmount;
    },
    maxValue() {
      if (this.depositAsset === null) {
        return '';
      }
        return this.depositAsset.maxDepositAmount;
    },
  },
  watch: {
    receiptAssets(assets) {
        if (assets.indexOf(this.receiptAsset) === -1) {
          [this.receiptAsset] = assets;
        }
    },
    receiptAsset(newAsset) {
      if (!this.depositAsset || !this.receiptAsset) return;
      this.updateRate({
        from: this.depositAsset.code,
        to: newAsset.code,
      });
    },
    depositAsset(newAsset) {
      if (!this.depositAsset || !this.receiptAsset) return;
      this.updateRate({
        from: newAsset.code,
        to: this.receiptAsset.code,
      });
    },
    amount(newAmount, previousAmount) {
      if (Number(newAmount) > this.maxValue) {
        if (this.maxValue === '') {
          this.inputError = 'Please choose a deposit currency';
        } else {
          this.inputError = `value cannot be greater than ${Number(this.maxValue).toLocaleString()}`;
        }
        // this.amount = Math.max(Math.min(newAmount,this.maxValue));
        this.amount = previousAmount;
      } else if (Number(newAmount) < 0) {
        this.inputError = 'value cannot be lower than 0';
        this.amount = '';
      } else if (this.amount === '') {
        this.inputError = '';
      }
    },
  },
  created() {
    this.$request('GET', '/assets/', (err, result) => {
      if (err) {
        this.$log("couldn't load assets");
      } else {
        this.assets = result.map((x) => {
          x.name = this.$capitalize(x.name);
          return x;
        });
        [this.depositAsset] = result;
        this.receiptAsset = result[result.length - 1];
        this.amount = this.depositAsset.minDepositAmount;
      }
    });
  },
  methods: {
    updateRate(query) {
      if (!this.socket) {
        const socket = socketIoClient(`${this.global.apiRootUrl}/rates`, {
          reconnectionDelay: 10000,
          query,
        });
        // socket.on('seen', msg => console.log('seen: ', msg));
        // socket.on('exception', err => console.log('exception: ', err));
        // socket.on('error', (...args) => console.log('error event: ', ...args));
        // socket.on('connect_timeout', (...args) => console.log('timeout: ', ...args));
        socket.on('new_rate', (rate) => {
          this.conversionRate = rate;
          console.log('new rate: ', rate);
        });
        this.socket = socket;
      } else {
        this.socket.emit('parameter_change', query);
      }
    },
    setSelect(inputId, modelProp, value) {
      const input = document.getElementById(inputId);
      if (!input) return;
      this[modelProp] = value;

      if (!value) {
        input.setCustomValidity('please select one');
      } else {
        input.setCustomValidity('');
      }
    },
    proceed() {
      sessionStorage.transaction = JSON.stringify({
        depositAsset: this.depositAsset,
        receiptAsset: this.receiptAsset,
        amount: this.amount,
        rate: this.conversionRate,
      });
      if (!this.$store.state.user) {
        this.$router.push({
          path: '/login',
          query: {
            message: 'Login to continue',
            nextPage: {
              path: '/transaction/payment',
            },
          },
        });
      } else {
          this.$router.push('transaction/payment');
      }
    },
  },
};
</script>
