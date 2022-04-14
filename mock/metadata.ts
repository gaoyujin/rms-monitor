import { Random } from "mockjs";
import { MockMethod } from "vite-plugin-mock";
import { metadataInfo } from "/@/models/metadata";

const type: metadataInfo[] = [];

const itemList = () => {
  const result = {
    errorCode: "",
    errorCodeDes: "",
    resultCode: "SUCCESS",
    series: type,
    totalCount: 16,
    totalPages: 2
  };

  result.series = [];
  for (let index = 0; index < 16; index++) {
    const itemInfo = {
      fieldDesc: Random.csentence(50),
      fieldKey: Random.word(6),
      fieldName: Random.cword(3),
      fieldType: "String",
      tags: [
        Random.cword(3),
        Random.cword(2),
        Random.cword(3),
        Random.cword(4)
      ],
      aliases: [
        Random.cword(3),
        Random.cword(2),
        Random.cword(3),
        Random.cword(4)
      ]
    };

    result.series.push(itemInfo);
  }

  return result;
};

const itemList2 = () => {
  const result = {
    errorCode: "",
    errorCodeDes: "",
    resultCode: "SUCCESS",
    series: type
  };

  result.series = [];
  for (let index = 0; index < 16; index++) {
    const itemInfo = {
      fieldDesc: Random.csentence(50),
      fieldKey: Random.word(6),
      fieldName: Random.cword(3),
      fieldType: "String",
      tags: [
        Random.cword(3),
        Random.cword(2),
        Random.cword(3),
        Random.cword(4)
      ],
      aliases: [
        Random.cword(3),
        Random.cword(2),
        Random.cword(3),
        Random.cword(4)
      ]
    };

    result.series.push(itemInfo);
  }

  return result;
};

const httpResult = () => {
  const result = {
    errorCode: "",
    errorCodeDes: "",
    resultCode: "SUCCESS"
  };

  return result;
};

const errorResult = () => {
  const result = {
    errorCode: "501",
    errorCodeDes: "测试提交错误的效果",
    resultCode: "FAIL"
  };

  return result;
};

export default [
  {
    url: "/metadata/global/pageQry",
    method: "post",
    response: () => {
      return itemList();
    }
  },
  {
    url: "/metadata/global/list",
    method: "post",
    response: () => {
      return itemList2();
    }
  },
  {
    url: "/metadata/global/create",
    method: "post",
    response: () => {
      return httpResult();
    }
  },
  {
    url: "/metadata/global/update",
    method: "post",
    response: () => {
      return errorResult();
    }
  },
  {
    url: "/metadata/global/delete",
    method: "post",
    response: () => {
      return httpResult();
    }
  }
] as MockMethod[];
