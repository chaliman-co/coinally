<template>
    <div>
        <div class="modal-header clearfix">
            <span class="modal-title">
                Verified
            </span>
            <button type="button" data-dismiss="modal"></button>
        </div>
        <div class="modal-body">
            <div class="modal-body__container">
                <div class="modal__pane" id="assets-selection">
                    <div class="input-fields">
                        <div class="select-component custom-form-group">
                            <label for="deposit">Receipt Bank account</label>
                            <vue-select :options="bankAccounts" label="label">
                                <template slot="option" slot-scope="option">
                                    {{option.label}}
                                </template>
                            </vue-select>
                        </div>
                        <button class="btn-custom-japanese-laurel add-new-account__button small custom-form-group">
                            <i class="fa fa-plus"></i>
                            Add New
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    inject: ['global'],
    data() {
        return {

        }
    },
    computed: {
        bankAccounts() {
            return this.global.user.assetAccounts.filter(account => typeof (account.address) == 'object').map(account => {
                account.label = account.address.number + ', ' + account.address.bankName;
                return account
            })
        },
    },
}
</script>
