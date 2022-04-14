<script setup lang="ts">
import { defineProps } from "vue";

type props = {
  currentPage: number;
  pageSize: number;
  total: number;
  small?: { type: boolean; default: false };
};

defineProps<props>();
</script>

<template>
  <ElPagination
    :background="true"
    small
    :current-page="currentPage"
    :page-sizes="[10, 15, 20, 30, 50, 100]"
    :page-size="pageSize"
    layout="total, sizes, prev, pager, next, jumper"
    :total="total"
  ></ElPagination>
</template>

<style lang="scss" scoped></style>
