<template>
  <tr>
    <td>{{ index + 1 }}</td>
    <td>{{ type }}</td>
    <td>{{ name }}</td>
    <td>{{ code }}</td>
    <td>
      <img
        :src="`${global.apiRootUrl}/${imagePath}`"
        alt="Image">
    </td>
    <td>{{ price_usd }}</td>
    <td v-html = "type === 'fiat'? `${depositAddress.name} <br/> ${depositAddress.number} <br/> ${depositAddress.bankName}`: depositAddress"/>
    <td>
      <div class="checkbox-component">
        <label>
          <input
            v-model="currentlySellable"
            type="checkbox">
        </label>
      </div>
    </td>
    <td>
      <div class="checkbox-component">
        <label>
          <input
            v-model="currentlyBuyable"
            type="checkbox" >
        </label>
      </div>
    </td>
    <td>
        <button class="btn-custom-astronaut-blue small" data-toggle="modal" data-target="#newCurrency" @click="edit">
            <i class="fa fa-pencil"></i>
        </button>
    </td>
  </tr>
</template>

<script>
export default {
  inject: [
    'global',
  ],
  props: ['_id', 'price_usd', 'type', 'code', 'imagePath', 'name', 'index', 'sellable', 'buyable', 'depositAddress'],
  data() {
    return {
      currentlyBuyable: this.buyable,
      currentlySellable: this.sellable,
    };
  },
  methods: {
     edit(){
         this.$emit('edit');
     }
  },
  watch: {
    currentlyBuyable(state) {
      const data = { buyable: state };
      const url = `/assets/${this._id}/buyable/`;
      this.global.request('PUT',
        url,
        data, (err, response) => {
          if (err) {
          } else {
            this.currentlyBuyable = response;
          }
        },
        );
    },
    currentlySellable(state){
      const data = { sellable: state };
      const url = `/assets/${this._id}/sellable/`;
      this.global.request('PUT',
        url,
        data, (err, response) => {
          if (err) {
          } else {
            this.currentlySellable = response;
          }
        },
        );
    },
  },
};

</script>
