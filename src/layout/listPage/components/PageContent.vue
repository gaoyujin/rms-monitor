<script setup lang="ts">
import PageBody from "./PageBody.vue";
</script>

<template>
  <div class="page-main-layout__content">
    <div class="page-main-layout__side" v-if="$slots.side">
      <slot name="side" />
    </div>
    <slot name="body" v-if="$slots.body" />
    <PageBody v-else>
      <template v-if="$slots.search" #search>
        <slot name="search" />
      </template>
      <slot />
      <template v-if="$slots.pagination" #pagination>
        <slot name="pagination" />
      </template>
    </PageBody>
  </div>
</template>

<style lang="scss" scoped>
.page-main-layout__content {
  flex: 1;
  padding-bottom: 8px;
  display: flex;
  height: 100px;
  overflow: hidden;
  border-radius: 4px;
}
.page-main-layout__side {
  height: 100%;
}
</style>
