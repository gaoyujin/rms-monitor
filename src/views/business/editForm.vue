<script lang="ts">
export default {
  name: "editBusiness"
};
</script>

<script setup lang="ts">
import { reactive, defineProps, watch, defineEmits, ref } from "vue";
import { FormInstance } from "element-plus";

import { bizType, businessParamType, businessInfo } from "/@/models/business";
import { createBusiness, updateBusiness } from "/@/api/business";
import { useBusinessStoreHook } from "/@/store/modules/business";
import { SUCCESS, successMessage, errorMessage } from "/@/utils/message/index";

// 父组件的数据
const props = defineProps<{
  parentNo: string;
  parentName: string;
  isEdit: boolean;
  selectRow?: businessInfo;
  isShow: boolean;
}>();

const xForm = ref<FormInstance>();
const itemType: bizType[] = [];

// 表单的数据信息
const refData = reactive({
  show: false,
  parentName: "",
  typeProps: itemType,
  formData: {
    businessDesc: "",
    businessName: "",
    businessNo: "",
    parentBusinessNo: "",
    businessType: ""
  }
});

const validateBizNO = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("Please input the password"));
  } else {
    const pattern = /^[a-zA-Z][a-zA-Z0-9_]{3,15}$/;
    const test = pattern.test(value);
    if (!test) {
      callback(
        new Error("只能输入：字母开头，允许4-16字节，允许字母数字下划线。")
      );
    }
    callback();
  }
};

const rules = reactive({
  businessNo: [
    { required: true, message: "请输入业务编号", trigger: "blur" },
    { validator: validateBizNO, trigger: "blur" }
  ],
  businessName: [
    {
      required: true,
      message: "请输入业务名称",
      trigger: "blur"
    }
  ],
  businessType: [
    {
      required: true,
      message: "请选择类型",
      trigger: "blur"
    }
  ]
});

// 控制窗口的隐藏和显示
watch(
  () => props.isShow,
  () => {
    if (props.isShow) {
      console.log(JSON.stringify(props));
      refData.show = true;
      refData.parentName = props.parentName;
      if (props.selectRow) {
        refData.formData = { ...props.selectRow };
      } else {
        refData.formData = {
          businessDesc: "",
          businessName: "",
          businessNo: "",
          parentBusinessNo: "",
          businessType: ""
        };
      }
    }
  }
);

// 获取类型信息并多个组件公用
const queryBizType = async () => {
  try {
    refData.typeProps = await useBusinessStoreHook().queryBizType();
  } catch (err) {
    errorMessage("查询类型失败，请联系管理员。");
    throw err;
  }
};

queryBizType();

const emit = defineEmits(["closeDialog", "refreshList"]);
// 关闭窗体
const closeDialog = () => {
  emit("closeDialog", false);
  refData.show = false;
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    console.log("验证了:" + valid);
    if (valid) {
      submitData();
    }
  });
};

// 提交表单
const submitData = async () => {
  if (props.isEdit) {
    const result = await updateBusiness(convertData());
    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("修改业务类型失败，信息为：" + result.errorCodeDes);
      return;
    } else {
      // 刷新存储数据
      useBusinessStoreHook().refreshBusinessData();
      successMessage("修改业务类型成功。");
    }
  } else {
    const result = await createBusiness(convertData());

    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("创建业务类型失败，信息为：" + result.errorCodeDes);
      return;
    } else {
      // 刷新存储数据
      useBusinessStoreHook().refreshBusinessData();
      successMessage("创建业务类型成功。");
    }
  }

  // 刷新并关闭
  emit("refreshList");
  closeDialog();
};

// 保存信息转换
const convertData = (): businessParamType => {
  const data: businessParamType = {
    businessNo: refData.formData.businessNo,
    businessName: refData.formData.businessName,
    businessType: refData.formData.businessType,
    parentBusinessNo: props.parentNo,
    businessDesc: refData.formData.businessDesc
  };

  return data;
};
</script>

<template>
  <el-dialog
    v-model="refData.show"
    :title="props.isEdit ? '编辑业务类型' : '新增业务类型'"
    width="70%"
    @closed="closeDialog"
  >
    <el-form
      ref="xForm"
      :rules="rules"
      :model="refData.formData"
      label-width="110px"
    >
      <el-form-item v-if="props.parentNo != ''" label="上级业务">
        <el-input v-model="refData.parentName" clearable :disabled="true" />
      </el-form-item>

      <el-form-item label="编号" prop="businessNo">
        <el-input
          v-model="refData.formData.businessNo"
          placeholder="请输入编号"
          clearable
          maxlength="15"
          :disabled="props.isEdit ? true : false"
          :showWordLimit="true"
        />
      </el-form-item>
      <el-form-item label="名称" prop="businessName">
        <el-input
          v-model="refData.formData.businessName"
          placeholder="请输入名称"
          clearable
          maxlength="10"
          :showWordLimit="true"
        />
      </el-form-item>
      <el-form-item label="类型" prop="businessType">
        <el-select
          v-model="refData.formData.businessType"
          placeholder="请选择类型"
          clearable
        >
          <el-option
            :key="index + '_' + item.businessType"
            v-for="(item, index) in refData.typeProps"
            :label="item.description"
            :value="item.businessType"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="业务描述">
        <el-input
          v-model="refData.formData.businessDesc"
          type="textarea"
          placeholder="请输入业务描述"
          clearable
          maxlength="300"
          rows="4"
          :showWordLimit="true"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm(xForm)">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<style scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
