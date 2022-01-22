<template>
  <div class="w-full flex flex-col justify-start">
    <div class="number-field-container" v-if="unit && unit.length > 1">
      <input
        ref="otherInput"
        type="number"
        aria-controls="none"
        class="number-field-input"
        v-model="otherInput"
      />
      <span v-if="unit" class="number-field-unit">{{ unit[1] }}</span>
    </div>
    <div class="number-field-container">
      <input
        ref="input"
        type="number"
        aria-controls="none"
        class="number-field-input"
        v-model="input"
      />
      <span v-if="unit" class="number-field-unit">{{ unit[0] }}</span>
    </div>
    <button
      v-if="displayOkButton"
      class="button button-primary"
      @click="handleOkButtonClick"
    >
      OK
    </button>
  </div>
</template>

<script>
export default {
  name: 'NumberField',
  components: {},
  mixins: [],
  props: {
    question: {
      type: Object,
      required: true
    },

    answer: {
      type: Object,
      default: undefined
    },

    goNext: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      input: '',
      otherInput: ''
    }
  },
  computed: {
    unit () {
      return this.question.title.split('  UNIT=')[1]
        ? this.question.title
          .split('  UNIT=')[1]
          .split('  ')[0]
          .split(';')
        : null
    },

    float () {
      return this.question.title.split('  FLOAT=')[1]
        ? this.question.title.split('  FLOAT=')[1].split('  ')[0]
        : null
    },

    minValue () {
      const min = this.question.validations.min_value
      return typeof min === 'number' ? min : false
    },

    maxValue () {
      const max = this.question.validations.max_value
      return typeof max === 'number' ? max : false
    },

    otherMinValue () {
      return this.question.title.split('  MIN=')[1]
        ? this.question.title.split('  MIN=')[1].split('  ')[0]
        : false
    },

    otherMaxValue () {
      return this.question.title.split('  MAX=')[1]
        ? this.question.title.split('  MAX=')[1].split('  ')[0]
        : false
    },

    inputAsNumber () {
      if (this.float === 'false' && this.unit && this.unit.length > 1) {
        return Number(this.otherInput + '.' + this.input)
      }
      return Number(this.input)
    },

    displayOkButton () {
      const otherMax = Number(this.otherMaxValue)
      const otherMin = Number(this.otherMinValue)

      if (this.float === 'false' && this.unit && this.unit.length > 1) {
        if (
          this.minValue !== false &&
          this.maxValue !== false &&
          otherMax !== false &&
          otherMin !== false
        ) {
          return (
            this.input.length > 0 &&
            this.otherInput.length > 0 &&
            this.minValue <= this.input &&
            this.input <= this.maxValue &&
            otherMin <= this.otherInput &&
            this.otherInput <= otherMax
          )
        } else {
          // TODO: Add all eventualities
          return this.input.length > 0
        }
      } else {
        if (this.minValue !== false && this.maxValue !== false) {
          return (
            this.input.length > 0 &&
            this.minValue <= this.inputAsNumber &&
            this.inputAsNumber <= this.maxValue
          )
        } else if (this.minValue !== false) {
          return this.input.length > 0 && this.minValue <= this.inputAsNumber
        } else if (this.maxValue !== false) {
          return this.input.length > 0 && this.inputAsNumber <= this.maxValue
        } else {
          return this.input.length > 0
        }
      }
    },

    formattedAnswer () {
      return {
        type: 'number',
        number: this.inputAsNumber,
        field: {
          id: this.question.id,
          type: this.question.type,
          ref: this.question.ref
        }
      }
    }
  },
  watch: {
    displayOkButton (validity) {
      this.$emit('validityCheck', validity)
    }
  },
  beforeCreate () {},
  created () {},
  beforeMount () {},
  mounted () {
    if (this.answer !== undefined) {
      if (this.float === 'false' && this.unit && this.unit.length > 1) {
        this.input = this.answer.number.toString().split('.')[1]
        this.otherInput = this.answer.number.toString().split('.')[0]
      } else {
        this.input = this.answer.number.toString()
      }
    }
  },
  beforeUpdate () {},
  updated () {},
  beforeDestroy () {},
  destroyed () {},
  methods: {
    handleOkButtonClick () {
      this.goNext(this.formattedAnswer, false)
    }
  }
}
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type="number"] {
  -moz-appearance: textfield; /* Firefox */
}
</style>
