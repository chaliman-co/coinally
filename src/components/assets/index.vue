<template>
    <div>

        <div class="box box-default collapsed-box">
            <div class="box-header with-border">

                <div class="row">
                    <div class="col-md-4 col-md-offset-4">
                        <button type="button" data-widget="collapse" class="btn btn-block btn-primary">
                            Add New
                        </button>
                    </div>
                </div>
            </div>
            <div class="box-body">

                <form class="form-horizontal">
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-5">
                                <label for="name" class="col-sm-3 control-label">Name</label>

                                <div class="col-sm-9">
                                    <input type="text" class="form-control" id="name" v-model="newName" placeholder="Name">
                                </div>
                            </div>
                            <div class="form-group col-md-5">
                                <label for="type" class="col-sm-3 control-label">Type</label>

                                <div class="col-sm-9">
                                    <select class="form-control" v-model="newType">
                                        <option v-for="(option, index) in availableTypes" :key="index" :value="option">{{option}}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group col-md-5">
                                <label for="code" class="col-sm-3 control-label">Code</label>

                                <div class="col-sm-9">
                                    <input type="text" class="form-control" id="code" v-model="newCode" placeholder="code">
                                </div>
                            </div>
                            <div class="form-group col-md-5">
                                <label for="price-usd" class="col-sm-3 control-label">Value(USD)</label>

                                <div class="col-sm-9">
                                    <input type="text" class="form-control" id="price-usd" v-model="newprice_usd" placeholder="usd">
                                </div>
                            </div>
                            <div class="col-md-12">
                                <h2> Deposit Address </h2>
                                <div class="row">
                                    <div class="form-group col-md-3">
                                        <label for="price-usd" class="col-sm-3 control-label">Select Bank</label>
                                        <div class="col-sm-9">
                                            <select class="form-control" v-model="newType">
                                                <option v-for="(option, index) in availableTypes" :key="index" :value="option">{{option}}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-group col-md-3">
                                        <label for="price-usd" class="col-sm-3 control-label">Account Number</label>
                                        <div class="col-sm-9">
                                            <input type="text" class="form-control" id="price-usd" v-model="newprice_usd" placeholder="usd">
                                        </div>
                                    </div>
                                    <div class="form-group col-md-3">
                                        <label for="price-usd" class="col-sm-3 control-label">Account Name</label>
                                        <div class="col-sm-9">
                                            <input type="text" class="form-control" id="price-usd" v-model="newprice_usd" placeholder="usd">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group col-md-5">
                                <label for="symbol" class="col-sm-3 control-label">Symbol</label>

                                <div class="col-sm-9">
                                    <input type="file" id="symbol" v-on:change="newFile=$event.target.files[0]">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">
                        <button class="btn btn-default" data-widget="collapse">Cancel</button>
                        <button type="submit" class="btn btn-info pull-right" v-on:click.prevent="add">Add</button>
                    </div>
                </form>

            </div>
        </div>

        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">Assets</h3>
            </div>
            <div class="box-body">
                <table class="table table-bordered">
                    <tbody>
                        <tr>
                            <th style="width: 10px">#</th>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Symbol</th>
                            <th>Value(USD)</th>
                            <th>Deposit Address</th>
                            <th style="width: 10px">Sellable</th>
                            <th style="width: 10px">Buyable</th>
                        </tr>
                        <single-asset v-for="(asset, index) in assets" :key="index" v-bind="asset" :index="index"></single-asset>
                    </tbody>
                </table>
            </div>
            <!-- /.box-body -->
            <div class="box-footer clearfix">
                <ul class="pagination pagination-sm no-margin pull-right">
                    <li>
                        <a href="#">«</a>
                    </li>
                    <li>
                        <a href="#">1</a>
                    </li>
                    <li>
                        <a href="#">2</a>
                    </li>
                    <li>
                        <a href="#">3</a>
                    </li>
                    <li>
                        <a href="#">»</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <!-- <div class="row">
                                        <single-asset v-for="(asset, index) in assets" :key="index"></single-asset>
                                    </div> -->
</template>

<script>
import singleAsset from "./asset"
export default {
    data() {
        return {
            assets: [],
            availableTypes: ["fiat", "digital", "card"]
        }
    },
    created() {
        var request = this.request = new XMLHttpRequest();
        request.open("GET", `http://localhost:9000/api/assets/`)
        request.onreadystatechange = function(event) {
            if (request.readyState === 4) {
                this.assets = JSON.parse(request.response).result;
            }
        }.bind(this);
        request.send()
    },
    methods: {
        remove(_id, index) {
            var request = this.request = new XMLHttpRequest(); this.addReq = request;
            request.open("DELETE", `http://localhost:9000/api/config/${_id}`);
            request.send();
            request.onreadystatechange = function(event) {
                if (request.readyState === 4) {
                    console.log(request.response)
                    this.configs.splice(index, 1);
                }
            }.bind(this);
        },
        add() {
            var request = this.request = new XMLHttpRequest(); this.addReq = request;
            request.open("POST", `http://localhost:9000/api/config/`);
            request.setRequestHeader("Content-Type", "application/json");
            request.send(JSON.stringify({ key: this.newKey, value: this.newVal }));
            request.onreadystatechange = function(event) {
                if (request.readyState === 4) {
                    this.configs.push(JSON.parse(request.response).result);
                }
            }.bind(this);
        }
    },
    components: {
        "single-asset": singleAsset
    }
}
</script>

