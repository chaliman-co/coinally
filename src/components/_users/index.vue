<template>
  <div class="box box-info">
    <div class="box-header with-border">
      <h3 class="box-title">All users</h3>
    </div>

    <table class="table table-hover">
      <thead>
        <tr>
          <th>s/n</th>
          <th>Image</th>
          <th>Full Name</th>
          <th>Email</th>
          <th>Phone Number</th>
          <th>Transaction count</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <single-user v-for="(user, index) in users" v-bind:key="index" :index="index" v-bind="user">
        </single-user>
      </tbody>
    </table>

  </div>
</template>

<script>
import user from "./user";
import socketIo from "socket.io-client"
export default {
  name: 'user',
  components: {
    "single-user": user
  },
  data: function() {
    return {
      request: null,
      users: []
    }
  },
  created: function() {
    var request = this.request = new XMLHttpRequest();
    request.open("GET", "http://localhost:9000/api/users")
    request.onreadystatechange = function(event) {
      if (request.readyState === 4) {
        this.users = JSON.parse(request.response).result;
      }
    }.bind(this);
    request.send()
  }
}
</script>
