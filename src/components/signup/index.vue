<template>
  <div class="account-page signup">
    <div class="account__form account__form--big">
      <img src="~src/img/account.svg" alt="Account" class="account__form-icon">
      <div class="title">
        Create an account
      </div>
      <h6 class="text-danger error-summary">{{errorSummary}}</h6>
      <form class="input-fields" @submit.prevent="submit">
        <div class="form-row custom-form-group">
          <div class="textbox-component">
            <label for="firstname">
              First name
              <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.firstName}}</font>
            </label>
            <input type="text" v-model="form.firstName.value" id="firstname" placeholder="first name" required/>
          </div>
          <div class="textbox-component">
            <label for="lastname">
              Last name
              <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.lastName}}</font>
            </label>
            <input type="text" v-model="form.lastName.value" id="lastname" placeholder="Last name" required/>
          </div>
        </div>
        <div class="form-row custom-form-group">
          <div class="textbox-component">
            <label for="email">
              Email
              <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.emailAddress}}</font>
            </label>
            <input type="email" v-model="form.emailAddress.value" @input="requestErrors.emailAddress = undefined" id="email" placeholder="jane@doe.com" required/>
          </div>
          <div class="textbox-component">
            <label for="image">
              Picture
            </label>
            <input type="file" id="image" v-on:change="form.image.value=$event.target.files[0]" accept="image/*" />
          </div>
        </div>

        <div class="custom-form-group">
          <div class="textbox-component">
            <label for="referrer">
              Referrer code
              <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.referrer}}</font>
            </label>
            <input type="text" v-model="form.referrer.value" id="referrer" @input="requestErrors.referrer = undefined" placeholder="ref code..." />
          </div>
        </div>

        <div class="custom-form-group">
          <div class="select-component ">
          <label for="phone-number">
            Phone number
            <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.phoneNumber}}</font>
          </label>
          </div>
          <tel-input @input="setPhoneNumber" errorMessage="please enter a valid phone number" required> </tel-input>
        </div>
        <div class="select-component custom-form-group">
          <label for="country">
            Country
            <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.country}}</font>
          </label>
          <vue-select :options="countryData" :on-change="updateCountry" label="name" inputId="country" placeholder="type to search...">
            <template slot="option" slot-scope="option">
              <span> {{option.name}}</span>
            </template>
          </vue-select>
        </div>
        <input type="submit" id="submit" class="hidden">
      </form>
      <div class="alternative">
        Already signed up?
        <a href="login.html">Login here</a>
      </div>
      <label for="submit" tabindex="0" class="call-to-action btn-custom-astronaut-blue" :disabled="!isValidated || isWaiting">
        {{isWaiting? 'Sending...': 'Finish' }}
      </label>
    </div>
  </div>
</template>

<script>
import vueSelect from "vue-select";
import countryNames from "../../COUNTRY_NAMES"
export default {
  inject: ['global'],
  props: ['nextPage'],
  data() {
    return {
      console,
      form: {
        country: {
          required: true,
          value: undefined,
        },
        phoneNumber: {
          required: true,
          value: undefined,
        },
        firstName: {
          required: true,
          value: undefined,
        },
        lastName: {
          required: true,
          value: undefined,
        },
        emailAddress: {
          required: true,
          value: undefined,
        },
        image: {
          value: undefined,
        },
        referrer: {
          value: undefined,
        },
      },

      countryData: countryNames.map(function(name) {
        return { name }
      }),
      errorSummary: '',
      requestErrors: {},
      isWaiting: false,
      validationFailed: false,  //don't show error messages on initial render
    };
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
    setPhoneNumber({isValid, digits, region}) {
      Object.assign(this.form.phoneNumber, {isValid, value: {digits, region}});
    },
    updateCountry(val) {
      let countryInput = document.getElementById('country');
      console.log(val);
      if (!val) countryInput.setCustomValidity('please select one');
      else countryInput.setCustomValidity('');
      this.form.country.value = val.name;
    },
    submit() {
      if (!this.isValidated) {
        return this.validationFailed = true;
      };
      this.isWaiting = true;
      let postBody = {};
      for (const field in this.form) postBody[field] = this.form[field].value; console.log({postBody})
      if (postBody.image) {
        postBody = objectToFormData(postBody)
      };
      this.global.request("POST", "/users", postBody, function(err, result) {
        this.isWaiting = false;
        if (err) {
          this.errorHandler(err);
          console.log("error from post: ", this.err = err, err.response);
          return
        };
        console.log("success...", result);
        this.errorSummary = '';
        this.requestErrors = {};
        if (this.$route.query.nextPage) {
          return this.$router.push({
            path: '/login',
            query: {
              message: 'Login to confirm your account',
              nextPage: this.$route.nextPage,
            },
          });
        };
        return this.$router.push({
          path: '/login',
          query: {
            message: 'Login to confirm your account',
          },
        })
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
            [field]: value});
        });
      this.validationFailed = true;
    },
  },
  components: {
    "vue-select": vueSelect,
    'tel-input': require('../tel-input').default,
  },
  mounted() {
    let countryInput = document.getElementById('country');
    countryInput.setCustomValidity('please select one');
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

<style>
.select-component {
  position: relative;
  z-index: 1;
}

.input-error-message {
  text-transform: capitalize;
}

.error-summary {
  text-align: center;
}
</style>
