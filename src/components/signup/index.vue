<template>
  <div class="account-page signup">
    <div class="account__form account__form--big">
      <img src="~src/img/account.svg" alt="Account" class="account__form-icon">
      <div class="title">
        Create an account
      </div>
      <h2 class="text-danger error-summary">{{errorSummary}}</h2>
      <form class="input-fields" @submit.prevent="submit">
        <div class="form-row custom-form-group">
          <div class="textbox-component">
            <label for="firstname">
              First name
              <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.firstName}}</font>
            </label>
            <input type="text" v-model="firstName" id="firstname" placeholder="first name" required/>
          </div>
          <div class="textbox-component password">
            <label for="lastname">
              Last name
              <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.lastName}}</font>
            </label>
            <input type="text" v-model="lastName" id="lastname" placeholder="Last name" required/>
          </div>
        </div>
        <div class="form-row custom-form-group">
          <div class="textbox-component">
            <label for="email">
              Email
              <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.emailAddress}}</font>
            </label>
            <input type="email" v-model="emailAddress" @change="delete requestErrors.emailAddress" id="email" placeholder="jane@doe.com" required/>
          </div>
          <div class="textbox-component">
            <label for="image">
              Picture
            </label>
            <input type="file" id="image" v-on:change="image=$event.target.files[0]" accept="image/*" />
          </div>
        </div>
        <div class="custom-form-group">
          <label for="phone-number">
            Phone number
            <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.phoneNumber}}</font>
          </label>
          <tel-input v-model="phoneNumber" errorMessage="please enter a valid phone number" required> </tel-input>
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
      countryData: countryNames.map(function(name) {
        return { name }
      }),
      country: null,
      phoneNumber: null,
      firstName: null,
      lastName: null,
      emailAddress: null,
      errorSummary: null,
      requestErrors: {},
      image: null,
      console,
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
      for (let field of ['emailAddress', 'firstName', 'lastName', 'phoneNumber', 'country']) {
        if (!this[field] || this[field].isValid === false) errors[field] = 'invalid';
        if (this.requestErrors[field]) errors[field] = this.requestErrors[field];
      }; console.log('errors:', errors)
      return errors
    },
  },
  methods: {
    updateCountry(val) {
      let countryInput = document.getElementById('country');
      console.log(val);
      if (!val) countryInput.setCustomValidity('please select one');
      else countryInput.setCustomValidity('');
      this.country = val.name;
    },
    submit() {
      if (!this.isValidated) {
        return this.validationFailed = true;
      };
      this.isWaiting = true;
      let postBody = {
        firstName: this.firstName,
        lastName: this.lastName,
        country: this.country,
        emailAddress: this.emailAddress,
        phoneNumber: this.phoneNumber
      };
      if (this.image) {
        postBody.image = this.image
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
      let serverResponse = err.response.data;
      for (let field in serverResponse.errors.errorDetails) {
        this.requestErrors[field] = serverResponse.errors.errorDetails[field];
      };
      /* remove later */
      if (err.response.status == 409) this.requestErrors.emailAddress = 'Email already taken';
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
