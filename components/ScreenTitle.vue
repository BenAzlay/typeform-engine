<template functional>
    <div class="w-full">
      <div class="welcome-title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div class="welcome-subtitle">
         <slot name="subtitle">{{ subtitle }}</slot>
      </div>
    </div>
</template>

<script>
export default {
  name: 'QuestionTitle'
}
</script>
