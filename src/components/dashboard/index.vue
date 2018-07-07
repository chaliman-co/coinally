<template>
  <div class="dashboard-page">
    <side-bar/>
    <user-dashboard v-if="user.role === 'admin'"/>
    <admin-dashboard v-else/>
  </div>
</template>

<script>
import sideBar from './../sideBar';
import userDashboard from './user';
import adminDashboard from './admin';
import {mapState} from 'vuex';

export default {
  components: {
    'side-bar': sideBar,
    userDashboard,
    adminDashboard
  },
  computed:  mapState([
        'user'
    ]),
};
</script>
