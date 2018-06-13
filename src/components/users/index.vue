<template>
    <div class="dashboard-page">
        <div class="dashboard__sidebar">
            <span class="hamburger">
                <img src="~img/close.svg" alt="Close">
            </span>
            <img src="~img/avatar.svg" alt="Avatar" class="avatar">
            <div class="title">
                Willy Wonka
            </div>

            <div class="links">
                <a href="admindashboard.html" class="link active">
                    Dashboard
                </a>
                <a href="userlist.html" class="link">
                    Users
                </a>
                <a href="currency.html" class="link">
                    Currency Settings
                </a>
                <a href="bankaccount.html" class="link">
                    Transactions
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
                                Users (23)
                            </div>
                        </div>
                        <div class="top-bar__table-cell top-bar__controls">
                            <!-- <a href="" class="btn-custom-astronaut-blue small" data-toggle="modal" data-target="#exchange-modal">
                                            <i class="fa fa-plus"></i> New Transaction
                                        </a> -->

                            <div class="select-component sort-by is--minified">
                                <div class="dropdown bootstrap-select show-tick custom-select-no-title" style="width: 100%;">
                                    <select name="sort-by" id="sort-by" class="custom-select-no-title" title="Sort by" tabindex="-98">
                                        <option class="bs-title-option" value=""></option>
                                        <option value="Name">Name</option>
                                        <option value="Email">Email</option>
                                        <option value="Most Recent">Most Recent</option>
                                        <option value="Status">Status</option>
                                    </select>
                                    <button type="button" class="btn dropdown-toggle bs-placeholder btn-default" data-toggle="dropdown" role="button" data-id="sort-by" title="Sort by">
                                        <div class="filter-option">
                                            <div class="filter-option-inner">
                                                <div class="filter-option-inner-inner">Sort by</div>
                                            </div>
                                        </div>
                                        <span class="bs-caret">
                                            <span class="caret"></span>
                                        </span>
                                    </button>
                                    <div class="dropdown-menu open" role="combobox">
                                        <div class="inner open" role="listbox" aria-expanded="false" tabindex="-1">
                                            <ul class="dropdown-menu inner "></ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- <a href="verify.html" class="btn-custom-transparent-astronaut-blue small">
                                            Verify Details
                                        </a> -->
                        </div>
                    </div>
                </div>
            </div>
            <div class="dashboard__body">

                <div class="admin-dashboard__user-list">
                    <!-- User Item Partial -->
                    <single-user v-for="(user, index) in users" v-bind:key="index" :index="index" v-bind="user"></single-user>
                </div>

            </div>
        </div>

    </div>
</template>

<script>
import singleUser from './components/singleUser';
export default {
    inject: ['global'],
    data: function() {
        return {
            request: null,
            users: []
        }
    },
    created: function() {
        this.global.request("GET", '/users', (err, res) => {
            this.users = res;
        })
    },
    components: {
        'single-user': singleUser,
    }
}
</script>

