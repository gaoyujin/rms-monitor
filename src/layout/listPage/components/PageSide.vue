<script setup lang="ts">
import { ref, toRef, watch, Ref, defineProps, defineEmits } from "vue";
const useCollapse = (collapseProp: Ref<boolean>, emit: any) => {
  const isCollapse = ref(collapseProp.value);

  watch(
    () => collapseProp.value,
    c => {
      set(c);
    }
  );

  const set = (value: boolean) => {
    isCollapse.value = value;
    emit("update:collapse", value);
  };

  const toggle = (value: boolean) => {
    return () => {
      set(value);
    };
  };

  return {
    isCollapse,
    toggle: (val: boolean) => toggle(val)(),
    open: toggle(true),
    close: toggle(false)
  };
};

const props = defineProps({
  title: { type: String, default: "" },
  canCollapse: {
    type: Boolean,
    default: false
  },
  scroll: {
    type: Boolean,
    default: true
  },
  collapse: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["updateCollapse"]);

const collapseProp = toRef(props, "collapse");
const { isCollapse, toggle } = useCollapse(collapseProp, emit);
</script>

<template>
  <div
    class="page-main-side"
    :class="{
      'page-main-side__scroll': scroll,
      'page-main-side__cancollapse': canCollapse,
      'page-main-side__collapse': isCollapse
    }"
  >
    <div class="page-main-side__content">
      <slot />
    </div>
    <div class="page-main-side__button" @click="toggle(!isCollapse)">
      <el-tooltip
        class="item"
        effect="dark"
        :content="(isCollapse ? '展开' : '收缩') + title"
        placement="right"
      >
        <i
          class="fam"
          :class="!isCollapse ? 'fam-collapse-line' : 'fam-expend-line'"
        />
      </el-tooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~@/assets/css/initial.less";
.page-main-side {
  width: 220px;
  height: 100%;
  border-right: 1px solid;
  margin-right: 15px;
  position: relative;
}

.page-main-side__content {
  height: 100%;
}

.page-main-side__scroll {
  padding-right: 15px;
  overflow: auto;
}

.page-main-side__cancollapse {
  padding-right: 15px;
  overflow: auto;
}

.page-main-side__collapse {
  width: 9px;
  border-right: none;
  margin-right: 1px;
}

.page-main-side__button {
  display: none;
  position: absolute;
  width: 24px;
  height: 56px;
  right: 0;
  top: 50%;
  text-align: center;
  cursor: pointer;
  box-sizing: border-box;
  padding-top: 15px;
  font-size: 16px;
}
</style>
