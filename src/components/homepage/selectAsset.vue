<template>
  
  <div id="asset-select" 
class="header__table-cell header__cta-form">
    <div class="cta-form">
      <!-- <p v-for="asset in assets">{{asset}} <hr></p> -->
      
      <div class="cta-form__assets-selection">
        <div class="title">
          Choose which assets to trade
        </div>
        <form class="input-fields" @submit.prevent="proceed">
          <div class="select-component custom-form-group">
            <label for="deposit">Deposit</label>
            <!-- {{depositAsset}} -->
            <vue-select :options="assets" v-model="depositAsset" input-id="deposit" label="name">
              <template slot="option" slot-scope="option">
                <img :src="`${global.apiRootUrl}/${option.imagePath}`" 
                  style="height:2rem; margin-right: .3rem; margin-bottom: 0; line-height: 1"> {{ option.name }}
              </template>
            </vue-select>
          </div>
          <div class="select-component custom-form-group">
            <label for="receipt">Receive</label>
            <vue-select :options="receiptAssets" v-model="receiptAsset" input-id="receipt" label="name">
              <template slot="option" slot-scope="option">
                <img :src="`${global.apiRootUrl}/${option.imagePath}`" 
                  style="height:2rem; margin-right: .3rem; margin-bottom: 0; line-height: 1"> {{ option.name }}
              </template>
            </vue-select>
          </div>
          <div class="textbox-component">
            <label for="amount">
              Amount (Min: {{ checkMinValue | numberFormat }} Max: {{ checkMaxValue | numberFormat}})
            </label>
            <input id="amount" 
              v-model="amount" type="number" placeholder="0" step="0.0000001" :min="checkMinValue" :max="checkMaxValue">
              <p v-if="inputError" class="text-danger">{{ inputError }}</p>
          </div>
          <button id="submitbutton" type="submit" class="hidden" />
        </form>
        <div v-if="depositAsset && receiptAsset && conversionRate" class="expected-amount">
          <div class="amount">
            
            {{ `${amount}` | numberFormat }} {{`${depositAsset.code.toUpperCase()}` }} ({{ `${receiptAmount}` | numberFormat }} {{ `${receiptAsset.code.toUpperCase()}` }})
          </div>
          <div class="exchange-rate">
            1 {{ `${depositAsset.code.toUpperCase()}` }} = {{ `${conversionRate.toFixed(8).replace(/(?:\.)?0+$/, "")}` | numberFormat }} {{ `${receiptAsset.code.toUpperCase()}` }}
          </div>
        </div>
        <label :disabled="!isValidated" 
            for="submitbutton" tabindex="0" class="convert btn-custom-astronaut-blue">
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
      inputError: false
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
    receiptAssets() {
      return this.assets.filter(asset => this.depositAsset === null || asset._id !== this.depositAsset._id)
    },
    depositAssets() {
      let depositAsset = this.assets;
      return depositAsset;
    },
    checkMinValue() {
      if (this.depositAsset === null) {
        return '';
      } else {
        return this.depositAsset.minDepositAmount;
      }
    },
    checkMaxValue() {
      if (this.depositAsset === null) {
        return '';
      } else {
        return this.depositAsset.maxDepositAmount;
      }
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
    amount(newAmount, previousAmount) {

      if (parseInt(newAmount) > this.checkMaxValue) {
        if (this.checkMaxValue == '') {
          this.inputError = 'Please choose a deposit currency';
        } else {
          this.inputError = 'value cannot be greater than ' + Number(this.checkMaxValue).toLocaleString();
        }
        // this.amount = Math.max(Math.min(newAmount,this.checkMaxValue));
        this.amount = previousAmount;
        console.log(newAmount, previousAmount);

      } else if (parseInt(newAmount) < 0) {
        this.inputError = 'value cannot be lower than 0';
        this.amount = '';
      } else if (this.amount == '') {
        this.inputError = '';
      }
    }
  },
  created() {
    this.$request('GET', '/assets/', (err, res) => {
      if (err) {
        console.error("couldn't load assets");
      } else {
        this.assets = res;
        let resLength = res.length;
        this.depositAsset = res[0];
        this.receiptAsset = res[resLength - 1];
        this.amount = this.depositAsset.minDepositAmount;
      }
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
      sessionStorage.transaction = JSON.stringify({
        depositAsset: this.depositAsset,
        receiptAsset: this.receiptAsset,
        amount: this.amount,
        rate: this.conversionRate,
      });
      if (!this.global.user) {
        return this.$router.push({
          path: '/login',
          query: {
            message: 'Login to continue',
            nextPage: {
              path: '/transaction/destination',
            },
          },
        });
      }
      this.$router.push('transaction/payment');
    },
  },
};
</script>
