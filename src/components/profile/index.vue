<template>
    <div class="dashboard-page">

        <side-bar></side-bar>
        <div class="dashboard__content">
            <div class="dashboard__top-bar">
                <div class="top-bar__table-md">
                    <div class="top-bar__table-row">
                        <div class="top-bar__table-cell top-bar__title">
                            <div class="title">
                                Edit Profile
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

                <div class="dashboard__profile">
                    <img src="~src/img/avatar.svg" alt="avatar" class="icon">
                    <div class="title">
                        Edit your profile
                    </div>
                    <h2 class="text-danger error-summary">{{errorSummary}}</h2>
                    <form class="input-fields" @submit.prevent="submit">
                        <div class="form-row custom-form-group">
                            <div class="textbox-component">
                                <label for="firstname">
                                    First name
                                </label>
                                <input type="text" v-model="form.firstName.value" id="firstname" placeholder="first name" /> </div>
                            <div class="textbox-component password">
                                <label for="lastname">
                                    Last name
                                </label>
                                <input type="text" v-model="form.lastName.value" id="lastname" placeholder="Last name" />
                            </div>
                        </div>
                        <div class="form-row custom-form-group">
                            <div class="textbox-component">
                                <label for="image">
                                    Picture
                                </label>
                                <input type="file" id="image" v-on:change="form.image.value=$event.target.files[0]" accept="image/*" />
                            </div>
                        </div>
                        <div class="custom-form-group">
                            <label for="phone-number">
                                Phone number
                                <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.phoneNumber}}</font>
                            </label>
                            <tel-input @input="setPhoneNumber" :value="form.phoneNumber.value" errorMessage="please enter a valid phone number" required> </tel-input>
                        </div>
                        <div class="select-component custom-form-group">
                            <label for="country">
                                Country
                            </label>
                            <vue-select :options="countryNames" v-model="form.country.value" inputId="country" placeholder="type to search...">
                            </vue-select>
                        </div>
                        <input type="submit" id="submit" class="hidden">
                    </form>
                    <label for="submit" style="width:100%" tabindex="0" class="call-to-action btn-custom-astronaut-blue" :disabled="!isValidated || isWaiting">
                        {{isWaiting? 'Sending...': 'Update' }}
                    </label>
                </div>

            </div>
        </div>
    </div>
</template>
<script>

import { mapState } from 'vuex';
import vueSelect from "vue-select";
import telInput from "./../tel-input";
import countryNames from "../../COUNTRY_NAMES";
import sideBar from './../sideBar';
export default {
    data() {
        return {
            form: {
                country: {
                    required: true,
                    value: this.$store.state.user.country,
                },
                phoneNumber: {
                    required: true,
                    isValid: true,
                    value: this.$store.state.user.phoneNumber,
                },
                firstName: {
                    required: true,
                    value: this.$store.state.user.firstName,
                },
                lastName: {
                    required: true,
                    value: this.$store.state.user.lastName,
                },
                image: {
                    value: undefined,
                },
            },
            errorSummary: '',
            requestErrors: {},
            isWaiting: false,
            countryNames,
            validationFailed: false,
        }
    },
    computed: {
        isValidated() {
            return !(Object.keys(this.validationError).length)
        },
        validationError() {
            const errors = {};
            for (let field in this.form) {
                if (this.form[field].isValid === false) errors[field] = 'invalid';
                if (this.form[field].required && !this.form[field].value) errors[field] = 'required';
                if (this.requestErrors[field]) errors[field] = this.requestErrors[field];
            }; console.log('errors:', errors)
            return errors
        },
    },
    methods: {
        submit() {
            if (!this.isValidated) {
                return this.validationFailed = true;
            };
            this.isWaiting = true;
            let postBody = {};
            for (const field in this.form) postBody[field] = this.form[field].value; console.log({ postBody })
            if (postBody.image) {
                postBody = objectToFormData(postBody)
            };
            this.$request('PATCH', `/users/${this.$store.state.user._id}`, postBody, function(err, user) {
                this.isWaiting = false;
                if (err) {
                    this.errorHandler(err);
                    console.log("error from post: ", this.err = err, err.response);
                    return
                };
                console.log("success...",user);
                this.$store.commit('updateUser', user)
                this.errorSummary = '';
                this.requestErrors = {};
            }.bind(this));
        },
        errorHandler(err) {
            if (err.message == 'Network Error') {
                return this.errorSummary = 'Network Error';
            };
            if (Math.floor(err.response.status / 100) == 4) this.errorSummary = 'validation failed';
            else this.errorSummary = 'internal server error';
            const serverResponse = err.response.data;
            Object.entries(serverResponse.errors.errorDetails)
                .forEach(([field, value]) => {
                    this.requestErrors = Object.assign({}, this.requestErrors, {
                        [field]: value
                    });
                });
            this.validationFailed = true;
        },
        setPhoneNumber({ isValid, digits, region }) {
            Object.assign(this.form.phoneNumber, { isValid, value: { digits, region } });
        },
    },
    mounted() {
    },
    components: {
        "vue-select": vueSelect,
        "tel-input": telInput,
        'side-bar': sideBar,
    }
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
