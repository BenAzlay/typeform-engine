export default {
  mixins: [],
  data () {
    return {}
  },
  computed: {},
  methods: {
    findPastAnswer (op, constant, answer) {
      // Checks if past answer even exists
      if (answer === undefined) {
        return false
      }

      let question
      let selectedRef
      // console.log(op)
      switch (answer.type) {
        case 'date':
          return this.dateFieldLogicComparator(op, this.dateInputToMilliseconds(constant), this.dateInputToMilliseconds(answer.date))
        case 'number':
          return this.numberAndOpinionScaleFieldLogicComparator(op, constant, answer.number)
        case 'opinion_scale':
          return this.numberAndOpinionScaleFieldLogicComparator(op, constant, answer.number)
        case 'short_text':
          return this.textFieldLogicComparator(op, constant, answer.text)
        case 'choice':
          question = this.getQuestionFromRef(answer.field.ref)
          selectedRef = question.properties.choices.find(choice => answer.choice.label === choice.label).ref
          // console.log(constant)
          return this.multipleChoiceFieldLogicComparator(op, constant, selectedRef)
        case 'choices':
          question = this.getQuestionFromRef(answer.field.ref)
          selectedRef = question.properties.choices.map(choice => {
            if (answer.choices.labels.includes(choice.label)) return choice.ref
          })
          return this.multipleChoiceFieldLogicComparator(op, constant, selectedRef)
      }
    },

    dateInputToMilliseconds (input) {
      return new Date(input).getTime()
    },

    dateFieldLogicComparator (op, constant, answer) {
      let valid = false

      switch (op) {
        case 'on':
          valid = constant === answer
          break
        case 'not_on':
          valid = constant !== answer
          break
        case 'earlier_than':
          valid = constant > answer
          break
        case 'earlier_than_or_on':
          valid = constant >= answer
          break
        case 'later_than':
          valid = constant < answer
          break
        case 'later_than_or_on':
          valid = constant <= answer
          break
      }

      return valid
    },

    handleDateFieldLogic ({ type, ref, actions }, answer) {
      const convertedAnswer = this.dateInputToMilliseconds(answer)

      for (const oneAction of actions) {
        const { details, condition } = oneAction
        const jumpToRef = details.to.value
        const { op, vars } = condition
        if (op === 'always') {
          return jumpToRef
        } else if (op === 'and' || op === 'or') {
          const array = [] // This array will be a collection the results of every check
          for (const oneCondition of vars) {
            // Getting the condition's value with which to compare the answer
            const field = oneCondition.vars.find(item => item.type === 'field')
            const constant = oneCondition.vars.find(item => item.type === 'constant' || item.type === 'choice')
            const convertedConstant = this.dateInputToMilliseconds(constant.value)
            const pastAnswer = this.answers.find(answer => answer.field.ref === field.value)
            // Checks if the condition refers to a past answer
            // Check if logic of current iteration passes
            const isValid = ref === field.value
              ? this.dateFieldLogicComparator(oneCondition.op, convertedConstant, convertedAnswer)
              : this.findPastAnswer(oneCondition.op, constant.value, pastAnswer)
            // Push result to array
            array.push(isValid)
          }
          // Check if every condition passed
          if ((op === 'and' && array.every(value => value)) || (op === 'or' && array.find(value => value === true))) {
            return jumpToRef
          }
        } else {
          // Getting the condition's value with which to compare the answer
          const field = vars.find(item => item.type === 'field')
          const constant = vars.find(item => item.type === 'constant' || item.type === 'choice')
          const convertedConstant = this.dateInputToMilliseconds(constant.value)
          const pastAnswer = this.answers.find(answer => answer.field.ref === field.value)

          // Checks if the condition refers to a past answer
          // Check if logic of current iteration passes
          const isValid = ref === field.value
            ? this.dateFieldLogicComparator(op, convertedConstant, convertedAnswer)
            : this.findPastAnswer(op, constant.value, pastAnswer)
          if (isValid) {
            return jumpToRef
          }
        }
      }
    },

    numberAndOpinionScaleFieldLogicComparator (op, constant, answer) {
      let valid = false

      switch (op) {
        case 'equal':
          valid = constant === answer
          break
        case 'not_equal':
          valid = constant !== answer
          break
        case 'lower_than':
          valid = constant > answer
          break
        case 'lower_equal_than':
          valid = constant >= answer
          break
        case 'greater_than':
          valid = constant < answer
          break
        case 'greater_equal_than':
          valid = constant <= answer
          break
      }

      return valid
    },

    handleNumberAndOpinionScaleFieldLogic ({ type, ref, actions }, answer) {
      for (const oneAction of actions) {
        const { details, condition } = oneAction

        const jumpToRef = details.to.value
        const { op, vars } = condition

        if (op === 'always') {
          return jumpToRef
        } else if (op === 'and' || op === 'or') {
          // This is an array will be a collection the results of every check
          const array = []
          for (const oneCondition of vars) {
            const field = oneCondition.vars.find(item => item.type === 'field')
            const constant = oneCondition.vars.find(item => item.type === 'choice' || item.type === 'constant')
            const pastAnswer = this.answers.find(answer => answer.field.ref === field.value)
            // Checks if the condition refers to a past answer
            // Check if logic of current iteration passes
            const isValid = ref === field.value
              ? this.numberAndOpinionScaleFieldLogicComparator(oneCondition.op, constant.value, answer)
              : this.findPastAnswer(oneCondition.op, constant.value, pastAnswer)
            // Push result to array
            array.push(isValid)
          }
          // Check if every condition passed
          if ((op === 'and' && array.every(value => value)) || (op === 'or' && array.find(value => value === true))) {
            return jumpToRef
          }
        } else {
          const constant = vars.find(item => item.type === 'choice' || item.type === 'constant')
          const field = vars.find(item => item.type === 'field')
          const pastAnswer = this.answers.find(answer => answer.field.ref === field.value)
          // Checks if the condition refers to a past answer
          // Check if logic of current iteration passes
          const isValid = ref === field.value
            ? this.numberAndOpinionScaleFieldLogicComparator(op, constant.value, answer)
            : this.findPastAnswer(op, constant.value, pastAnswer)
          if (isValid) {
            return jumpToRef
          }
        }
      }
    },

    textFieldLogicComparator (op, constant, answer) {
      let valid = false

      switch (op) {
        case 'equal':
          valid = constant === answer
          break
        case 'not_equal':
          valid = constant !== answer
          break
        case 'begins_with':
          valid = answer.startsWith(constant)
          break
        case 'ends_with':
          valid = answer.endsWith(constant)
          break
        case 'contains':
          valid = answer.includes(constant)
          break
        case 'not_contains':
          valid = !answer.includes(constant)
          break
      }

      return valid
    },

    handleTextFieldLogic ({ type, ref, actions }, answer) {
      for (const oneAction of actions) {
        const { details, condition } = oneAction

        const jumpToRef = details.to.value
        const { op, vars } = condition

        if (op === 'always') {
          return jumpToRef
        } else if (op === 'and' || op === 'or') {
          // This is an array will be a collection the results of every check
          const array = []
          for (const oneCondition of vars) {
            const field = oneCondition.vars.find(item => item.type === 'field')
            const constant = oneCondition.vars.find(item => item.type === 'constant')
            const pastAnswer = this.answers.find(answer => answer.field.ref === field.value)
            // Checks if the condition refers to a past answer
            // Check if logic of current iteration passes
            const isValid = ref === field.value
              ? this.textFieldLogicComparator(oneCondition.op, constant.value, answer)
              : this.findPastAnswer(oneCondition.op, constant.value, pastAnswer)
            // Push result to array
            array.push(isValid)
          }
          // Check if every condition passed
          if ((op === 'and' && array.every(value => value)) || (op === 'or' && array.find(value => value === true))) {
            return jumpToRef
          }
        } else {
          const constant = vars.find(item => item.type === 'constant')
          const field = vars.find(item => item.type === 'field')
          const pastAnswer = this.answers.find(answer => answer.field.ref === field.value)
          // Checks if the condition refers to a past answer
          // Check if logic of current iteration passes
          const isValid = ref === field.value
            ? this.textFieldLogicComparator(op, constant.value, answer)
            : this.findPastAnswer(op, constant.value, pastAnswer)
          if (isValid) {
            return jumpToRef
          }
        }
      }
    },

    multipleChoiceFieldLogicComparator (op, constant, answer) {
      let valid = false
      switch (op) {
        case 'is':
          valid = answer.includes(constant)
          break
        case 'is_not':
          valid = !answer.includes(constant)
          break
        case 'contains':
          valid = answer.includes(constant)
          break
      }

      return valid
    },

    handleMultipleChoiceFieldLogic ({ type, ref, actions }, answer, pastAnswers, multipleSelection) {
      const question = this.getQuestionFromRef(ref)
      const choices = question.properties.choices
      const selectedRef = choices.map(choice => {
        if (multipleSelection) {
          if (answer.includes(choice.label)) return choice.ref
        } else {
          if (choice.label === answer) return choice.ref
        }
      })

      // "When someone answers question" conditions
      for (const oneAction of actions) {
        const { details, condition } = oneAction
        const jumpToRef = details.to.value
        const { op, vars } = condition

        // NOTE: Cease function if at 'always' operator
        if (op === 'always') {
          return jumpToRef
        } else if (op === 'and' || op === 'or') {
          // This is an array will be a collection the results of every check
          const array = []
          for (const oneCondition of vars) {
            const constant = oneCondition.vars.find(item => item.type === 'choice' || item.type === 'constant')
            const field = oneCondition.vars.find(item => item.type === 'field')
            const pastAnswer = this.answers.find(answer => answer.field.ref === field.value)

            // Checks if the condition refers to a past answer and we did answer that question
            const isValid = ref === field.value
              ? this.multipleChoiceFieldLogicComparator(oneCondition.op, constant.value, selectedRef)
              : this.findPastAnswer(oneCondition.op, constant.value, pastAnswer)
            // Push result to array
            array.push(isValid)
          }

          // Check if every condition passed
          if ((op === 'and' && array.every(value => value)) || (op === 'or' && array.find(value => value === true))) {
            return jumpToRef
          }
        } else {
          const constant = vars.find(item => item.type === 'choice' || item.type === 'constant')
          const field = vars.find(item => item.type === 'field')

          const pastAnswer = this.answers.find(answer => answer.field.ref === field.value)
          // Checks if the condition refers to a past answer
          // Check if logic of current iteration passes
          const isValid = ref === field.value
            ? this.multipleChoiceFieldLogicComparator(op, constant.value, selectedRef)
            : this.findPastAnswer(op, constant.value, pastAnswer)
          if (isValid) {
            return jumpToRef
          }
        }
      }
    }
  }
}
