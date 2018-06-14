<template>
  <div class="dashboard-page">
    <sidebar/>
    <div class="dashboard__content">
      <div class="dashboard__top-bar">
        <div class="top-bar__table-md">
          <div class="top-bar__table-row">
            <div class="top-bar__table-cell top-bar__title">
              <div class="title">
                Currencies ({{ assets.length }})
              </div>
            </div>
            <div class="top-bar__table-cell top-bar__controls">
              <button
                class="btn-custom-japanese-laurel small"
                data-toggle="modal"
                data-target="#newCurrency">
                <i class="fa fa-plus"/> Add New Currency
              </button>

              <!-- <a href="verify.html" class="btn-custom-transparent-astronaut-blue small">
                            Verify Details
                        </a> -->
            </div>
          </div>
        </div>
      </div>
      <div class="dashboard__body">

        <div class="admin-dashboard__currency">
          <div class="currency__table">
            <div class="table-responsive">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Symbol</th>
                    <th>Value(USD)</th>
                    <th>Deposit Address</th>
                    <th>Sellable</th>
                    <th>Buyable</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Digital</td>
                    <td>Bitcoin</td>
                    <td>BTC</td>
                    <td>
                      <img
                        src="https://shapeshift.io/images/coins/bitcoin.png"
                        alt="Image">
                    </td>
                    <td>8314.49</td>
                    <td>dhdu888hh22j92002jdkdk</td>
                    <td>
                      <div class="checkbox-component">
                        <label>
                          <input type="checkbox">
                        </label>
                      </div>
                    </td>
                    <td>
                      <div class="checkbox-component">
                        <label>
                          <input type="checkbox">
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Digital</td>
                    <td>Ether</td>
                    <td>ETH</td>
                    <td>
                      <img
                        src="https://shapeshift.io/images/coins/ether.png"
                        alt="Image">
                    </td>
                    <td>8314.49</td>
                    <td>dhdu888hh22j92002jdkdk</td>
                    <td>
                      <div class="checkbox-component">
                        <label>
                          <input type="checkbox">
                        </label>
                      </div>
                    </td>
                    <td>
                      <div class="checkbox-component">
                        <label>
                          <input type="checkbox">
                        </label>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div
          id="newCurrency"
          class="modal-component modal fade new-currency-modal default">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <span class="modal-title">
                  Add a new currency
                </span>
                <button
                  type="button"
                  data-dismiss="modal"/>
              </div>
              <div class="modal-body">
                <div class="modal-body__container">
                  <div class="modal__pane clearfix">
                    <div class="input-fields">
                      <div class="form-row custom-form-group">
                        <div class="textbox-component custom-form-group">
                          <label for="currency-name">
                            Name
                          </label>
                          <input
                            id="currency-name"
                            type="text"
                            placeholder="Name" >
                        </div>
                        <div class="select-component">
                          <label for="currency-type">
                            Type
                          </label>
                          <select
                            id="currency-type"
                            name="currency-type"
                            class="custom-select">
                            <option value="fiat">Fiat</option>
                            <option value="digital">Digital</option>
                          </select>
                        </div>
                      </div>
                      <div class="form-row custom-form-group">
                        <div class="textbox-component custom-form-group">
                          <label for="currency-code">
                            Code
                          </label>
                          <input
                            id="currency-code"
                            type="text"
                            placeholder="Code" >
                        </div>
                        <div class="textbox-component">
                          <label for="currency-value">
                            Value(USD)
                          </label>
                          <input
                            id="currency-value"
                            type="number"
                            placeholder="0.00 USD" >
                        </div>
                      </div>
                    </div>
                    <div class="modal__title">
                      Deposit Address
                    </div>
                    <div class="input-fields">
                      <div class="select-component custom-form-group">
                        <label for="bank-name">
                          Bank Name
                        </label>
                        <select
                          id="bank-name"
                          name="bank-name"
                          class="custom-select">
                          <option value="ACCESS">Access Bank</option>
                          <option value="UBA">UBA</option>
                          <option value="ZENITH">Zenith Bank</option>
                        </select>
                      </div>
                      <div class="select-component custom-form-group">
                        <label for="account-type">
                          Account Type
                        </label>
                        <select
                          id="account-type"
                          name="account-type"
                          class="custom-select">
                          <option value="CURRENT">Current</option>
                          <option value="SAVINGS">Savings</option>
                        </select>
                      </div>
                      <div class="textbox-component custom-form-group">
                        <label for="account-number">
                          10-Digit NUBAN Account Number
                        </label>
                        <input
                          id="account-number"
                          type="number"
                          max="10"
                          placeholder="0..." >
                      </div>
                    </div>
                    <button class="call-to-action btn-custom-astronaut-blue">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- <div>

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
    </div> -->
</template>

<script>
import singleAsset from './asset/index.vue';
import sidebar from '../sideBar.vue';

export default {
  components: {
    'single-asset': singleAsset,
    sidebar,
  },
  data() {
    return {
      assets: [],
      availableTypes: ['fiat', 'digital', 'card'],
    };
  },
  created() {
    const request = this.request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:9000/api/assets/');
    request.onreadystatechange = function (event) {
      if (request.readyState === 4) {
        this.assets = JSON.parse(request.response).result;
      }
    }.bind(this);
    request.send();
  },
  methods: {
    remove(_id, index) {
      const request = this.request = new XMLHttpRequest(); this.addReq = request;
      request.open('DELETE', `http://localhost:9000/api/config/${_id}`);
      request.send();
      request.onreadystatechange = function (event) {
        if (request.readyState === 4) {
          console.log(request.response);
          this.configs.splice(index, 1);
        }
      }.bind(this);
    },
    add() {
      const request = this.request = new XMLHttpRequest(); this.addReq = request;
      request.open('POST', 'http://localhost:9000/api/config/');
      request.setRequestHeader('Content-Type', 'application/json');
      request.send(JSON.stringify({ key: this.newKey, value: this.newVal }));
      request.onreadystatechange = function (event) {
        if (request.readyState === 4) {
          this.configs.push(JSON.parse(request.response).result);
        }
      }.bind(this);
    },
  },
};
</script>

