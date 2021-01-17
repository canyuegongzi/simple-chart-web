<template lang="pug">
    .room-container
        van-nav-bar(title="我的请求" ref="topNav" @click-left="backRoute" :left-arrow="true" :safe-area-inset-top="true")
            template(#right)
                van-icon(name="plus" size="24" @click="openAddFriend" color="#ffffff")
        van-pull-refresh(v-model="refreshing" @refresh="onRefresh" style="height: calc(100% - 46px);overflow: scroll;")
           .item-container(v-for="item, index in list" :key="index + 'index'" @click="seeNote(item)")
                .item-left
                    van-icon(:name="item.targetIcon" size="32" style="margin-right: 4px;")
                    .info
                        span {{item.targetName}}
                        .info-note {{item.timeStr}}
                .item-right
                    // span {{item.status}}
                    span.status-label(:style="{backgroundColor: item.color}") {{item.statusLabel}}
        van-popup(v-model="searchShow" round close-icon="close" position="bottom" @close="closeSearch" closeable  :style="{ height: '95%', width: '100%' }" style=" height: 90%")
            search(ref="searchRef" @add="addTargetItem")
        van-dialog(v-model="addFormShow" title="添加好友" :closeOnClickOverlay="true" round close-icon="close" closeable  @close="cancelAdd" :show-confirm-button="false")
            van-form(@submit="onSubmit")
                van-field(v-model="note" name="备注" label="验证" placeholder="请输入验证消息" )
                div(style="margin: 16px;")
                    van-button(round block type="info" size="small" native-type="submit") 提交
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {userCenterApi} from "../../utils/apiUrl";
import dayjs from 'dayjs'
import Search from "../../components/friend/Search";
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
    name: "MyRequest",
    components: {Search},
    computed: {
        ...mapState('app', {
            socket: state => state.socket,
            currentInfo: state => state.currentInfo,
            friendList: state => state.friendList,
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
            note: '',
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
            searchShow: false,
            addFormShow: false,
            currentFriendInfo: null
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
                const res = await this.$post(userCenterApi.myRequest.url, {userId: this.currentInfo.userId}, userCenterApi.myRequest.server)
                console.log(res)
                list = res.data.data


            }catch (e) {
                console.log(e)
            }
            this.list = (() => {
                return list.map((item) => {
                    return {
                        ...item,
                        timeStr: item.updateTime ? dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss'): '',
                        ...statusMap[item.callBackType]
                    }
                })

            })()
        },
        seeNote(item) {
            this.$Dialog.alert({
                confirmButtonColor: item.color,
                title: item.targetName,
                message: item.note,
            }).then(() => {
                // on close
            });
        },
        openAddFriend() {
            console.log(4444)
            this.searchShow = true
        },
        closeSearch() {
            try {
                this.$refs.searchRef.clearData()
            }catch (e) {
                console.warn(e)
            }
        },
        addTargetItem(item) {
            console.log(item)
            this.addFormShow = true
            this.currentFriendInfo = item
        },
        async onSubmit() {
            console.log('提交');
            console.log(this.note)
            const info = {
                ...this.currentFriendInfo,
                message: this.message

            }
            try {
                const res = await this.$post(userCenterApi.request.url, {
                    "targetId": info.id,
                    "targetName": info.name,
                    "targetIcon": "http://qiniu.canyuegongzi.xyz/person_timg.jpg",
                    "formId": this.currentInfo.userId,
                    "type": "FRIEND",
                    note: this.note
                }, userCenterApi.request.server)
                console.log(res)
                if (res.success) {
                    this.$Notify({ type: 'success', message: '操作成功', duration: 1500 });
                    this.getList()
                }
            }catch (e) {
                this.$Notify({ type: 'warning', message: '操作失败', duration: 1500 });
            }
            this.cancelAdd()
        },
        cancelAdd() {
            this.note = ''
            this.currentFriendInfo = null
            this.addFormShow = false
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
