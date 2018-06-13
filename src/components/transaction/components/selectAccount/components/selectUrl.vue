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
                        <div class="custom-form-group">
                            <div class="textbox-component" style="margin-bottom: 2rem;">
                                <label for="receipt-url">
                                    Receipt Address
                                </label>
                                <input type="text" id="receipt-url" placeholder="url..." />
                            </div>
                        </div>

                        <div class="textbox-component custom-form-group">
                            <label for="refund-url">
                                Refund Address
                            </label>
                            <input type="text" id="refund-url" placeholder="url..." />
                        </div>

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
