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
                <div class="modal__pane" id="destination">
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
                    <button class="call-to-action btn-custom-astronaut-blue toggle-pane">
                        Start Transaction
                    </button>
                </div>
            </div>
                <div class="order-details">
                    <div class="transaction__type">
                        <img src="https://shapeshift.io/images/coins/bitcoin.png" alt="Bitcoin"> →
                        <img src="https://shapeshift.io/images/coins/ether.png" alt="Ether">
                    </div>
                    <div class="amount">
                        <span title="Deposit">D:</span> 2.2334BTC,
                        <span title="Receive">R:</span> 10.22344ETH
                    </div>
                    <div class="exchange-rate">
                        1 BTC = 5 ETH
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
