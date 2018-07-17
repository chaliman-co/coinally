<template>
  <form @submit.prevent="verify">
    <div class="title">
      <span>{{ $route.query.message }}</span>
      <p style="font-size: 0.7em;font-family: PT Serif,serif;">Enter the code sent to {{ emailAddress }}</p>
    </div>
    <p class="text-danger error-summary"><strong>{{ errorSummary }}</strong></p>
    <div class="input-fields">
      <div class="textbox-component custom-form-group">
        <label for="code">
          Verification Code
          <font
            v-if="validationFailed"
            color="red"
            class="input-error-message"> * {{ validationError.code }}</font>
        </label>
        <input
          id="code"
          v-model="code"
          type="text"
          required
          @input="clearErrors">
      </div>
    </div>
    <div class="alternative">
      Don't have an account?
      <router-link to="/signup">Sign up here</router-link>
    </div>
    <button
      :disabled="!isValidated || isWaiting"
      type="submit"
      class="call-to-action btn-custom-astronaut-blue">
      {{ isWaiting? 'Sending...': 'Verify' }}
    </button>
  </form>
</template>

<script>
  // import { mapState } from 'vuex';

  export default {
    inject: ['global'],
    data() {
      return {
        errorSummary: null,
        requestErrors: {},
        validationFailed: false,
        isWaiting: false,
        code: null,
        emailAddress: null,
      };
    },
    computed: {
      isValidated() {
        return !(Object.keys(this.validationError).length);
      },
      validationError() {
        const error = {};
        if (!this.code) error.code = 'invalid';
        const code = this.requestErrors.code;
        if (code) error.code = this.requestErrors.code;
        return error;
      },
    },
    mounted() {
      this.emailAddress = sessionStorage.emailAddress;

      if (!this.emailAddress) {
        this.$router.push('/login');
      }
    },
    //  mapState(['emailAddress', 'code'])),
    methods: {
      clearErrors() {
        if (this.requestErrors.code) {
          delete this.requestErrors.code;
        }
      },

      verify() {
        this.isWaiting = true;
        const url = `/auth/?code=${this.code}`;
        this.$request('GET', url, (err, result) => {
          this.isWaiting = false;
          if (err) {
            this.handleError(err);
            window.err = err;
            this.$log('error from post: ', err, err.response);
          }

          this.$store.commit('updateToken', result.token);

          // localStorage.COINALLY_AUTH_TOKEN = result.token;
          this.global.setUser(result.token, (e, user) => {
            this.$log(user, e);
            if (!e) {
              this.$store.commit('signIn', {
                token: result.token,
                user,
              });

              const {
                nextPage,
              } = this.$route.query;

              if (nextPage) {
                this.$router.push(nextPage);
              } else {
                this.$router.push('/dashboard');
              }
            }
          });
        });
      },
      handleError(err) {
        if (err.message === 'Network Error') {
           this.errorSummary = 'Network Error';
        }

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
      },
    },
  };
</script>

<style>
  .error-summary {
    text-align: center;
  }
</style>
