<template>
  <!-- <router-link :to="`/users/${_id}`"> -->

  <tr>
    <td>{{index + 1}}</td>
    <td><img class="img-circle allUserImage" :src="`http://localhost:9000/${imagePath}`" alt="Image"></td>
    <td>{{firstName}} {{lastName}}</td>
    <td>{{emailAddress}}</td>
    <td>{{phoneNumber.digits}}</td>
    <td>{{transactions ? 0 : transactions.length}}</td>
    <td>{{status}}</td>
    <td>
      <a href="#" class="btn btn-primary" v-on:click.prevent="$router.push(`/users/${_id}`)">View</a>
    </td>
    <td></td>
  </tr>
  <!-- </router-link> -->
</template>


<script>
export default {
  name: 'user',
  props: ["phoneNumber",
    "index",
    "lastName",
    "firstName",
    "emailAddress",
    "imagePath",
    "status",
    "transactions",
    "country",
    "_id"
  ]
}

</script>

<style scoped>
.allUserImage {
  height: 50px;
  width: 50px;
}
</style>
