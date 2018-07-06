<template>
    <div id="transaction-page">
    <div class="modal-component exchange-modal verified in">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header clearfix">
            <span class="modal-title">
              Verified
            </span>
            <button
              v-if="!id"
              type="button"
              data-dismiss="modal"
              @click="goBack"/>
          </div>
          <div class="modal-body">
            <div class="modal-body__container">
              <div
                id="payment"
                class="modal__pane">
                <div class="modal__title">
                  <span>Order ID</span>: {{ id }}
                </div>
                <div class="payment-address__table-md">
                  <div class="payment-address__table-row">
                    <div class="payment-address__table-cell payment-address__qr-code">
                      <img
                        src="~img/qr-code.png"
                        alt="QR Code">
                    </div>
                    <div class="payment-address__table-cell payment-address__description">

                      <!-- IF FIAT, REMOVE hidden FROM THE FOLLOWING DIV -->
                      <div
                        v-if="isFiat"
                        class="description__fiat">
                        <div class="title">
                          Click to pay online
                        </div>
                        <div class="body">
                          <p>
                            <span>Amount:</span>
                            <i class="naira"/>{{ amount }}
                          </p>
                        </div>
                        <button class="btn-custom-astronaut-blue small description__call-to-action">
                          Pay now
                        </button>
                      </div>
                      <!--  -->

                      <!-- IF CRYPTOCURRENCY, REMOVE hidden FROM THE FOLLOWING DIV -->
                      <div
                        v-else
                        class="description__cryptocurrency">
                        <div class="title">
                          Send to this address:
                        </div>
                        <div class="body">
                          <p>
                            {{ depositAsset.depositAddress }}
                          </p>
                          <p>
                            <span>Amount:</span> {{ amount }}
                          </p>
                        </div>
                      </div>
                      <!--  -->

                    </div>
                  </div>
                </div>
                <div class="progress__indicator">
                  <div class="indicator__label">
                    {{ transaction.status | capitalize }}
                  </div>
                  <div class="indicator__composite">
                    <div class="indicator__bg"/>
                    <div
                      class="indicator__progress"
                      style="width:20%"/>
                  </div>
                  <div class="indicator__progress-value">
                    20%
                  </div>
                </div>
              </div>
            </div>
            <div class="order-details">
              <div
                v-if="depositAsset && receiptAsset && conversionRate"
                class="transaction__type">
                <img
                  :src="global.apiRootUrl + '/' + depositAsset.imagePath"
                  :alt="depositAsset.name"> →
                <img
                  :src="global.apiRootUrl + '/' + receiptAsset.imagePath"
                  :alt="receiptAsset.name">
              </div>
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

            </div>
          </div>

        </div>
      </div>

    </div>

  </div>
</template>
