 
import chatRoutes from "@/views/demos/chat/chatRoutes";
import todoRoutes from "@/views/demos/todo/Routes";
import newchatRoutes from "@/views/demos/newchat/Routes";

export default [
  {
    path: "/demos/chat",
    meta: {
      requiresAuth: true,
      layout: "ui",
      category: "DEMOS",
      title: "Chat",
    },
    component: () =>
      import("@/views/demos/chat/App.vue"),
    children: [...chatRoutes],
  },
  {
    path: "/demos/todo",
    meta: {
      requiresAuth: true,
      layout: "ui",
      category: "DEVELOPER",
      title: "Todo",
    },
    component: () =>
      import("@/views/demos/todo/App.vue"),
    children: [...todoRoutes],
  },  
  {
    path: "/demos/newchat",
    meta: {
      requiresAuth: true,
      layout: "ui",
      category: "DEMOS",
      title: "NewChat",
    },
    component: () =>
      import("@/views/demos/newchat/App.vue"),
    children: [...newchatRoutes],
  },
]; 
