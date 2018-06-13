<template>
    <form class="input-fields" @submit.prevent="submit">
        <div class="title">
            <p style="font-size: 0.7em;font-family: PT Serif,serif;">A verificatiion code will be sent to &#10; the email address provided.</p>
        </div>
        <h2 class="text-danger error-summary">{{errorSummary}}</h2>
        <div class="input-fields">
            <div class="textbox-component custom-form-group">
                <label for="email">
                    Email
                    <font color="red" class="input-error-message" v-if="validationFailed"> *{{validationError.emailAddress}}</font>
                </label>
                <input type="email" :value="emailAddress" required id="email" @input="commit('set_email_address', $event.target.value), delete requestErrors.emailAddress" placeholder="jane@doe.com" />
            </div>
        </div>
        <div class="alternative">
            Don't have an account?
            <router-link to="/signup">Sign up here</router-link>
        </div>
        <button type="submit" class="call-to-action btn-custom-astronaut-blue" :disabled="!isValidated || isWaiting">
            {{isWaiting? 'Sending...': 'Proceed' }}
        </button>
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
            return !(Object.keys(this.validationError).length)
        },
        validationError() {
            const error = {};
            if (!this.emailAddress) error.emailAddress = 'invalid';
            if (this.requestErrors.emailAddress) error.emailAddress = this.requestErrors.emailAddress;
            return error
        },
    }, mapState(['emailAddress'])),
    methods: {
        submit() {
            this.isWaiting = true;
            this.global.request("POST", "/auth", { emailAddress: this.emailAddress }, function(err, result) {
                this.isWaiting = false;
                if (err) { this.errorHandler(err); return console.log("error from post: ", this.err = err, err.response); }
                console.log("success...", result);
                if (this.$route.query.nextPage) {
                    return this.$router.push({
                        path: '/login/verify',
                        query: {
                            nextPage: this.$route.query.nextPage,
                        },
                    });
                };
                return this.$router.push({
                    path: '/login/verify',
                })
            }.bind(this));
        },
        commit(mutationName, payload) {
            this.$store.commit(mutationName, payload);
        },
        errorHandler(err) {
            if (err.message == 'Network Error') {
                return this.errorSummary = 'Network Error';
            };
            if (Math.floor(err.response.status / 100) == 4) this.errorSummary = 'email address not found';
            else this.errorSummary = 'internal server error';
            let serverResponse = err.response.data;
            for (let field in serverResponse.errors) {
                this.requestErrors[field] = serverResponse.errors[field];
            };
            this.validationFailed = true;
        },
    },
}
</script>

<style>
.error-summary {
    text-align: center;
}
</style>
