<template>
  <div
    id="asset-select"
    class="header__table-cell header__cta-form">
    <div class="cta-form">
      <div class="cta-form__assets-selection">
        <div class="title">
          Choose which assets to trade
        </div>
        <form
          class="input-fields"
          @submit.prevent="proceed">
          <div class="select-component custom-form-group">
            <label for="deposit">Deposit</label>
            <vue-select
              :options="assets"
              :on-change="val => setSelect('deposit', 'depositAsset', val)"
              input-id="deposit"
              label="name">
              <template
                slot="option"
                slot-scope="option">
                <img
                  :src="`${global.apiRootUrl}/${option.imagePath}`"
                  style="height:2rem; margin-right: .3rem; margin-bottom: 0; line-height: 1"> {{ option.name }}
              </template>
            </vue-select>
          </div>
          <div class="select-component custom-form-group">
            <label for="receipt">Receive</label>
            <vue-select
              :options="assets"
              :on-change="val => setSelect('receipt', 'receiptAsset', val)"
              input-id="receipt"
              label="name">
              <template
                slot="option"
                slot-scope="option">
                <img
                  :src="`${global.apiRootUrl}/${option.imagePath}`"
                  style="height:2rem; margin-right: .3rem; margin-bottom: 0; line-height: 1"> {{ option.name }}
              </template>
            </vue-select>
          </div>
          <div class="textbox-component">
            <label for="amount">
              Amount (Min: 0, Max: 100)
            </label>
            <input
              id="amount"
              v-model="amount"
              type="number"
              placeholder="0"
              step="0.0000001" >
          </div>
          <button
            id="submitbutton"
            type="submit"
            class="hidden"/>
        </form>
        <div
          v-if="depositAsset && receiptAsset && conversionRate"
          class="expected-amount">
          <div class="amount">
            {{ `${amount} ${depositAsset.code.toUpperCase()} (${receiptAmount}${receiptAsset.code.toUpperCase()})` }}
          </div>
          <div class="exchange-rate">
            {{ `1 ${depositAsset.code.toUpperCase()} = ${conversionRate.toFixed(8).replace(/(?:\.)?0+$/, "")}${receiptAsset.code.toUpperCase()}` }}
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
    };
  },
  computed: {
    receiptAmount() {
      if (isNaN(this.amount) || isNaN(this.conversionRate)) return null;
      return (this.conversionRate * this.amount).toFixed(8).replace(/(?:\.)?0+$/, '');
    },
    isValidated() {
      return !!(this.depositAsset && this.receiptAsset);
    },

  },
  watch: {
    receiptAsset(newAsset, previousAsset) {
      if (!(this.depositAsset && this.receiptAsset)) return;
      this.UpdateRate(previousAsset ? {
        to: newAsset.code,
      } : {
        from: this.depositAsset.code,
        to: newAsset.code,
      });
    },
    depositAsset(newAsset, previousAsset) {
      if (!(this.depositAsset && this.receiptAsset)) return;
      this.UpdateRate(previousAsset ? {
        from: newAsset.code,
      } : {
        from: newAsset.code,
        to: this.receiptAsset.code,
      });
    },
  },
  created() {
    this.global.request('GET', '/assets/', (err, res) => {
      if (err) console.error("couldn't load assets");
      this.assets = res;
    });
  },
  methods: {
    UpdateRate(query) {
      console.log(query);
      if (!this.socket) {
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
      } else this.socket.emit('parameter_change', query);
    },
    setSelect(inputId, modelProp, value) {
      const input = document.getElementById(inputId);
      if (!input) return;
      this[modelProp] = value;
      if (!value) return input.setCustomValidity('please select one');
      return input.setCustomValidity('');
    },
    proceed() {
      if (!this.global.user) {
        return this.$router.push({
          path: '/login',
          query: {
            message: 'Login to continue',
            nextPage: {
              path: '/transaction',
              query: {
                deposit: this.depositAsset.code,
                receipt: this.receiptAsset.code,
                amount: this.amount,
              },
            },
          },
        });
      }
      sessionStorage.transaction = JSON.stringify({
        depositAsset: this.depositAsset,
        receiptAsset: this.receiptAsset,
        amount: this.amount,
        rate: this.conversionRate,
      });
      this.$router.push('transaction/destination');
      // this.$router.push({
      //   path: '/transaction',
      //   query: {
      //     deposit: this.depositAsset.code,
      //     receipt: this.receiptAsset.code,
      //     amount: this.amount,
      //   }
      // });
    },
  },
};
</script>
