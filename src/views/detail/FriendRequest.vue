<template lang="pug">
    .room-container
        van-nav-bar(title="好友请求" ref="topNav" @click-left="backRoute" :left-arrow="true" :safe-area-inset-top="true")
        van-pull-refresh(v-model="refreshing" @refresh="onRefresh" style="height: calc(100% - 46px);overflow: scroll;")
            .item-container(v-for="item, index in list" :key="index + 'index'")
                .item-left(@click="seeNote(item)")
                    van-icon(:name="item.fromIcon" size="32" style="margin-right: 4px;")
                    .info
                        span {{item.fromName}}
                        .info-note {{item.timeStr}}
                .item-right(@click="callbackResquest(item)")
                    // span {{item.status}}
                    span.status-label(:style="{backgroundColor: item.color}") {{item.statusLabel}}
        van-dialog(v-model="show" :confirmButtonColor="dialogInfo.color" :title="dialogInfo.targetName" :message="dialogInfo.note" show-cancel-button)
            p.message-title(style="text-align: center;") {{dialogInfo.note}}
        van-action-sheet(v-model="resultShow" :actions="actions" @select="selectItem" @cancel="cancelSelect" cancel-text="取消" description="请选择操作" close-on-click-action)
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {userCenterApi} from "../../utils/apiUrl";
import dayjs from 'dayjs'
const statusMap = {
    // 未应答
    '1': {
        statusLabel: '未应答',
        statusValue: 'waring',
        color: '#1989fa'
    },
    // 同意
    '2': {
        statusLabel: '已同意',
        statusValue: 'success',
        color: '#07c160'
    },
    // 拒绝
    '3': {
        statusLabel: '已拒绝',
        statusValue: 'danger',
        color: '#ff976a'
    },
}
export default {
    name: "FriendRequest",
    components: {},
    computed: {
        ...mapState('app', {
            socket: state => state.socket,
            currentInfo: state => state.currentInfo,
            targetChartObj: state => state.targetChartObj,
            friendList: state => state.friendList,
        }),
        friendMap() {
            const friendObj = {};
            for (let i = 0; i < this.friendList.length; i ++ ) {
                friendObj[this.friendList[i].friendId] = this.friendList[i]
            }
            return friendObj;
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
            show: false,
            resultShow: false,
            dialogInfo: {},
            actions: [
                { name: '同意', value: 2 },
                { name: '拒绝', value: 3 },
            ]
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
            // 清空列表数据
            this.finished = false;
            // 重新加载数据
            // 将 loading 设置为 true，表示处于加载状态
            this.loading = true;

            await this.getList()
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
        /**
         * 加载列表
         * @returns {Promise<void>}
         */
        async getList() {
            let list = []
            try {
                const res = await this.$post(userCenterApi.friendRequest.url, {userId: this.currentInfo.userId}, userCenterApi.friendRequest.server)
                console.log(res)
                list = res.data.data

            }catch (e) {
                console.log(e)
            }
            this.list = (() => {
                return list.map((item) => {
                    const fromInfo = this.friendMap[item.formId] || null
                    return {
                        ...item,
                        timeStr: item.updateTime ? dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss'): '',
                        ...statusMap[item.callBackType],
                        fromName: fromInfo.friendName || '--',
                        fromIcon: fromInfo.fromIcon || ''
                    }
                })

            })()
        },
        seeNote(item) {
            console.log(item);
            this.dialogInfo = item;
            this.show = true;
        },
        callbackResquest(item) {
            if(item.callBackType === 1) {
                this.resultShow = true;
                this.dialogInfo = item
            }
        },
        async selectItem(action, index) {
            console.log(action);
            console.log(index);
            console.log(this.dialogInfo);
            try {
                const res = await this.$post(userCenterApi.friendCallback.url, {
                    id: this.dialogInfo.id,
                    callBackType: action.value
                }, userCenterApi.friendCallback.server);
                console.log(res);
                if(res.data) {
                    this.$Notify({ type: 'success', message: '操作成功', duration: 1500 });
                    this.getList()
                }else {
                    this.$Notify({ type: 'error', message: '操作失败', duration: 1500 });
                }

            }catch (e) {
                this.$Notify({ type: 'error', message: '操作失败', duration: 1500 });
            }
        },
        cancelSelect() {
            this.dialogInfo = {};
        }
    },
    async created() {
        this.getList()
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
    .item-container
        padding: 4px 16px;
        height: 46px
        display flex
        flex-direction row
        align-items center
        border-bottom: 1px solid #ebedf0;
        justify-content: space-between;
        .item-left
            display: flex;
            .info
                display: flex;
                flex-direction: column;
                .info-note
                    color: #969799;
                    font-size: 12px;
                    line-height: 18px;
        .item-right
            .status-label
                font-size: 12px;
                display: flex;
                width: 48px;
                border-radius: 3px;
                align-items: center;
                height: 20px;
                justify-content: center;
                color: #fff;
</style>
