<script lang="ts">
export default {
  name: "quotaSetting"
};
</script>

<script setup lang="ts">
import { reactive, watch, ref } from "vue";
import { VxeTableInstance } from "vxe-table";

import { businessViewInfo } from "/@/models/business";
import { ruleInfo, quotaDimensionItem, quotaFlowInfo } from "/@/models/rules";
import { qryQuotaFlows } from "/@/api/businessRule";

import { SUCCESS, errorMessage } from "/@/utils/message/index";

const xTable = ref({} as VxeTableInstance);

// 父组件的数据
const props = defineProps<{
  viewData: businessViewInfo;
  ruleData: ruleInfo;
  isShow: boolean;
}>();

const quotaFlowType: quotaFlowInfo[] = [];
const dimensionType: quotaDimensionItem[] = [];

// 表单的数据信息
const refData = reactive({
  flowSource: quotaFlowType,
  formData: {
    // 流量标识
    flowId: "",
    // 流量名称
    flowName: "",
    // 维度相关的信息
    dimensions: dimensionType
  }
});

// 表单验证
const rules = reactive({
  flowId: [{ required: true, message: "请选择关联流量", trigger: "blur" }]
});

// 查询规则相关的流量信息
const queryQuotaFlows = async () => {
  if (!props.viewData || !props.viewData.businessNo) {
    return;
  }

  const result = await qryQuotaFlows({});

  if (result.resultCode.toUpperCase() != SUCCESS) {
    errorMessage("查询规则相关的流量信息失败，原因：" + result.errorCodeDes);
    return;
  } else {
    refData.flowSource = result.series;
  }
};

queryQuotaFlows();

const changeSelect = () => {
  const items = refData.flowSource.find(
    item => item.flowId === refData.formData.flowId
  );

  if (items) {
    refData.formData.dimensions = items.dimensions;
  }

  xTable.value.loadData(refData.formData.dimensions);
};

// 提交前的校验
const validator = () => {
  if (!refData.formData.flowId || refData.formData.flowId.length < 1) {
    return false;
  }

  return true;
};

// 返回限额限次的数据信息
const getQuotaInfo = (): quotaFlowInfo => {
  return refData.formData;
};

defineExpose({ getQuotaInfo, validator });
</script>

<template>
  <el-form
    v-if="refData.flowSource && refData.flowSource.length > 0"
    :rules="rules"
    style="width: 100%"
    :model="refData.formData"
    label-width="110px"
  >
    <el-row>
      <el-col :span="12"
        ><el-form-item prop="flowId" label="关联流量">
          <el-select
            v-model="refData.formData.flowId"
            filterable
            placeholder="请选择关联流量"
            @change="changeSelect"
            style="width: 100%"
          >
            <el-option
              v-for="item in refData.flowSource"
              :key="item.flowId"
              :label="item.flowName"
              :value="item.flowId"
            />
          </el-select> </el-form-item
      ></el-col>
      <el-col :span="12"></el-col>
    </el-row>
    <el-row>
      <el-col :span="24"
        ><el-form-item prop="dimensions" label="流量维度">
          <vxe-table
            border
            show-overflow
            keep-source
            ref="xTable"
            :column-config="{ resizable: true }"
            auto-resize="true"
            style="width: 100%"
            :data="refData.formData.dimensions"
          >
            <vxe-column type="seq" width="60"></vxe-column>
            <vxe-column
              field="dimension"
              width="210"
              title="维度Key"
              :edit-render="{}"
            >
              <template #default="{ row }">
                <span>{{ row.dimension }}</span>
              </template>
            </vxe-column>
            <vxe-column field="quotaValue" title="阈值" :edit-render="{}">
              <template #default="{ row }">
                <vxe-input
                  v-model="row.quotaValue"
                  placeholder="请输入阈值"
                  type="number"
                ></vxe-input>
              </template>
            </vxe-column>
          </vxe-table> </el-form-item
      ></el-col>
    </el-row>
  </el-form>
</template>

<style scoped></style>
