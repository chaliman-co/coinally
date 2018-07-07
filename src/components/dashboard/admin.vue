<template>
    <div class="dashboard__content">
              <transaction-modal/>
            <div class="dashboard__top-bar">
                <div class="top-bar__table-md">
                    <div class="top-bar__table-row">
                        <div class="top-bar__table-cell top-bar__title">
                            <div class="title">
                                Dashboard
                            </div>
                        </div>
                        <div class="top-bar__table-cell top-bar__controls">

        <a href="" class="btn-custom-astronaut-blue small" data-toggle="modal" data-target="#exchange-modal">
            <i class="fa fa-plus"></i> New Transaction
        </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="dashboard__body">

                <div class="dashboard__table-md admin-dashboard__dashboard">
                    <div class="dashboard__table-row">
                        <div class="dashboard__table-cell dashboard__left-col">
                            <div class="dashboard-pane dashboard-pane--lg newest-orders">
                                <div class="dashboard-pane__header">
                                    <div class="header__title">
                                        Newest Orders
                                    </div>
                                    <div class="header__subtitle">
                                        23
                                    </div>
                                </div>
                                <div class="dashboard-pane__body">
                                    <div class="order-item new">
                                        <div class="order-item__title">
                                            0.34 ETH to BTC
                                        </div>
                                        <div class="order-item__subtitle">
                                            2 minutes ago - Jane Doe
                                        </div>
                                    </div>
                                    <div class="order-item new">
                                        <div class="order-item__title">
                                            0.34 ETH to BTC
                                        </div>
                                        <div class="order-item__subtitle">
                                            2 minutes ago - Jane Doe
                                        </div>
                                    </div>
                                    <div class="order-item">
                                        <div class="order-item__title">
                                            0.34 ETH to BTC
                                        </div>
                                        <div class="order-item__subtitle">
                                            2 minutes ago - Jane Doe
                                        </div>
                                    </div>
                                    <div class="order-item">
                                        <div class="order-item__title">
                                            0.34 ETH to BTC
                                        </div>
                                        <div class="order-item__subtitle">
                                            2 minutes ago - Jane Doe
                                        </div>
                                    </div>
                                    <div class="order-item">
                                        <div class="order-item__title">
                                            0.34 ETH to BTC
                                        </div>
                                        <div class="order-item__subtitle">
                                            2 minutes ago - Jane Doe
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--lg order-charts">
                                <div class="dashboard-pane__header">
                                    <div class="header__title">
                                        Order Charts
                                    </div>
                                    <div class="header__subtitle">
                                        01 Jan. 2018 to 05 Mar. 2018
                                    </div>
                                </div>
                                <div class="dashboard-pane__body">
                                    <div class="order-chart">
                                        <img class="placeholder-image" src="https://datavizcatalogue.com/methods/images/top_images/bar_chart.png" alt="Dunno which chart library you'll be using so I'm using an image"
                                            title="Dunno which chart library you'll be using so I'm using an image">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="dashboard__table-cell dashboard__right-col">
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="~img/cart.svg" class="dashboard-pane__icon" alt="Cart" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        900
                                    </div>
                                    <div class="body__subtitle">
                                        New orders
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="~img/chart.svg" class="dashboard-pane__icon" alt="" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        53%
                                    </div>
                                    <div class="body__subtitle">
                                        Sale Stats
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="~img/new-user.svg" class="dashboard-pane__icon" alt="" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        44
                                    </div>
                                    <div class="body__subtitle">
                                        User registrations
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="~img/money.svg" class="dashboard-pane__icon" alt="" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        $5,000
                                    </div>
                                    <div class="body__subtitle">
                                        Processed
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="https://shapeshift.io/images/coins/ether.png" class="dashboard-pane__icon" alt="" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        ETH 12
                                    </div>
                                    <div class="body__subtitle">
                                        Processed
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="https://shapeshift.io/images/coins/bitcoin.png" class="dashboard-pane__icon" alt="" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        BTC 20.778
                                    </div>
                                    <div class="body__subtitle">
                                        Processed
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="~img/money.svg" class="dashboard-pane__icon" alt="" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        NGN 1.1M
                                    </div>
                                    <div class="body__subtitle">
                                        Processed
                                    </div>
                                </div>
                            </div>
                            <div class="dashboard-pane dashboard-pane--sm dashboard-pane--hover">
                                <img src="https://shapeshift.io/images/coins/bitcoincash.png" class="dashboard-pane__icon" alt="" />
                                <div class="dashboard-pane__body">
                                    <div class="body__title">
                                        BCH 4000
                                    </div>
                                    <div class="body__subtitle">
                                        Processed
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
</template>

<script>
import transactionModal from '../transactionModal.vue';
export default {
    components: {
    transactionModal
    }
}
</script>
