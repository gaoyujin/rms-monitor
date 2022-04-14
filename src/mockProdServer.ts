import { createProdMockServer } from "vite-plugin-mock/es/createProdMockServer";
import asyncRoutesMock from "../mock/asyncRoutes";
import business from "mock/business";
import metadata from "mock/metadata";
import metaReference from "mock/metaReference";
import checkPoint from "mock/checkPoint";
import businessRule from "mock/businessRule";

export const mockModules = [
  ...asyncRoutesMock,
  ...business,
  ...metadata,
  ...metaReference,
  ...checkPoint,
  ...businessRule
];

export function setupProdMockServer() {
  createProdMockServer(mockModules);
}
