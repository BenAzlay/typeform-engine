<template>
  <div class="w-full flex flex-col justify-start">
    <button class="button button-primary" @click="handleOkButtonClick">{{ question.properties.button_text }}</button>
  </div>
</template>

<script>
export default {
  name: 'StatementField',
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
    }
  },
  computed: {
    formattedAnswer () {
      return {
        type: this.question.type,
        field: {
          id: this.question.id,
          ref: this.question.ref,
          type: this.question.type
        }
      }
    }
  },
  watch: {},
  beforeCreate () {},
  created () {},
  beforeMount () {},
  mounted () {
    this.$emit('validityCheck', true)
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

input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
}
</style>
