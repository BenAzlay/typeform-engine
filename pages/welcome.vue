<template>
  <div class="flex justify-center">
    <div class="w-full md:w-3/4 lg:w-1/2 p-8">
      <div class="w-full flex justify-between lg:p-8">
        <transition
          name="custom-classes-transition"
          appear
          appear-active-class="animated faster fadeInDownBig"
          enter-active-class="animated faster fadeInDownBig"
          leave-active-class="animated faster fadeOutUpBig"
          mode="out-in"
        >
          <div class="w-full">
            <img
              v-if="welcomeScreen.attachment && welcomeScreen.attachment.href"
              :src="welcomeScreen.attachment.href"
              alt="Welcome image"
              class="welcome-image"
            />

            <screen-title>
              <template #title>
                <span v-html="formatTypeformText(welcomeScreen.title)" />
              </template>
              <template v-if="welcomeScreen.properties.description" #subtitle>
                <span v-html="formatTypeformText(welcomeScreen.properties.description)" />
              </template>
            </screen-title>
            <div class="flex justify-center">
              <button class="button button-primary button-welcome" @click="launchQuestionnaire">
                <span v-html="formatTypeformText(welcomeScreen.properties.button_text)" />
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ScreenTitle from '../components/ScreenTitle'

export default {
  name: 'Welcome',
  components: {
    ScreenTitle
  },
  data () {
    return {}
  },
  created () {
  },
  computed: {
    ...mapState(['questionnaireConfig']),
    welcomeScreen () {
      return this.questionnaireConfig.welcome_screens[0]
    }
  },
  methods: {
    launchQuestionnaire () {
      this.$router.push({ path: '/questionnaire', query: this.$route.query })
    }
  }
}
</script>

<style scoped>
</style>
