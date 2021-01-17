<template lang="pug">
    van-pull-refresh(v-model="refreshing" @refresh="onRefresh" style="height: 100%;overflow-y: scroll;overflow-x: hidden;")
        van-list(v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad")
            van-cell(v-for="(item, index) in homeMessageList" @click="clickItem(item)" :key="index" :title="item.friendInfo ? item.friendInfo.friendName: ''" :value="item.message.time" size="mini" style="padding: 4px 16px;"  :label="item.message.content")
                template(#icon)
                    div(style="display:flex;align-items: center;padding-right: 8px;")
                        van-icon(:name="item.friendInfo.friendIcon" size="32")
                template(#right-icon)
                    div(style="position: absolute;right: 16px;bottom: 4px;" v-show="item.message.unreadMessageTotal")
                        van-badge(:content="item.message.unreadMessageTotal" max="99")
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import dayjs from 'dayjs'
import {IMCenterApi} from "../../utils/apiUrl";

export default {
    name: "MessageList",
    computed: {
        ...mapState('app', {
            socket: state => state.socket,
            currentInfo: state => state.currentInfo,
            friendList: state => state.friendList,
            homeMessageList: state => state.homeMessageList
        }),
    },
    watch: {
        currentInfo: {
            handler: function (val) {
                this.getHomeList();
            }
        },
        friendList: {
            handler: function (val) {
                this.getHomeList();
            }
        }
    },
    data() {
        return {
            list: [],
            loading: false,
            finished: false,
            refreshing: false,
        }
    },
    methods: {
        ...mapMutations('app', {
            setSocket: "setSocket",
            setCurrentInfo: "setCurrentInfo",
            setHomeMessageList:'setHomeMessageList',
            setTargetChartObj:'setTargetChartObj',
        }),
        // 树数据
        ...mapActions('app', {
            connectSocket: "connectSocket",
            getUserFriendList: "getUserFriendList"
        }),
        async onLoad() {
            const data = await this.getHomeList()
        },
        async onRefresh() {
            // 清空列表数据
            this.finished = false;

            // 重新加载数据
            // 将 loading 设置为 true，表示处于加载状态
            this.loading = true;
            await this.getHomeList();
            this.loading = false;
            this.finished = true;
            this.refreshing = false;
        },
        /**
         * 获取首页消息列表
         * @returns {Promise<Array>}
         */
        async getHomeList() {
            if (!this.friendList.length){
                return
            }
            let data = null;
            const messageList = [];
            try {
                const res = await this.$get(IMCenterApi.homeMessageList.url, {
                    userId: this.currentInfo.userId,
                    pageSize: 100,
                    page: 1,
                    time: dayjs().subtract(3, 'days').valueOf()
                }, IMCenterApi.homeMessageList.server)
                data = res.data.data.data
                for (let key in data) {
                    const friendInfo = this.friendList.find((item) =>{
                        return item.friendId + '' === key + '';
                    })
                    const newMessage = {friendId: key, message: {...data[key][0], time: dayjs(data[key][0].createTime).format('YYYY-MM-DD HH:mm:ss')}, friendInfo: friendInfo}
                    messageList.push(newMessage)
                }
                this.setHomeMessageList(messageList);
                this.loading = false;
                this.finished = true;
            }catch (e) {
                data = null
                this.loading = false;
                this.finished = true;
            }
            return messageList;
        },
        /**
         * 行点击
         * @param item
         */
        async clickItem(item) {
            console.log(item);
            if (Array.isArray(item.message.unreadHashIds) && item.message.unreadHashIds.length > 0) {
                this.socket.emit('affirmMessageStatus', {
                    messageType: 'FRIEND',
                    messageId: '',
                    hashId: item.message.unreadHashIds.join(','),
                    status: '1'
                })
            }
            this.setTargetChartObj({type: 'FRIEND', targetInfo: item.friendInfo})
            this.$router.push('/room')
        },
        /**
         * s刷新数据
         * @param messageInfo
         * @returns {Promise<void>}
         */
        async refreshMessageList(messageInfo) {
            if (this.$route.name === 'Main') {
                console.log(messageInfo);
                let indexNum = -1;
                const currentMessage = this.homeMessageList.find((item, index) =>  {
                    if (item.friendId + '' === messageInfo.message.userId + '') {
                        indexNum = index;
                    }
                    return item.friendId + '' === messageInfo.message.userId + ''
                });
                if (currentMessage) {
                    console.log(currentMessage);
                    const newTempMessageInfo = {
                        ...currentMessage.message,
                        content: messageInfo.message.content,
                        createTime: messageInfo.message.createTime,
                        hashId: messageInfo.message.hashId,
                        id:  messageInfo.message.hashId,
                        messageTotal: currentMessage.message.messageTotal + 1,
                        status: "0",
                        time: dayjs(messageInfo.message.createTime).format('YYYY-MM-DD HH:mm:ss'),
                        type: messageInfo.message.type,
                        unreadHashIds: (() => {
                            const unreadHashIds = [...currentMessage.message.unreadHashIds];
                            unreadHashIds.push(messageInfo.message.hashId)
                            return unreadHashIds
                        })(),
                        unreadMessageTotal: currentMessage.message.unreadMessageTotal + 1
                    }
                    const list = [...this.homeMessageList];
                    console.log(indexNum);
                    list.splice(indexNum, 1, {...currentMessage, message: newTempMessageInfo})
                    console.log(list);
                    this.setHomeMessageList(list);
                    return
                }
                const friendInfo = this.friendList.find((item) => {
                    return item.friendId + '' === messageInfo.message.userId
                })
                console.log(friendInfo);
                const newTempMessageInfo = {
                    content: messageInfo.message.content,
                    createTime: messageInfo.message.createTime,
                    hashId: messageInfo.message.hashId,
                    id:  messageInfo.message.hashId,
                    messageTotal: 1,
                    status: "0",
                    time: dayjs(messageInfo.message.createTime).format('YYYY-MM-DD HH:mm:ss'),
                    type: messageInfo.message.type,
                    unreadHashIds: [messageInfo.message.hashId],
                    unreadMessageTotal: 1
                }
                const list = [...this.homeMessageList]
                list.unshift({
                    friendInfo: friendInfo,
                    message: newTempMessageInfo,
                    friendId: messageInfo.message.userId
                })
                this.setHomeMessageList(list);
            }

        }
    },
    async created() {
        window._globalEvent.listen('homeRefreshFriendMessage', this.refreshMessageList)
    },
    beforeDestroy() {
        window._globalEvent.remove('homeRefreshFriendMessage', this.refreshMessageList)
    }
}
</script>

<style scoped lang="stylus">
.van-cell__value
    font-size 12px
.van-icon__image
    border-radius 50%
</style>
