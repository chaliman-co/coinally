<template>
  <div class="dashboard-page">
    <side-bar/>
    <div class="dashboard__content">
      <div class="dashboard__top-bar">
        <div class="top-bar__table-md">
          <div class="top-bar__table-row">
            <div class="top-bar__table-cell top-bar__title">
              <div class="title">
                Users ({{ users.length }})
              </div>
            </div>
            <div class="top-bar__table-cell top-bar__controls">
              <!-- <a href="" class="btn-custom-astronaut-blue small" data-toggle="modal" data-target="#exchange-modal">
                                            <i class="fa fa-plus"></i> New Transaction
                                        </a> -->

              <div class="select-component sort-by is--minified">
                <div
                  class="dropdown bootstrap-select show-tick custom-select-no-title"
                  style="width: 100%;">
                  <select
                    id="sort-by"
                    name="sort-by"
                    class="custom-select-no-title" 
title="Sort by" tabindex="-98">
                    <option
                      class="bs-title-option"
                      value=""/>
                    <option value="Name">Name</option>
                    <option value="Email">Email</option>
                    <option value="Most Recent">Most Recent</option>
                    <option value="Status">Status</option>
                  </select>
                  <button
                    type="button"
                    class="btn dropdown-toggle bs-placeholder btn-default"
                    data-toggle="dropdown"
                    role="button" 
data-id="sort-by" title="Sort by">
                    <div class="filter-option">
                      <div class="filter-option-inner">
                        <div class="filter-option-inner-inner">Sort by</div>
                      </div>
                    </div>
                    <span class="bs-caret">
                      <span class="caret"/>
                    </span>
                  </button>
                  <div
                    class="dropdown-menu open"
                    role="combobox">
                    <div
                      class="inner open"
                      role="listbox"
                      aria-expanded="false"
                      tabindex="-1">
                      <ul class="dropdown-menu inner "/>
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
          <single-user
            v-for="(user, index) in users"
            :key="index"
            :index="index"
            v-bind="user"/>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import singleUser from './components/singleUser.vue';
import sideBar from '../sideBar.vue';

export default {
    inject: ['global'],
    components: {
        'single-user': singleUser,
        sideBar,
    },
    data() {
        return {
            request: null,
            users: [],
        };
    },
    created() {
        this.$request('GET', '/users', (err, res) => {
            this.users = res;
        });
    },
};
</script>

