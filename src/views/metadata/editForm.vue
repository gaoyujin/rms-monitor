<script lang="ts">
export default {
  name: "editMetadata"
};
</script>

<script setup lang="ts">
import { reactive, defineProps, watch, defineEmits, ref, nextTick } from "vue";
import { FormInstance } from "element-plus";
import { Plus } from "@element-plus/icons-vue";

import { metadataInfo } from "/@/models/metadata";
import { createMetadata, updateMetadata } from "/@/api/metadata";
import { useMetadataStoreHook } from "/@/store/modules/metadata";
import { SUCCESS, successMessage, errorMessage } from "/@/utils/message/index";

// 父组件的数据
const props = defineProps<{
  isEdit: boolean;
  selectRow?: metadataInfo;
  isShow: boolean;
}>();

const xForm = ref<FormInstance>();
const columnType: string[] = ["String", "Number", "Boolean", "DateTime"];
const VeriModeType = [
  { label: "字符串", code: "string" },
  { label: "整数", code: "int" },
  { label: "整数", code: "number" },
  { label: "日期", code: "date" },
  { label: "邮箱", code: "email" },
  { label: "网址", code: "url" },
  { label: "手机号", code: "phone" }
];
const saveTagInput = ref(null);
const saveAliaseInput = ref(null);

// 表单的数据信息
const refData = reactive({
  show: false,
  tempTags: "",
  tagsInput: false,
  tempAliases: "",
  aliasesInput: false,
  formData: {
    fieldDesc: "",
    fieldKey: "",
    fieldName: "",
    fieldType: "",
    tags: [],
    aliases: [],
    id: "",
    isDefault: false,
    VeriMode: "",
    Pattern: ""
  }
});

const validateFieldKey = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入字段名称"));
  } else {
    const pattern = /^[a-zA-Z][a-zA-Z_]{3,15}$/;
    const test = pattern.test(value);
    if (!test) {
      callback(
        new Error("只能输入：字母开头，允许4-16字节，允许字母和下划线。")
      );
    }
    callback();
  }
};

const rules = reactive({
  fieldKey: [
    { required: true, message: "请输入英文名称", trigger: "blur" },
    { validator: validateFieldKey, trigger: "blur" }
  ],
  fieldName: [
    {
      required: true,
      message: "请输入字段名称",
      trigger: "blur"
    }
  ],
  fieldType: [
    {
      required: true,
      message: "请选择类型",
      trigger: "change"
    }
  ]
});

// 控制窗口的隐藏和显示
watch(
  () => props.isShow,
  () => {
    if (props.isShow) {
      refData.show = true;
      if (props.isEdit && props.selectRow) {
        refData.formData.fieldDesc = props.selectRow.fieldDesc;
        refData.formData.fieldKey = props.selectRow.fieldKey;
        refData.formData.fieldName = props.selectRow.fieldName;
        refData.formData.fieldType = props.selectRow.fieldType;
        refData.formData.tags = props.selectRow.tags;
        refData.formData.aliases = props.selectRow.aliases;
        refData.formData.isDefault = props.selectRow.isDefault;
        refData.formData.VeriMode = props.selectRow.VeriMode;
        refData.formData.Pattern = props.selectRow.Pattern;
        if (props.selectRow.id) {
          refData.formData.id = props.selectRow.id;
        }
      } else {
        refData.formData = {
          fieldDesc: "",
          fieldKey: "",
          fieldName: "",
          fieldType: "",
          tags: [],
          aliases: [],
          id: "",
          isDefault: false,
          VeriMode: "",
          Pattern: ""
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

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      submitData();
    }
  });
};

// 提交表单
const submitData = async () => {
  if (props.isEdit) {
    const result = await updateMetadata(convertData());
    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("修改元数据字段失败，信息为：" + result.errorCodeDes);
      return;
    } else {
      // 刷新存储数据
      useMetadataStoreHook().refreshMetadata();
      successMessage("修改元数据字段成功。");
    }
  } else {
    const result = await createMetadata(convertData());

    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("创建元数据字段失败，信息为：" + result.errorCodeDes);
      return;
    } else {
      // 刷新存储数据
      useMetadataStoreHook().refreshMetadata();
      successMessage("创建元数据字段成功。");
    }
  }

  // 刷新并关闭
  emit("refreshList");
  closeDialog();
};

// 标签添加
const handleInputConfirm = () => {
  const data = refData.formData.tags.find(item => item === refData.tempTags);
  if (data !== undefined) {
    refData.tempTags = "";
    errorMessage("标签不能相同。");
  } else {
    const inputValue = refData.tempTags;
    if (inputValue) {
      refData.formData.tags.push(inputValue);
    }
  }

  refData.tagsInput = false;
  refData.tempTags = "";
};

// 显示tag的输入框
const showTagInput = () => {
  refData.tagsInput = true;
  nextTick(() => {
    saveTagInput.value.input.focus();
  });
};

// 删除标签
const handleTagClose = tag => {
  refData.formData.tags.splice(refData.formData.tags.indexOf(tag), 1);
};

// 别名添加
const handleAliaseConfirm = () => {
  const data = refData.formData.aliases.find(
    item => item === refData.tempAliases
  );
  if (data !== undefined) {
    refData.tempAliases = "";
    errorMessage("别名不能相同。");
  } else {
    const inputValue = refData.tempAliases;
    if (inputValue) {
      refData.formData.aliases.push(inputValue);
    }
  }

  refData.aliasesInput = false;
  refData.tempAliases = "";
};

// 显示别名的输入框
const showAliaseInput = () => {
  refData.aliasesInput = true;
  nextTick(() => {
    saveAliaseInput.value.input.focus();
  });
};

// 删除别名
const handleAliaseClose = tag => {
  refData.formData.aliases.splice(refData.formData.aliases.indexOf(tag), 1);
};

// 保存信息转换
const convertData = (): metadataInfo => {
  const data: metadataInfo = {
    fieldDesc: refData.formData.fieldDesc,
    fieldKey: refData.formData.fieldKey,
    fieldName: refData.formData.fieldName,
    fieldType: refData.formData.fieldType,
    tags: refData.formData.tags,
    aliases: refData.formData.aliases,
    id: refData.formData.id,
    isDefault: refData.formData.isDefault,
    VeriMode: refData.formData.VeriMode,
    Pattern: refData.formData.Pattern
  };

  return data;
};
</script>

<template>
  <el-dialog
    v-model="refData.show"
    :title="props.isEdit ? '编辑元数据字段' : '新增元数据字段'"
    width="70%"
    @closed="closeDialog"
  >
    <el-form
      ref="xForm"
      :rules="rules"
      :model="refData.formData"
      label-width="110px"
    >
      <el-form-item label="英文名称" prop="fieldKey">
        <el-input
          v-model="refData.formData.fieldKey"
          placeholder="请输入英文名称"
          clearable
          maxlength="10"
          :disabled="props.isEdit ? true : false"
          :showWordLimit="true"
        />
      </el-form-item>
      <el-form-item label="字段名称" prop="fieldName">
        <el-input
          v-model="refData.formData.fieldName"
          placeholder="请输入字段名称"
          clearable
          maxlength="10"
          :showWordLimit="true"
        />
      </el-form-item>

      <el-row>
        <el-col :span="12">
          <el-form-item label="类型" prop="fieldType">
            <el-select
              class="item-width-setting"
              v-model="refData.formData.fieldType"
              placeholder="请选择类型"
              clearable
            >
              <el-option
                :key="index + '_' + item"
                v-for="(item, index) in columnType"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>
      </el-row>

      <el-row>
        <el-col :span="12"
          ><el-form-item label="默认正则" prop="isDefault">
            <el-switch v-model="refData.formData.isDefault" /> </el-form-item
        ></el-col>
        <el-col :span="12">
          <el-form-item
            v-show="refData.formData.isDefault"
            label="相关正则"
            prop="VeriMode"
          >
            <el-select
              class="item-width-setting"
              v-model="refData.formData.VeriMode"
              placeholder="请选择相关正则"
              clearable
            >
              <el-option
                :key="index + '_' + item.code"
                v-for="(item, index) in VeriModeType"
                :label="item.label"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-show="!refData.formData.isDefault"
            label="相关正则"
            prop="Pattern"
          >
            <el-input
              v-model="refData.formData.Pattern"
              placeholder="请输入相关正则"
            /> </el-form-item
        ></el-col>
      </el-row>

      <el-form-item label="标签" prop="tags">
        <div class="form-item-tag">
          <el-tag
            :key="tag"
            v-for="tag in refData.formData.tags"
            closable
            :disable-transitions="false"
            size="large"
            @close="handleTagClose(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="refData.tagsInput"
            v-model="refData.tempTags"
            ref="saveTagInput"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
            maxlength="10"
          />

          <el-button
            v-else
            class="button-new-tag"
            @click="showTagInput"
            :icon="Plus"
            circle
          ></el-button>
        </div>
      </el-form-item>

      <el-form-item label="别名" prop="aliases">
        <div class="form-item-tag">
          <el-tag
            :key="tag"
            v-for="tag in refData.formData.aliases"
            closable
            :disable-transitions="false"
            size="large"
            @close="handleAliaseClose(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="refData.aliasesInput"
            v-model="refData.tempAliases"
            ref="saveAliaseInput"
            @keyup.enter.native="handleAliaseConfirm"
            @blur="handleAliaseConfirm"
            maxlength="10"
          />

          <el-button
            v-else
            class="button-new-tag"
            @click="showAliaseInput"
            :icon="Plus"
            circle
          ></el-button>
        </div>
      </el-form-item>

      <el-form-item label="字段描述" prop="fieldDesc">
        <el-input
          v-model="refData.formData.fieldDesc"
          type="textarea"
          placeholder="请输入字段描述"
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

.form-item-tag .el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}

.item-width-setting {
  width: 100%;
}
</style>
