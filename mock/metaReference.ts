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
    totalCount: 5,
    totalPages: 1
  };

  result.series = [];
  for (let index = 0; index < 5; index++) {
    const itemInfo = {
      fieldDesc: Random.csentence(50),
      fieldKey: Random.word(6),
      fieldName: Random.cword(3),
      fieldType: "string",
      id: Random.word(6),
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

export default [
  {
    url: "/metadata/reference/list",
    method: "post",
    response: () => {
      return itemList();
    }
  },
  {
    url: "/metadata/reference",
    method: "post",
    response: () => {
      return httpResult();
    }
  },
  {
    url: "/metadata/reference/add",
    method: "post",
    response: () => {
      return httpResult();
    }
  },
  {
    url: "/metadata/reference/delete",
    method: "post",
    response: () => {
      return httpResult();
    }
  }
] as MockMethod[];
