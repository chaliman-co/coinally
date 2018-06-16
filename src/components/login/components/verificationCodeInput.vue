<template>
  <form @submit.prevent="verify">
    <div class="title">
      <span>{{ $route.query.message }}</span>
      <p style="font-size: 0.7em;font-family: PT Serif,serif;">Enter the code sent to {{ emailAddress }}</p>
    </div>
    <h2 class="text-danger error-summary">{{ errorSummary }}</h2>
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
          type="text"
          required
          @input="commit('set_verification_code', $event.target.value), delete requestErrors.code" >
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
        </div>
  </form>
</template>

<script>
import { mapState } from 'vuex';

export default {
  inject: ['global'],
  data() {
    return {
      errorSummary: null,
      requestErrors: {},
      validationFailed: false,
      isWaiting: false,
    };
  },
  computed: Object.assign({
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
  }, mapState(['emailAddress', 'code'])),
  methods: {
    verify() {
      this.isWaiting = true;
      this.global.request('GET', `/auth/?code=${this.code}`, (err, result) => {
        this.isWaiting = false;
        if (err) { this.errorHandler(err); return console.log('error from post: ', window.err = err, err.response); }
        console.log('success...', result);
        localStorage.COINALLY_AUTH_TOKEN = result.token;
        this.global.setUser(localStorage.COINALLY_AUTH_TOKEN, () => {
          const nextPage = this.$route.query.nextPage;
          if (nextPage) {
            return this.$router.push(nextPage);
          }
          return this.$router.push('/dashboard');
        });
      });
    },
    errorHandler(err) {
      if (err.message == 'Network Error') {
        return this.errorSummary = 'Network Error';
      }
      if (Math.floor(err.response.status / 100) == 4) this.errorSummary = 'validation failed';
      else this.errorSummary = 'internal server error';
      const serverResponse = err.response.data;
      for (const field in serverResponse.errors.errorDetails) {
        this.requestErrors = Object.assign({ [field]: serverResponse.errors.errorDetails[field] }, this.requestErrors);
      }
      this.validationFailed = true;
    },
    commit(mutationName, payload) {
      this.$store.commit(mutationName, payload);
    },
  },
};
</script>

<style>
.error-summary {
    text-align: center;
}
</style>
