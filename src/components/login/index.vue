<template>
    <div>
        <div class="account-page login">
            <div class="account__form" style="padding-bottom: 2em;">
                <h2 style="text-align:center;">{{$route.query.message}}</h2>
                <img src="~src/img/account.svg" alt="Account" class="account__form-icon">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script>
// import Vuex from 'vuex';
// import Vue from 'vue';
// Vue.use(Vuex)
export default {
    data() {
        return {
        }
    },
    // store: new Vuex.Store({
    //     state: {
    //         code: null,
    //         emailAddress: null
    //     },
    //     mutations: {
    //         'set_email_address': (state, emailAddress) => state.emailAddress = emailAddress,
    //         'set_verification_code': (state, code) => state.code = code,
    //     }
    // }),
    methods: {
    }
}
</script>

