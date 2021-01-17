<template lang="pug">
    .room-container
        van-nav-bar(title="用户信息" ref="topNav" @click-left="backRoute" :left-arrow="true" :safe-area-inset-top="true")
            // template(#right)
            //     van-icon(name="success" size="24" @click="changeUserInfo" color="#ffffff")
        van-pull-refresh(v-model="refreshing" @refresh="onRefresh" style="height: calc(100% - 46px);overflow: scroll;")
            van-form(@submit="changeUserInfo")
                van-field(v-model="username" name="用户名" label="用户名" placeholder="请输入用户名" :rules="[{ required: true, message: '请输入用户名' }]")
                van-field(v-model="nick" name="密码" label="昵称" placeholder="请输入昵称" :rules="[{ required: true, message: '请请输入昵称' }]")
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {bspCenterApi} from "../../utils/apiUrl";

export default {
    name: "UserInfo",
    components: {},
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
            username: '',
            nick: '',
            loading: false,
            finished: false,
            refreshing: false,
            messageList: [],
            pageSize: 10,
            page: 1,
            targetRoom: '好友',
            userInfoMap: {},
            total: 0,
            friendUserInfo: {},
        }
    },
    methods: {
        ...mapMutations('app', {
            setSocket: "setSocket",
            setMainContentComponent: "setMainContentComponent",
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
            this.setMainContentComponent('Setting')
            this.$router.back()
        },
        async changeUserInfo() {
            if (!this.username) {
                this.$Toast({type: 'text', position: 'bottom', message: '用户名不能为空'})
                return
            }
            if (!this.nick) {
                this.$Toast({type: 'text', position: 'bottom', message: '昵称不能为空'})
                return
            }
            const res = await this.$post(bspCenterApi.updateUser.url, {...this.currentInfo, nick: this.nick, name: this.username, id: this.currentInfo.userId}, bspCenterApi.updateUser.server)
            console.log(res)
            console.log(this.username);
            console.log(this.nick)
        }
    },
    async created() {
        if (this.currentInfo.userName) {
            this.username = this.currentInfo.userName
            this.nick = this.currentInfo.nick
        }
        if (this.$route.query.userId  && this.$route.query.type === 'FRIEND') {
            console.log(1225)
        }
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
