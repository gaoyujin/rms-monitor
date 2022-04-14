import { Random } from "mockjs";
import { MockMethod } from "vite-plugin-mock";
import { businessInfo } from "/@/models/business";

// const businessList = () => {
//   const result = {
//     errorCode: "",
//     errorCodeDes: "",
//     resultCode: "SUCCESS",
//     series: [],
//     totalCount: 0,
//     totalPages: 0
//   };

//   for (let index = 0; index < 8; index++) {
//     const parentCode = Random.word(8);
//     const parentInfo = {
//       businessDesc: Random.csentence(50),
//       businessName: Random.csentence(5),
//       businessNo: parentCode,
//       businessType: Random.word(6),
//       businessTypeName: Random.csentence(5),
//       createTime: Random.datetime(),
//       operator: Random.word(6),
//       status: Random.word(6),
//       updateTime: Random.datetime(),
//       parentBusinessNo: null,
//       children: []
//     };

//     result.series.push(parentInfo);

//     const num = Random.integer(3, 7);

//     for (let k = 0; k < num; k++) {
//       const subCode = Random.word(8);
//       const subInfo = {
//         businessDesc: Random.csentence(50),
//         businessName: Random.csentence(5),
//         businessNo: subCode,
//         businessType: Random.word(6),
//         businessTypeName: Random.csentence(5),
//         createTime: Random.datetime(),
//         operator: Random.word(6),
//         status: Random.word(6),
//         updateTime: Random.datetime(),
//         parentBusinessNo: parentCode,
//         children: []
//       };
//       parentInfo.children.push(subInfo);

//       const next = Random.integer(1, 3);

//       for (let n = 0; n < next; n++) {
//         const subCode = Random.word(8);
//         subInfo.children.push({
//           businessDesc: Random.csentence(50),
//           businessName: Random.csentence(5),
//           businessNo: Random.word(8),
//           businessType: Random.word(6),
//           businessTypeName: Random.csentence(5),
//           createTime: Random.datetime(),
//           operator: Random.word(6),
//           status: Random.word(6),
//           updateTime: Random.datetime(),
//           parentBusinessNo: subCode,
//           children: []
//         });
//       }
//     }
//   }

//   return result;
// };

const type: businessInfo[] = [];

const businessList = () => {
  const result = {
    errorCode: "",
    errorCodeDes: "",
    resultCode: "SUCCESS",
    series: type,
    totalCount: 0,
    totalPages: 0
  };

  result.series = [];
  for (let index = 0; index < 2; index++) {
    const parentCode = Random.word(8);
    const parentInfo = {
      businessDesc: Random.csentence(50),
      businessName: Random.cword(5),
      businessNo: parentCode,
      businessType: Random.word(6),
      businessTypeName: Random.cword(5),
      createTime: Random.datetime(),
      operator: Random.word(6),
      status: Random.word(6),
      updateTime: Random.datetime(),
      parentBusinessNo: null,
      children: []
    };

    result.series.push(parentInfo);

    const num = Random.integer(3, 7);

    for (let k = 0; k < 2; k++) {
      const subCode = Random.word(8);
      const subInfo = {
        businessDesc: Random.csentence(50),
        businessName: Random.cword(5),
        businessNo: subCode,
        businessType: Random.word(6),
        businessTypeName: Random.cword(5),
        createTime: Random.datetime(),
        operator: Random.word(6),
        status: Random.word(6),
        updateTime: Random.datetime(),
        parentBusinessNo: parentCode,
        children: []
      };
      result.series.push(subInfo);

      const next = Random.integer(1, 3);

      for (let n = 0; n < 1; n++) {
        result.series.push({
          businessDesc: Random.csentence(50),
          businessName: Random.cword(5),
          businessNo: Random.word(8),
          businessType: Random.word(6),
          businessTypeName: Random.cword(5),
          createTime: Random.datetime(),
          operator: Random.word(6),
          status: Random.word(6),
          updateTime: Random.datetime(),
          parentBusinessNo: subCode,
          children: []
        });
      }
    }
  }

  return result;
};

const typeList = () => {
  const result = {
    errorCode: "",
    errorCodeDes: "",
    resultCode: "SUCCESS",
    series: [],
    totalCount: 0,
    totalPages: 0
  };

  const info1 = {
    businessType: "chuk",
    description: "出款"
  };

  const info2 = {
    businessType: "jinz",
    description: "进账"
  };

  const info3 = {
    businessType: "other",
    description: "其他"
  };

  result.series.push(info1);
  result.series.push(info2);
  result.series.push(info3);

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

const viewResult = () => {
  const infoCode = Random.word(8);
  const result = {
    errorCode: "",
    errorCodeDes: "",
    resultCode: "SUCCESS",
    item: {
      businessDesc: Random.csentence(50),
      businessName: Random.csentence(4),
      businessNo: infoCode,
      parentBusinessNo: Random.word(8),
      businessType: Random.word(6),
      businessTypeName: Random.csentence(5),
      operator: Random.word(6),
      status: Random.word(6),
      updateTime: Random.datetime(),
      createTime: Random.datetime(),
      ruleList: ruleList(infoCode),
      checkPointList: pointList(infoCode)
    }
  };

  return result;
};

const ruleList = (parentNo: string) => {
  const list = [];
  for (let n = 0; n < 5; n++) {
    list.push({
      businessNo: parentNo,
      memo: Random.word(8),
      ruleContent: Random.word(50),
      ruleDescription: Random.csentence(50),
      ruleGroup: Random.csentence(4),
      ruleNo: Random.word(7)
    });
  }

  return list;
};

const pointList = (parentNo: string) => {
  const list = [];
  for (let n = 0; n < 5; n++) {
    list.push({
      businessNo: parentNo,
      code: Random.word(5),
      label: Random.csentence(4),
      memo: Random.csentence(50),
      syncInstance: "是"
    });
  }

  return list;
};

export default [
  {
    url: "/business/definition/pageQry",
    method: "post",
    response: () => {
      return businessList();
    }
  },
  {
    url: "/business/definition/type",
    method: "get",
    response: () => {
      return typeList();
    }
  },
  {
    url: "/business/definition/create",
    method: "post",
    response: () => {
      return httpResult();
    }
  },
  {
    url: "/business/definition/update",
    method: "post",
    response: () => {
      return errorResult();
    }
  },
  {
    url: "/business/definition/detail",
    method: "get",
    response: () => {
      return viewResult();
    }
  }
] as MockMethod[];
