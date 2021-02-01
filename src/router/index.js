import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Main",
        component: () => import(/* webpackChunkName: "about" */ "../views/Main.vue")
    },
    {
        path: "/room",
        name: "Room",
        component: () => import(/* webpackChunkName: "about" */ "../views/room/Room.vue")
    },
    //
    {
        path: "/robotRoom",
        name: "RobotRoom",
        component: () => import(/* webpackChunkName: "about" */ "../views/room/RobotRoom.vue")
    },
    {
        path: "/groupRoom",
        name: "GroupRoom",
        component: () => import(/* webpackChunkName: "about" */ "../views/room/GroupRoom.vue")
    },

    {
        path: "/myRequest",
        name: "MyRequest",
        component: () => import(/* webpackChunkName: "about" */ "../views/detail/MyRequest.vue")
    },
    {
        path: "/friendRequest",
        name: "FriendRequest",
        component: () => import(/* webpackChunkName: "about" */ "../views/detail/FriendRequest.vue")
    },

    {
        path: "/userInfo",
        name: "UserInfo",
        component: () => import(/* webpackChunkName: "about" */ "../views/detail/UserInfo.vue")
    },

    {
        path: "/login",
        name: "Login",
        component: () => import(/* webpackChunkName: "about" */ "../views/login/Login.vue")
    },
];

const router = new VueRouter({
    mode: "hash",
    base: process.env.BASE_URL,
    routes
});

export default router;
