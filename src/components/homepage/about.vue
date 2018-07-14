<template>
<div class="about-page">
    <header>
        <h3 class="header__caption">
            Wealthy-minded persons pursue freedom not riches, set yourself free!
        </h3>
    </header>
    <section class="about-us">
        <p>
            We believe that blockchain has the power to fast-track development in the world and digital assets like cryptocurrencies
            will significantly change how the world views and uses money, giving more freedom to individuals and yet more
            privacy, customising user experiences and ultimately decentralising the market by giving everyone access to the
            same financial system, irrespective of who they are or where they are.
        </p>
        <p>
            Thus it is our vision to empower the African Populace, bringing wealth to their doorstep, irrespective of their social class
            or location.
        </p>
        <div class="cta">
            <h3 class="cta__text">
                It's easy
            </h3>
            <router-link class="btn-custom-astronaut-blue cta__button" to="/signup">
                Start today
            </router-link>
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
                        Share the opportunity with friends and get rewarded!
                    </h3>
                    <router-link class="btn-custom-white" to="/signup">
                        Get your referral link already!
                    </router-link>
                </div>
            </div>
        </div>
    </section>
</div>
</template>

<script>
export default {
    
}
</script>
