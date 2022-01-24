<template>
  <div class="flex justify-center">
    <div class="w-full md:w-3/4 lg:w-1/2 p-8">
      <div class="w-full flex justify-between lg:p-8">
        <transition
          name="custom-classes-transition"
          appear
          appear-active-class="animated faster fadeInUpBig"
          enter-active-class="animated faster fadeInUpBig"
          leave-active-class="animated faster fadeOutUpBig"
          mode="out-in">
          <div class="w-full">
            <img v-if="thankyouScreen.attachment && thankyouScreen.attachment.href" :src="thankyouScreen.attachment.href" alt="Thankyou image" class="thank-you-image">

            <screen-title>
              <template #title>
                <span v-html="formatTypeformText(thankyouScreen.title.replace(varScore, score))" />
              </template>
              <template v-if="thankyouScreen.properties.description" #subtitle>
                <span v-html="formatTypeformText(thankyouScreen.properties.description)" />
              </template>
            </screen-title>
            <div class="flex justify-center">
              <a class="button button-primary" :href="thankyouScreen.properties.redirect_url">{{ thankyouScreen.properties.button_text }}</a>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ScreenTitle from '@/components/ScreenTitle'

export default {
  name: 'ending',
  components: {
    ScreenTitle
  },
  mixins: [],
  props: {
    screenRef: {
      validator: prop => typeof prop === 'string' || prop === null,
      required: true
    },
    score: {
      validator: prop => typeof prop === 'number' || prop === null,
      required: true
    }
  },
  data () {
    return {
      varScore: '{{var:score}}'
    }
  },
  computed: {
    ...mapState(['questionnaireConfig']),
    thankyouScreen () {
      return this.screenRef ? this.questionnaireConfig.thankyou_screens.find(screen => screen.ref === this.screenRef) : this.questionnaireConfig.thankyou_screens[0]
    }
  }
}
</script>

<style scoped>
</style>
