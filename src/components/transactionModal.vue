<template>
    <div>
        <div class="modal-component modal fade exchange-modal verified" id="exchange-modal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header clearfix">
                        <!-- CHANGE THE TEXT IN THE FOLLOWING DIV TO BE EITHER Verified OR Not Verified BASED ON THE VERIFICATION OF THE USER -->
                        <!-- <span class="modal-title">
                            Verified
                        </span> -->
                        <button type="button" data-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="modal-body__container">
                            <form @submit.prevent="proceed" class="modal__pane" id="assets-selection">
                                <div class="modal__title">
                                    Choose which assets to trade
                                </div>
                                <div class="input-fields">
                                    <div class="select-component custom-form-group">
                                        <label for="deposit">
                                            Deposit
                                        </label>
                                        <vue-select :options="depositAssets" v-model="depositAsset" input-id="deposit" label="name">
                                        <template slot="option" slot-scope="option">
                                            <img :src="`${global.apiRootUrl}/${option.imagePath}`" 
                                            style="height:2rem; margin-right: .3rem; margin-bottom: 0; line-height: 1"> {{ option.name }}
                                        </template>
                                        </vue-select>
                                    </div>
                                    <div class="select-component custom-form-group">
                                        <label for="receive">
                                            Receive
                                        </label>
                                        <vue-select :options="receiptAssets" v-model="receiptAsset" input-id="receipt" label="name">
                                        <template slot="option" slot-scope="option">
                                            <img :src="`${global.apiRootUrl}/${option.imagePath}`" 
                                            style="height:2rem; margin-right: .3rem; margin-bottom: 0; line-height: 1"> {{ option.name }}
                                        </template>
                                        </vue-select>
                                    </div>
                                    <div class="textbox-component custom-form-group">
                                        <label for="amount">
                                            Amount (Min: {{ checkMinValue.toString() | numberFormat }} Max: {{ checkMaxValue.toString() | numberFormat}})
                                        </label>
                                        <input id="amount" 
                                            v-model="amount" type="number" placeholder="0" step="0.0000001" :min="checkMinValue" :max="checkMaxValue">
                                            <p v-if="inputError" class="text-danger">{{ inputError }}</p>
                                    </div>
                                </div>

                                <button type="submit" class="call-to-action btn-custom-astronaut-blue toggle-pane">
                                    Convert
                                </button>
                            </form>
                        </div>
                        <div class="order-details"
                            v-if="depositAsset && receiptAsset && conversionRate">
                            <div class="transaction__type">
                                <img
                                :src="global.apiRootUrl + '/' + depositAsset.imagePath"
                                :alt="depositAsset.name"> →
                                <img
                                :src="global.apiRootUrl + '/' + receiptAsset.imagePath"
                                :alt="receiptAsset.name">
                            </div>
                            <div class="amount">
                                <span title="Deposit">D:</span>{{amount | numberFormat}} {{depositAsset.code.toUpperCase()}},
                                <span title="Receive">R:</span>{{receiptAmount.toFixed(8) | numberFormat}} {{receiptAsset.code.toUpperCase()}}
                            </div>
                            <div class="exchange-rate">
                                {{ `1 ${depositAsset.code.toUpperCase()} = ${conversionRate.toFixed(8).replace(/(?:\.)?0+$/, "")}${receiptAsset.code.toUpperCase()}` }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Dashboard Sidebar Partial -->
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
        if (isNaN(this.amount) || isNaN(this.conversionRate)) return 0;
        return this.conversionRate * this.amount;
      },
      isValidated() {
        return !!(this.depositAsset && this.receiptAsset);
      },
      receiptAssets(){
        return this.assets.filter(asset => this.depositAsset === null || asset._id !== this.depositAsset._id)
      },
      depositAssets(){
        let depositAsset = this.assets;
        return depositAsset;
      },
      checkMinValue(){
        if(this.depositAsset === null){
          return '';
        } else {
          return this.depositAsset.minDepositAmount;
        }
      },
      checkMaxValue(){
        if(this.depositAsset === null){
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
      amount(newAmount, previousAmount){
          
          if(parseInt(newAmount) > this.checkMaxValue){
              if(this.checkMaxValue == ''){
                this.inputError = 'Please choose a deposit currency';
              }else {
                this.inputError = 'value cannot be greater than '+Number(this.checkMaxValue).toLocaleString();
              }
              this.amount = previousAmount;
              
          } else if(parseInt(newAmount) < 0){
              this.inputError = 'value cannot be lower than 0';
              this.amount = '';
          } else if(this.amount == '') {
              this.inputError = '';
          }
      }
    },
    created() {
      this.$request('GET', '/assets/', (err, res) => {
        if (err) {
          console.error("couldn't load assets");
        }else{
          this.assets = res;
          let resLength = res.length;
          this.amount = 1;
          this.depositAsset = res[0];
          this.receiptAsset = res[resLength - 1];
        }
      });
    },
    methods: {
      UpdateRate(query) {
        if (!this.socket) {
          const socket = socketIoClient(`${this.global.apiRootUrl}/rates`, {
            reconnectionDelay: 10000,
            query,
          });
          
          socket.on('new_rate', (rate) => {
            this.conversionRate = rate;
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

        window.jQuery('#exchange-modal').modal('hide');
        this.$router.push('transaction/payment');
      },
      
      
    },
  };
</script>
