<script setup lang="ts"></script>

<template>
  <div class="page-main-layout__body">
    <div v-if="$slots.search" class="el-form--class">
      <slot name="search" />
    </div>

    <div v-if="$slots.toolbar" class="el-form--class">
      <slot name="toolbar" />
    </div>

    <div class="page-main-layout__list">
      <slot></slot>
    </div>
    <div v-if="$slots.pagination" class="page-main-layout__pagination">
      <slot name="pagination"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.el-form--class {
  padding-top: 20px;
  background-color: var(--bg-color);
  background-color: white;
  padding-right: 40px;
  border-radius: 5px;
}

.vxe-toolbar--class {
  padding-right: 5px;
  margin-bottom: -5px;
  height: 50px;
  line-height: 50px;
  float: right;
}

.page-main-layout__body {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.page-main-layout__list {
  flex: 1;
  box-sizing: content-box;
  overflow: auto;
  position: relative;
  .tabs-horizontal {
    margin-bottom: 0;
  }

  > .el-table {
    position: absolute;
  }

  .el-table__fixed::before,
  .el-table::before {
    display: none;
  }
}

.page-main-layout__pagination {
  // border-top: 1px solid @border-primary;
  padding-top: 12px;
  padding-bottom: 0;
  text-align: center;
  display: flex;
  justify-content: center;
}
</style>
