<script lang="ts">
export default {
  name: "editRule"
};
</script>

<script setup lang="ts">
import { reactive, defineProps, watch, defineEmits, ref } from "vue";
import * as monaco from "monaco-editor";
import { FormInstance } from "element-plus";

import { businessInfo } from "/@/models/business";
import {
  ruleInfo,
  quotaDimensionItem,
  metadataItem,
  RuleBaseInfoData,
  quotaFlowInfo
} from "/@/models/rules";
import { metadataInfo } from "/@/models/metadata";
import {
  qryParamRule,
  createParamRule,
  updateParamRule
} from "/@/api/ruleParam";

import {
  qryQuotaRule,
  createQuotaRule,
  updateQuotaRule
} from "/@/api/ruleQuota";

import { contentCompile } from "/@/api/businessRule";
import { itemResult } from "/@/models/httpResult";
import { useRuleStoreHook } from "/@/store/modules/rules";
import { SUCCESS, successMessage, errorMessage } from "/@/utils/message/index";
import { validateBizNO } from "/@/utils/validate";
import { buildShortUUID } from "/@/utils/uuid";

import ParamSetting from "/@/views/rules/components/paramSetting.vue";
import QuotaSetting from "/@/views/rules/components/quotaSetting.vue";
import { nextTick } from "process";

const VAR_PARAM = "param";
const VAR_QUOTA = "quota";
const VAR_BLACKWHITE = "blackWhiteList";
const VAR_CUSTOM = "custom";

const monacoID = "ruleContainer" + buildShortUUID();
let addEdit = false;
let monacoEditor = null;

const monacoDiffID = "ruleDiffContainer" + buildShortUUID();
let addDiff = false;
let diffEditor = null;

// 父组件的数据
const props = defineProps<{
  isEdit: boolean;
  viewData: businessInfo;
  selectRow?: ruleInfo;
  isShow: boolean;
}>();

const xForm = ref<FormInstance>();
const active = ref(0);
const xParamSetting = ref(null);
const xQuotaSetting = ref(null);

const dimensionType: quotaDimensionItem[] = [];
const metadataType: metadataItem[] = [];
const ruleBaseInfoType: RuleBaseInfoData = null;

// 表单数据初始化
const dataInit = (ruleInfo: ruleInfo) => {
  const data = {
    // 是否异步执行
    asyncExecute: false,
    // 业务编号
    businessNo: "",
    // 规则生效结束时间(yyyy-MM-dd)
    endTime: "",
    // 备注
    memo: "",
    // 策略等级
    policyLevel: "",
    // 策略分类
    policyType: "",
    // 处理类型
    processType: "",
    // 规则描述
    ruleDescription: "",
    // 规则组
    ruleGroup: "",
    // 规则名称
    ruleName: "",
    // 规则编号
    ruleNo: "",
    // 规则种类(限额限次/黑白名单/自定义) [ param, quota, blackWhiteList, custom ]
    ruleType: VAR_PARAM,
    // 规则生效开始时间(yyyy-MM-dd)
    startTime: "",
    // 规则状态(online/offline)
    status: "offline",
    // 规则标签
    tags: [],
    // 限额限次的风控流量服务流量编号
    flowNo: "",
    // 限额限次的规则设定
    quotaDimensions: dimensionType,
    // 参数校验字段列表
    metadatas: metadataType,
    // 规则内容(自定义规则时必填)
    ruleContent: ""
  };

  if (ruleInfo) {
    data.asyncExecute = ruleInfo.asyncExecute;
    data.businessNo = ruleInfo.businessNo;
    data.endTime = ruleInfo.endTime;
    data.memo = ruleInfo.memo;
    data.policyLevel = ruleInfo.policyLevel;
    data.policyType = ruleInfo.policyType;
    data.processType = ruleInfo.processType;
    data.ruleDescription = ruleInfo.ruleDescription;
    data.ruleGroup = ruleInfo.ruleGroup;
    data.ruleName = ruleInfo.ruleName;
    data.ruleNo = ruleInfo.ruleNo;
    data.ruleType = ruleInfo.ruleType;
    data.startTime = ruleInfo.startTime;
    data.status = ruleInfo.status;
    data.tags = ruleInfo.tags;
    data.flowNo = ruleInfo.flowNo;
    data.quotaDimensions = ruleInfo.quotaDimensions;
    data.metadatas = ruleInfo.metadatas;
    data.ruleContent = ruleInfo.ruleContent;

    refData.oldData = ruleInfo.ruleContent;
  }

  return data;
};

// 表单的数据信息
const refData = reactive({
  show: false,
  oldData: "",
  showDiff: false,
  ruleBaseInfo: ruleBaseInfoType,
  formData: dataInit(null)
});

// 表单验证
const rules = reactive({
  ruleNo: [
    { required: true, message: "请输入规则编号", trigger: "blur" },
    { validator: validateBizNO, trigger: "blur" }
  ],
  ruleName: [{ required: true, message: "请输入规则名称", trigger: "blur" }],
  ruleType: [{ required: true, message: "请选择规则类型", trigger: "blur" }],
  tags: [{ required: true, message: "请选择规则标签", trigger: "blur" }]
});

// 控制窗口的隐藏和显示
watch(
  () => props.isShow,
  async () => {
    if (props.isShow) {
      refData.show = true;

      if (props.isEdit) {
        const ruleNo = props.selectRow.ruleNo;
        const ruleType = props.selectRow.ruleType;

        let result: itemResult<ruleInfo> = null;
        if (ruleType === VAR_PARAM) {
          result = await qryParamRule({ ruleNo: ruleNo });
        } else if (ruleType === VAR_QUOTA) {
          result = await qryQuotaRule({ ruleNo: ruleNo });
        } else if (ruleType === VAR_BLACKWHITE) {
          //const result = await qryParamRule({ ruleNo: ruleNo });
        } else if (ruleType === VAR_CUSTOM) {
          //const result = await qryParamRule({ ruleNo: ruleNo });
        }

        if (result.resultCode.toUpperCase() != SUCCESS) {
          errorMessage("查询规则详情失败，信息为：" + result.errorCodeDes);
          return;
        } else {
          refData.formData = dataInit(result.item);
        }
      } else if (props.isEdit === false) {
        refData.formData = dataInit(null);
      }
      // 获取规则的统配信息
      refData.ruleBaseInfo = await useRuleStoreHook().queryBaseInfoFromCache();
    }
  }
);

// 加载编辑器
const loadMonaco = () => {
  if (monacoEditor) {
    monacoEditor.setValue(refData.formData.ruleContent);
  }
  if (addEdit || !document.getElementById(monacoID)) {
    return;
  }
  nextTick(() => {
    monaco.editor.defineTheme("BlackTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "custom-info", foreground: "a3a7a9", background: "ffffff" },
        { token: "custom-notice", foreground: "1055af" },
        { token: "custom-date", foreground: "20aa20" }
      ],
      colors: {
        "editor.background": "#3e414a" //背景色
      }
    });
    //设置自定义主题
    monaco.editor.setTheme("BlackTheme");
    monacoEditor = monaco.editor.create(document.getElementById(monacoID), {
      value: "",
      language: "java"
    });

    addEdit = true;
  });
};

// 内容比较的UI创建
const loadDiffMonaco = () => {
  if (addDiff || !document.getElementById(monacoDiffID)) {
    return;
  }

  nextTick(() => {
    diffEditor = monaco.editor.createDiffEditor(
      document.getElementById(monacoDiffID),
      {
        theme: "vs-dark",
        readOnly: true
      }
    );
    // 隐藏
    document.getElementById(monacoDiffID).style.display = "none";
    addDiff = true;
  });
};

// 下一步
const next = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate((valid, fields) => {
    if (valid) {
      active.value++;

      if (refData.formData.ruleType === "custom") {
        loadMonaco();
        loadDiffMonaco();
      }
    }
  });
};

// 上一步
const previous = () => {
  active.value--;
};

// 比对内容
const onDiffChange = () => {
  if (refData.showDiff) {
    document.getElementById(monacoDiffID).style.display = "";
    loadDiffMonaco();
    setTimeout(() => {
      if (diffEditor) {
        diffEditor.setModel({
          original: monaco.editor.createModel(refData.oldData, "java"),
          modified: monaco.editor.createModel(monacoEditor.getValue(), "java")
        });
      }
    }, 300);
  } else {
    document.getElementById(monacoDiffID).style.display = "none";
  }
};

const emit = defineEmits(["closeDialog", "refreshList"]);
// 关闭窗体
const closeDialog = () => {
  emit("closeDialog", false);
  refData.show = false;
  active.value = 0;
};

// 参数校验的处理
const submitParamSetting = async (): Promise<boolean> => {
  if (
    refData.formData.ruleType === VAR_PARAM &&
    !xParamSetting.value.validator()
  ) {
    errorMessage("请配置参数校验信息！");
    return false;
  }

  const paramDatas: metadataInfo[] = xParamSetting.value.getParamInfo();
  console.log("配置的参数信息：" + JSON.stringify(paramDatas));
  refData.formData.metadatas = [];
  paramDatas.forEach(element => {
    refData.formData.metadatas.push({
      metadataId: element.id,
      nullable: element.nullable
    });
  });

  if (props.isEdit) {
    const result = await updateParamRule(refData.formData);

    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("修改参数校验信息失败，信息为：" + result.errorCodeDes);
      return false;
    } else {
      successMessage("修改参数校验信息成功。");
    }
  } else {
    const result = await createParamRule(refData.formData);

    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("创建参数校验信息失败，信息为：" + result.errorCodeDes);
      return false;
    } else {
      successMessage("创建参数校验信息成功。");
    }
  }

  return true;
};

// 验证规则内容
const testRuleContent = async (showMsg: boolean) => {
  const result = await contentCompile({ ruleContent: monacoEditor.getValue() });

  if (result.resultCode.toUpperCase() != SUCCESS) {
    errorMessage("测试规则内容未通过。");
    return false;
  } else {
    if (showMsg) {
      successMessage("测试规则内容通过。");
    }
    return true;
  }
};

// 自定义模式的处理
const submitContentSetting = async (): Promise<boolean> => {
  if (
    refData.formData.ruleType === VAR_CUSTOM &&
    refData.formData.ruleContent.trim().length < 1
  ) {
    errorMessage("请配置自定义规则代码！");
    return false;
  }

  if (!testRuleContent(true)) {
    return false;
  }

  if (props.isEdit) {
    const result = await updateParamRule(refData.formData);

    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("修改自定义规则失败，信息为：" + result.errorCodeDes);
      return false;
    } else {
      successMessage("修改自定义规则成功。");
    }
  } else {
    const result = await createParamRule(refData.formData);

    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("创建自定义规则失败，信息为：" + result.errorCodeDes);
      return false;
    } else {
      successMessage("创建自定义规则成功。");
    }
  }
};

// 限额限次的处理
const submitQuotaSetting = async (): Promise<boolean> => {
  if (
    refData.formData.ruleType === VAR_QUOTA &&
    !xQuotaSetting.value.validator()
  ) {
    errorMessage("请配置限额限次的流量信息！");
    return false;
  }

  const data: quotaFlowInfo = xQuotaSetting.value.getQuotaInfo();

  refData.formData.flowNo = data.flowId;
  refData.formData.quotaDimensions = data.dimensions;

  if (props.isEdit) {
    const result = await updateQuotaRule(refData.formData);

    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("修改限额限次信息失败，信息为：" + result.errorCodeDes);
      return false;
    } else {
      successMessage("修改限额限次信息成功。");
    }
  } else {
    const result = await createQuotaRule(refData.formData);

    if (result.resultCode.toUpperCase() != SUCCESS) {
      errorMessage("创建限额限次信息失败，信息为：" + result.errorCodeDes);
      return false;
    } else {
      successMessage("创建限额限次信息成功。");
    }
  }

  return true;
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  let isTodo = false;

  // 获取参数校验的相关设置
  if (refData.formData.ruleType === VAR_PARAM) {
    isTodo = await submitParamSetting();
  }

  // 设置自定义规则设置
  if (refData.formData.ruleType === VAR_CUSTOM) {
    isTodo = await submitContentSetting();
  }

  // 设置限额限次的信息
  if (refData.formData.ruleType === VAR_QUOTA) {
    isTodo = await submitQuotaSetting();
  }

  if (isTodo) {
    // 刷新并关闭
    emit("refreshList");
    closeDialog();
  }
};
</script>

<template>
  <el-dialog
    v-model="refData.show"
    :title="props.isEdit ? '编辑业务规则' : '新增业务规则'"
    top="5vh"
    width="88%"
    :close-on-click-modal="false"
    @closed="closeDialog"
  >
    <el-steps
      :active="active"
      simple
      finish-status="success"
      style="margin-top: -20px"
    >
      <el-step title="第一步：基础信息配置"> </el-step>
      <el-step title="第二步：规则特性配置" />
    </el-steps>

    <div style="padding-top: 15px" v-show="active == 0">
      <el-form
        ref="xForm"
        v-if="refData.ruleBaseInfo"
        :rules="rules"
        :model="refData.formData"
        label-width="110px"
      >
        <el-row>
          <el-col :span="12"
            ><el-form-item prop="ruleName" label="规则名称">
              <el-input
                v-model="refData.formData.ruleName"
                placeholder="请输入规则名称"
                clearable
                maxlength="15"
                show-word-limit
              /> </el-form-item
          ></el-col>
          <el-col :span="12"
            ><el-form-item prop="ruleNo" label="规则标识">
              <el-input
                v-model="refData.formData.ruleNo"
                placeholder="请输入规则标识"
                :disabled="props.isEdit ? true : false"
                clearable
                maxlength="25"
                show-word-limit
              /> </el-form-item
          ></el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="tags" label="规则标签">
              <el-checkbox-group v-model="refData.formData.tags">
                <el-checkbox
                  v-for="item in refData.ruleBaseInfo.ruleTagList"
                  :key="item.code"
                  :label="item.label"
                  >{{ item.label }}</el-checkbox
                >
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12"
            ><el-form-item prop="ruleType" label="规则类型">
              <el-select
                class="item-width-setting"
                :disabled="props.isEdit ? true : false"
                v-model="refData.formData.ruleType"
                placeholder="请选择规则类型"
              >
                <el-option
                  v-for="item in refData.ruleBaseInfo.statusArray"
                  :key="item.code"
                  :label="item.label"
                  :value="item.code"
                />
              </el-select> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item prop="ruleType" label="是否上线">
              <el-select
                class="item-width-setting"
                v-model="refData.formData.status"
                placeholder="请选择是否上线"
              >
                <el-option
                  v-for="item in refData.ruleBaseInfo.statusType"
                  :key="item.code"
                  :label="item.label"
                  :value="item.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12"
            ><el-form-item prop="policyLevel" label="策略等级">
              <el-select
                class="item-width-setting"
                clearable
                v-model="refData.formData.policyLevel"
                placeholder="请选择策略等级"
              >
                <el-option
                  v-for="item in refData.ruleBaseInfo.policyLevelList"
                  :key="item.code"
                  :label="item.label"
                  :value="item.code"
                />
              </el-select> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item prop="policyType" label="策略分类">
              <el-select
                class="item-width-setting"
                clearable
                v-model="refData.formData.policyType"
                placeholder="请选择策略分类"
              >
                <el-option
                  v-for="item in refData.ruleBaseInfo.policyTypeList"
                  :key="item.code"
                  :label="item.label"
                  :value="item.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12"
            ><el-form-item prop="processType" label="处理类型">
              <el-select
                class="item-width-setting"
                clearable
                v-model="refData.formData.processType"
                placeholder="请选择处理类型"
              >
                <el-option
                  v-for="item in refData.ruleBaseInfo.processTypeList"
                  :key="item.code"
                  :label="item.label"
                  :value="item.code"
                />
              </el-select> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item prop="ruleGroup" label="规则组">
              <el-select
                class="item-width-setting"
                clearable
                v-model="refData.formData.ruleGroup"
                placeholder="请选择规则组"
              >
                <el-option
                  v-for="item in refData.ruleBaseInfo.ruleGroupList"
                  :key="item.code"
                  :label="item.label"
                  :value="item.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12"
            ><el-form-item prop="startTime" label="生效时间">
              <el-date-picker
                class="item-width-setting"
                v-model="refData.formData.startTime"
                type="date"
                placeholder="请选择生效时间" /></el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item prop="endTime" label="失效时间">
              <el-date-picker
                class="item-width-setting"
                v-model="refData.formData.endTime"
                type="date"
                placeholder="请选择失效时间"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24"
            ><el-form-item prop="asyncExecute" label="">
              注意：规则有效期包含开始日期，不包含结束日期；即从开始日期的0点到结束日期的0点。
            </el-form-item></el-col
          >
        </el-row>
        <el-row>
          <el-col :span="12"
            ><el-form-item prop="asyncExecute" label="异步执行">
              <el-switch
                v-model="refData.formData.asyncExecute" /></el-form-item
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
      </el-form>
    </div>
    <div style="padding-top: 15px; width: 100%" v-show="active != 0">
      <!-- 参数校验模式 -->
      <ParamSetting
        v-show="refData.formData.ruleType === VAR_PARAM"
        ref="xParamSetting"
        :viewData="props.viewData"
        :ruleData="refData.formData"
        :isShow="props.isShow"
      ></ParamSetting>

      <!-- 自定义模式 -->
      <el-form
        v-show="refData.formData.ruleType === VAR_CUSTOM"
        label-width="110px"
      >
        <el-form-item label="规则内容">
          <div
            v-show="!refData.showDiff"
            :id="monacoID"
            style="width: 100%; height: 410px"
          ></div>
          <div :id="monacoDiffID" style="width: 100%; height: 410px"></div>
        </el-form-item>
        <el-row>
          <el-col :span="12"
            ><el-form-item label="内容比对">
              <el-switch
                @change="onDiffChange()"
                v-model="refData.showDiff" /></el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="内容测试">
              <el-button @click="testRuleContent(true)">测试</el-button
              ><span style="padding-left: 12px"
                >注：提交会默认进行内容测试，不通过不能提交。</span
              >
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 限额限次 -->
      <QuotaSetting
        v-show="refData.formData.ruleType === VAR_QUOTA"
        ref="xQuotaSetting"
        :viewData="props.viewData"
        :ruleData="refData.formData"
        :isShow="props.isShow"
      ></QuotaSetting>

      <template
        v-if="
          refData.formData.ruleType != VAR_PARAM &&
          refData.formData.ruleType != VAR_CUSTOM &&
          refData.formData.ruleType != VAR_QUOTA
        "
      >
        <div>请他组件</div>
      </template>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button v-if="active < 1" @click="next(xForm)">下一步</el-button>
        <el-button v-if="active > 0" @click="previous">上一步</el-button>
        <el-button v-if="active > 0" type="primary" @click="submitForm(xForm)"
          >确认</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
.item-width-setting {
  width: 100%;
}
</style>
