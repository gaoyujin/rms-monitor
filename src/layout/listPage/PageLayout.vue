<script setup lang="ts">
import PageContent from "./components/PageContent.vue";
</script>

<template>
  <div class="page-main-layout">
    <slot name="content" v-if="$slots.content" />
    <PageContent v-else>
      <template v-if="$slots.search" #search>
        <slot name="search" />
      </template>
      <slot />
      <template v-if="$slots.side" #side>
        <slot name="side" />
      </template>
      <template v-if="$slots.pagination" #pagination>
        <slot name="pagination" />
      </template>
      <template v-if="$slots.body" #body>
        <slot name="body" />
      </template>
    </PageContent>
  </div>
</template>

<style lang="scss" scoped>
@import "/@/assets/css/initial.scss";
.page-main-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
