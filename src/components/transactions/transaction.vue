<template>
  <div
    id="view-transaction"
    class="modal-component modal fade view-transaction-modal default">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">
            View transaction
          </span>
          <button
            type="button"
            data-dismiss="modal"/>
        </div>
        <div class="modal-body">
          <div class="modal-body__container">
            <div class="modal__pane clearfix">
              <div class="modal__title">
                <span>Order ID</span>: {{ transaction._id }}
              </div>
              <div
                v-show="transaction.cardDetail"
                class="row text-center">
                <h3><strong>Card Details</strong></h3>
                <div :class="transaction.cardDetail && transaction.cardDetail.receiptUrl ? 'col-md-6' : 'col-md-12'">
                  <h4><strong>Card Image</strong></h4>
                  <img
                    :src="$generateUrl(transaction.cardDetail ? transaction.cardDetail.imageUrl : '')"
                    :data-zoom="$generateUrl(transaction.cardDetail ? transaction.cardDetail.imageUrl : '')"
                    class="zoomable-img"
                    width="100%"
                    alt="Card Detail">
                </div>
                <div
                  v-show="transaction.cardDetail && transaction.cardDetail.receiptUrl"
                  class="col-md-6">
                  <h4><strong>Receipt Image</strong></h4>
                  <img
                    :src="$generateUrl(transaction.cardDetail ? transaction.cardDetail.receiptUrl : '')"
                    :data-zoom="$generateUrl(transaction.cardDetail ? transaction.cardDetail.receiptUrl : '')"
                    class="zoomable-img"
                    width="100%"
                    alt="Card Detail">
                </div>
              </div>
              <img
                src="~img/qr-code.png"
                class="qr-code hidden"
                alt="QR Code">
              <div class="progress__indicator">
                <div class="indicator__label">
                  {{ transaction.status | capitalize }}
                </div>
                <div class="indicator__composite">
                  <div class="indicator__bg"/>
                  <div
                    :style="{width: progress + '%'}"
                    class="indicator__progress"/>
                </div>
                <div class="indicator__progress-value">
                  {{ progress }}%
                </div>
              </div>
              <div class="order-details custom-form-group">
                <div class="transaction__type">
                  <img
                    :src="$generateUrl(transaction.depositAsset.imagePath)"
                    :alt="transaction.depositAsset.name"> ???
                  <img
                    :src="$generateUrl(transaction.receiptAsset.imagePath)"
                    :alt="transaction.receiptAsset.name">
                </div>
                <div class="amount">
                  <span title="Deposit">D:</span>
                  {{ transaction.depositAmount.toString() | numberFormat }}
                  {{ transaction.depositAssetCode }},
                  <span title="Receive">R:</span>
                  {{ transaction.receiptAmount.toString() | numberFormat }}
                  {{ transaction.receiptAssetCode }}
                </div>
                <div class="exchange-rate">
                  1 {{ transaction.depositAssetCode }} =
                  {{ transaction.rate.toString() | numberFormat }}
                  {{ transaction.receiptAssetCode }}
                </div>
              </div>
              <template v-if="user.role === 'admin'">
                <div class="select-component custom-form-group">
                  <label for="status">
                    Status
                  </label>
                  <select
                    id="status"
                    v-model="selectedStatus"
                    name="status"
                    class="custom-select-no-title"
                    title="Status...">
                    <option
                      v-for="(option, index) in statuses"
                      :key="index"
                      :disabled="statuses.indexOf(transaction.status) >= index "
                      :value="option">{{ option | capitalize }}</option>
                  </select>
                </div>
                <button
                  :disabled="isSaving"
                  class="call-to-action btn-custom-astronaut-blue"
                  @click="save">
                  Save
                  <i
                    v-if="isSaving"
                    class="fa fa-spinner fa-pulse"/>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import jQuery from 'jquery';
import bootstrap from 'bootstrap3';
import Drift from 'drift-zoom';

import { mapState } from 'vuex';
import utils from '../../utils';

// const jQuery = window.jQuery;

export default {
  inject: ['global'],
  data() {
    return {
      transaction: {
        _id: null,
        status: null,
        depositAsset: {

        },
        depositAssetCode: null,
        depositAmount: 0,
        receiptAsset: {

        },
        receiptAssetCode: null,
        receiptAmount: 0,
        rate: 0,
      },
      selectedStatus: null,
      statuses: utils.getStatus(),
      isSaving: false,
    };
  },
  computed: Object.assign({
    progress() {
      const index = this.statuses.indexOf(this.transaction.status);

      if (index === 0) return 0;

      return (index / (this.statuses.length - 1)) * 100;
    },
    isAdmin() {
      this.$request(this.user && this.user.role === 'admin');
      return this.user && this.user.role === 'admin';
    },
  }, mapState(['user'])),
  methods: {
    open(transaction) {
      this.transaction = transaction;
      this.selectedStatus = transaction.status;

      const elements = document.getElementsByClassName('zoomable-img');

      for (let i = 0; i < elements.length; i++) {
        const drift = new Drift(elements[i], {
          zoomFactor: 2,
        });
      }

      window.jQuery('#view-transaction').modal('show');
    },
    close() {
      window.jQuery('#view-transaction').modal('hide');
    },
    save() {
      const data = { status: this.selectedStatus };
      const url = `/transactions/${this.transaction._id}/status`;

      this.isSaving = true;

      this.global.request('PUT', url, data, (err, response) => {
        this.isSaving = false;

        if (!err) {
          this.$emit('statusChanged', this.transaction, response);
          this.close();
        }
      });
    },
  },
};
</script>

<style>
  .drift-zoom-pane.drift-open{
    z-index: 10000;
  }
</style>
