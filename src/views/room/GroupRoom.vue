<template lang="pug">
    .room-container
        van-nav-bar(:title="targetName" ref="topNav" @click-left="backRoute" :left-arrow="true" :safe-area-inset-top="true")
        van-pull-refresh(v-model="refreshing" @refresh="onRefresh" style="height: calc(100% - 100px);overflow-y: scroll;overflow-x: hidden;")
            .message(v-for="item, index in messageList" style="padding: 0 16px;margin: 10px 0px;")
                div
                    chat-avatar(:userInfo="currentInfo" :currentInfo="item.userInfo" :time="item.time")
                    div(:class="item.userInfo.userId+'' === currentInfo.userId+'' ? 'current-user-message' : 'other-user-message'")
                        .content(v-html="item.content" )
        chart-input(@get:message="getMessageValue")
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import ChartInput from "../../components/room/ChartInput";
import {groupCenterApi, IMCenterApi, noticeCenterApi} from "../../utils/apiUrl";
import ChatAvatar from "../../components/room/ChatAvatar";
import {FriendMessageInfo, GroupMessageInfo} from "../../utils/messageTypes";
import {$get} from "../../utils/httpClient";

export default {
    name: "GroupRoom",
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
            if (this.targetChartObj && this.targetChartObj.type === 'GROUP'){
                return this.targetChartObj.targetInfo.title
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
            total: 0,
            groupInfo: {
                userList: [],
                groupName: '',
                groupCode: '',
                groupIcon: ''
            },
            memberMap: {},
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


            const list = await this.loadGroupMessageList()
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
            const info = new GroupMessageInfo({
                type: "TEXT",
                groupCode: this.targetChartObj.targetInfo.targetId,
                content: value,
                userId: this.currentInfo.userId+'',
                targetIds: this.groupInfo.userList.map(item => item.userId).join(',')
            });
            console.log(info);
            if(!info.content){
                this.$Notify({type: 'waring', message: '消息内容不能为空'});
                return;
            }
            if(!info.userId || !info.groupCode){
                this.$Notify({type: 'error', message: '系统异常，即将推出系统'});
                this.$router.push('/login')
                return;
            }
            try {
                const messageResult = await this.$post(noticeCenterApi.emitGroupMessage.url, info, noticeCenterApi.emitGroupMessage.server);
                console.log(messageResult);
            }catch (e) {
                console.log(e);
            }
            // this.messageList.push(tempMessageInfo)
            this.total = this.total + 1
        },
        /**
         * 加载点对点聊天消息列表
         */
        async loadGroupMessageList() {
            let list = [];
            try {
                const res = await this.$get(IMCenterApi.groupMessageList.url, {page: this.page, pageSize: this.pageSize, userId: this.currentInfo.userId, groupCode: this.targetChartObj.targetInfo.targetId}, IMCenterApi.groupMessageList.server)
                console.log(res);
                list = res.data.data.data
                list.forEach((item) => {
                    const userInfo = this.memberMap[item.userId];
                    item.time = item.createTime;
                    item.userInfo = {
                        ...userInfo,
                        friendName: userInfo.userName,
                        headerIcon: userInfo.userIcon
                    };
                    item.success = true;
                })
                console.log(list);
                this.page++;
                this.total = res.data.data.total;
                list.reverse();
            }catch (e) {
                console.log(e);
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
            console.log(data);
            const hashIds = [];
            if(data.type === 'GROUP') {
                data.message.forEach(item => {
                    const userInfo = this.memberMap[item.userId];
                    if (userInfo) {
                        const dataObj = {
                            content: item.content,
                            createTime: item.createTime,
                            groupCode: item.groupCode,
                            hashId: item.hashId,
                            id: item.hashId,
                            success: true,
                            time: item.createTime,
                            type: item.type,
                            userId: userInfo.userId,
                            userInfo: {
                                headerIcon: userInfo.userIcon,
                                userId: userInfo.userId,
                                userName: userInfo.userName,
                            }
                        }
                        hashIds.push(item.hashId);
                        this.total = this.total + 1;
                        this.messageList.push(dataObj)
                    }

                })
                this.socket.emit('affirmMessageStatus', {
                    messageType: data.type,
                    messageId: '',
                    groupCode: this.targetChartObj.targetInfo.targetId,
                    hashId: hashIds.join(','),
                    status: '1',
                    userId: this.currentInfo.userId+''
                })

            }
        },

        /**
         * 加载群信息
         */
        async getGroupInfo(groupCode) {
            console.log(groupCode);
            try {
                const userMap = {}
                const res = await $get(groupCenterApi.groupInfo.url, {groupCode: groupCode}, groupCenterApi.groupInfo.server);
                res.data.userList.forEach(item => {
                   userMap[item.userId] = {
                       ...item,
                       userIcon: item.userIcon || 'http://qiniu.canyuegongzi.xyz/person_timg.jpg'
                   }
                })
                this.memberMap = userMap
                this.groupInfo = res.data;
                const list = await this.loadGroupMessageList();
                console.log(list);
                this.messageList = list
            }catch (e) {

            }

        }
    },
    async created() {
        window._globalEvent.listen('newGroupMessage', this.getOneNewMessage)
        this.getGroupInfo(this.targetChartObj.targetInfo.targetId);
    },
    beforeDestroy() {
        window._globalEvent.remove('newGroupMessage', this.getOneNewMessage)
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
