<script lang="ts">
export default {
  name: "viewMetadata"
};
</script>

<script setup lang="ts">
import { reactive, defineProps, watch, defineEmits, ref } from "vue";
import { FormInstance } from "element-plus";

import { metadataInfo } from "/@/models/metadata";

// 父组件的数据
const props = defineProps<{
  selectRow: metadataInfo;
  isShow: boolean;
}>();

const xForm = ref<FormInstance>();

// 表单的数据信息
const refData = reactive({
  show: false,
  formData: {
    fieldDesc: "",
    fieldKey: "",
    fieldName: "",
    fieldType: "",
    tags: [],
    aliases: [],
    id: ""
  }
});

// 控制窗口的隐藏和显示
watch(
  () => props.isShow,
  () => {
    if (props.isShow) {
      refData.show = true;
      if (props.selectRow) {
        refData.formData.fieldDesc = props.selectRow.fieldDesc;
        refData.formData.fieldKey = props.selectRow.fieldKey;
        refData.formData.fieldName = props.selectRow.fieldName;
        refData.formData.fieldType = props.selectRow.fieldType;
        refData.formData.tags = props.selectRow.tags;
        refData.formData.aliases = props.selectRow.aliases;
        if (props.selectRow.id) {
          refData.formData.id = props.selectRow.id;
        }
      }
    }
  }
);

const emit = defineEmits(["closeDialog"]);
// 关闭窗体
const closeDialog = () => {
  emit("closeDialog", false);
  refData.show = false;
};
</script>

<template>
  <el-dialog
    v-model="refData.show"
    title="查看元数据字段"
    width="70%"
    @closed="closeDialog"
  >
    <el-form ref="xForm" :model="refData.formData" label-width="110px">
      <el-form-item label="英文名称" prop="fieldKey">
        <div class="div-view-setting">{{ refData.formData.fieldName }}</div>
      </el-form-item>
      <el-form-item label="字段名称" prop="fieldName">
        <div class="div-view-setting">{{ refData.formData.fieldName }}</div>
      </el-form-item>
      <el-form-item label="类型" prop="fieldType">
        <div class="div-view-setting">{{ refData.formData.fieldName }}</div>
      </el-form-item>

      <el-form-item label="标签" prop="tags">
        <div class="form-item-tag">
          <el-tag :key="tag" v-for="tag in refData.formData.tags" size="large">
            {{ tag }}
          </el-tag>
        </div>
      </el-form-item>

      <el-form-item label="别名" prop="aliases">
        <div class="form-item-tag">
          <el-tag
            :key="tag"
            v-for="tag in refData.formData.aliases"
            size="large"
          >
            {{ tag }}
          </el-tag>
        </div>
      </el-form-item>

      <el-form-item label="字段描述" prop="fieldDesc">
        <div class="div-view-setting" style="height: 120px; overflow: auto">
          {{ refData.formData.fieldDesc }}
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<style scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}

.form-item-tag .el-tag + .el-tag {
  margin-left: 10px;
}

.div-view-setting {
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  width: 100%;
  padding-left: 8px;
}
</style>
