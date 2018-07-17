<template>
  <router-link
    :to="`/users/${_id}`"
    class="user-item is--hoverable">
    <div class="user-item__profile">
      <div
        v-if="imagePath"
        :style="`background-image: url('${$generateUrl(imagePath.replace(/\\/g, '/'))}')`"
        class="profile__image"/>
      <div
        v-else
        :style="`background-image: url('${$generateUrl('images/profile_pictures/avatar.svg')}')`"
        class="profile__image"/>
      <div class="profile__title">
        {{ `${firstName} ${lastName}` | capitalize }}
      </div>
      <div class="profile__subtitle">
        {{ emailAddress }}
      </div>
      <div class="profile__subtitle">
        {{ phoneNumber.digits }}
      </div>
      <div class="user-item__status">
        {{ status }}
        <span class="status__indicator"/>
      </div>
    </div>
    <div class="user-item__transactions">
      <img
        src="~img/cart.svg"
        alt="Transactions"
        class="transactions__icon">
      <div class="transactions__title">
        <span>{{ transactionCount }}</span> Transactions
      </div>
    </div>
  </router-link>
</template>
<script>
export default {
    inject: ['global'],
    name: 'User',
    props: [
        'phoneNumber',
        'index',
        'lastName',
        'firstName',
        'emailAddress',
        'imagePath',
        'status',
        'transactionCount',
        'country',
        '_id',
    ],
};
</script>
