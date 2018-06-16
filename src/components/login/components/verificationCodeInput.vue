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
          v-model="code"
          required
          @input="clearErrors" >
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
      emailAddress: null
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
  //  mapState(['emailAddress', 'code'])),
  methods: {
        clearErrors() {
            if(this.requestErrors.code){
                delete this.requestErrors.code;
            }
        },
        
    verify() {
      this.isWaiting = true;
      const url = `/auth/?code=${this.code}`;
      this.global.request('GET', url, (err, result) => {
        this.isWaiting = false;
        if (err) { 
          this.handleError(err); 
          return console.log('error from post: ', window.err = err, err.response); 
          }

        console.log('success...', result);

        // localStorage.COINALLY_AUTH_TOKEN = result.token;
        this.global.setUser(result.token, user => {
          this.$store.commit('signIn', {token: result.token, user});
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
    // commit(mutationName, payload) {
    //   this.$store.commit(mutationName, payload);
    // },
  },
  mounted(){
    this.emailAddress = sessionStorage.emailAddress;

    if(!this.emailAddress)
      this.$router.push('/login');
  }
};
</script>

<style>
.error-summary {
    text-align: center;
}
</style>
