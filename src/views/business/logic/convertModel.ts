import { businessInfo } from "/@/models/business";

const convertBusinessInfo = (infoList: businessInfo[]): businessInfo[] => {
  // 没数据，直接返回
  if (!infoList) {
    return infoList;
  }

  // 获取顶层业务信息集合
  const topInfo = infoList.filter(
    item => !item.parentBusinessNo || item.parentBusinessNo.length < 1
  );

  // 递归整理数据
  topInfo.forEach(item => {
    getNextItem(item, infoList);
  });

  return topInfo;
};

// 递归梳理数据结构
const getNextItem = (parent: businessInfo, allInfo: businessInfo[]) => {
  const nextChild = allInfo.filter(
    item => item.parentBusinessNo == parent.businessNo
  );

  if (!nextChild || nextChild.length < 1) {
    return;
  }

  nextChild.forEach(item => {
    getNextItem(item, allInfo);

    if (!parent.children) {
      parent.children = [];
    }

    parent.children.push(item);
  });
};

export { convertBusinessInfo };
