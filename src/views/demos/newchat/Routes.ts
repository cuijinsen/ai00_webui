export default [
  {
    path: "",
    redirect: "/demos/newchat/main",
  },
  {
    path: "/demos/newchat/main",
    name: "demos-newchat-main",
    component: () =>
      import(
        /* webpackChunkName: "demos-newchat-main" */ "@/views/demos/newchat/pages/main.vue"
      ),
  },
  {
    path: "/demos/newchatcompleted",
    name: "demos-newchat-completed",
    component: () =>
      import(
        /* webpackChunkName: "demos-newchat-completed" */ "@/views/demos/newchat/pages/completed.vue"
      ),
  },
  {
    path: "/demos/newchatlabel/:id",
    name: "demos-newchat-label",
    component: () =>
      import(
        /* webpackChunkName: "demos-newchat-label" */ "@/views/demos/newchat/pages/label.vue"
      ),
  },
];
