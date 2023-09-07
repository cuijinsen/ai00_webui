import chatRoutes from "@/views/app/chat/chatRoutes";
import todoRoutes from "~/src/views/app/todo/Routes";

export default [
  {
    path: "/apps/chat",
    meta: {
      requiresAuth: true,
      layout: "ui",
      category: "APP",
      title: "Chat",
    },
    component: () =>
      import("@/views/app/chat/ChatApp.vue"),
    children: [...chatRoutes],
  },
  {
    path: "/apps/lunwen",
    meta: {
      requiresAuth: true,
      layout: "ui",
      category: "APP",
      title: "LunWen",
    },
    component: () =>
      import("@/views/app/lunwen.vue"),

  },  
  {
    path: "/apps/todo",
    meta: {
      requiresAuth: true,
      layout: "ui",
      category: "APP",
      title: "Todo",
    },
    component: () =>
      import("@/views/app/todo/App.vue"),
    children: [...todoRoutes],
  },
];
