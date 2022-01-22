<template functional>
    <div class="w-full">
      <div class="question-title">
        <slot name="title">{{ title }}</slot>
      </div>
      <p class="question-subtitle">
         <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </div>
</template>

<script>
export default {
  name: 'QuestionTitle'
}
</script>
