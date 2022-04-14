<script lang="ts">
export default {
  name: "editMetaTransfer"
};
</script>

<script lang="ts" setup>
import { reactive, watch } from "vue";

import { metadataInfo } from "/@/models/metadata";
import { metadataReferenceParam } from "/@/models/metaReference";
import { useMetadataStoreHook } from "/@/store/modules/metadata";
import { businessViewInfo } from "/@/models/business";
import { metadataReference } from "/@/api/metaReference";
import { SUCCESS, successMessage, errorMessage } from "/@/utils/message/index";

// 父组件的数据
const props = defineProps<{
  viewData: businessViewInfo;
  selectOption: metadataInfo[];
  isShow: boolean;
}>();

interface Option {
  seq: number;
  key: string;
  label: string;
  disabled: boolean;
}
const resultType: Option[] = [];

// 表单的数据信息
const refData = reactive({
  show: false,
  tableData: resultType,
  selectVal: []
});

// 控制窗口的隐藏和显示
watch(
  () => props.isShow,
  async () => {
    if (props.isShow) {
      refData.show = true;
      const allData = await useMetadataStoreHook().queryMetadata();
      refData.tableData = processData(allData);
    }
  }
);

// 控件的数据源处理
const processData = (allData: metadataInfo[]): Option[] => {
  const resultData: Option[] = [];
  let seq = 1;
  allData.forEach(item => {
    // 显示内容的组装
    const label =
      item.fieldKey + " - " + item.fieldName + " - " + item.fieldType;
    const relItem: Option = {
      seq: seq,
      key: item.fieldKey,
      label: label,
      disabled: false
    };
    resultData.push(relItem);
    seq = seq + 1;

    // 引用内容的设置
    const exist = props.selectOption.some(
      element => element.fieldKey === item.fieldKey
    );
    if (exist) {
      refData.selectVal.push(item.fieldKey);
    }
  });

  return resultData;
};

const emit = defineEmits(["closeDialog", "refreshList"]);
// 关闭窗体
const closeDialog = () => {
  emit("closeDialog", false);
  refData.show = false;
};

// 提交配置
const submitForm = async () => {
  // 引用的相关信息
  const param: metadataReferenceParam = {
    primary: "",
    primaryType: "",
    metadataIds: []
  };
  param.primary = props.viewData.businessNo;
  param.primaryType = props.viewData.businessType;
  refData.selectVal.forEach(item => param.metadataIds.push(item));

  const result = await metadataReference(param);
  if (result.resultCode.toUpperCase() != SUCCESS) {
    errorMessage("引用元数据字段失败，信息为：" + result.errorCodeDes);
    return;
  } else {
    successMessage("引用元数据字段成功。");
  }

  // 刷新并关闭
  emit("refreshList");
  closeDialog();
};
</script>

<template>
  <el-dialog
    v-model="refData.show"
    title="配置元数据引用"
    width="880px"
    @closed="closeDialog"
  >
    <p style="margin: 0 0 20px; padding-left: 20px">
      说明：显示内容为 => 英文名称 - 中文名称 - 数据类型
    </p>
    <div style="text-align: center">
      <el-transfer
        v-model="refData.selectVal"
        style="text-align: left; display: inline-block"
        filterable
        :titles="['共享的元数据字段', '已经引用的元数据字段']"
        :format="{
          noChecked: '${total}',
          hasChecked: '${checked}/${total}'
        }"
        :data="refData.tableData"
      >
        <template #default="{ option }">
          <span>{{ option.seq }} - {{ option.label }}</span>
        </template>
      </el-transfer>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm()">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.el-dialog /deep/ .el-dialog__body {
  padding-top: 10px !important;
}

.transfer-footer {
  margin-left: 15px;
  padding: 6px 5px;
}

.el-transfer /deep/ .el-transfer-panel {
  width: 330px;
}
</style>
