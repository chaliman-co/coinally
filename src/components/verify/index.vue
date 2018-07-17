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
                Verify Account
              </div>
            </div>
            <div class="top-bar__table-cell top-bar__controls">
              <a
                href=""
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
      <div class="dashboard__body">

        <div class="dashboard__verify">
          <img
            src="src/img/verify.svg"
            alt="Verify"
            class="icon">
          <div class="title">
            Verify your account
          </div>
          <p class="text-danger error-summary"><strong>{{ errorSummary }}</strong></p>
          <div class="input-fields">
            <form @submit.prevent="upload({ bvn })">
              <div class="textbox-component custom-form-group">
                <label for="bvn">
                  Bank Verification Number (BVN)
                </label>
                <input
                  id="bvn"
                  v-model="bvn"
                  placeholder="0..."
                  pattern="^\d{11}$"
                  type="text">
              </div>
              <button
                :disabled="!bvnIsValidated || isWaiting"
                type="submit"
                class="finish btn-custom-astronaut-blue">
                {{ isSendingBvn? 'Sending...': 'Upload' }}
              </button>
            </form>
            <div class="divider">
              OR
            </div>
            <div class="document-upload">
              <div class="document-upload__instruction">
                Upload either National ID Card,
                International Passport, Driver's License or any Govt.
                Issued ID plus Utility Bill
              </div>
              <form @submit.prevent="upload({ idCardName, idCardImage })">
                <div class="textbox-component custom-form-group">
                  <label for="name">
                    Name of id card(e.g Voter's card)
                  </label>
                  <input
                    id="name"
                    v-model="idCardName"
                    placeholder="voter's card"
                    type="text">
                </div>
                <div class="textbox-component custom-form-group">
                  <label for="image">
                    image
                  </label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    @change="idCardImage = $event.target.files ? $event.target.files[0] : null" >
                </div>
                <button
                  :disabled="!idCardIsValidated || isWaiting"
                  type="submit"
                  class="finish btn-custom-astronaut-blue">
                  {{ isSendingIdCard? 'Sending...': 'Upload' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import sideBar from './../sideBar.vue';
import transactionModal from '../transactionModal.vue';

export default {
    inject: ['global'],
    components: {
        sideBar,
        transactionModal,
    },
    data() {
        return {
            isSendingBvn: false,
            isSendingIdCard: false,
            isWaiting: false,
            errorSummary: '',
            requestErrors: {},
            idCardImage: undefined,
            idCardName: undefined,
            bvn: undefined,
        };
    },
    computed: {
        idCardIsValidated() {
            return !(Object.keys(this.idCardValidationError).length);
        },
        bvnIsValidated() {
            return !(Object.keys(this.bvnValidationError).length);
        },
        bvnValidationError() {
            const error = {};
            if (!this.bvn || !/^\d{11}$/.test(this.bvn)) {
                error.bvn = 'invalid';
            }
            const { bvn } = this.requestErrors;
            if (bvn) {
                error.bvn = bvn;
            }
            return error;
        },
        idCardValidationError() {
            const error = {};
            if (!this.idCardImage) error.idCardImage = 'invalid';
            if (!this.idCardName) error.idCardName = 'invalid';
            const { idCardImageError, idCardNameError } = this.requestErrors;
            if (idCardNameError) error.idCardName = idCardNameError;
            if (idCardImageError) error.idCardImage = idCardImageError;
            return error;
        },
    },
    methods: {
        upload({ bvn, idCardImage, idCardName } = {}) {
            let postData = {};
            if (bvn) {
                postData.type = 'bvn';
                postData.name = 'bvn';
                postData.number = bvn;
            } else {
                postData = new FormData();
                postData.append('type', 'id card');
                postData.append('name', idCardName);
                postData.append('image', idCardImage);
            }
            this.isWaiting = true;
            this.global.request('POST', `/users/${this.global.user._id}/verification_details`, postData, (err, res) => {
                this.isWaiting = false;
                if (err) {
                    this.errorHandler(err);
                } else {
                    this.errorSummary = '';
                    this.requestErrors = {};
                    this.global.user.verificationDetails.push(res);
                }
            });
        },
        errorHandler(err) {
            if (err.message === 'Network Error') {
                this.errorSummary = 'Network Error';
            } else if (Math.floor(err.response.status / 100) === 4) {
                 this.errorSummary = 'validation failed';
            } else {
                this.errorSummary = 'internal server error';
            }
            const serverResponse = err.response.data;
            this.requestErrors = { ...serverResponse.errors.errorDetails };
            // for (const field in serverResponse.errors.errorDetails) {
            //     this.requestErrors[field] = serverResponse.errors.errorDetails[field];
            // }
            /* remove later */
            this.validationFailed = true;
        },

    },
};
</script>
<style>
.error-summary {
    text-align: center;
}
</style>
