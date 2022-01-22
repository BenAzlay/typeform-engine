export const state = () => ({
    userId: null, // Migraine Buddy user ID //
    userLang: null,
    userCountry: null,
    userAuthToken: null,
    userAppVersion: null,
    questionnaireConfig: null,
    isLoading: true,
    isRecurring: false,
    isBraze: false,
    conditionAnswer: null,
    conditionNoAnswer: null,
    pastAnswers: null,
    questionnaireStyling: null,
    // Time
    now: new Date()
})
export const mutations = {
    setTime (state) {
      state.now = new Date()
    },
    setUserProfile (state, payload) {
      Object.entries(payload).forEach(([key, value]) => {
        if (Object.prototype.hasOwnProperty.call(state, key)) {
          state[key] = value
        }
      })
    },
    setUserId: (state, payload) => {
      state.userId = payload
    },
    setQuestionnaireConfig: (state, payload) => {
      state.questionnaireConfig = payload
    },
    setQuestionnaireStyling: (state, payload) => {
      state.questionnaireStyling = payload
    },
    setIsLoading: (state, payload) => {
      state.isLoading = payload
    },
    setIsRecurring: (state, payload) => {
      state.isRecurring = payload
    },
    setIsBraze: (state, payload) => {
      state.isBraze = payload
    },
    setConditionAnswer: (state, payload) => {
      state.conditionAnswer = payload
    },
    setConditionNoAnswer: (state, payload) => {
      state.conditionNoAnswer = payload
    },
    setPastAnswers: (state, payload) => {
      state.pastAnswers = payload
    }
}
export const actions = {
    updateTime ({ commit }) {
      return new Promise(resolve => {
        setInterval(() => {
          commit('setTime')
        }, 1000 * 60)
        resolve()
      })
    },
    saveUserProfile ({ commit }, payload) {
      return new Promise((resolve) => {
        commit('setUserProfile', payload)
        resolve()
      })
    },
    updateUserId: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        commit('setUserId', payload)
        resolve()
      })
    },
    updateQuestionnaireConfig: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        commit('setQuestionnaireConfig', payload)
        resolve()
      })
    },
    updateQuestionnaireStyling: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        commit('setQuestionnaireStyling', payload)
        resolve()
      })
    },
    updateIsRecurring: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        commit('setIsRecurring', payload)
        resolve()
      })
    },
    updateIsBraze: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        commit('setIsBraze', payload)
        resolve()
      })
    },
    updateConditionAnswer: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        commit('setConditionAnswer', payload)
        resolve()
      })
    },
    updateConditionNoAnswer: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        commit('setConditionNoAnswer', payload)
        resolve()
      })
    },
    updatePastAnswers: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        commit('setPastAnswers', payload)
        resolve()
      })
    }
}
