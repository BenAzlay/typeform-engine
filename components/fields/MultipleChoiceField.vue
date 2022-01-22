<template>
  <div class="w-full flex flex-col justify-start">
    <p
      v-if="subtitle !== 'false'"
      class="text-gray-400 text-base text-center w-full mb-4"
    >
      <span>{{ choicesHint }}</span>
    </p>
    <button
      v-for="(choice, index) in choices"
      :key="index"
      :class="[
        selected.includes(choice.label)
          ? 'mc-field-choice-selected'
          : 'mc-field-choice',
        selected.includes(choice.label) && doBlink === choice.label
          ? 'blink'
          : ''
      ]"
      class="flex justify-between"
      @click="setSelected(choice.label)"
    >
      <span v-html="choice.label" />
      <fa-icon
        :class="selected.includes(choice.label) ? 'opacity-100' : 'opacity-0'"
        icon="check"
        class="float-right ml-2 self-center"
      />
    </button>
    <transition
      name="custom-classes-transition"
      appear
      appear-active-class="animated faster fadeInDown"
      enter-active-class="animated faster fadeInDown"
      leave-active-class="animated faster fadeOutUp"
      mode="out-in"
    >
      <div v-if="selected.includes('Other')" class="mc-other-text-container">
        <input
          v-model="otherChoice"
          class="mc-other-text"
          placeholder="Please specify"
        />
      </div>
    </transition>
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
  name: 'MultipleChoiceField',
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
      doBlink: '',
      otherChoice: '',
      selected: []
    }
  },
  computed: {
    only () {
      return this.question.title.split('  ONLY=')[1]
        ? this.question.title
          .split('  ONLY=')[1]
          .split('  ')[0]
          .split(';')
        : []
    },
    subtitle () {
      return this.question.title.split('  SUBTITLE=')[1]
        ? this.question.title.split('  SUBTITLE=')[1].split('  ')[0].trim()
        : null
    },
    choices () {
      return this.question.properties.choices
    },

    choicesRef () {
      return this.question.properties.choices.map(choice => choice.ref)
    },

    randomize () {
      return this.question.properties.randomize || false
    },

    allowMultipleSelection () {
      return this.question.properties.allow_multiple_selection || false
    },

    allowOtherChoice () {
      return this.question.properties.allow_other_choice || false
    },

    minSelection () {
      return this.question.validations.min_selection || false
    },

    maxSelection () {
      return this.question.validations.max_selection || false
    },

    choicesHint () {
      const multiple = this.allowMultipleSelection
      const min = this.minSelection
      const max = this.maxSelection
      const equal = min === max

      if (multiple && min && max && equal) return `Choose ${min}`
      else if (multiple && min && max && !equal) { return `Choose from ${min} up to ${max}` } else if (multiple && !min && max) return `Choose up to ${max}}`
      else if (multiple && min && !max) return `Choose at least ${min}}`
      else if (multiple && !min && !max) return 'Choose all that apply'
      else return 'Choose one'
    },

    formattedAnswer () {
      const selected = this.selected
      const references = this.choicesRef
      const formatted = {
        references: references,
        field: {
          id: this.question.id,
          type: this.question.type,
          ref: this.question.ref
        }
      }

      if (!this.allowMultipleSelection) {
        // Don't allow multiple
        formatted.type = 'choice'
        formatted.choice = { label: selected[0] }
      } else {
        // Allow multiple
        formatted.type = 'choices'
        formatted.choices = {
          labels: selected.map(answer => answer)
        }
      }

      return formatted
    },

    displayOkButton () {
      const max = this.maxSelection
      const min = this.minSelection
      const length = this.selected.length
      if (this.selected.includes('Other') && this.otherChoice === '') { return false }
      if (this.allowMultipleSelection) {
        if (min && min <= length && max && max >= length) {
          return true
        } else if (!min && !max && length > 0) {
          return true
        } else {
          return false
        }
      } else if (
        !this.allowMultipleSelection &&
        this.selected.includes('Other') && this.otherChoice !== ''
      ) {
        return true
      } else {
        return false
      }
    }
  },
  watch: {
    otherChoice (newValue) {
      const index = this.question.properties.choices.findIndex(
        choice => choice.id === 'other'
      )
      this.question.properties.choices[index].ref = newValue
    },
    displayOkButton (validity) {
      this.$emit('validityCheck', validity)
    }
  },
  beforeCreate () {},
  created () {},
  beforeMount () {},
  mounted () {
    // Add "Other" choice
    if (
      this.allowOtherChoice &&
      !this.question.properties.choices.find(choice => choice.id === 'other')
    ) {
      this.question.properties.choices.push({
        id: 'other',
        ref: '',
        label: 'Other'
      })
    }
    // If there already are answers
    if (this.answer !== undefined) {
      // Set answered choices to selected
      if (Object.prototype.hasOwnProperty.call(this.answer, 'choices')) { this.selected = this.answer.choices.labels } else if (Object.prototype.hasOwnProperty.call(this.answer, 'choice')) {
        this.selected = [this.answer.choice.label]
        this.$emit('validityCheck', true)
      }
    }
    if (this.selected.includes('Other')) {
      this.otherChoice = this.question.properties.choices[
        this.question.properties.choices.length - 1
      ].ref
    }
  },
  beforeUpdate () {},
  updated () {},
  beforeDestroy () {},
  destroyed () {},
  methods: {
    setSelected (choice) {
      var selected = this.selected
      this.doBlink = choice // So that not all choices blink when coming back to question
      if (this.only.length > 0 && this.only.includes(choice)) {
        this.selected = [choice]
      } else if (this.allowMultipleSelection && this.maxSelection) {
        if (selected.some(answer => this.only.includes(answer))) {
          this.selected = selected.filter(
            answer => !this.only.includes(answer)
          )
        }
        if (selected.includes(choice.replace(/\s+/g, ''))) {
          this.selected = selected.filter(answer => answer !== choice)
        } else if (this.maxSelection > selected.length) {
          this.selected = [...selected, choice]
        }
      } else if (this.allowMultipleSelection) {
        if (selected.some(answer => this.only.includes(answer))) {
          selected = selected.filter(answer => !this.only.includes(answer))
        }
        if (selected.includes(choice)) {
          this.selected = selected.filter(answer => answer !== choice)
        } else {
          this.selected = [...selected, choice]
        }
      } else {
        if (selected.some(answer => this.only.includes(answer))) {
          this.selected = selected.filter(
            answer => !this.only.includes(answer)
          )
        }
        if (this.selected[0] !== choice) {
          this.selected = [choice]
          if (!this.selected.includes('Other')) { this.goNext(this.formattedAnswer) }
        }
      }
    },

    handleOkButtonClick () {
      this.goNext(this.formattedAnswer, false)
    }
  }
}
</script>

<style scoped>
</style>
