<template>
  <div v-if="user" class="dashboard__sidebar">
    <span class="hamburger">
      <img src="~img/close.svg" alt="Close">
    </span>
    <img v-if="user.imagePath" :src="$generateUrl(user.imagePath)" alt="Avatar" class="avatar">
    <img v-else src="~img/avatar.svg" alt="Avatar" class="avatar">
    <div class="title">
      {{ user.firstName }} {{ user.lastName }}
    </div>

    <div class="referral-code">
      <div class="title">
        Referral Code
      </div>
      <div class="body">
        {{user.refCode}}
      </div>
      <div class="subtitle">
        Total Referrals: {{user.refCount}}
      </div>
    </div>

    <div class="links">
      <router-link v-for="(link, index) in displayLinks" :key="index" :to="link.path" :class="$route.path == link.path? 'link active' : 'link'">
        {{ link.label }}
      </router-link>
      <a href="" class="link logout" @click.prevent="logOut">
        Logout
      </a>
    </div>
  </div>
</template>

<script>
export default {
  inject: ['global'],
  data() {
    return {
      userLinks: [{
        path: '/dashboard',
        label: 'Dashboard',
      }, {
        path: '/profile',
        label: 'Edit profile',
      }, {
        path: '/accounts',
        label: 'Bank Accounts',
      }, {
        path: '/verify',
        label: 'Verify Details',
      }],
      adminLinks: [{
        path: '/dashboard',
        label: 'Dashboard',
      }, {
        path: '/assets',
        label: 'Assets',
      }, {
        path: '/users',
        label: 'Users',
      }, {
        path: '/transactions',
        label: 'Transactions',

      }],
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    displayLinks() {
      if (!this.user) {
        return null;
      }
      return this.user.role === 'admin' ? this.adminLinks : this.userLinks;
    },
  },
  methods: {
    logOut() {
      this.$store.commit('signOut');
      this.$router.push('/');
    },
  },
};
</script>
