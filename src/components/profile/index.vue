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
                Edit Profile
              </div>
            </div>
            <div class="top-bar__table-cell top-bar__controls">
              <a
                href="#"
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

        <div class="dashboard__profile">
          <img
            v-if="user.imagePath"
            :src="$generateUrl(user.imagePath)"
            alt="avatar"
            class="icon">
          <img
            v-else
            src="~src/img/avatar.svg"
            alt="avatar"
            class="icon">
          <div class="title">
            Edit your profile
          </div>
          <p class="text-danger error-summary"><strong>{{ errorSummary }}</strong></p>
          <form
            class="input-fields"
            @submit.prevent="submit">
            <div class="form-row custom-form-group">
              <div class="textbox-component">
                <label for="firstname">
                  First name
                </label>
                <input
                  id="firstname"
                  v-model="form.firstName.value"
                  type="text"
                  placeholder="first name" > </div>
              <div class="textbox-component password">
                <label for="lastname">
                  Last name
                </label>
                <input
                  id="lastname"
                  v-model="form.lastName.value"
                  type="text"
                  placeholder="Last name" >
              </div>
            </div>
            <div class="form-row custom-form-group">
              <div class="textbox-component">
                <label for="image">
                  Picture
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  @change="form.image.value=$event.target.files[0]" >
              </div>
            </div>
            <div class="custom-form-group">
              <label for="phone-number">
                Phone number
                <font
                  v-if="validationFailed"
                  color="red"
                  class="input-error-message"> *{{ validationError.phoneNumber }}</font>
              </label>
              <tel-input
                :value="form.phoneNumber.value"
                error-message="please enter a valid phone number"
                required
                @input="setPhoneNumber"/>
            </div>
            <div class="select-component custom-form-group">
              <label for="country">
                Country
              </label>
              <vue-select
                :options="countryNames"
                v-model="form.country.value"
                input-id="country"
                placeholder="type to search..."/>
            </div>
            <input
              id="submit"
              type="submit"
              class="hidden">
          </form>
          <label
            :disabled="!isValidated || isWaiting"
            for="submit"
            style="width:100%"
            tabindex="0"
            class="call-to-action btn-custom-astronaut-blue">
            {{ isWaiting? 'Sending...': 'Update' }}
          </label>
        </div>

      </div>
    </div>
  </div>
</template>
<script>

import vueSelect from 'vue-select';
import { mapState } from 'vuex';
import telInput from './../tel-input.vue';
import countryNames from '../../COUNTRY_NAMES.json';
import sideBar from './../sideBar.vue';
import transactionModal from '../transactionModal.vue';

export default {
    components: {
        'vue-select': vueSelect,
        'tel-input': telInput,
        'side-bar': sideBar,
        transactionModal,
    },
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
        };
    },
    computed: {
        ...mapState(['user']),
        isValidated() {
            return !(Object.keys(this.validationError).length);
        },
        validationError() {
            const errors = {};
            for (const field in this.form) {
                if (this.form[field].isValid === false) errors[field] = 'invalid';
                if (this.form[field].required && !this.form[field].value) errors[field] = 'required';
                if (this.requestErrors[field]) errors[field] = this.requestErrors[field];
            }
            return errors;
        },
    },
    methods: {
        submit() {
            if (!this.isValidated) {
                this.validationFailed = true;
                return;
            }

            this.isWaiting = true;
            let postBody = {};
            for (const field in this.form) {
                postBody[field] = this.form[field].value;
            }
            if (postBody.image) {
                postBody = objectToFormData(postBody);
            }
            this.$request('PATCH', `/users/${this.$store.state.user._id}`, postBody, (err, user) => {
                this.isWaiting = false;
                if (err) {
                    this.errorHandler(err);
                } else {
                    this.$store.commit('updateUser', user);
                    this.errorSummary = '';
                    this.requestErrors = {};
                }
            });
        },
        errorHandler(err) {
            if (err.message === 'Network Error') {
                this.errorSummary = 'Network Error';
            } else {
                if (Math.floor(err.response.status / 100) === 4) {
                    this.errorSummary = 'validation failed';
                } else {
                    this.errorSummary = 'internal server error';
                }
                const serverResponse = err.response.data;
                Object.entries(serverResponse.errors.errorDetails)
                    .forEach(([field, value]) => {
                        this.requestErrors = Object.assign({}, this.requestErrors, {
                            [field]: value,
                        });
                    });
                this.validationFailed = true;
            }
        },
        setPhoneNumber({ isValid, digits, region }) {
            Object.assign(this.form.phoneNumber, { isValid, value: { digits, region } });
        },
    },
};

var objectToFormData = function (obj, form, namespace) {
    const fd = form || new FormData();
    let formKey;
    for (const property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (namespace) {
                formKey = `${namespace}[${property}]`;
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
