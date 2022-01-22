<template>
  <div id="app" :style="styles" class="min-h-screen h-full">
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex'

import axios from 'axios'
import Vue from 'vue'

// require('dotenv').config()

Vue.mixin({
  methods: {
    formatTypeformText (text) {
      return text.replace('\\*', '*')
    },
    scrollToTop () {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'auto'
      })
    },
    async getFormConfig (formId) {
        console.log('getFormConfig')
        return await this.$typeform.get(`/forms/${formId}`)
    },
    async getFormStyling (themeId) {
        console.log('getFormStyling')
        return await this.$typeform.get(`/themes/${themeId}`)
    }
  },
})

export default {
  name: 'App',
  components: {},
  props: {},
  data () {
    return {}
  },
  computed: {
    ...mapState(['questionnaireConfig', 'userId', 'isBraze', 'questionnaireStyling', 'conditionAnswer', 'conditionNoAnswer']),

    styles () {
      if (this.questionnaireStyling) {
        return {
          backgroundColor: this.questionnaireStyling.colors.background,
          '--bg-color': this.questionnaireStyling.colors.background,
          '--darken-bg-color': this.lightenDarkenColor(
            this.questionnaireStyling.colors.background,
            -5
          ),
          '--title-color': this.questionnaireStyling.colors.question,
          '--darken-title-color': this.lightenDarkenColor(
            this.questionnaireStyling.colors.question,
            -20
          ),
          '--answer-color': this.questionnaireStyling.colors.answer,
          '--lighter-answer-color': this.lightenDarkenColor(
            this.questionnaireStyling.colors.answer,
            100
          ),
          '--button-color': this.questionnaireStyling.colors.button
        }
      } else return ''
    }
  },
  watch: {
    // styles () {
    //   document.querySelector('body').style.backgroundColor = this.styles.backgroundColor
    //     ? this.styles.backgroundColor
    //     : null
    // }
  },
  created () {
    this.updateTime()
  },
  mounted () {
    Vue.prototype.$typeform = axios.create({
      baseURL: '/api',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NUXT_APP_TYPEFORM_TOKEN}`,
        "Access-Control-Allow-Origin": true
      }
    })

    if (this.$route.query.formId) {
      this.initializeQuestionnaireEngine()
    } else {
        console.error('No formId query param!')
    }
  },
  methods: {
    ...mapMutations(['setIsLoading']),
    ...mapActions([
      'updateTime',
      'updateQuestionnaireConfig',
      'updateUserId',
      'updateIsRecurring',
      'updateIsBraze',
      'updateConditionAnswer',
      'updateConditionNoAnswer',
      'updatePastAnswers',
      'saveUserProfile',
      'updateQuestionnaireStyling'
    ]),
    async initializeQuestionnaireEngine () {
        // Fetch form config from Typeform API
        const formId = this.$route.query.formId
        let payload = await this.getFormConfig(formId)
        const formConfig = payload.data
        if (formConfig.id !== formId) {
            console.error('Failed to fetch Typeform config with ID:', formId)
        }
        this.updateQuestionnaireConfig(formConfig)
        // Fetch form styling
        const themePathArray = formConfig.theme.href.split('/')
        payload = await this.getFormStyling(themePathArray[themePathArray.length - 1])
        const formStyling = payload.data
        this.updateQuestionnaireStyling(formStyling)
        if (this.questionnaireConfig.welcome_screens) {
            this.$router.push({ path: 'welcome' })
        } else {
            this.$router.push({ name: 'questionnaire' })
        }
    },
    lightenDarkenColor (col, amt) {
      var usePound = false

      if (col[0] === '#') {
        col = col.slice(1)
        usePound = true
      }

      var num = parseInt(col, 16)

      var r = (num >> 16) + amt

      if (r > 255) r = 255
      else if (r < 0) r = 0

      var b = ((num >> 8) & 0x00ff) + amt

      if (b > 255) b = 255
      else if (b < 0) b = 0

      var g = (num & 0x0000ff) + amt

      if (g > 255) g = 255
      else if (g < 0) g = 0

      return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
    }
  }
}
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap");
@import "assets/styles/tailwind.postcss";
@import "assets/styles/animate.css";

.app-font {
  font-family: "Lato", sans-serif;
}

body {
  /* background-color: #466780 !important; */
  /* color: #4d4d4d !important; */
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
  -webkit-user-select: none;
  height: 100%;
  overflow: auto;
}

.blink {
  animation: blink 0.15s 3;
}

.dimmer {
  background-color: var(--darken-bg-color);
}

.tabbar-bg {
  background-color: var(--darken-bg-color);
}

.welcome-title,
.question-title {
  color: var(--title-color);
}

.question-subtitle {
  color: var(--darken-title-color);
}

.button-primary {
  color: var(--title-color);
  background-color: var(--button-color);
}

.opinion-scale-label,
.opinion-scale-square,
.mc-field-choice {
  color: var(--answer-color);
  border-color: var(--answer-color);
}

.number-field-input,
.mc-other-text,
.short-text-field-input > {
  /* color: var(--answer-color); */
  color: purple;
}

.mc-field-choice-selected,
.mc-other-text-container,
.number-field-container,
.opinion-scale-square-selected,
.short-text-field-container {
  color: var(--lighter-answer-color);
  border-color: var(--lighter-answer-color);
}

.number-field-container,
.mc-other-text-container,
.mc-other-text,
.number-field-input,
.short-text-field-input,
.short-text-field-container,
.opinion-scale-square,
.opinion-scale-square-selected {
  background-color: var(--bg-color);
}

@keyframes blink {
  0% {
    border-color: var(--answer-color);
  }
  50% {
    border-color: var(--answer-color);
  }
  50.01% {
    border-color: var(--bg-color);
  }
  100% {
    border-color: var(--bg-color);
  }
}
</style>
