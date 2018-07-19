<template>
  <div
    id="payment"
    class="modal__pane">
    <!-- <div class="modal__title">
        <span>Order ID</span>: {{ id }}
    </div> -->
    <div class="payment-address__table-md">
      <p
        v-if="errorMessage"
        class="text-danger">{{ errorMessage }}</p>
      <div
        v-if="isFiat"
        class="payment-address__table-row">
        <div class="payment-address__table-cell payment-address__description">
          <div class="description__fiat">
            <div class="title">
              Click to pay online
            </div>
            <div class="body">
              <p>
                <span>Amount:</span>
                <i class="naira" />{{ transaction.amount | numberFormat }}
              </p>
            </div>
            <button
              :disabled="isLoading"
              class="btn-custom-astronaut-blue small description__call-to-action"
              @click="pay">
              Pay now
              <i
                v-if="isLoading"
                class="fa fa-spinner fa-pulse"/>
            </button>
          </div>
        </div>
        <div class="payment-address__table-cell">
          <div class="description__fiat">
            <div class="title">
              OR
            </div>
            <div class="body">
              <p>
                <strong>Pay to</strong>
                <br> {{ depositAsset.depositAddress.name }}
                <br> {{ depositAsset.depositAddress.number }}
                <br> {{ depositAsset.depositAddress.bankName }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else-if="isDigital"
        class="payment-address__table-row">
        <div class="payment-address__table-cell payment-address__qr-code">
          <img
            :src="`https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${depositAsset.depositAddress}`"
            alt="QR Code">
        </div>
        <div class="payment-address__table-cell payment-address__description">
          <div class="description__cryptocurrency">
            <div class="title">
              Send to this address:
            </div>
            <div class="body">
              <p>
                {{ depositAsset.depositAddress }}
              </p>
              <p>
                <span>Amount:</span> {{ transaction.amount | numberFormat }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="payment-address__table-row">
        <div class="payment-address__table-cell payment-address__description">
          <div class="description__fiat">
            <div class="title">
              Upload Card Details:
            </div>
            <div class="body">
              <p>
                <span>Amount:</span> {{ transaction.amount | numberFormat }}
              </p>
            </div>
          </div>
        </div>
        <div class="payment-address__table-cell">

          <div class="description__fiat ">
            <div class="">
              <p><strong>Card Details</strong></p>
              <button
                class="btn-custom-astronaut-blue small"
                @click="launchFileInput('cardInput')">
                Upload
              </button>
              <span v-if="cardFile">{{ cardFile.name | truncate(5) }}</span>
              <br>
              <p><strong>Card receipt (optional)</strong></p>
              <button
                class="btn-custom-astronaut-blue small"
                @click="launchFileInput('cardReceipt')">
                Upload
              </button>
              <span v-if="cardReceipt">{{ cardReceipt.name | truncate(5) }}</span>
              <input
                id="cardReceipt"
                type="file"
                class="hidden"
                @change="cardReceiptChange">
              <input
                id="cardInput"
                type="file"
                class="hidden"
                @change="cardFileChange">
            </div>
          </div>
        </div>
      </div>
    </div>
    <button
      :loading="isUploading"
      class="call-to-action btn-custom-astronaut-blue"
      @click="start">
      Continue
      <i
        v-if="isUploading"
        class="fa fa-spinner fa-pulse"/>
    </button>
  </div>
</template>

<script>
import utils from '../../utils';

export default {
    data() {
        return {
            transaction: {

            },
            depositAsset: {},
            reference: null,
            isLoading: false,
            isUploading: false,
            cardFile: null,
            cardReceipt: null,
            errorMessage: null,
        };
    },
    computed: {
        isFiat() {
            return this.depositAsset.type === 'fiat';
        },
        isDigital() {
            return this.depositAsset.type === 'digital';
        },
    },
    created() {
        this.initialize();
    },
    methods: {
        cardFileChange($event) {
            this.onFileChange($event, 'cardFile');
        },
        cardReceiptChange($event) {
            this.onFileChange($event, 'cardReceipt');
        },
        onFileChange($event, store) {
            const { files } = $event.target;
            if (files.length > 0) {
                const [file] = files;
                this[store] = file;
            }
        },
        launchFileInput(id) {
            document.getElementById(id).click();
        },
        start() {
            if (!this.isFiat && !this.isDigital) {
                this.processCard();
            } else {
                this.goNext();
            }
        },
        goNext() {
            sessionStorage.setItem('transaction', JSON.stringify(this.transaction));
            this.$router.push('/transaction/destination');
        },
        processCard() {
            const data = new FormData();
            if (!this.cardFile) {
                this.setErrorMessage('Please upload an image of the card');
                return;
            }

            data.append('files', this.cardFile);

            if (this.cardReceipt) {
                data.append('files', this.cardReceipt);
            }

            this.isUploading = true;
            this.$request('POST', '/uploads', data, (err, result) => {
                this.isUploading = false;
                if (!err) {
                    const hasError = result.filter(f => f.error).length;

                    if (!hasError) {
                        const cardDetail = {
                            imageUrl: result[0].url,
                            receiptUrl: result.length > 1 ? result[1].url : undefined,
                        };

                        this.transaction.cardDetail = cardDetail;
                        this.goNext();
                    } else {
                        this.setErrorMessage('Failed to upload files. Please try again');
                    }
                } else {
                    this.setErrorMessage('Failed to upload files. Please try again');
                }
            });
        },
        pay() {
            this.isLoading = true;

            const url = '/transactions';
            const data = {
                depositAmount: this.transaction.amount,
                depositAssetCode: this.transaction.depositAsset.code,
                receiptAssetCode: this.transaction.receiptAsset.code,
                user: this.$store.state.user._id,
            };

            this.$request('POST', url, data, (err, result) => {
                this.isLoading = false;
                if (!err) {
                    this.reference = result._id;
                    this.transaction.id = result._id;
                    this.payWithPaystack();
                }
            });
        },
        setErrorMessage(message) {
            this.errorMessage = message;
            setTimeout(() => {
                this.errorMessage = null;
            }, 5000);
        },
        payWithPaystack() {
            this.isLoading = true;
            const options = {
                key: utils.paystackKey,
                email: this.$store.state.user.emailAddress,
                amount: this.transaction.amount * 100,
                ref: this.reference,
                currency: this.depositAsset.code,
                callback: (response) => {
                    this.verifyPayment(response);
                },
                onClose: () => {
                    this.isLoading = false;
                },
            };

            const handler = window.PaystackPop.setup(options);
            handler.openIframe();
        },
        verifyPayment() {
            const url = `/transactions/${this.reference}/payment/verify`;

            this.$request('PUT', url, null, (err) => {
                this.isLoading = false;
                if (!err) {
                    this.start();
                }
            });
        },
        initialize() {
            const transaction = sessionStorage.getItem('transaction');
            if (transaction) {
                this.transaction = JSON.parse(transaction);
                this.depositAsset = this.transaction.depositAsset;
            } else {
                this.$router.go(-1);
            }
        },
    },
};
</script>
