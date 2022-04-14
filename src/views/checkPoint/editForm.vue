<script lang="ts">
export default {
  name: "editCheckPoint"
};
</script>

<script setup lang="ts">
import { reactive, defineProps, watch, defineEmits, ref } from "vue";
import { VxeTableInstance, VxeTablePropTypes } from "vxe-table";
import { FormInstance, ElMessageBox } from "element-plus";

import {
  businessTypeList,
  preActionListType,
  checkPointList
} from "/@/models/checkPoint";
import { createCheckPoint, updateCheckPoint } from "/@/api/checkPoint";
import { businessViewInfo } from "/@/models/business";
import { SUCCESS, successMessage, errorMessage } from "/@/utils/message/index";
import { validateBizNO } from "/@/utils/validate";

const xForm = ref<FormInstance>();
const xTable = ref({} as VxeTableInstance);
const bizTypeListType: businessTypeList[] = [];
const actionType: preActionListType[] = [];
const syncInstanceType: string[] = ["RMS", "RMS4POS"];
const preActionType: string[] = [
  "Ip22ProvinceCity",
  "Mobile22Province",
  "EpcMobile",
  "UesDecrypt",
  "AdssCardNo",
  "MerchantInfo",
  "CrmMerchantInfo",
  "UserInfoDataCenter",
  "Gps22ProvinceCity"
];

// 父组件的数据
const props = defineProps<{
  viewBusuness: businessViewInfo;
  isEdit: boolean;
  selectRow?: checkPointList;
  isShow: boolean;
}>();

// 表单的数据信息
const refData = reactive({
  show: false,
  formData: {
    businessNo: "",
    businessTypeList: bizTypeListType,
    checkDuplicate: false,
    code: "",
    defaultPkFieldName: "",
    label: "",
    memo: "",
    preActionList: actionType,
    syncInstance: ""
  }
});

// 控制窗口的隐藏和显示
watch(
  () => props.isShow,
  () => {
    if (props.isShow) {
      refData.show = true;
      if (props.isEdit) {
        refData.formData = {
          businessNo: props.viewBusuness.businessNo,
          businessTypeList: props.selectRow.businessTypeList,
          checkDuplicate: props.selectRow.checkDuplicate,
          code: props.selectRow.code,
          defaultPkFieldName: props.selectRow.defaultPkFieldName,
          label: props.selectRow.label,
          memo: props.selectRow.memo,
          preActionList: props.selectRow.preActionList,
          syncInstance: props.selectRow.syncInstance
        };
      } else if (props.isEdit === false) {
        refData.formData = {
          businessNo: props.viewBusuness.businessNo,
          businessTypeList: bizTypeListType,
          checkDuplicate: false,
          code: "",
          defaultPkFieldName: "",
          label: "",
          memo: "",
          preActionList: actionType,
          syncInstance: ""
        };
      }
    }
  }
);

const emit = defineEmits(["closeDialog", "refreshList"]);
// 关闭窗体
const closeDialog = () => {
  emit("closeDialog", false);
  refData.show = false;
};

// 表单验证
const rules = reactive({
  code: [
    { required: true, message: "请输入业务阶段标识", trigger: "blur" },
    { validator: validateBizNO, trigger: "blur" }
  ],
  label: [
    {
      required: true,
      message: "请输入业务阶段名称",
      trigger: "blur"
    }
  ],
  syncInstance: [
    {
      required: true,
      message: "请选择同步策略引擎",
      trigger: "blur"
    }
  ]
});

// 预处理配置验证
const validRules = ref({
  preAction: [{ required: true, message: "后处理动作不能为空" }],
  targetFields: [{ required: true, message: "需要的字段不能为空" }],
  prefix: [{ required: true, message: "返回值的前缀不能为空" }]
} as VxeTablePropTypes.EditRules);
// 触发表格的校验
const validEvent = async (): Promise<boolean> => {
  const $table = xTable.value;
  const errMap = await $table.validate();
  if (errMap) {
    return false;
  }
  return true;
};

// 提交验证
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  if (!validEvent()) {
    errorMessage("预处理配置的行数据不能为空！");
  } else {
    await formEl.validate((valid, fields) => {
      if (valid) {
        submitData();
      }
    });
  }
};

// 提交表单
const submitData = async () => {
  const tableObject = xTable.value;
  // 获取预处理表的数据
  getPreActionList();
  try {
    if (props.isEdit) {
      const result = await updateCheckPoint(refData.formData);
      if (result.resultCode.toUpperCase() != SUCCESS) {
        errorMessage("修改业务阶段信息失败，信息为：" + result.errorCodeDes);
        return;
      } else {
        successMessage("修改业务阶段信息成功。");
      }
    } else {
      const result = await createCheckPoint(refData.formData);

      if (result.resultCode.toUpperCase() != SUCCESS) {
        errorMessage("创建业务阶段信息失败，信息为：" + result.errorCodeDes);
        return;
      } else {
        successMessage("创建业务阶段信息成功。");
      }
    }

    // 刷新并关闭
    emit("refreshList");
    closeDialog();
  } catch (err) {
    errorMessage("接口请求异常，请联系管理员。");
    throw err;
  }
};

// 获取预处理相关信息
const getPreActionList = () => {
  const itemData = xTable.value.getTableData().fullData;
  refData.formData.preActionList = [];
  if (itemData && itemData.length > 0) {
    itemData.forEach(item => {
      const objData = {
        preAction: item["preAction"],
        prefix: item["prefix"],
        targetFields: item["targetFields"]
      };
      refData.formData.preActionList.push(objData);
    });
  }
};

// 插入一行
const insertEvent = async (row: any) => {
  const $table = xTable.value;
  const record = {
    preAction: "",
    prefix: "",
    targetFields: ""
  };
  const { row: newRow } = await $table.insertAt(record, row);
  await $table.setActiveCell(newRow, "name");
};

// 删除一行
const removeEvent = async (row: any) => {
  const $table = xTable.value;
  ElMessageBox.confirm("您确定要删除该数据?", "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "info"
  }).then(async () => {
    $table.remove(row);
  });
};
</script>

<template>
  <el-dialog
    v-model="refData.show"
    :title="props.isEdit ? '编辑业务阶段' : '新增业务阶段'"
    top="5vh"
    width="88%"
    @closed="closeDialog"
  >
    <el-form
      ref="xForm"
      :rules="rules"
      :model="refData.formData"
      label-width="110px"
    >
      <el-row>
        <el-col :span="12"
          ><el-form-item prop="code" label="阶段标识">
            <el-input
              v-model="refData.formData.code"
              placeholder="请输入阶段标识"
              :disabled="props.isEdit ? true : false"
              clearable
              maxlength="25"
              show-word-limit
            /> </el-form-item
        ></el-col>
        <el-col :span="12"
          ><el-form-item prop="defaultPkFieldName" label="默认主键">
            <el-input
              v-model="refData.formData.defaultPkFieldName"
              placeholder="请输入默认主键"
              maxlength="25"
              show-word-limit
              clearable
            /> </el-form-item
        ></el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="label" label="阶段名称">
            <el-input
              v-model="refData.formData.label"
              placeholder="请输入阶段名称"
              maxlength="15"
              show-word-limit
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="checkDuplicate" label="是否幂等">
            <el-switch v-model="refData.formData.checkDuplicate" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12"
          ><el-form-item prop="syncInstance" label="同步策略引擎">
            <el-select
              v-model="refData.formData.syncInstance"
              placeholder="请选择同步策略引擎"
            >
              <el-option
                v-for="item in syncInstanceType"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select> </el-form-item
        ></el-col>
        <el-col :span="12"></el-col>
      </el-row>
      <el-row>
        <el-col :span="24"
          ><el-form-item prop="memo" label="备注">
            <el-input
              v-model="refData.formData.memo"
              :autosize="{ minRows: 2, maxRows: 5 }"
              type="textarea"
              maxlength="300"
              show-word-limit
              placeholder="请输入备注信息" /></el-form-item
        ></el-col>
      </el-row>
      <el-row>
        <el-col :span="24"
          ><el-form-item prop="memo" label="预处理配置">
            <el-row style="width: 100%">
              <vxe-toolbar>
                <template #buttons>
                  <vxe-button icon="fa fa-plus" @click="insertEvent(-1)"
                    >新增</vxe-button
                  >
                </template>
              </vxe-toolbar>
            </el-row>
            <el-row style="width: 100%">
              <vxe-table
                border
                show-overflow
                keep-source
                ref="xTable"
                auto-resize="true"
                style="width: 100%; z-index: 9999"
                max-height="400"
                :data="refData.formData.preActionList"
                :edit-rules="validRules"
                :edit-config="{
                  trigger: 'click',
                  mode: 'cell',
                  icon: 'fa fa-pencil',
                  showStatus: true
                }"
              >
                <vxe-column type="seq" width="60"></vxe-column>
                <vxe-column
                  field="preAction"
                  title="后处理动作"
                  width="175px"
                  :edit-render="{}"
                >
                  <template #edit="{ row }">
                    <vxe-select
                      v-model="row.preAction"
                      style="“z-index:999;”"
                      transfer
                    >
                      <vxe-option
                        v-for="item in preActionType"
                        :key="item"
                        :value="item"
                        :label="item"
                      ></vxe-option>
                    </vxe-select>
                  </template>
                </vxe-column>
                <vxe-column
                  field="targetFields"
                  title="需要的字段"
                  :edit-render="{}"
                >
                  <template #edit="{ row }">
                    <vxe-input
                      v-model="row.targetFields"
                      type="text"
                      maxlength="100"
                    ></vxe-input>
                  </template>
                </vxe-column>
                <vxe-column
                  field="prefix"
                  title="返回值的前缀"
                  width="250px"
                  :edit-render="{}"
                >
                  <template #edit="{ row }">
                    <vxe-input v-model="row.prefix" maxlength="60"></vxe-input>
                  </template>
                </vxe-column>
                <vxe-table-column
                  title="操作"
                  align="center"
                  header-align="center"
                  width="75"
                  fixed="right"
                >
                  <template #default="{ row }">
                    <vxe-button
                      type="text"
                      status="primary"
                      @click="removeEvent(row)"
                      content="删除"
                    ></vxe-button>
                  </template>
                </vxe-table-column>
              </vxe-table>
            </el-row> </el-form-item
        ></el-col>
      </el-row>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm(xForm)">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style>
.vxe-select--panel {
  z-index: 9997 !important;
}
</style>
