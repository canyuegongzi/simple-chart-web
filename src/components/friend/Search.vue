<template lang="pug">
    .room-container
       .search(style="padding-top: 40px;" )
           van-search(v-model="valueStr" show-action placeholder="请输入搜索关键词" @search="onSearch")
               template(#action)
                   div(@click="onSearch") 搜索
       .list(style="height:calc(100%-94px)")
           .item-container(v-for="(item, index) in list" :key="index + 'index'" @click="addItem(item)")
                p {{item.name}}
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {bspCenterApi, userCenterApi} from "../../utils/apiUrl";
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
    name: "Search",
    components: {},
    computed: {
        ...mapState('app', {
            socket: state => state.socket,
            currentInfo: state => state.currentInfo,
            targetChartObj: state => state.targetChartObj,
            friendList: state => state.friendList,
        }),
        targetName() {
            if (this.targetChartObj && this.targetChartObj.type === 'FRIEND'){
                return this.targetChartObj.targetInfo.friendName
            }
            return null
        },
        myFriendUserIds() {
            return this.friendList.map(item => {
                return item.friendId
            })
        }
    },
    data() {
        return {
            empty: false,
            valueStr: '',
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
            searchShow: false
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


            }catch (e) {
                console.log(e)
            }
        },
        addItem(item) {
            this.$emit('add', item)
        },
        openAddFriend() {
            console.log(4444)
            this.searchShow = true
        },
        /**
         * 开始搜索
         */
        async onSearch() {
            console.log(this.valueStr)
            if (!this.valueStr) {
                return
            }
            try {
                const params = {
                    page: 1,
                    pageSize: 100,
                    name: this.valueStr
                }
                const userList = await this.$get(bspCenterApi.searchUser.url, params, bspCenterApi.searchUser.server);
                console.log(userList.data.data.data);
                const myFriendUserIds = [...this.myFriendUserIds, this.currentInfo.id + ''];
                const newList = userList.data.data.data.filter((item) => {
                    return !myFriendUserIds.includes(item.id + '');
                })
                this.list = newList;
                if (!newList.length) {
                    this.empty = true
                }
            }catch (e) {
                console.log(e)
                this.list = [];
                this.empty = true
            }
        },
        clearData() {
            this.list = []
            this.valueStr = ''
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
