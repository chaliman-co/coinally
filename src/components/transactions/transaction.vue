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
              <img
                src="~img/qr-code.png"
                class="qr-code"
                alt="QR Code">
              <div class="progress__indicator">
                <div class="indicator__label">
                  {{ transaction.status }}
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
                    src="https://shapeshift.io/images/coins/bitcoin.png"
                    alt="Bitcoin"> &rarr;
                  <img
                    src="https://shapeshift.io/images/coins/ether.png"
                    alt="Ether">
                </div>
                <div class="amount">
                  <span title="Deposit">D:</span> {{ transaction.depositAmount }} {{ transaction.depositAssetCode }},
                  <span title="Receive">R:</span> {{ transaction.receiptAmount }} {{ transaction.receiptAssetCode }}
                </div>
                <div class="exchange-rate">
                  1 {{ transaction.depositAssetCode }} = {{ transaction.rate }} {{ transaction.receiptAssetCode }}
                </div>
              </div>
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
                    :disabled="statuses.indexOf(transaction.status) >= index"
                    :value="option">{{ option }}</option>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import jQuery from 'jquery';

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
      statuses: ['initialized', 'payment_received', 'completed', 'failed'],
      isAdmin: this.global.user.role === 'admin',
      isSaving: false,
    };
  },
  computed: {
    progress() {
      const index = this.statuses.indexOf(this.transaction.status) + 1;

      if (index === 0) return 0;

      return (index / this.statuses.length) * 100;
    },
  },
  methods: {
    open(transaction) {
      this.transaction = transaction;
      this.selectedStatus = transaction.status;

      jQuery('#view-transaction').modal('show');
    },
    close() {
      jQuery('#view-transaction').modal('hide');
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
