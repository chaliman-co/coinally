<template>
    <tr>
        <td>
            <span class="cell-content">{{index + 1}}</span>
        </td>
        <td>
            <span class="cell-content">{{type}}</span>
        </td>
        <td>
            <span class="cell-content">{{name}}</span>
        </td>
        <td>
            <span class="cell-content">{{code}}</span>
        </td>
        <td><img :src="`http://localhost:9000/${imagePath}`"></td>
        <td>
            <span class="cell-content">{{price_usd}}</span>
        </td>
        <td>
            <span class="cell-content" v-html = "type === 'fiat'? `${depositAddress.name} <br/> ${depositAddress.number} <br/> ${depositAddress.bankName}`: depositAddress"></span>
        </td>
        <td>
            <span class="cell-content"> <input type="checkbox" v-model="currentlySellable"></span>
        </td>
        <td>
            <span class="cell-content"> <input type="checkbox" v-model="currentlyBuyable"></span>
        </td>
    </tr>
</template>

<script>
export default {
    props: ["_id", "price_usd", "type", "code", "imagePath", "name", "index", "sellable", "buyable", "depositAddress"],
    data() {
        return {
            currentlyBuyable: this.buyable,
            currentlySellable: this.sellable
        }
    },
    watch: {
        currentlyBuyable(state) {
            console.log(state)
            var request = this.request = new XMLHttpRequest();
            request.open("PUT", `http://localhost:9000/api/assets/${this._id}/buyable/`)
            request.setRequestHeader("Content-Type", "application/json");
            request.onreadystatechange = function(event) {
                if (request.readyState === 4) {
                    console.log(request.response)
                    this.currentlyBuyable = JSON.parse(request.response).result;
                }
            }.bind(this);
            request.send(JSON.stringify({ buyable: state }))
        }
    },
    watch: {
        currentlySellable(state) {
            console.log(state)
            var request = this.request = new XMLHttpRequest();
            request.open("PUT", `http://localhost:9000/api/assets/${this._id}/sellable/`)
            request.setRequestHeader("Content-Type", "application/json");
            request.onreadystatechange = function(event) {
                if (request.readyState === 4) {
                    console.log(request.response)
                    this.currentlySellable = JSON.parse(request.response).result;
                }
            }.bind(this);
            request.send(JSON.stringify({ sellable: state }))
        }
    }
}
</script>


<style scoped>
.cell-content {
    vertical-align: -100%;
}

td {
    height: 6em;
}

td img {
    height: inherit;
}
</style>

