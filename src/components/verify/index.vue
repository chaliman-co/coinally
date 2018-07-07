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
        <a href="" class="btn-custom-astronaut-blue small" data-toggle="modal" data-target="#exchange-modal">
            <i class="fa fa-plus"></i> New Transaction
        </a>

                            <a href="verify.html" class="btn-custom-transparent-astronaut-blue small">
                                Verify Details
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="dashboard__body">

                <div class="dashboard__verify">
                    <img src="src/img/verify.svg" alt="Verify" class="icon">
                    <div class="title">
                        Verify your account
                    </div>
                    <h2 class="text-danger error-summary">{{errorSummary}}</h2>
                    <div class="input-fields">
                        <form @submit.prevent="upload({ bvn })">
                            <div class="textbox-component custom-form-group">
                                <label for="bvn">
                                    Bank Verification Number (BVN)
                                </label>
                                <input id="bvn" v-model="bvn" placeholder="0..." pattern="^\d{11}$" type="text">
                            </div>
                            <button type="submit" class="finish btn-custom-astronaut-blue" :disabled="!bvnIsValidated || isWaiting">
                                {{isSendingBvn? 'Sending...': 'Upload' }}
                            </button>
                        </form>
                        <div class="divider">
                            OR
                        </div>
                        <div class="document-upload">
                            <div class="document-upload__instruction">
                                Upload either National ID Card, International Passport, Driver's License or any Govt. Issued ID plus Utility Bill
                            </div>
                            <form @submit.prevent="upload({ idCardName, idCardImage })">
                                <div class="textbox-component custom-form-group">
                                    <label for="name">
                                        Name of id card(e.g Voter's card)
                                    </label>
                                    <input id="name" v-model="idCardName" placeholder="voter's card" type="text">
                                </div>
                                <div class="textbox-component custom-form-group">
                                    <label for="image">
                                        image
                                    </label>
                                    <input type="file" @change="idCardImage = $event.target.files[0]" id="image" accept="image/*" />
                                </div>
                                <button type="submit" class="finish btn-custom-astronaut-blue" :disabled="!idCardIsValidated || isWaiting">
                                    {{isSendingIdCard? 'Sending...': 'Upload' }}
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
import sideBar from './../sideBar';
import transactionModal from '../transactionModal.vue';

export default {
    inject: ['global'],
    components: {
        sideBar,
        transactionModal
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
        }
    },
    computed: {
        idCardIsValidated() {
            return !(Object.keys(this.idCardValidationError).length)
        },
        bvnIsValidated() {
            return !(Object.keys(this.bvnValidationError).length)
        },
        bvnValidationError() {
            const error = {};
            if (!this.bvn || !/^\d{11}$/.test(this.bvn)) error.bvn = 'invalid';
            const bvnError = this.requestErrors.bvn;
            if (bvnError) error.bvn = bvnError;
            return error
        },
        idCardValidationError() {
            const error = {};
            if (!this.idCardImage) error.idCardImage = 'invalid';
            if (!this.idCardName) error.idCardName = 'invalid';
            const idCardImageError = this.requestErrors.idCardImageError;
            const idCardNameError = this.requestErrors.idCardNameError;
            if (idCardNameError) error.idCardName = idCardNameError;
            if (idCardImageError) error.idCardImage = idCardImageError;
            return error
        }
    },
    methods: {
        upload({ bvn, idCardImage, idCardName } = {}) {
            console.log("called!", bvn, idCardImage, idCardName)
            let postData = {};
            let sendState;
            if (bvn) {
                postData.type = 'bvn';
                postData.number = bvn;
                sendState = this.isSendingBvn;

            }
            else {
                postData = objectToFormData({ type: 'id_card', image: idCardImage });
                sendState = this.isSendingIdCard;
            }
            sendState = this.isWaiting = true;
            this.global.request('POST', `/users/${this.global.user._id}/verification_details`, postData, (err, res) => {
                sendState = this.isWaiting = false;
                if (err) { this.errorHandler(err); return console.log('error: ', err, err.response) }
                console.log('success')
                this.errorSummary = '';
                this.requestErrors = {};
                return this.global.user.verificationDetails.push(res);
            })
        },
        errorHandler(err) {
            if (err.message == 'Network Error') {
                return this.errorSummary = 'Network Error';
            };
            if (Math.floor(err.response.status / 100) == 4) this.errorSummary = 'validation failed';
            else this.errorSummary = 'internal server error';
            let serverResponse = err.response.data;
            for (let field in serverResponse.errors.errorDetails) {
                this.requestErrors[field] = serverResponse.errors.errorDetails[field];
            };
            /* remove later */
            this.validationFailed = true;
        },

    },
}
var objectToFormData = function(obj, form, namespace) {
    var fd = form || new FormData();
    var formKey;
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (namespace) {
                formKey = namespace + '[' + property + ']';
            } else {
                formKey = property;
            }
            if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
                objectToFormData(obj[property], fd, property);
            } else {
                fd.append(formKey, obj[property]);
            }
        }
    }
    return fd;
};
</script>
<style>
.error-summary {
    text-align: center;
}
</style>
