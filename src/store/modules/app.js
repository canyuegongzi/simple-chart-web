import io from 'socket.io-client';
import Vue from 'vue';
import {bspCenterApi, IMCenterApi, groupCenterApi, userCenterApi} from '../../utils/apiUrl';
import {$get, $post} from '../../utils/httpClient';
const state = {
    socket: null,
    currentInfo: null,
    messageMap: {}, // 聊天消息map
    friendList: [],
    groupList: [], // 群组
    friendInfoList: [],
    total: 0,
    groupTotal: 0, // 群组id
    homeMessageList: [],
    robotInfo: null,
    targetChartObj: {}, // 聊天对象
    mainContentComponent: 'MessageList', // main页面内容
};
const mutations = {
    /**
     * 设置socket
     * @param state
     * @param data
     */
    setSocket(state, data = null) {
        state.socket = data;
    },

    /**
     * 设置机器人
     * @param state
     * @param data
     */
    setRobotInfo(state, data = null) {
        state.robotInfo = data;
    },
    /**
     * 设置socket
     * @param state
     * @param data
     */
    setCurrentInfo(state, data = null) {
        state.currentInfo = data;
    },
    /**
     * 设置好友消息
     * @param state
     * @param data
     */
    setFriendMessageList(state, data = { friendId: '', message: [] }) {
        if (!data.friendId) {
            return;
        }
        data.message.forEach((item, index) => {
            const messageUser = state.friendList.find((t, i) => {
                return (t.friendId + '') == (item.userId + '')
            })
            console.log(messageUser)
            item.userInfo = {
                ...messageUser,
                headerIcon: 'https://img14.360buyimg.com/imagetools/jfs/t1/130112/36/5492/38449/5f1f964cEfd6f41bf/bec836b48b55bb00.jpg',
                userId: messageUser.userId,
                userName: messageUser.friendName
            }
            item.time =  item.createTime
            window._globalEvent.trigger('newFriendMessage', { message: item, type: 'FRIEND' })
            window._globalEvent.trigger('homeRefreshFriendMessage', { message: item, type: 'FRIEND' })
        })
        const list = state.messageMap[data.friendId] ? state.messageMap[data.friendId].concat(data.message) : [].concat(data.message);
        Vue.set(state.messageMap, data.friendId, list);
    },

    /**
     * 设置好友消息
     * @param state
     * @param data
     */
    setGroupMessageList(state, data = { groupId: '', message: [] }) {
        console.log(data);
        if (!data.groupId) {
            return;
        }
        window._globalEvent.trigger('newGroupMessage', { message: data.message, type: 'GROUP' });
        window._globalEvent.trigger('homeRefreshFriendMessage', { message: data.message[0], type: 'GROUP' });
    },
    /**
     * 设置socket
     * @param state
     * @param data
     */
    setFriendList (state, data = []) {
        state.friendList = data
    },
    /**
     * 设置socket
     * @param state
     * @param data
     */
    setGroupList (state, data = []) {
        state.groupList = data
    },

    /**
     * 设置socket
     * @param state
     * @param data
     */
    setHomeMessageList (state, data = []) {
        state.homeMessageList = data
    },
    /**
     * 设置socket
     * @param state
     * @param data
     */
    setFriendInfoList (state, data = []) {
        state.friendInfoList = data
    },
    /**
     * 设置好友个数
     * @param state
     * @param data
     */
    setFriendTotal (state, total = 0) {
        state.total = total
    },

    /**
     * 设置好友个数
     * @param state
     * @param data
     */
    setGroupTotal (state, total = 0) {
        state.groupTotal = total
    },
    /**
     * 发送消息（消息列表添加）
     * @param state
     * @param data
     */
    emitMessageToList (state, data = { friendId: '', message: [] }) {
        console.log(data)
        if (!data.friendId) {
            return;
        }
        const list = state.messageMap[data.friendId] ? state.messageMap[data.friendId].concat(data.message) : [].concat(data.message);
        Vue.set(state.messageMap, data.friendId, list);
    },
    /**
     * 聊天对象赋值
     * @param state
     * @param data
     */
    setTargetChartObj(state, data = { type: 'FRIEND', info: {} }) {
        state.targetChartObj = data
    },

    /**
     * 设置主内容
     * @param state
     * @param data
     */
    setMainContentComponent(state, data = 'MessageList') {
        state.mainContentComponent = data;
    }
};
const actions = {
    /**
     * 异步连接socket
     * @param store
     * @return {Promise<void>}
     */
    async connectSocket({ commit, state, dispatch, rootState }, params, callback) {
        let socket = io.connect(`http://127.0.0.1:9010/?userId=${params.userId}&deviceType=${params.deviceType}`);
        socket.on('connect', async data => {
            console.log('连接成 功');
            commit('setSocket', socket);
            // 好友消息
            socket.on('friendMessage', async res => {
                console.log('on friendMessage', res);
                commit('setFriendMessageList', { friendId: res.userId, message: [res] });
            });

            // 群消息
            socket.on('groupMessage', async res => {
                console.log('on groupMessage', res);
                console.log(res);
                commit('setGroupMessageList', { groupId: res.groupId, message: [res] });
            });
            // 好友请求
            socket.on('newRequest', async res => {
                console.log('on newRequest', res);
                // await storeNewFriendMessage(res);
            });
            // 群组请求
            socket.on('newGroupRequest', async res => {
                console.log('on newGroupRequest', res);
            })
        });
    },

    /**
     * 初始化机器人信息
     * @param userId
     * @returns {Promise<void>}
     */
    async initRobotInfo({ commit, state, dispatch, rootState }, {userId, userName}) {
        try {
            const res = await $post(IMCenterApi.initRobot.url, { userId, userName }, IMCenterApi.initRobot.server);
            return res.data.data;
        }catch (e) {
            return null
        }


    },
    /**
     * 获取用户好友的消息列表
     * @param commit
     * @param state
     * @param dispatch
     * @param rootState
     * @param params
     * @param callback
     * @returns {Promise<void>}
     */
    async getUserFriendMessageList({ commit, state, dispatch, rootState }, params, callback) {
        try {
            return state.messageMap[data.friendId];
        } catch (e) {
            return null;
        }
    },

    /**
     * 设置朋友消息列表
     * @param state
     * @param data
     */
    setFriendMessageList(state, data = { friendId: '', message: [] }) {
        console.log(data);
        if (!data.friendId) {
            return;
        }
        state.messageMap[data.friendId] = state.messageMap[data.friendId].concat(data.message);
    },
    /**
     * 获取用户好友
     * @param commit
     * @param state
     * @param dispatch
     * @param rootState
     * @param params
     * @param callback
     * @returns {Promise<void>}
     */
    async getUserFriendList ({ commit, state, dispatch, rootState }, params, callback ) {
        try {
            const userList = await $get(userCenterApi.friendList.url, {userId: params.userId}, userCenterApi.friendList.server);
            if (userList.success) {
                const friensList = userList.data.data.map((item) => {
                    return item.friendId;
                })
                const userListInfo = await $get(bspCenterApi.usersInfo.url, {ids: friensList}, bspCenterApi.usersInfo.server);
                console.log(userListInfo.data.data);
                commit('setFriendInfoList', userListInfo.data.data);

                userList.data.data.forEach((t, i) => {
                    const userInfo = userListInfo.data.data.find((w, j) => {
                        return w.id + '' === t.friendId + ''
                    })
                    t.friendInfo = userInfo;
                    t.friendName = userInfo ? userInfo.nick: '';
                    t.userName = userInfo ? userInfo.name: '';
                })
                commit("setFriendList", userList.data.data);
                commit("setFriendTotal", userList.data.total);
                return userList.data.data
            }
            return [];
        }catch (e) {
            console.log(e);
            const list = [
                {
                    userId: 123456,
                    name: 'root',
                    avatar: 'https://img14.360buyimg.com/imagetools/jfs/t1/130112/36/5492/38449/5f1f964cEfd6f41bf/bec836b48b55bb00.jpg'
                },
                {
                    userId: 1234567,
                    name: 'root1',
                    avatar: 'https://img14.360buyimg.com/imagetools/jfs/t1/130112/36/5492/38449/5f1f964cEfd6f41bf/bec836b48b55bb00.jpg'
                },
                {
                    userId: 12345678,
                    name: 'root2',
                    avatar: 'https://img14.360buyimg.com/imagetools/jfs/t1/130112/36/5492/38449/5f1f964cEfd6f41bf/bec836b48b55bb00.jpg'
                }
            ]
            commit("setFriendList", list);
        }
    },

    /**
     * 获取用户群组
     * @param commit
     * @param state
     * @param dispatch
     * @param rootState
     * @param params
     * @param callback
     * @returns {Promise<void>}
     */
    async getUserGroupList ({ commit, state, dispatch, rootState }, params, callback ) {
        try {
            const groupList = await $get(groupCenterApi.groupList.url, {userId: params.userId}, userCenterApi.friendList.server);
            if (groupList.success) {
                console.log(groupList);
                commit("setGroupList", groupList.data);
                return groupList.data
            }
            return [];
        }catch (e) {
            console.log(e);
            const list = [];
            commit("setGroupList", list);
        }
    },

    /**
     * 獲取用戶詳細信息
     * @param commit
     * @param state
     * @param dispatch
     * @param rootState
     * @param params
     * @param callback
     * @returns {Promise<void>}
     */
    async getUserInfoByIds ({ commit, state, dispatch, rootState }, params, callback ) {
        try {
            const userList = await $get(bspCenterApi.usersInfo.url, {userId: params.userId}, bspCenterApi.usersInfo.server, {ignoreToken: true});
            console.log(userList);
            if (userList.success) {
                /*commit("setFriendList", userList.data.data);
                commit("setFriendTotal", userList.data.total);*/
            }

        }catch (e) {
            console.log(e);
        }
    },

    /**
     * 获取用户信息通过token
     * @param commit
     * @param state
     * @param dispatch
     * @param rootState
     * @returns {Promise<void>}
     */
    async getUserInfoByToken({ commit, state, dispatch, rootState }, token) {
        return $post(bspCenterApi.findUserToken.url, {token}, bspCenterApi.findUserToken.server)
    }
};
export default {
    namespaced: true,
    state,
    mutations,
    actions
};
