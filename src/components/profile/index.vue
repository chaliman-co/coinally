<template>
    <div class="dashboard-page">

        <div class="dashboard__sidebar">
            <span class="hamburger">
                <img src="~src/img/close.svg" alt="Close">
            </span>
            <img src="~src/img/avatar.svg" alt="Avatar" class="avatar">
            <div class="title">
                Jonathan Doekritz
            </div>

            <div class="referral-code">
                <div class="title">
                    Referral Code
                </div>
                <div class="body">
                    02dh3a35
                </div>
                <div class="subtitle">
                    Total Referrals: 2
                </div>
            </div>

            <div class="links">
                <a href="dashboard.html" class="link active">
                    Dashboard
                </a>
                <a href="verify.html" class="link">
                    Verify Details
                </a>
                <a href="profile.html" class="link">
                    Edit Profile
                </a>
                <a href="bankaccount.html" class="link">
                    Bank Accounts
                </a>
                <a href="/" class="link logout">
                    Logout
                </a>
            </div>
        </div>
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
                    <div class="input-fields">

                        <div class="form-row custom-form-group">
                            <div class="textbox-component">
                                <label for="firstname">
                                    First name
                                </label>
                                <input type="email" v-model="newFirstName" id="firstname" placeholder="first name" /> </div>
                            <div class="textbox-component password">
                                <label for="lastname">
                                    Last name
                                </label>
                                <input type="text" v-model="newLastName" id="lastname" placeholder="Last name" />
                            </div>
                        </div>
                        <div class="form-row custom-form-group">
                            <div class="textbox-component">
                                <label for="email">
                                    Email
                                </label>
                                <input type="email" id="email" v-model="newEmailAddress" placeholder="jane@doe.com" />
                            </div>

                            <div class="textbox-component">
                                <label for="image">
                                    Picture
                                </label>
                                <input type="file" id="image" v-on:change="newImage=$event.target.files[0]" accept="image/*" />
                            </div>
                        </div>
                        <div class="custom-form-group">
                            <label for="phone-number">
                                Phone number
                            </label>
                            <tel-input v-model="phoneNumber" required> </tel-input>
                        </div>
                        <div class="select-component custom-form-group">
                            <label for="country">
                                Country
                            </label>
                            <vue-select :options="countryData" label="name" v-model="newCountry" inputId="country" placeholder="type to search...">
                                <template slot="option" slot-scope="option">
                                    <span> {{option.name}}</span>
                                </template>
                            </vue-select>
                        </div>
                    </div>
                    <button class="update btn-custom-astronaut-blue">
                        Update
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>
<script>

import vueSelect from "vue-select";
import countryNames from "../../COUNTRY_NAMES";
export default {
    data() {
        return {
            countryData: countryNames.map(function(name) {
                return { name }
            }),
            newCountry: null,
            newPhoneNumber: null,
            newFirstName: null,
            newLastName: null,
            newEmailAddress: null,
            newImage: null
        }
    },
    methods: {
        submit() {
            if (!this.isValidated) return this.error = validationError;
            let postBody = {
                firstName: this.newFirstName,
                lastName: this.newLastName,
                country: this.newCountry,
                emailAddress: this.newEmailAddress,
                image: this.newImage,
                phoneNumber: this.newPhoneNumber,
            }
            if (postBody.image) {
                postBody = objectToFormData(postBody)
            }
            this.$root.request('PATCH', `/users/${this.$root.user._id}`, postBody, function(err, result) {
                if (err) return console.log("error from post: ", this.err = err, err.response);
                console.log("success...", result);
            })
        }
    },
    mounted() {
    },
    components: {
        "vue-select": vueSelect,
    }
}
</script>
