<template>
    <div>
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">Settings</h3>
            </div>
            <!-- /.box-header -->
            <div class="box-body">
                <table class="table table-bordered">
                    <tbody>
                        <tr>
                            <th style="width: 10px">#</th>
                            <th>Name</th>
                            <th>Value</th>
                            <th colspan="2">Action</th>
                        </tr>
                        <single-setting
                        v-for="(config, index) in configs"
                        :key="index"
                        :index="index"
                        v-bind="config"
                        :name="config.key"
                        v-on:removed="remove"></single-setting>
                    </tbody>
                </table>
            </div>
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
                        <div class="form-group">
                            <label for="inputEmail3" class="col-sm-2 control-label">Name</label>

                            <div class="col-sm-10">
                                <input type="text" class="form-control" id="inputEmail3" v-model="newKey" placeholder="Key">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="inputPassword3" class="col-sm-2 control-label">Value</label>

                            <div class="col-sm-10">
                                <input type="text" class="form-control" id="inputPassword3" v-model="newVal" placeholder="value">
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
    </div>
</template>

<script>
import singleSetting from "./setting";
export default {
    data() {
        return {
            configs: {},
            newKey: null,
            newVal: null
        }
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
    created() {
        var request = this.request = new XMLHttpRequest();
        request.open("GET", `http://localhost:9000/api/config/`)
        request.onreadystatechange = function(event) {
            if (request.readyState === 4) {
                this.configs = JSON.parse(request.response).result; console.log(this.configs)
            }
        }.bind(this);
        request.send()
    },
    components: {
        "single-setting": singleSetting
    }
}
</script>
