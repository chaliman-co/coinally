<template>
  <div>
    <div
      class="btn-group flags-dropdown"
      style="height: 100%">
      <button
        type="button"
        class="btn btn-default dropdown-toggle"
        style="width: 100%"
        data-toggle="dropdown">
        <img
          :src="`${countryFlagsUrl}/${countryCode}.png`"
          :alt="`${countryCode}`"
          class="selected-image"
          style="">
      </button>
      <ul
        class="dropdown-menu country-menu"
        role="menu">
        <li
          v-for="(countryInfo, index) in countryData"
          :key="index">
          <a
            href="#"
            @click="countryCode=countryInfo[1].toUpperCase()">
            <img
              :src="`${countryFlagsUrl}/${countryInfo[1].toUpperCase()}.png`"
              :alt="`${countryInfo[1]}`"
              class="dropdown-image"> {{ countryInfo[0] }} +{{ countryInfo[2] }}
          </a>
        </li>
      </ul>
    </div>
    <div class="input-wrapper">

      <input
        :value="rawInput"
        :class="validity"
        :required="required"
        type="text"
        class="form-control number-input"
        @input="oninput">

    </div>
  </div>
</template>

<script>
import countryData from '../countryData';
import Libphonenumber from 'google-libphonenumber';

const phoneUtil = Libphonenumber.PhoneNumberUtil.getInstance();
export default {
    props: ['value', 'required', 'errorMessage'],
    data() {
        return {
            countryFlagsUrl: 'https://raw.githubusercontent.com/behdad/region-flags/gh-pages/png',
            countryData,
            rawInput: null,
            countryCode: countryData[0][0].toUpperCase(),
            formatter: null,
            currentValue: null,
        };
    },
    computed: {
        validity() {
            return this.currentValue && this.currentValue.isValid ? 'is-valid' : 'is-invalid';
        },
    },
    watch: {
        countryCode() {
            this.formatter = new Libphonenumber.AsYouTypeFormatter(this.countryCode);
        },
        value() {
            this.countryCode = this.currentValue.region;
        },
    },
    created() {
        if (this.value) {
            this.countryCode = this.value.region;
            this.formatter = new Libphonenumber.AsYouTypeFormatter(this.value.region);
            this.oninput({ target: { value: this.value.digits } });
        }

        fetch({
            url: 'https://ipinfo.io/json',
            method: 'GET',
        })
        .then(response => response.json())
        .then((data) => {
            if (!data) {
                this.countryCode = data.country;
            } else {
                this.countryCode = this.countryCode || this.countryData[0][1].toUpperCase();
            }
        })
        .catch(() => {
            this.countryCode = this.countryCode || this.countryData[0][1].toUpperCase();
        });
    },
    methods: {
        oninput(event) {
            const input = event.target.value.replace(/ /g, '');
            let number;
            let isValid;

            if (!input) return;
            this.formatter.clear();
            for (const digit of input) {
                this.formatter.inputDigit(digit);
            }
            try {
                number = phoneUtil.parseAndKeepRawInput(input, this.countryCode);
                isValid = phoneUtil.isValidNumberForRegion(number, this.countryCode);
            } catch (err) {
            }
            if (isValid) {
                if (event.target.setCustomValidity) event.target.setCustomValidity('');
                this.rawInput = phoneUtil.format(number, 1).trim();
                this.$emit('input', this.currentValue = { region: this.countryCode, digits: this.rawInput, isValid: true });
                return;
            }
            this.rawInput = this.formatter.currentOutput_.trim();
            if (event.target.setCustomValidity) event.target.setCustomValidity(this.errorMessage);
            this.$emit('input', this.currentValue = { region: this.countryCode, digits: this.rawInput, isValid: false });
        },
    },

};
</script>

<style>
.flags-dropdown,
.number-input {
    float: left;
    display: inline-block;
}

.flags-dropdown {
    width: 57px;
    border: 2px rgba(100, 100, 100, 0.3) solid;
    background-color: rgba(240, 240, 240, 1);

    border-radius: 10%;
}

.number-input {
    width: 100%;
    height: 100%;
}

.dropdown-image {
    display: inline-block;
    height: 18px;
    width: 8%;
}

.input-wrapper {
    overflow: hidden;
}

.selected-image {
    height: 18px;
    width: 100%;
}

.country-menu {
    overflow-y: scroll;
    max-height: 280px;
    overflow-x: hidden;
}

.flags-dropdown button {
    border: 0;
    background-color: inherit;
}

.is-valid {

    border: 2px green solid !important;
}

.is-invalid {

    border: 2px red solid !important;
}
</style>
