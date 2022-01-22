export default {
  mixins: [],
  data () {
    return {}
  },
  computed: {},
  methods: {
    operatorAction (action, value, score) {
      let newScore = score

      switch (action) {
        case 'add':
          newScore += value
          break
        case 'substract':
          newScore -= value
          break
        case 'multiply':
          newScore *= value
          break
        case 'divide':
          newScore /= value
          break
      }

      return newScore
    },

    handleDateFieldCalculation ({ type, ref, actions }, answer, score) {
      for (const oneAction of actions) {
        const { action, details, condition } = oneAction

        const { vars } = condition

        const conditionValue = vars[1].value
        const value = details.value.value
        if (answer === conditionValue) {
          return this.operatorAction(action, value, score)
        }
      }
      return score
    },

    handleNumberAndOpinionScaleFieldCalculation ({ type, ref, actions }, answer, score) {
      for (const oneAction of actions) {
        const { action, details, condition } = oneAction

        const { op, vars } = condition

        if (op === 'always') {
          return this.operatorAction(action, answer, score)
        } else { // op === equals
          const conditionValue = vars[1].value
          const value = details.value.value
          if (answer === conditionValue) {
            return this.operatorAction(action, value, score)
          }
        }
      }
      return score
    },

    handleMultipleChoiceFieldCalculation ({ type, ref, actions }, answer, score, multipleSelection) {
      const question = this.getQuestionFromRef(ref)
      const choices = question.properties.choices
      const selectedRef = choices.map(choice => {
        if (multipleSelection) {
          if (answer.includes(choice.label)) return choice.ref
        } else {
          if (choice.label === answer) return choice.ref
        }
      })

      // console.log(`selectedRef=${selectedRef}`)

      for (const oneAction of actions) {
        const { action, details, condition } = oneAction

        const { vars } = condition

        const conditionValue = vars[1].value
        const value = details.value.value
        if (selectedRef.includes(conditionValue)) {
          score = this.operatorAction(action, value, score)
        }
      }
      return score
    }
  }
}
