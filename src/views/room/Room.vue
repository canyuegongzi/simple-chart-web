<template lang="pug">
    .room-container
        van-nav-bar(:title="targetName" ref="topNav" @click-left="backRoute" :left-arrow="true" :safe-area-inset-top="true")
        van-pull-refresh(v-model="refreshing" @refresh="onRefresh" style="height: calc(100% - 100px);overflow-y: scroll;overflow-x: hidden;")
            .message(v-for="item, index in messageList" style="padding: 0 16px;margin: 10px 0px;")
                div
                    chat-avatar(:userInfo="currentInfo" :currentInfo="item.userInfo" :time="item.time")
                    div(:class="item.userInfo.userId === currentInfo.userId ? 'current-user-message' : 'other-user-message'")
                        .content(v-html="item.content" )
        chart-input(@get:message="getMessageValue")
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import ChartInput from "../../components/room/ChartInput";
import {IMCenterApi, noticeCenterApi} from "../../utils/apiUrl";
import ChatAvatar from "../../components/room/ChatAvatar";
import {FriendMessageInfo} from "../../utils/messageTypes";

export default {
    name: "Room",
    components: {
        ChartInput,
        ChatAvatar
    },
    computed: {
        ...mapState('app', {
            socket: state => state.socket,
            currentInfo: state => state.currentInfo,
            targetChartObj: state => state.targetChartObj,
        }),
        targetName() {
            if (this.targetChartObj && this.targetChartObj.type === 'FRIEND'){
                return this.targetChartObj.targetInfo.friendName
            }
            return null
        }
    },
    data() {
        return {
            list: [],
            loading: false,
            finished: false,
            refreshing: false,
            messageList: [],
            pageSize: 10,
            page: 1,
            targetRoom: '好友',
            userInfoMap: {},
            total: 0
        }
    },
    methods: {
        ...mapMutations('app', {
            setSocket: "setSocket",
        }),
        // 树数据
        ...mapActions('app', {
            connectSocket: "connectSocket",
            getUserFriendList: "getUserFriendList"
        }),
        async onLoad() {
            // await this.getUserFriendList()
            this.finished = true;
            this.loading = false;
        },
        async onRefresh() {
            if (this.messageList.length >= this.total) {
                this.loading = false;
                this.finished = true;
                this.refreshing = false;
                return
            }
            // 清空列表数据
            this.finished = false;
            // 重新加载数据
            // 将 loading 设置为 true，表示处于加载状态
            this.loading = true;


            const list = await this.loadFriendMessageList()
            console.log(list);
            this.messageList = [...list, ...this.messageList]
            this.loading = false;
            this.finished = true;
            this.refreshing = false;
        },
        /**
         * 行点击
         * @param item
         */
        clickItem(item) {
            console.log(item)
        },
        backRoute() {
            this.$router.back()
        },
        /**
         * 获取消息
         * @param val
         */
        async getMessageValue(value) {
            const info = new FriendMessageInfo({
                type: "TEXT",
                friendId: this.targetChartObj.targetInfo.friendId+'',
                content: value,
                userId: this.currentInfo.userId+'',
            });
            const tempMessageInfo = {
                ...info,
                time: new Date().getTime(),
                userInfo: {
                    ...this.currentInfo
                },
                success: false
            }
            if(!info.content){
                this.$Notify({type: 'waring', message: '消息内容不能为空'});
                return;
            }
            if(!info.userId || !info.friendId){
                this.$Notify({type: 'error', message: '系统异常，即将推出系统'});
                this.$router.push('/login')
                return;
            }
            try {
                const messageResult = await this.$post(noticeCenterApi.emitFriendMessage.url, info, noticeCenterApi.emitFriendMessage.server);
                console.log(messageResult);
                tempMessageInfo.success = true
            }catch (e) {
                console.log(e);
                tempMessageInfo.success = false
            }
            this.messageList.push(tempMessageInfo)
            this.total = this.total + 1
        },
        /**
         * 加载点对点聊天消息列表
         */
        async loadFriendMessageList() {
            let list = []
            try {
                const res = await this.$get(IMCenterApi.friendMessageList.url, {page: this.page, pageSize: this.pageSize, userId: this.currentInfo.userId, friendId: this.targetChartObj.targetInfo.friendId}, IMCenterApi.friendMessageList.server)
                list = res.data.data.data
                list.forEach((item) => {
                    item.time = item.createTime
                    item.userInfo = this.userInfoMap[item.userId]
                    item.success = true
                })
                console.log(list);
                this.page++
                this.total = res.data.data.total
                list.reverse()
            }catch (e) {
                list = []
            }
            return list
        },
        /**
         * 有新的消息了
         * @param data
         */
        getOneNewMessage(data) {
            console.log('新的消息');
            console.log(data)
            if(data.type === 'FRIEND') {
                const dataObj = {
                    content: data.message.content,
                    createTime: data.message.time,
                    friendId: data.message.friendId,
                    hashId: data.message.hashId,
                    id: data.message.hashId,
                    success: true,
                    time: data.message.time,
                    type: data.message.type,
                    userId: data.message.userId,
                    userInfo: {
                        headerIcon: data.message.userInfo.friendIcon,
                        userId: data.message.userInfo.friendId,
                        userName: data.message.userInfo.userName,
                    }

                }
                this.socket.emit('affirmMessageStatus', {
                    messageType: data.type,
                    messageId: '',
                    hashId: data.message.hashId,
                    status: '1'
                })
                this.total = this.total + 1;
                this.messageList.push(dataObj);
            }
        }
    },
    async created() {
        window._globalEvent.listen('newFriendMessage', this.getOneNewMessage)
        if (this.targetChartObj.type === 'FRIEND') {
            const userInfoMap = {}
            userInfoMap[this.currentInfo.userId] = {
                headerIcon: this.currentInfo.headerIcon,
                userName: this.currentInfo.name,
                friendName: this.currentInfo.nick,
                userId: this.currentInfo.userId,
            }
            userInfoMap[this.targetChartObj.targetInfo.friendId] =  {
                headerIcon: this.targetChartObj.targetInfo.friendIcon,
                userName: this.targetChartObj.targetInfo.userName,
                friendName: this.targetChartObj.targetInfo.friendName,
                userId: this.targetChartObj.targetInfo.friendId,
            }
            this.userInfoMap = userInfoMap
            const list = await this.loadFriendMessageList()
            this.messageList = list
        }
    },
    beforeDestroy() {
        window._globalEvent.remove('newFriendMessage', this.getOneNewMessage)
    }
}
</script>

<style scoped lang="stylus">
    .room-container
        height 100%
    .van-cell__value
        font-size 12px
    .van-icon__image
        border-radius 50%
    .current-user-message
        display flex
        justify-content flex-end
    .content
        max-width 70%
        display inline-block;
        background-color rgba(0, 200, 255, 0.4)
        padding 6px
        font-size 16px
        border-radius: 5px
        text-align left
        word-break break-word
        float right
        margin-top 4px
    .other-user-message
        display flex
        .content
            text-align left
            max-width 70%
            display inline-block;
            background-color rgba(0, 200, 255, 0.4)
            padding 6px
            font-size 16px
            border-radius: 5px
            word-break break-word
            margin-top 4px
</style>
