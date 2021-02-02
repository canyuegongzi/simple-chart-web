export const userCenterApi = {
    // 好友列表
    friendList: {
        url: "/friend/list",
        server: "IM"
    },
    // 好友请求
    request: {
        url: "/friend/request",
        server: "IM"
    },
    // 我的请求
    myRequest: {
        url: "/friend/myRequest",
        server: "IM"
    },
    // 好友请求
    friendRequest: {
        url: "/friend/friendRequest",
        server: "IM"
    },
    // 好友请求操作
    friendCallback: {
        url: "/friend/requestCallback",
        server: "IM"
    }
};

export const groupCenterApi = {
    // 群组列表
    groupList: {
        url: "/group/list",
        server: "IM"
    },
    // 群信息
    groupInfo: {
        url: '/group/info',
        server: 'IM'
    },
    // 搜索群组
    searchGroup: {
        url: "/group/queryList", // page: 1 pageSize: 10 name: 1
        server: "IM"
    },
    // 申请入群
    addGroup: {
        url: '/group/request',
        server: "IM"
    }
};
export const IMCenterApi = {
    // 首页最新消息
    homeMessageList: {
        url: "/messageStore/homeMessageList",
        server: "IM"
    },
    // 好友消息列表
    friendMessageList: {
        url: "/messageStore/userFriendMessage",
        server: "IM"
    },
    // 群消息聊天
    groupMessageList: {
        url: '/messageStore/groupMessage',
        server: 'IM'
    },
    // 机器人消息列表
    robotMessageList: {
        url: "/robot/userFriendMessage",
        server: "IM"
    },
    // 初始化机器人
    initRobot: {
        url: "/friend/getRobotUser",
        server: "IM"
    },
    // 发送消息给机器人
    robotMessage: {
        url: "/robot/queryAnswer",
        server: "IM"
    }
};

export const noticeCenterApi = {
    // 好友消息
    emitFriendMessage: {
        url: "/amqpMessage/newMessage",
        server: "notice"
    },
    // 群组消息
    emitGroupMessage: {
        url: "/groupMessage/newMessage",
        server: "notice"
    }
};
export const bspCenterApi = {
    usersInfo: {
        url: "/user/infoByIds",
        server: "user"
    },
    searchUser: {
        url: "/user/list", // page: 1 pageSize: 10 name: 1
        server: "user"
    },
    login: {
        url: "/user/login",
        server: "user"
    },
    findUserToken: {
        url: "/user/findUserToken",
        server: "user"
    },
    updateUser: {
        url: "/user/update",
        server: "user"
    }
};
