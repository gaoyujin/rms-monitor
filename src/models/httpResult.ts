// 通用请求的返回结果
export declare type resultHttp = Promise<httpResult>;

// 分页对象返回
export declare type pageResult<T> = {
  errorCode: string;
  errorCodeDes: string;
  resultCode: string;
  series: T[];
  totalCount: number;
  totalPages: number;
};

// 请求结果返回
export declare type httpResult = {
  errorCode: string;
  errorCodeDes: string;
  resultCode: string;
};

// 某业务对象返回
export declare type itemResult<T> = {
  errorCode: string;
  errorCodeDes: string;
  resultCode: string;
  item: T;
};

// 不分页列表返回
export declare type listResult<T> = {
  errorCode: string;
  errorCodeDes: string;
  resultCode: string;
  series: T[];
};
