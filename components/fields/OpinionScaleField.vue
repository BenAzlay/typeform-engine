<template>
  <div class="w-full flex flex-col justify-start">
    <div class="w-full flex flex-row justify-start">
      <button
        v-for="(step, index) in steps"
        :key="index"
        :class="[
          selected === step && 'opinion-scale-square-selected',
          doBlink && selected === step ? 'blink': ''
        ]"
        class="opinion-scale-square first:rounded-l last:rounded-r first:ml-0"
        @click="setSelected(step)">
          {{ step }}
      </button>
    </div>
    <div v-if="labels" class="opinion-scale-labels-container">
      <span v-if="Object.prototype.hasOwnProperty.call(labels, 'left')" class="opinion-scale-label">
         {{labels.left}}
      </span>
      <span v-if="Object.prototype.hasOwnProperty.call(labels, 'center')" class="opinion-scale-label">
         {{labels.center}}
      </span>
      <span v-if="Object.prototype.hasOwnProperty.call(labels, 'right')" class="opinion-scale-label">
         {{labels.right}}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OpinionScaleField',
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
      doBlink: true,
      selected: null
    }
  },
  computed: {
    min () {
      return this.question.properties.start_at_one ? 1 : 0
    },

    max () {
      return this.question.properties.steps - (this.question.properties.start_at_one ? 0 : 1)
    },

    steps () {
      const array = []
      for (let i = this.min; i <= this.max; i++) {
        array.push(i)
      }

      return array
    },

    labels () {
      return this.question.properties.labels || null // keys: left, center, right
    },

    formattedAnswer () {
      return {
        type: 'number',
        field: {
          id: this.question.id,
          ref: this.question.ref,
          type: this.question.type
        },
        number: this.selected
      }
    }
  },
  watch: {},
  beforeCreate () {},
  created () {},
  beforeMount () {},
  mounted () {
    if (this.answer !== undefined) {
      this.doBlink = false
      this.selected = this.answer.number
    }
  },
  beforeUpdate () {},
  updated () {},
  beforeDestroy () {},
  destroyed () {},
  methods: {
    setSelected (step) {
      this.selected = step
      this.doBlink = true
      this.goNext(this.formattedAnswer)
    }
  }
}
</script>

<style scoped>
</style>
