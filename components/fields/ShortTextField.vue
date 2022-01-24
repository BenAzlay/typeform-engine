<template>
  <div class="w-full flex flex-col justify-start">
    <div :class="question.type !== 'long_text' ? 'short-text-field-container' : 'long-text-field-container'">
      <input
          v-if="question.type !== 'long_text'"
          ref="input"
          type="text"
          class="short-text-field-input"
          v-model="input">
        <textarea
          v-else
          ref="input"
          class="long-text-field-input"
          v-model="input"></textarea>
    </div>
    <button v-if="displayOkButton" class="button button-primary" @click="handleOkButtonClick">OK</button>
  </div>
</template>

<script>
export default {
  name: 'ShortTextField',
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
      input: ''
    }
  },
  computed: {
    formattedAnswer () {
      return {
        type: this.question.type,
        text: this.input,
        field: {
          id: this.question.id,
          ref: this.question.ref,
          type: this.question.type
        }
      }
    },
    displayOkButton () {
      const isValidInput = (this.input.length > 0 && this.input.replace(/\s/g, '').length)

      return (isValidInput)
    }
  },
  watch: {
    displayOkButton (validity) {
      this.$emit('validityCheck', validity)
    }
  },
  created () {
    console.log(this.question)
  },
  mounted () {
    if (this.answer !== undefined) {
      this.input = this.answer.text
    }
  },
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

input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
}
</style>
