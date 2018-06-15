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
            <div class="top-bar__table-cell top-bar__controls hidden">
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <single-asset
                    v-for="(asset, index) in assets"
                    :key="index"
                    v-bind="asset"
                    :index="index"
                    @edit="selectAsset(asset)"/>
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
                  Edit currency details
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
                            v-model="selectedAsset.name"
                            type="text"
                            placeholder="Name"
                            disabled >
                        </div>
                        <div class="select-component">
                          <label for="currency-type">
                            Type
                          </label>
                          <select
                            id="currency-type"
                            v-model="selectedAsset.type"
                            name="currency-type"
                            class="custom-select"
                            disabled>
                            <option value="fiat">Fiat</option>
                            <option value="digital">Digital</option>
                          </select>
                        </div>
                      </div>
                      <div class="form-row custom-form-group">
                        <div class="textbox-component custom-form-group">
                          <label for="selling_profit">
                            Selling Profit
                          </label>
                          <input
                            id="selling_profit"
                            v-model="selectedAsset.sellingProfit"
                            type="number"
                            placeholder="0.00"
                            step="0.00001">
                        </div>
                        <div class="textbox-component">
                          <label for="buying_profit">
                            Buying Profit
                          </label>
                          <input
                            id="buying_profit"
                            v-model="selectedAsset.buyingProfit"
                            type="number"
                            placeholder="0.00"
                            step="0.00001">
                        </div>
                      </div>
                    </div>
                    <div class="modal__title">
                      Deposit Address
                    </div>
                    <div
                      v-if="selectedAsset.type === 'digital'"
                      class="input-fields" >
                      <div class="select-component custom-form-group">
                        <label for="bank-name">
                          Wallet Address
                        </label>
                        <input
                          id="account-number"
                          v-model="selectedAsset.address"
                          type="text"
                          placeholder="0x00..." >
                      </div>
                    </div>
                    <div
                      v-else
                      class="input-fields">
                      <div class="select-component custom-form-group">
                        <label for="bank-name">
                          Bank Name
                        </label>
                        <select
                          id="bank-name"
                          v-model="selectedAsset.depositAccount.bankName"
                          name="bank-name"
                          class="custom-select">
                          <option>Access Bank</option>
                          <option>Diamond Bank</option>
                          <option>UBA</option>
                          <option>Zenith Bank</option>
                        </select>
                      </div>
                      <div class="select-component custom-form-group">
                        <label for="account-type">
                          Account Type
                        </label>
                        <select
                          id="account-type"
                          v-model="selectedAsset.depositAccount.type"
                          name="account-type"
                          class="custom-select">
                          <option value="Current">Current</option>
                          <option value="Savings">Savings</option>
                        </select>
                      </div>
                      <div class="textbox-component custom-form-group">
                        <label for="account-name">
                          Account Name
                        </label>
                        <input
                          id="account-name"
                          v-model="selectedAsset.depositAccount.name"
                          type="text"
                          placeholder="Coinlly Admin" >
                      </div>
                      <div class="textbox-component custom-form-group">
                        <label for="account-number">
                          10-Digit NUBAN Account Number
                        </label>
                        <input
                          id="account-number"
                          v-model="selectedAsset.depositAccount.number"
                          type="number"
                          max="10"
                          placeholder="0..." >
                      </div>
                    </div>
                  </div>
                  <button
                    :disabled="!isValid || isSaving"
                    class="call-to-action btn-custom-astronaut-blue"
                    @click="save">
                    Save
                    <i
                      v-if="isSaving"
                      class="fa fa-spinner fa-pulse"/>
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
import jQuery from 'jquery';
import singleAsset from './asset/index.vue';
import sidebar from '../sideBar.vue';

export default {
  inject: ['global'],
  components: {
    'single-asset': singleAsset,
    sidebar,
  },
  data() {
    return {
      assets: [],
      isSaving: false,
      selectedAsset: {
        id: null,
        name: null,
        type: null,
        address: null,
        buyingProfit: 0,
        sellingProfit: 0,
        depositAccount: {
          bankName: null,
          name: null,
          type: null,
          number: null,
        },
      },
      availableTypes: ['fiat', 'digital', 'card'],
    };
  },
  computed: {
    isValid() {
      if (this.selectedAsset.buyingProfit == null || this.selectedAsset.sellingProfit == null) {
        return false;
      }
      if (this.selectedAsset.type === 'digital' && this.selectedAsset.address == null) {
        return false;
      }
      if (this.selectedAsset.type === 'fiat') {
        if (Object.values(this.selectedAsset.depositAccount).includes(null)) {
          return false;
        }
      }
      return true;
    },
  },
  created() {
    const url = '/assets';
    this.global.request('GET', url, null, (err, response) => {
      if (!err) {
        this.assets = response;
      }
    });
  },
  methods: {
    selectAsset(asset) {
      this.selectedAsset = {
        id: asset._id,
        name: asset.name,
        type: asset.type,
        buyingProfit: asset.buyingProfit,
        sellingProfit: asset.sellingProfit,
        address: asset.type === 'digital' ? asset.depositAddress : null,
        depositAccount: asset.type === 'fiat' ? asset.depositAddress : {},
      };
    },
    save() {
      const data = {
        buyingProfit: Number(this.selectedAsset.buyingProfit),
        sellingProfit: Number(this.selectedAsset.sellingProfit),
        depositAddress: this.selectedAsset.type === 'digital' ? this.selectedAsset.address : this.selectedAsset.depositAccount,
      };

      const url = `/assets/${this.selectedAsset.id}`;

      this.isSaving = true;
      this.global.request('PUT', url, data, (err, response) => {
        this.isSaving = false;
        if (!err) {
          let asset = this.assets.find(a => a._id == response._id);
          if (asset != null) {
            asset = response;
          }
          jQuery('#newCurrency').modal('hide');
        }
      });
    },
  },
};
</script>

