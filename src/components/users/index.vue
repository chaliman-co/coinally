<template>
  <div class="dashboard-page">
    <side-bar/>
    <div class="dashboard__content">
      <div class="dashboard__top-bar">
        <div class="top-bar__table-md">
          <div class="top-bar__table-row">
            <div class="top-bar__table-cell top-bar__title">
              <div class="title">
                Users ({{ total }})
              </div>
            </div>
            <div class="top-bar__table-cell top-bar__controls">

              <div class="select-component sort-by is--minified">
                  <select
                    id="sort-by"
                    name="sort-by"
                    class="custom-select-no-title pull-right" 
                    title="Sort by" tabindex="-98"
                    style="width: 50%"
                    v-model="sortBy">
                    <option value="date">Sort By</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="date">Most Recent</option>
                    <option value="status">Status</option>
                  </select>
              </div>
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

        <pagination
        :active-page="page"
        :total-items-count="total"
        :items-count-per-page="pageSize"
        v-if="!loading && total > 0"
        @changePage="updatePage"
        />
      </div>
    </div>

  </div>
</template>

<script>
import singleUser from './components/singleUser.vue';
import sideBar from '../sideBar.vue';
import pagination from './../pagination';

export default {
    inject: ['global'],
    components: {
        'single-user': singleUser,
        sideBar,
        pagination,
    },
    data() {
        return {
            request: null,
            users: [],
            page: 1,
            pageSize: 16,
            total: 0,
            sortBy: 'date',
            loading: false,
        };
    },
    methods: {
      updatePage(){
        this.fetchUsers();
      },
      fetchUsers(){
        this.users = [];
        this.loading = true;
        this.$request('GET', `/users?page=${this.page}&pageSize=${this.pageSize}&sortBy=${this.sortBy}`, (err, result) => {
            if(!err){
              this.users = result.items;
              this.total = result.total;
              this.loading = false;
            }
        });
      }
    },
    created() {
      this.fetchUsers();
    },
    watch:{
      sortBy(oldValue, newValue){
        if(oldValue !== newValue){
          this.page = 1;
          this.updatePage();
        }
      }
    }
};
</script>

