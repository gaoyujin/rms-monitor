// 根据角色动态生成路由
import { MockMethod } from "vite-plugin-mock";

const permissionRouter = {
  path: "/permission",
  redirect: "/permission/page/index",
  meta: {
    title: "menus.permission",
    icon: "lollipop",
    i18n: true,
    rank: 7
  },
  children: [
    {
      path: "/permission/page/index",
      name: "permissionPage",
      meta: {
        title: "menus.permissionPage",
        i18n: true
      }
    },
    {
      path: "/permission/button/index",
      name: "permissionButton",
      meta: {
        title: "menus.permissionButton",
        i18n: true,
        authority: []
      }
    }
  ]
};

const gyjAddRouter = [
  {
    path: "/business",
    redirect: "/business/index",
    meta: {
      title: "风控配置",
      icon: "lollipop",
      rank: 1
    },
    children: [
      {
        name: "business",
        path: "/business/index",
        meta: {
          title: "业务配置",
          keepAlive: true,
          icon: "tickets",
          rank: 6
        },
        children: [
          {
            path: "/business/viewDetail",
            name: "viewDetail",
            meta: {
              title: "",
              keepAlive: true,
              showLink: false,
              i18n: false,
              dynamicLevel: 3
            }
          }
        ]
      },
      {
        name: "metadata",
        path: "/metadata/index",
        meta: {
          title: "元数据配置",
          keepAlive: true,
          icon: "tickets",
          rank: 6
        },
        children: []
      }
    ]
  }
];

// 添加不同按钮权限到/permission/button页面中
// function setDifAuthority(authority, routes) {
//   routes.children[1].meta.authority = [authority];
//   return routes;
// }

export default [
  {
    url: "/getAsyncRoutes",
    method: "get",
    response: ({ query }) => {
      debugger;
      if (query.name === "admin") {
        return {
          code: 0,
          //info: [setDifAuthority("v-admin", permissionRouter), ...gyjAddRouter]
          info: [...gyjAddRouter]
        };
      } else {
        return {
          code: 0,
          //info: [setDifAuthority("v-test", permissionRouter), ...gyjAddRouter]
          info: [...gyjAddRouter]
        };
      }
    }
  }
] as MockMethod[];
