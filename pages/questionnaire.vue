<template>
  <div class="flex justify-center">
    <div class="w-full md:w-3/4 lg:w-1/2 p-8">
      <div class="w-full flex justify-between lg:p-8">
        <transition
          name="custom-classes-transition"
          appear
          appear-active-class="animated faster fadeInUpBig"
          :enter-active-class="
            isNext
              ? 'animated faster fadeInUpBig'
              : 'animated faster fadeInDownBig'
          "
          :leave-active-class="
            isNext
              ? 'animated faster fadeOutUpBig'
              : 'animated faster fadeOutDownBig'
          "
          mode="out-in"
        >
          <div class="w-full" :key="currentQuestion.id">
            <question-title>
              <template #title
                ><span v-html="formatTypeformText(questionTitle)" />
                <!-- <span>{{ attribute }}</span> -->
              </template>
              <template
                v-if="
                  currentQuestion.properties &&
                    currentQuestion.properties.description
                "
                #subtitle
                >{{ currentQuestion.properties.description }}</template
              >
            </question-title>

            <img
              v-if="
                currentQuestion.attachment && currentQuestion.attachment.href
              "
              :src="currentQuestion.attachment.href"
              alt="Question image"
              class="question-image mb-6"
            />

            <component
              id="current"
              :is="fieldType"
              :question="currentQuestion"
              :goNext="goNext"
              :answer="currentAnswer"
              @validityCheck="validity = $event"
            />
          </div>
        </transition>
      </div>
      <!-- Buffer for bottom nav -->
      <div id="buffer" class="h-20 md:h-24 lg:h-24 w-full" />
      <!-- Shade -->
      <div
        v-if="allowSubmit"
        class="dimmer absolute top-0 left-0 w-screen h-screen opacity-75 z-10"
      />
      <div
        class="fixed bottom-0 left-0 tabbar-bg flex items-center w-full z-10
                  h-16 p-2 space-x-2
                  md:h-20 md:p-4 md:space-x-4
                  lg:h-20 lg:p-4 lg:space-x-4"
      >
        <button
          :disabled="!allowSubmit"
          :class="allowSubmit ? 'opacity-100' : 'opacity-0'"
          class="button button-primary h-12 flex-grow"
          @click="submitAnswers"
        >
          <i class="fas fa-check mr-2" />
          Submit Answers
        </button>
        <button
          :class="[
            hasWelcomeScreen || activeIndex > 0 ? '' : 'button-disabled'
          ]"
          class="button button-primary h-12 w-12"
          @click="handleBottomNav('previous')"
        >
          <i class="fas fa-chevron-up" />
        </button>
        <button
          :class="[
            currentAnswer !== undefined && !allowSubmit && validity
              ? ''
              : 'button-disabled'
          ]"
          class="button button-primary h-12 w-12"
          @click="handleBottomNav('next')"
        >
          <i class="fas fa-chevron-down" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import QuestionTitle from '../components/QuestionTitle'
import MultipleChoiceField from '../components/fields/MultipleChoiceField'
import NumberField from '../components/fields/NumberField'
import OpinionScaleField from '../components/fields/OpinionScaleField'
import DateField from '../components/fields/DateField'
import ShortTextField from '../components/fields/ShortTextField'
import StatementField from '../components/fields/StatementField'
import qnLogicJump from '../mixins/qnLogicJump'
import qnLogicCalculator from '../mixins/qnLogicCalculator'
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'Questionnaire',
  components: {
    QuestionTitle,
    MultipleChoiceField,
    NumberField,
    OpinionScaleField,
    DateField,
    ShortTextField,
    StatementField
  },
  mixins: [qnLogicJump, qnLogicCalculator],
  props: {},
  data () {
    return {
      indexHistory: [], // This is to handle "Back" when questions are skipped due to logic jumps
      activeIndex: 0,
      isNext: true,
      answers: [],
      score: 0,
      allowSubmit: false,
      thankYouScreenRef: null,
      isLast: false,
      validity: false
    }
  },
  computed: {
    ...mapState([
      'now',
      'questionnaireConfig',
      'userId',
      'isRecurring',
      'isBraze',
      'pastAnswers'
    ]),

    fields () {
      return this.questionnaireConfig.fields
    },

    thankYouScreens () {
      return this.questionnaireConfig.thankyou_screens
    },

    questionTitle () {
      let title = this.currentQuestion.title
      // console.log(title)
      // Past answers
      if (title.match(/{{field:(.*)}}/)) {
        const ref = title.split(/{{field:(.*)}}/)[1]
        const pastAnswer = this.answers.find(answer => answer.field.ref === ref)
        switch (pastAnswer.type) {
          case 'choice':
            title = title.replace(/{{field:(.*)}}/, pastAnswer.choice.label)
            break
          case 'number' || 'opinion_scale':
            title = title.replace(/{{field:(.*)}}/, pastAnswer.number)
            break
          case 'text':
            title = title.replace(/{{field:(.*)}}/, pastAnswer.text)
            break
          case 'date':
            title = title.replace(/{{field:(.*)}}/, pastAnswer.date)
            break
        }
      }
      return title
        .split('  UNIT=')[0]
        .split(/\*(.*?)\*/)
        .join('')
        .split('  FLOAT=')[0]
        .split(/\*(.*?)\*/)
        .join('')
        .split('  MAX=')[0]
        .split(/\*(.*?)\*/)
        .join('')
        .split('  MIN=')[0]
        .split(/\*(.*?)\*/)
        .join('')
        .split('  ATTRIBUTE=')[0]
        .split(/\*(.*?)\*/)
        .join('')
        .split('  ONLY=')[0]
        .split(/\*(.*?)\*/)
        .join('')
        .split('  SUBTITLE=')[0]
        .split(/\*(.*?)\*/)
        .join('')
    },
    attribute () {
      return this.currentQuestion.title.split('  ATTRIBUTE=')[1]
        ? this.currentQuestion.title.split('  ATTRIBUTE=')[1].split('  ')[0]
        : null
    },

    allLogic () {
      return this.questionnaireConfig.logic || []
    },

    currentQuestion () {
      // console.log(JSON.stringify(this.fields[this.activeIndex], null, 1))
      return this.fields[this.activeIndex]
    },

    currentAnswer () {
      // console.log(this.answers)
      // console.log(
      //   this.answers.find(
      //     answer => answer.field.ref === this.currentQuestion.ref
      //   )
      // )
      return this.answers.find(
        answer => answer.field.ref === this.currentQuestion.ref
      )
    },

    hasWelcomeScreen () {
      return this.questionnaireConfig.welcome_screens
    },

    fieldType () {
      // console.log(this.currentQuestion.type)
      switch (this.currentQuestion.type) {
        case 'multiple_choice':
          return 'MultipleChoiceField'
        case 'number':
          return 'NumberField'
        case 'opinion_scale':
          return 'OpinionScaleField'
        case 'date':
          return 'DateField'
        case 'short_text':
          return 'ShortTextField'
        case 'statement':
          return 'StatementField'
        default:
          this.$rollbar.error('Unidentified field type')
          return ''
      }
    }
  },
  watch: {
    activeIndex (newValue, oldValue) {
      // console.log(`from ${oldValue} to ${newValue}`)
      if (newValue > oldValue) {
        this.isNext = true
        if (oldValue >= 0) this.indexHistory = [...this.indexHistory, oldValue]
      } else {
        this.isNext = false
        this.indexHistory = this.indexHistory.filter(
          index => index !== newValue
        )
      }
    }
  },
  mounted () {
    if (
      this.questionnaireConfig.variables &&
      this.questionnaireConfig.variables.score
    ) {
      this.score = this.questionnaireConfig.variables.score
    }
  },
  methods: {
    ...mapMutations(['setIsLoading']),

    saveAnswer (answer) {
      if (this.currentAnswer) {
        this.answers = this.answers.map(item =>
          item.field.ref === answer.field.ref ? answer : item
        )
      } else this.answers = [...this.answers, answer]
    },

    removeCurrentAnswer () {
      const index = this.answers.indexOf(this.currentAnswer)
      if (index !== -1) this.answers.splice(index, 1)
    },

    getQuestionFromRef (ref) {
      return this.fields.find(question => question.ref === ref)
    },

    getQuestionFromIndex (index) {
      return this.fields[index]
    },

    handleQuestionLogicCalculator (answer, logic, score) {
      switch (answer.type) {
        case 'date':
          return this.handleDateFieldCalculation(logic, answer.date, score)
        case 'number':
          return this.handleNumberAndOpinionScaleFieldCalculation(
            logic,
            answer.number,
            score
          )
        case 'opinion_scale':
          return this.handleNumberAndOpinionScaleFieldCalculation(
            logic,
            answer.number,
            score
          )
        case 'choice':
          return this.handleMultipleChoiceFieldCalculation(
            logic,
            answer.choice.label,
            score,
            false
          )
        case 'choices':
          return this.handleMultipleChoiceFieldCalculation(
            logic,
            answer.choices.labels,
            score,
            true
          )
      }
    },

    handleQuestionLogicJump (answer, logic) {
      let ref

      switch (answer.type) {
        case 'date':
          ref = this.handleDateFieldLogic(logic, answer.date, this.answers)
          if (this.thankYouScreens.find(screen => screen.ref === ref)) {
            this.thankYouScreenRef = ref
            this.isLast = true
          }
          return this.fields.findIndex(field => field.ref === ref)
        case 'short_text':
          ref = this.handleTextFieldLogic(logic, answer.text)
          if (this.thankYouScreens.find(screen => screen.ref === ref)) {
            this.thankYouScreenRef = ref
            this.isLast = true
          }
          return this.fields.findIndex(field => field.ref === ref)
        case 'number':
          ref = this.handleNumberAndOpinionScaleFieldLogic(
            logic,
            answer.number
          )
          if (this.thankYouScreens.find(screen => screen.ref === ref)) {
            this.thankYouScreenRef = ref
            this.isLast = true
          }
          return this.fields.findIndex(field => field.ref === ref)
        case 'opinion_scale':
          ref = this.handleNumberAndOpinionScaleFieldLogic(
            logic,
            answer.number
          )
          if (this.thankYouScreens.find(screen => screen.ref === ref)) {
            this.thankYouScreenRef = ref
            this.isLast = true
          }
          return this.fields.findIndex(field => field.ref === ref)
        case 'choice':
          ref = this.handleMultipleChoiceFieldLogic(
            logic,
            answer.choice.label,
            this.answers,
            false
          )
          if (this.thankYouScreens.find(screen => screen.ref === ref)) {
            this.thankYouScreenRef = ref
            this.isLast = true
          }
          return this.fields.findIndex(field => field.ref === ref)
        case 'choices':
          ref = this.handleMultipleChoiceFieldLogic(
            logic,
            answer.choices.labels,
            this.answers,
            true
          )
          if (this.thankYouScreens.find(screen => screen.ref === ref)) {
            this.thankYouScreenRef = ref
            this.isLast = true
          }
          return this.fields.findIndex(field => field.ref === ref)
      }
      /*
      ================================================================================================
      ================================================================================================
      If last question
        Display submit

      Find if current question has logic
        If no logic
          Go to next question (index + 1)
        If logic
          Handle logic

        EXAMPLE LOGIC DATA
        "logic": [
          {
            "type": "field",
            "ref": "94fa2005-e522-479f-a35d-19135ea1b0d9",
            "actions": [
              {
                "action": "jump",
                "details": {
                  "to": {
                    "type": "field",
                    "value": "8f393df6-450a-4360-a664-9a76cff3735f"
                  }
                },
                "condition": {
                  "op": "on",
                  "vars": [
                    {
                      "type": "field",
                      "value": "94fa2005-e522-479f-a35d-19135ea1b0d9"
                    },
                    {
                      "type": "constant",
                      "value": "2020-12-25"
                    }
                  ]
                }
              },
              {
                "action": "jump",
                "details": {
                  "to": {
                    "type": "field",
                    "value": "51447e59-5716-404c-9812-68d439f1b521"
                  }
                },
                "condition": {
                  "op": "always",
                  "vars": []
                }
              }
            ]
          }
        ]

      Logic handling:
      action: "jump" // Should be the only value available
      details: {
        to: {
          type: "field" // Should be the only value available
          value: "question_reference" // Reference of the question to jump to if condition passes
        }
      }
      condition: {
        op: "on" // This decides the relationship to the value specified afterwards
        vars: [

        ]
      }
      Determine type of question
      Execute the correct function to handle the type of question's logic
      Call
      ================================================================================================
      ================================================================================================
      */
    },

    findLogicForQuestion (ref) {
      return this.allLogic.find(logic => logic.ref === ref)
    },

    findLogicToJump (logic) {
      logic.actions = logic.actions.filter(
        oneAction => oneAction.action === 'jump'
      )
      return logic
    },

    findLogicToCalculate (logic) {
      logic.actions = logic.actions.filter(
        oneAction => oneAction.action !== 'jump'
      )
      return logic
    },

    removeAnswersForSkippedQuestions (currentIndex, nextIndex) {
      for (let i = currentIndex; i < nextIndex - 1; i++) {
        const question = this.getQuestionFromIndex(i + 1)
        const { ref } = question
        this.answers = this.answers.filter(answer => answer.field.ref !== ref)
      }
    },

    goNext (answer, animation = true) {
      this.isLast = this.activeIndex + 1 === this.fields.length
      const logic = this.findLogicForQuestion(answer.field.ref)
      let index

      // CALCULATOR LOGIC
      if (
        logic &&
        logic.actions.find(oneAction => oneAction.action !== 'jump')
      ) {
        this.score = this.handleQuestionLogicCalculator(
          answer,
          this.findLogicToCalculate(logic),
          this.score
        )
      }

      // JUMP LOGIC
      if (
        logic &&
        logic.actions.find(oneAction => oneAction.action === 'jump')
      ) {
        index = this.handleQuestionLogicJump(
          answer,
          this.findLogicToJump(logic)
        )
        this.removeAnswersForSkippedQuestions(this.activeIndex, index)
      } else {
        index = this.activeIndex + 1
      }

      if (answer) {
        this.saveAnswer(answer)
        const element = document.querySelector('#current')

        if (animation) {
          element.addEventListener('animationend', () => {
            if (!this.isLast && index >= 0) {
              this.activeIndex = index
            }
          })
        } else {
          if (!this.isLast && index >= 0) this.activeIndex = index
        }
      } else {
        if (!this.isLast && index >= 0) this.activeIndex = index
      }

      this.scrollToTop()

      if (this.isLast) this.allowSubmit = true
    },

    handleBottomNav (direction) {
      const index = this.activeIndex
      const last = this.fields.length - 1
      if (direction === 'previous') {
        const history = this.indexHistory
        // Back to welcome screen
        if (index === 0 && this.hasWelcomeScreen) {
          this.$router.push({
            name: 'WelcomeScreen',
            query: this.$route.query
          })
        }
        if (history.length > 0 && !this.allowSubmit) {
          // if logic, delete answer
          if (this.allLogic.length > 0) {
            this.removeCurrentAnswer()
          }
          this.activeIndex = history[history.length - 1]
        }
        if (this.allowSubmit) {
          this.allowSubmit = false
        }
      } else {
        const answer = this.currentAnswer
        if (answer !== undefined && index !== last) {
          this.goNext(answer, false)
        } else if (answer !== undefined && index === last) {
          this.allowSubmit = true
        }
      }
    },

    reorderAnswers () {
      return this.fields.map(field => {
        const answer = this.answers.find(
          answer => answer.field.id === field.id
        )
        if (answer) return answer
        else {
          return { field: { id: field.id } }
        }
        // if (answer) return answer
        // else return { field: field }
      })
    },

    dateObjectToYYYYMMDD (date) {
      var d = new Date(date)
      var month = '' + (d.getMonth() + 1)
      var day = '' + d.getDate()
      var year = d.getFullYear()

      if (month.length < 2) {
        month = '0' + month
      }
      if (day.length < 2) {
        day = '0' + day
      }

      return [year, month, day].join('-')
    },

    submitAnswers () {
      // Because questionnaire were too long for the pipeline, had to give the definition separatly to the data team
      const body = {
        form_response: {
          form_id: this.questionnaireConfig.id,
          definition: {
            id: this.questionnaireConfig.id,
            title: this.questionnaireConfig.title,
            fields: this.fields
          },
          hidden: {
            userid: this.userId
          },
          calculated: {
            score: this.score
          },
          answers: this.reorderAnswers()
        }
      }

      if (this.questionnaireConfig.hidden && this.questionnaireConfig.hidden.includes('study_id')) {
        body.form_response.hidden.study_id = this.$sessionId
      }

      if (this.isBraze) {
        var attributes = {}
        for (let i = 0; i < body.form_response.answers.length; i++) {
          var question = this.fields.find(
            element => element.id === body.form_response.answers[i].field.id
          )

          if (question.title.includes('  ATTRIBUTE=')) {
            let rawAttributes = question.title.split('  ATTRIBUTE=')[1]
            rawAttributes = rawAttributes.split('  ')[0]
            rawAttributes = rawAttributes.split(';')
            for (let j = 0; j < rawAttributes.length; j++) {
              if (rawAttributes[j].includes('===')) {
                if (body.form_response.answers[i].type === 'choice') {
                  if (
                    body.form_response.answers[i].choice.label ===
                    rawAttributes[j].split('===')[1].split('?')[0]
                  ) {
                    if (rawAttributes[j].split('?')[1].split('!')[1]) {
                      if (
                        rawAttributes[j].split('?')[1].split('!')[1] === 'date'
                      ) {
                        attributes[
                          rawAttributes[j].split('?')[1].split('!')[0]
                        ] = this.dateObjectToYYYYMMDD(this.now)
                      }
                    } else {
                      attributes[rawAttributes[j].split('?')[1]] = true
                    }
                  }
                } else if (body.form_response.answers[i].type === 'choices') {
                  if (
                    body.form_response.answers[i].choices.labels.includes(
                      rawAttributes[j].split('===')[1].split('?')[0]
                    )
                  ) {
                    attributes[rawAttributes[j].split('?')[1]] = true
                  }
                }
              } else if (rawAttributes[j].includes('date')) {
                attributes[rawAttributes[j].split('?')[1]] =
                  body.form_response.answers[i].date
              }
            }
          }
          attributes[this.questionnaireConfig.title + 'Answered'] = true
          attributes[this.questionnaireConfig.title] = this.dateObjectToYYYYMMDD(
            this.now
          )
        }
      }
      // if (process.env.NODE_ENV !== 'production') console.log(JSON.stringify(attributes))

      if (this.isRecurring && !this.pastAnswers) {
        body.form_response.hidden.recurring_order = 1
      }

      // if (process.env.NODE_ENV !== 'production') console.log(JSON.stringify(body))

      // Note: Too long json are breaking the pipeline, waiting for a fix
      // if (JSON.stringify(body).length > 1500 && process.env.NODE_ENV !== 'production') {
      //   console.log('QUESTIONNAIRE FOR DATA TEAM:')
      //   console.log(JSON.stringify(this.fields))
      //   body.form_response.definition.fields = {}
      // }

      this.setIsLoading(true)
      if (this.isBraze) {
        this.postAnswers(body)
          .then(data => data)
          .catch(({ response }) => {
            return new Promise(() => {
              this.setIsLoading(false)
              // this.$router.push({
              //   name: 'Error',
              //   params: {
              //     errorType: 'updateError'
              //   }
              // })
              console.log(response)
            })
          })
          .then(this.updateBrazeUserAttributes(attributes))
          .then(data => data)
          .catch(({ response }) => {
            return new Promise(() => {
              this.setIsLoading(false)
              // this.$router.push({
              //   name: 'Error',
              //   params: {
              //     errorType: 'updateError'
              //   }
              // })
              console.log(response)
            })
          })
          .then(() => {
            this.setIsLoading(false)
            this.$router.push({
              name: 'ThankYouScreen',
              query: this.$route.query,
              params: { screenRef: this.thankYouScreenRef, score: this.score }
            })
          })
      } else {
        this.postAnswers(body)
          .then(data => data)
          .catch(({ response }) => {
            return new Promise(() => {
              this.setIsLoading(false)
              // this.$router.push({
              //   name: 'Error',
              //   params: {
              //     errorType: 'updateError'
              //   }
              // })
              console.log(response)
            })
          })
          .then(() => {
            this.setIsLoading(false)
            this.$router.push({
              name: 'ThankYouScreen',
              query: this.$route.query,
              params: { screenRef: this.thankYouScreenRef, score: this.score }
            })
          })
      }
    }
  }
}
</script>

<style scoped>
</style>
