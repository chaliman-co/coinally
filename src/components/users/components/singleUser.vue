<template>
    <router-link class="user-item is--hoverable" :to="`/users/${_id}`">
        <div class="user-item__profile">
            <div class="profile__image" v-if="imagePath" :style="`background-image: url('${global.apiRootUrl}/${imagePath.replace(/\\/g, '/')}')`"></div>
            <div class="profile__image" v-else :style="`background-image: url('${global.apiRootUrl}/images/profile_pictures/default')`"></div>
            <div class="profile__title">
                {{firstName}} {{lastName}}
            </div>
            <div class="profile__subtitle">
                {{emailAddress}}
            </div>
            <div class="profile__subtitle">
                {{phoneNumber.digits}}
            </div>
            <div class="user-item__status">
                {{status}}
                <span class="status__indicator"></span>
            </div>
        </div>
        <div class="user-item__transactions">
            <img src="~img/cart.svg" alt="Transactions" class="transactions__icon">
            <div class="transactions__title">
                <span>{{transactionCount}}</span> Transactions
            </div>
        </div>
    </router-link>
</template>
<script>
export default {
    inject: ['global'],
    name: 'user',
    props: ["phoneNumber",
        "index",
        "lastName",
        "firstName",
        "emailAddress",
        "imagePath",
        "status",
        "transactionCount",
        "country",
        "_id"
    ]
}
</script>