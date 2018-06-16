<template>
  <div
    v-if="global.user"
    class="dashboard__sidebar">
    <span class="hamburger">
      <img
        src="~img/close.svg"
        alt="Close">
    </span>
    <img
      v-if="global.user.imagePath"
      :src="`${global.apiRootUrl}${global.user.imagePath}`"
      alt="Avatar"
      class="avatar">
    <img
      v-else
      src="~img/avatar.svg"
      alt="Avatar"
      class="avatar">
    <div class="title">
      {{ global.user.firstName }} {{ global.user.lastName }}
    </div>
    <div class="links">
      <router-link
        v-for="(link, index) in displayLinks"
        :key="index"
        :to="link.path"
        :class="$route.path == link.path? 'link active' : 'link'">
        {{ link.label }}
      </router-link>
      <a
        href=""
        class="link logout"
        @click.prevent="logOut">
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
    displayLinks() {
      const { user } = this.global;
      if (!user) {
        return null;
      }
      return user.role === 'admin' ? this.adminLinks : this.userLinks;
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
