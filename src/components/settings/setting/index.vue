<template>
    <tr>
        <td>{{index + 1}}.</td>
        <td>{{name}}</td>
        <td>{{currentValue}}</td>
        <td>
            <div class="input-group">
                <input type="text" class="form-control" placeholder="New value" v-model="newVal">
                <div class="input-group-btn">
                    <button type="button" class="btn btn-primary" v-on:click.prevent="change">Change value</button>
                </div>
            </div>
        </td>
        <td>
            <button type="button" class="btn btn-block btn-danger" v-on:click.prevent="$emit('removed',_id, index)">Remove</button>
        </td>
    </tr>
</template>

<script>
export default {
    props: ["index", "name", "value", "_id"],
    data() {
        return {
            newVal: null,
            currentValue: this.value
        }
    },
    methods: {
        change() {
            var request = this.request = new XMLHttpRequest();
            request.open("PUT", `http://localhost:9000/api/config/${this._id}/value`);
            request.setRequestHeader("Content-Type", "application/json"); console.log({ value: this.newVal })
            request.send(JSON.stringify({ value: this.newVal }));
            request.onreadystatechange = function(event) {
                if (request.readyState === 4) {
                    console.log(request.response)
                    this.currentValue = JSON.parse(request.response).result;
                }
            }.bind(this);
        },
    }
}
</script>
