<template lang="html">
      <div class="home-page" data-controller="HomeController">
    <header>      
      <div class="header__table-md">
        <div class="header__table-row">
          <div class="header__table-cell header__caption">
            <h3 class="caption__title">
              We
              <span>Buy</span> and
              <span>Sell</span> Digital Assets
            </h3>
            <div class="caption__subtitle">
              The safest way to buy Bitcoin, Ethereum, Litecoin and many other blockchain tokens.
            </div>
          </div>
          <select-asset></select-asset>
        </div>
      </div>
    </header>
    <section class="rates-monitor">
      <div class="rate" data-magik="magik">
        <div class="rate__type gain"></div>
        <div class="rate__name">
          BTC
        </div>
        <div class="rate__price">
          ${{'8988.2000' | numberFormat}}
        </div>
        <div class="rate__change loss">
          -3.86%
        </div>
      </div>
      <div class="rate" data-magik="magik">
        <div class="rate__type loss"></div>
        <div class="rate__name">
          ETH
        </div>
        <div class="rate__price">
          $8988.2000
          
        </div>
        <div class="rate__change gain">
          3.86%
        </div>
      </div>
      <div class="rate" data-magik="magik">
        <div class="rate__type gain"></div>
        <div class="rate__name">
          BTC
        </div>
        <div class="rate__price">
          $8988.2000
        </div>
        <div class="rate__change loss">
          -3.86%
        </div>
      </div>
      <div class="rate" data-magik="magik">
        <div class="rate__type "></div>
        <div class="rate__name">
          BTC
        </div>
        <div class="rate__price">
          $8988.2000
        </div>
        <div class="rate__change loss">
          -3.86%
        </div>
      </div>
      <div class="rate" data-magik="magik">
        <div class="rate__type "></div>
        <div class="rate__name">
          BTC
        </div>
        <div class="rate__price">
          $8988.2000
        </div>
        <div class="rate__change loss">
          -3.86%
        </div>
      </div>
      <div class="rate" data-magik="magik">
        <div class="rate__type gain"></div>
        <div class="rate__name">
          BTC
        </div>
        <div class="rate__price">
          $8988.2000
        </div>
        <div class="rate__change loss">
          -3.86%
        </div>
      </div>
    </section>
    <section class="features">
      <div class="features__table-md">
        <div class="features__table-row">
          <div class="features__table-cell feature-item" data-magik="magik">
            <img src="~src/img/easy.svg" alt="Easy" class="feature-item__icon">
            <h3 class="feature-item__title">
              Easy
            </h3>
            <div class="feature-item__body">
              Choose the altcoins or blockchain tokens you would like to exchange, input your receiving address, &amp; send your funds.
              Fast crypto market exchanges, no fees, and a delightful process.
            </div>
          </div>
          <div class="features__table-cell feature-item" data-magik="magik">
            <img src="~src/img/secure.svg" alt="Safe" class="feature-item__icon">
            <h3 class="feature-item__title">
              Safe
            </h3>
            <div class="feature-item__body">
              Unlike other digital asset and bitcoin exchanges, you don’t need an account to use ShapeShift. This means your funds and
              information don’t suffer custodial risk.
            </div>
          </div>
          <div class="features__table-cell feature-item" data-magik="magik">
            <img src="~src/img/competitive.svg" alt="Easy" class="feature-item__icon">
            <h3 class="feature-item__title">
              Competitive
            </h3>
            <div class="feature-item__body">
              We offer competitive altcoin and btc exchange rates that update in real time, with no fees on top. Our liquidity and expertise
              in cryptocurrency trading continually improve.
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="how-it-works">
        <div class="how-it-works__table-md">
            <div class="how-it-works__table-row">
                <div class="how-it-works__table-cell">
                    <div class="how-it-works__title">
                        Whether you're new to trading and digital assets or you are a lord in the field of digital assets trading we're here to help.
                        In just a few clicks, you should be done!
                    </div>
                </div>
                <div class="how-it-works__table-cell">
                    <div class="how-it-works-item" data-index="01">
                        <div class="how-it-works-item__title">
                            Join
                        </div>
                        <div class="how-it-works-item__body">
                            Create a free Coinaly Wallet on web, iOS or Android and go through a very simple identity verification process.
                        </div>
                    </div>
                    <div class="how-it-works-item" data-index="02">
                        <div class="how-it-works-item__title">
                            Initiate
                        </div>
                        <div class="how-it-works-item__body">
                            Login to your Coinaly account, click on create new order. Select Buy or Sell order and fill the amount.
                        </div>
                    </div>
                    <div class="how-it-works-item" data-index="03">
                        <div class="how-it-works-item__title">
                            Receive
                        </div>
                        <div class="how-it-works-item__body">
                            Processing time is averagely less than 4 hours. Once your transaction is confirmed, we’ll remit your assets to your desired
                            account.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section class="recent-transactions">
      <img src="~src/img/exchange.svg" alt="Exchnge" class="icon">
      <h3 class="title">
        Recent Transactions
      </h3>
      <div class="transaction-items transaction-item__table">
        <div class="transaction-item__table-row">
          <div class="transaction-item__table-cell transaction-item__description">
            0.022
            <a href="">BTC</a> to
            <a href="">DOGE</a>
          </div>
          <div class="transaction-item__table-cell transaction-item__time">
            10 minutes ago
          </div>
        </div>
        <div class="transaction-item__table-row">
          <div class="transaction-item__table-cell transaction-item__description">
            0.022
            <a href="">BTC</a> to
            <a href="">DOGE</a>
          </div>
          <div class="transaction-item__table-cell transaction-item__time">
            10 minutes ago
          </div>
        </div>
        <div class="transaction-item__table-row">
          <div class="transaction-item__table-cell transaction-item__description">
            0.022
            <a href="">BTC</a> to
            <a href="">DOGE</a>
          </div>
          <div class="transaction-item__table-cell transaction-item__time">
            10 minutes ago
          </div>
        </div>
      </div>
    </section>
    <section class="statistics">
      <div class="statistics__table-md">
        <div class="statistics__table-row">
          <div class="statistics__table-cell statistics__header">
            <img src="~src/img/statistics.svg" alt="Statistics" class="icon">
            <h3 class="title">
              24-hour Statistics
            </h3>
          </div>
          <div class="statistics__table-cell statistics__statistics">
            <div class="statistics-items">
              <div class="statistics-item" data-magik="magik">
                <h4 class="title">
                  Transactions
                </h4>
                <div class="subtitle">
                  10,828
                </div>
              </div>
              <div class="statistics-item" data-magik="magik">
                <h4 class="title">
                  Bitcoin Volume Equivalent
                </h4>
                <div class="subtitle">
                  1,021.231 BTC
                </div>
              </div>
              <div class="statistics-item" data-magik="magik">
                <h4 class="title">
                  Average Processing Time
                </h4>
                <div class="subtitle">
                  1244 seconds
                </div>
              </div>
              <div class="statistics-item" data-magik="magik">
                <h4 class="title">
                  Most Popular Trade
                </h4>
                <div class="subtitle">
                  ETH &rarr; BTC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="referral">
        <div class="referral__table-md">
            <div class="referral__table-row">
                <div class="referral__table-cell referral__image">
                    <img src="~img/referral.jpg" alt="Referral" class="image">
                </div>
                <div class="referral__table-cell referral__content">
                    <h3 class="referral__title">
                        Mention us to your friends and get rewarded every time!
                    </h3>
                    <router-link to="/signup" class="btn-custom-white">
                        Get your referral link already!
                    </router-link>
                </div>
            </div>
        </div>
    </section>
  </div>
</template>

<script>
import selectAsset from "./selectAsset";
export default {
  components: {
    "select-asset": selectAsset
  }
}
</script>
