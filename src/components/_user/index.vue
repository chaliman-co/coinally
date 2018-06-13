<template>
    <div class="box-widget widget-user-2">
        <div class="modal fade" :id="`verificationDetail-${index}`" style="display: none;" v-for="(verificationDetail, index) in user.verificationDetails" :key="index" v-if="verificationDetail && verificationDetail.imagePath">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                        <h4 class="modal-title">Image</h4>
                    </div>
                    <div class="modal-body">
                        <img :src="`http://localhost:9000/${verificationDetail.imagePath}`" alt="Image">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default pull-left" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="widget-user-header bg-yellow">
            <div class="widget-user-image">
                <img class="img-circle" v-if="user.imagePath" :src="`http://localhost:9000/${user.imagePath}`" alt="Image">
            </div>
            <button type="button" class="btn btn-lg btn-danger pull-right" v-on:click="changeUserStatus(user.status === 'active'? 'banned': 'active')"> {{user.status === "active"? "Ban": "Unban" }} </button>
            <h2 class="widget-user-username">{{ user.firstName }} {{user.lastName}} </h2>
            <h4 class="widget-user-desc">{{ user.emailAddress }}</h4>
            <h4 class="widget-user-desc">{{ user.phoneNumber.digits }}</h4>
            <h5 class="widget-user-desc">{{ user.country }}</h5>
        </div>
        <div class="box-footer no-padding">
            <ul class="nav nav-stacked">
                <li>

                    <div class="box box-default box-solid">
                        <div class="box-header with-border">
                            <h3 class="box-title">Transactions</h3>

                            <div class="box-tools pull-right">
                                <button type="button" class="btn btn-box-tool" data-widget="collapse">
                                    <i class="fa fa-minus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="box-body">
                            {{"No transactions"}}
                        </div>
                    </div>
                </li>

                <li>
                    <div class="box box-default box-solid">
                        <div class="box-header with-border">
                            <h3 class="box-title">Bank accounts</h3>
                            <div class="box-tools pull-right">
                                <button type="button" class="btn btn-box-tool" data-widget="collapse">
                                    <i class="fa fa-minus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="box-body">
                            <table class="table table-condensed">
                                <tbody>
                                    <tr>
                                        <th style="width: 10px">#</th>
                                        <th>Name</th>
                                        <th>Number</th>
                                        <th>Bank</th>
                                        <th>Verified</th>
                                        <th>Action</th>
                                    </tr>
                                    <tr v-for="(assetAccount, index) in user.assetAccounts.filter(assetAccount => assetAccount.asset.addressType === 'bank account')" :key="index">
                                        <td>{{index + 1}}.</td>
                                        <td>{{assetAccount.address.name}}</td>
                                        <td>{{assetAccount.address.number}}</td>
                                        <td>{{assetAccount.address.bankName}}</td>
                                        <td>{{assetAccount.isVerified}}</td>
                                        <td>
                                            <button class="btn btn-xs btn-success" v-on:click="changeAssetAccountVerification(user.assetAccounts.indexOf(assetAccount), assetAccount.isVerified? false: true)">
                                                {{assetAccount.isVerified? "Disapprove" : "Verify"}}
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="box box-default box-solid">
                        <div class="box-header with-border">
                            <h3 class="box-title">Address urls</h3>
                            <div class="box-tools pull-right">
                                <button type="button" class="btn btn-box-tool" data-widget="collapse">
                                    <i class="fa fa-minus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="box-body">

                            <table class="table table-condensed">
                                <tbody>
                                    <tr>
                                        <th style="width: 10px">#</th>
                                        <th>Name</th>
                                        <th>url</th>
                                    </tr>
                                    <tr v-for="(assetAccount, index) in user.assetAccounts.filter(assetAccount => assetAccount.asset.addressType === 'url')" :key="index">
                                        <td>{{index + 1}}.</td>
                                        <td>{{assetAccount.asset.name}}</td>
                                        <td>{{assetAccount.address}}</td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                    </div>
                </li>
                <li>
                    <div class="box box-default box-solid">
                        <div class="box-header with-border">
                            <h3 class="box-title">Verification Details</h3>
                            <div class="box-tools pull-right">
                                <button type="button" class="btn btn-box-tool" data-widget="collapse">
                                    <i class="fa fa-minus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="box-body">
                            <table class="table table-condensed">
                                <tbody>
                                    <tr>
                                        <th style="width: 10px">#</th>
                                        <th>type</th>
                                        <th>number</th>
                                        <th>image</th>
                                        <th>Approved</th>
                                        <th>Action</th </tr>
                                        <tr v-for="(verificationDetail, index) in user.verificationDetails" :key="index" v-if="verificationDetail">
                                            <td>{{index}}.</td>
                                            <td>{{verificationDetail.type}}</td>
                                            <td>{{verificationDetail.value}}</td>
                                            <td>
                                                <button type="button" v-if="verificationDetail.imagePath" style="height: 3em;" class="btn btn-xs btn-primary" data-toggle="modal" :data-target="`#verificationDetail-${index}`">
                                                    <img :src="`http://localhost:9000/${verificationDetail.imagePath}`" alt="Image">
                                                </button>
                                            </td>
                                            <td>{{verificationDetail.isApproved}}</td>
                                            <td>
                                                <button class="btn btn-xs btn-success" v-on:click.prevent="changeVerificationDetailApproval(index, verificationDetail.isApproved? false : true)">
                                                    {{verificationDetail.isApproved? "Disapprove" : "Appprove"}}
                                                </button>
                                            </td>
                                        </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            user: {
                phoneNumber: {},
                lastName: undefined,
                firstName: undefined,
                emailAddress: undefined,
                assetAccounts: [],
                verificationDetails: [],
                imagePath: undefined,
                country: undefined

            }
        }
    },
    created() {
        var request = this.request = new XMLHttpRequest();
        request.open("GET", `http://localhost:9000/api/users/${this.$route.params._id}/`)
        request.onreadystatechange = function(event) {
            if (request.readyState === 4) {
                this.user = JSON.parse(request.response).result;
            }
        }.bind(this);
        request.send()
    },
    methods: {
        changeVerificationDetailApproval(index, status) {
            var request = this.request = new XMLHttpRequest();
            request.open("POST", `http://localhost:9000/api/users/${this.user._id}/verification_details/${index}/is_approved`)
            request.setRequestHeader("Content-Type", "application/json");
            request.onreadystatechange = function(event) {
                if (request.readyState === 4) {
                    this.user.verificationDetails[index].isApproved = JSON.parse(request.response).result;
                }
            }.bind(this);
            request.send(JSON.stringify({ isApproved: status }));
        },
        changeAssetAccountVerification(index, status) {
            var request = this.request = new XMLHttpRequest();
            request.open("POST", `http://localhost:9000/api/users/${this.user._id}/asset_accounts/${index}/is_verified`)
            request.setRequestHeader("Content-Type", "application/json");
            request.onreadystatechange = function(event) {
                if (request.readyState === 4) {
                    this.user.assetAccounts[index].isVerified = JSON.parse(request.response).result;
                }
            }.bind(this);
            request.send(JSON.stringify({ isVerified: status }))
        },
        changeUserStatus(status) {
            var request = this.request = new XMLHttpRequest();
            request.open("PUT", `http://localhost:9000/api/users/${this.user._id}/status`);
            request.setRequestHeader("Content-Type", "application/json");
            request.onreadystatechange = function(event) {
                if (request.readyState === 4) {
                    this.user.status = JSON.parse(request.response).result;
                }
            }.bind(this);
            request.send(JSON.stringify({ status }));
        }
    }
}

</script>
