<script lang="ts">
export default {
  name: "paramSetting"
};
</script>

<script setup lang="ts">
import { reactive, watch, ref } from "vue";
import { VxeTableInstance } from "vxe-table";
import { businessViewInfo } from "/@/models/business";
import { ruleInfo } from "/@/models/rules";
import { referenceQueryParam } from "/@/models/metaReference";
import { metadataInfo } from "/@/models/metadata";

import { qryMetadataReferences } from "/@/api/metaReference";
import { SUCCESS, errorMessage } from "/@/utils/message/index";

// 父组件的数据
const props = defineProps<{
  viewData: businessViewInfo;
  ruleData: ruleInfo;
  isShow: boolean;
}>();

const metaInfoType: metadataInfo[] = [];

const xTable = ref({} as VxeTableInstance);

// 表单的数据信息
const refData = reactive({
  metadataSource: metaInfoType,
  formData: {
    showMetadatas: metaInfoType,
    selectMetadatas: []
  }
});

// 表单验证
const rules = reactive({
  selectMetadatas: [
    { required: true, message: "请选择涉及的元数据字段", trigger: "blur" }
  ]
});

// 查询业务相关的元数据字段
const queryRelationColumn = async () => {
  if (!props.viewData || !props.viewData.businessNo) {
    return;
  }

  const param: referenceQueryParam = {
    primary: props.viewData.businessNo,
    primaryType: props.viewData.businessType
  };

  const result = await qryMetadataReferences(param);

  if (result.resultCode.toUpperCase() != SUCCESS) {
    errorMessage("查规则相关元数据失败，原因：" + result.errorCodeDes);
    return;
  } else {
    refData.metadataSource = result.series;
  }
};

queryRelationColumn();

// 根据父类的信息初始页面
watch(
  () => props.isShow,
  () => {
    changeSelect();
  }
);

// 根据父类的信息初始页面
watch(
  () => props.ruleData,
  () => {
    if (props.ruleData && props.ruleData.metadatas) {
      refData.formData.selectMetadatas = props.ruleData.metadatas;
    }
  }
);

// 计算已经选择的字段
watch(
  () => refData.formData.selectMetadatas,
  () => {
    changeSelect();
  }
);

// 选择信息的重置
const changeSelect = () => {
  refData.formData.selectMetadatas.forEach(item => {
    const key = item;
    const isHas = refData.formData.showMetadatas.some(meta => meta.id == key);

    // 新增的添加
    if (!isHas) {
      let itemData: metadataInfo = null;
      for (let i = 0; i < refData.metadataSource.length; i++) {
        const dataItem = refData.metadataSource[i];
        if (dataItem.id == key) {
          itemData = dataItem;
          break;
        }
      }

      // const itemData = refData.metadataSource.find(obj => {
      //   obj.id == key;
      // });

      if (itemData) {
        refData.formData.showMetadatas.push({
          ...itemData,
          nullable: true
        });
      }
    }
  });

  // 删除的需要去除
  refData.formData.showMetadatas.forEach(item => {
    const isHas = refData.formData.selectMetadatas.some(obj => obj == item.id);

    if (!isHas) {
      refData.formData.showMetadatas.splice(
        refData.formData.showMetadatas.findIndex(data => data.id === item.id),
        1
      );
    }
  });

  xTable.value.loadData(refData.formData.showMetadatas);
};

// 删除一行
const removeRow = row => {
  refData.formData.showMetadatas.splice(
    refData.formData.showMetadatas.findIndex(data => data.id === row.id),
    1
  );

  refData.formData.selectMetadatas.splice(
    refData.formData.selectMetadatas.findIndex(data => data === row.id),
    1
  );

  xTable.value.loadData(refData.formData.showMetadatas);
};

// 提交前的校验
const validator = () => {
  if (
    !refData.formData.selectMetadatas ||
    refData.formData.selectMetadatas.length < 1
  ) {
    return false;
  }

  return true;
};

// 获取配置的参数校验信息
const getParamInfo = (): metadataInfo[] => {
  return refData.formData.showMetadatas;
};

defineExpose({ validator, getParamInfo });
</script>

<template>
  <el-form
    v-if="refData.metadataSource && refData.metadataSource.length > 0"
    :rules="rules"
    style="width: 100%"
    :model="refData.formData"
    label-width="110px"
  >
    <el-row>
      <el-col :span="24"
        ><el-form-item prop="selectMetadatas" label="元数据字段">
          <el-select
            v-model="refData.formData.selectMetadatas"
            multiple
            filterable
            placeholder="请选择元数据字段"
            @change="changeSelect"
            style="width: 100%"
          >
            <el-option
              v-for="item in refData.metadataSource"
              :key="item.id"
              :label="item.fieldName + '-' + item.fieldKey"
              :value="item.id"
            />
          </el-select> </el-form-item
      ></el-col>
    </el-row>
    <el-row>
      <el-col :span="24"
        ><el-form-item prop="selectMetadatas" label="参数配置">
          <vxe-table
            border
            show-overflow
            keep-source
            ref="xTable"
            :column-config="{ resizable: true }"
            auto-resize="true"
            style="width: 100%"
            :data="refData.formData.showMetadatas"
          >
            <vxe-column type="seq" width="60"></vxe-column>
            <vxe-column field="fieldKey" title="字段标识" :edit-render="{}">
              <template #default="{ row }">
                <span>{{ row.fieldKey }}</span>
              </template>
            </vxe-column>
            <vxe-column field="fieldName" title="字段名称" :edit-render="{}">
              <template #default="{ row }">
                <span>{{ row.fieldName }}</span>
              </template>
            </vxe-column>
            <vxe-column
              width="160px"
              field="nullable"
              title="允许为空"
              :edit-render="{}"
            >
              <template #default="{ row }">
                <vxe-switch
                  v-model="row.nullable"
                  open-label="是"
                  close-label="否"
                ></vxe-switch>
              </template>
            </vxe-column>
            <vxe-column title="操作" align="center" width="85">
              <template #default="{ row }">
                <vxe-button
                  type="text"
                  status="primary"
                  @click="removeRow(row)"
                  content="删除"
                ></vxe-button>
              </template>
            </vxe-column>
          </vxe-table> </el-form-item
      ></el-col>
    </el-row>
  </el-form>
</template>

<style scoped></style>
