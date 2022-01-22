<template>
  <div class="w-full flex flex-col justify-start space-y-2">
    <!-- <date-picker
      v-model="input"
      mode="single"
      :value="input"
      :to-page="toPage"
      :min-date="minValue"
      :max-date="maxValue"
      is-inline
      is-expanded
    /> -->

    <button v-if="displayOkButton" class="button button-primary" @click="handleOkButtonClick">OK</button>
  </div>
</template>

<script>
import { mapState } from 'vuex'

// import DatePicker from 'v-calendar/lib/components/date-picker.umd'
export default {
  name: 'DateField',
  components: {
    // DatePicker
  },
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
      input: null,
      toPage: undefined
    }
  },
  computed: {
    ...mapState([
      'now'
    ]),
    minValue () {
      var minValue = this.question.title.split('  MIN=')[1]
        ? this.question.title.split('  MIN=')[1].split('  ')[0]
        : null
      console.log(minValue)
      if (minValue) {
        if (minValue === 'today') {
          minValue = this.dateObjectToYYYYMMDD(
            this.now
          )
        } else if (minValue === 'tomorrow') {
          var tomorrow = new Date()
          tomorrow.setDate(this.now.getDate() + 1)
          minValue = this.dateObjectToYYYYMMDD(
            tomorrow
          )
        }
      }
      return minValue
    },

    maxValue () {
      var maxValue = this.question.title.split('  MAX=')[1]
        ? this.question.title.split('  MAX=')[1].split('  ')[0]
        : null
      console.log(maxValue)
      if (maxValue) {
        if (maxValue === 'today') {
          maxValue = this.dateObjectToYYYYMMDD(
            this.now
          )
        } else if (maxValue === 'tomorrow') {
          var tomorrow = new Date()
          tomorrow.setDate(this.now.getDate() + 1)
          maxValue = this.dateObjectToYYYYMMDD(
            tomorrow
          )
        }
      }
      return maxValue
    },

    formattedAnswer () {
      const formatted = {
        type: this.question.type,
        field: {
          id: this.question.id,
          ref: this.question.ref,
          type: this.question.type
        }
      }

      if (this.input) {
        formatted.date = this.dateObjectToYYYYMMDD(this.input)
      } else {
        formatted.date = null
      }

      return formatted
    },

    displayOkButton () {
      return !!this.input
    }
  },
  watch: {
    // formattedAnswer (newVal) {
    //   console.table(newVal)
    // }
  },
  beforeCreate () {},
  created () {},
  beforeMount () {},
  mounted () {
    if (this.answer) {
      this.input = new Date(this.answer.date)
      this.toPage = {
        month: this.input.getMonth() + 1,
        year: this.input.getFullYear()
      }
    }
  },
  beforeUpdate () {},
  updated () {},
  beforeDestroy () {},
  destroyed () {},
  methods: {
    dateObjectToYYYYMMDD (date) {
      let day = date.getDate().toString()
      let month = (date.getMonth() + 1).toString()
      const year = date.getFullYear().toString()

      if (day.length < 2) {
        day = '0' + day
      }

      if (month.length < 2) {
        month = '0' + month
      }

      return `${year}-${month}-${day}`
    },

    handleOkButtonClick () {
      this.goNext(this.formattedAnswer, false)
    }
  }
}
</script>

<style scoped>
</style>
