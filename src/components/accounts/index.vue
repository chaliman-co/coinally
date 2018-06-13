<template>
    <div class="dashboard-page">
        <side-bar></side-bar>

        <div class="dashboard__content">
            <div class="dashboard__top-bar">
                <div class="top-bar__table-md">
                    <div class="top-bar__table-row">
                        <div class="top-bar__table-cell top-bar__title">
                            <div class="title">
                                Bank Accounts
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
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h4 class="panel-title">
                        <button class="btn-custom-japanese-laurel small" data-toggle="collapse" data-target="#collapseOne">
                            <i class="fa fa-plus"></i> New Bank Account
                        </button>
                    </h4>
                </div>
                <div id="collapseOne" class="panel-collapse collapse">
                    <div class="panel-body">
                        <h2 class="text-danger error-summary">{{errorSummary}}</h2>
                        <form class="input-fields" @submit.prevent="submit">
                            <div class="row custom-form-group">
                                <div class="textbox-component custom-form-group col-md-6 col-md-offset-3">
                                    <label for="name">
                                        Account Name
                                        <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.name}}</font>
                                    </label>
                                    <input type="text" v-model="form.address.name" id="name" placeholder="account name" required/>
                                </div>
                                <div class="textbox-component custom-form-group col-md-6 col-md-offset-3">
                                    <label for="number">
                                        Account Number
                                        <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.number}}</font>
                                    </label>
                                    <input type="text" v-model="form.address.number" id="number" pattern="\d{10}" placeholder="account number..." required/>
                                </div>
                                <div class="textbox-component custom-form-group col-md-6 col-md-offset-3">
                                    <label for="bank-name">
                                        Bank
                                        <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.bankName}}</font>
                                    </label>
                                    <input type="text" v-model="form.address.bankName" id="bank-name" placeholder="eg. First Bank" required/>
                                </div>
                                <div class="select-component custom-form-group  col-md-6 col-md-offset-3">
                                    <label for="asset">Currency</label>
                                    <vue-select :options="assets.filter(asset => asset.type == 'fiat')" inputId="asset" :on-change="val => setSelect('asset', 'form.asset', val && val._id)" label="name">
                                        <template slot="option" slot-scope="option">
                                            <img :src="`${global.apiRootUrl}/${option.imagePath}`" style="height:2rem; margin-right: .3rem; margin-bottom: 0; line-height: 1"> {{option.name}}
                                        </template>
                                    </vue-select>
                                </div>
                            </div>
                            <div class="custom-form-group col-md-6 col-md-offset-3">
                                <button type="submit" style="width:100%" class="call-to-action btn-custom-astronaut-blue" :disabled="!isValidated || isWaiting">
                                    {{isWaiting? 'Sending...': 'Add' }}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
            <div class="dashboard__bank-account">
                <div class="bank-account__table">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Account Name</th>
                                    <th>Account Number</th>
                                    <th>Bank</th>
                                    <th>Verified</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-if="global.user">
                                    <tr v-if="assetAccount" v-for="(assetAccount, index) in bankAccounts" :key="index">
                                        <td>{{index + 1}}.</td>
                                        <td>{{assetAccount.address.name}}</td>
                                        <td>{{assetAccount.address.number}}</td>
                                        <td>{{assetAccount.address.bankName}}</td>
                                        <td>{{assetAccount.isVerified? "Yes" : "No"}}</td>
                                        <td>
                                            <button class=" btn btn-sm btn-danger" v-if="!waitingAccounts[assetAccount.index]" @click="removeAccount(assetAccount, assetAccount.index)"> Remove
                                                <i class="fa fa-times"></i>
                                            </button>
                                            <i class="fa fa-spinner fa-pulse" v-else />
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import sideBar from './../sideBar';
import vueSelect from 'vue-select';
export default {
    inject: ['global'],
    data() {
        return {
            validationFailed: false,
            requestErrors: {},
            errorSummary: '',
            isWaiting: false,
            assets: [],
            waitingAccounts: [],
            form: {
                asset: undefined,
                address: {
                    name: undefined,
                    number: undefined,
                    bankName: undefined,
                },
            },
        };
    },
    computed: {
        bankAccounts() {
            const bankAccounts = this.global.user.assetAccounts.filter((assetAccount, index) => {
                if (assetAccount != null) {
                    const asset = assetAccount.asset;
                    for (let fullAsset of this.assets) {
                        if (fullAsset._id == asset) fullAsset.addressType == 'bank account' ? bankAccounts.push(assetAccount) : bankAccounts.push(null);
                    }

                    // TODO: Remove this line after fix
                    assetAccount.index = index;
                }


                return assetAccount != null && assetAccount.asset.addressType == 'bank account';
            });
            // const bankAccounts = [];

            // for (let assetAccount of this.global.user.assetAccounts) {
            //     if (!assetAccount) { bankAccounts.push(null); continue };
            //     let asset = assetAccount.asset;
            //     if (typeof asset == 'object') asset.addressType == 'bank account' ? bankAccounts.push(assetAccount) : bankAccounts.push(null);
            //     else {
            //         for (let fullAsset of this.assets) {
            //             if (fullAsset._id == asset) fullAsset.addressType == 'bank account' ? bankAccounts.push(assetAccount) : bankAccounts.push(null);
            //         }
            //     }
            // }
            return bankAccounts
        },
        isValidated() {
            return !(Object.keys(this.validationError).length)
        },
        validationError() {
            const errors = {};
            if (!this.form.asset) errors['asset'] = 'invalid';
            if (this.requestErrors['asset']) errors['asset'] = this.requestErrors['asset'];
            for (let field of ['name', 'bankName', 'number']) {
                if (!this.form.address[field] || this.form.address[field].isValid === false) errors[field] = 'invalid';
                if (this.requestErrors[field]) errors[field] = this.requestErrors[field];
            }; console.log('errors:', errors)
            return errors
        },
    },
    methods: {
        removeAccount(account, index) {
            if (!confirm('Are you sure you want to delete this bank account?')) return;
            this.waitingAccounts = Object.assign({ [index]: true }, this.waitingAccounts);
            this.global.request("DELETE", `/users/${this.global.user._id}/asset_accounts/${index}`, (err, result) => {
                this.waitingAccounts = Object.assign({ [index]: false }, this.waitingAccounts);
                if (err) {
                    console.log("error from post: ", this.err = err, err.response);
                    return
                };
                console.log("success...", result);
                this.global.user.assetAccounts.splice(index, 1, null);
            });
        },
        submit() {
            if (!this.isValidated) {
                return this.validationFailed = true;
            };
            this.isWaiting = true;
            this.global.request("POST", `/users/${this.global.user._id}/asset_accounts`, this.form, (err, result) => {
                this.isWaiting = false;
                if (err) {
                    this.errorHandler(err);
                    console.log("error from post: ", this.err = err, err.response);
                    return
                };
                console.log("success...", result);
                this.errorSummary = '';
                this.requestErrors = {};
                this.global.user.assetAccounts.push(result);
            });
        },
        setSelect(inputId, modelProp, value) {
            const input = document.getElementById(inputId);
            if (!input) return;
            eval(`this.${modelProp} = value`);
            if (!value) return input.setCustomValidity('please select one');
            return input.setCustomValidity('');
        },
        errorHandler(err) {
            if (err.message == 'Network Error') {
                return this.errorSummary = 'Network Error';
            };
            if (Math.floor(err.response.status / 100) == 4) this.errorSummary = 'validation failed';
            else this.errorSummary = 'internal server error';
            let serverResponse = err.response.data;
            for (let field in serverResponse.errors.errorDetails) {
                this.requestErrors = Object.assign({ [field]: serverResponse.errors.errorDetails[field] }, this.requestErrors);
            };
            this.validationFailed = true;
        },
    },
    created() {
        this.global.request("GET", `/assets/`, (err, res) => {
            if (err) console.error("couldn't load assets");
            this.assets = res;
        });
    },
    components: {
        'side-bar': sideBar,
        'vue-select': vueSelect,
    },
}
</script>

<style>
.error-summary {
    text-align: center;
}
</style>
