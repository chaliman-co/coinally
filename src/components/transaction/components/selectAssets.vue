<template>
  <div>
    <div class="modal-header clearfix">
      <span class="modal-title">
        Verified
      </span>
      <button 
type="button"
              data-dismiss="modal"/>
    </div>
    <div class="modal-body">
      <div class="modal-body__container">
        <div id="assets-selection" 
class="modal__pane">
          <div class="modal__title">
            Choose which assets to trade
          </div>

          <form 
class="input-fields"
                @submit.prevent="proceed">
            <div class="select-component custom-form-group">
              <label for="deposit">Deposit</label>
              <vue-select 
:options="assets"
                          label="name" 
@input="dispatch('set_deposit_asset', $event)">
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
              <label for="receive">Receive</label>
              <vue-select 
:options="assets"
                          label="name" 
@input="dispatch('set_receipt_asset', $event)">
                <template 
                slot="option"
                          slot-scope="option">
                  <img 
:src="`${global.apiRootUrl}/${option.imagePath}`"
                       style="height:2rem; margin-right: .3rem; margin-bottom: 0; line-height: 1"> {{ option.name }}
                </template>
              </vue-select>
            </div>
            <div class="textbox-component custom-form-group">
              <label for="amount">
                Amount (Min: 0, Max: 100)
              </label>
              <input type="number" 
:value="amount" @input="commit('set_amount', $event.target.value)" id="amount" placeholder="0" step="0.00000000001" >
            </div>
            <button 
id="submitbutton"
                    type="submit" 
class="hidden"/>
          </form>
          <label 
:disabled="!isValidated" 
for="submitbutton" 
tabindex="0" class="convert btn-custom-astronaut-blue">
            Convert
          </label>

        </div>
      </div>

    </div>
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex';
import vueSelect from 'vue-select';

export default {
  inject: ['global'],
  computed: Object.assign(
    {
      isValidated() {
        return !!(this.depositAsset && this.receiptAsset);
      },
    }, mapState([
      'depositAsset',
      'receiptAsset',
      'assets',
      'amount',
      'request',
      'conversionRate']),
    mapGetters(['receiptAmount']),
  ),
  methods: {
    commit(mutation, payload) {
      this.$store.commit(mutation, payload);
    },
    dispatch(action, payload) {
      this.$store.dispatch(action, payload);
    },
    setSelect(inputId, modeProp, value) {
      const input = document.getElementById(inputId);
      if (!input) return;
      this[modeProp] = value;
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
      this.$router.push({
        path: '/transaction/account',
        query: {
          deposit: this.depositAsset.code,
          receipt: this.receiptAsset.code,
          amount: this.amount,
        },
      });
    },
  },
  components: {
    'vue-select': vueSelect,
  },
};
</script>

