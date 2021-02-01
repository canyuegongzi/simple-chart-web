<template lang="pug">
    van-pull-refresh(v-model="refreshing" @refresh="onRefresh" style="height: 100%;overflow-y: scroll;overflow-x: hidden;")
        van-list(v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad")
            van-cell(v-for="(item, index) in groupList" :key="index" center @click="clickItem(item)"  :title="item.groupName" size="mini" style="padding: 4px 16px;")
                template(#icon)
                    div(style="display:flex;align-items: center;padding-right: 8px;")
                        van-icon(:name="item.groupIcon" size="32")
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import dayjs from 'dayjs'
import {IMCenterApi} from "../../utils/apiUrl";

export default {
    name: "GroupList",
    computed: {
        ...mapState('app', {
            socket: state => state.socket,
            currentInfo: state => state.currentInfo,
            groupList: state => state.groupList,
            homeMessageList: state => state.homeMessageList

        })
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
            getUserFriendList: "getUserFriendList",
            getUserGroupList: "getUserGroupList",
        }),
        async onLoad() {
            const data =  window.localStorage.getItem('WS-TOKEN')
            const wsToken = data ? JSON.parse(data) : {}
            await this.getUserGroupList({userId: wsToken.userId, deviceType: 'PC'});
            this.finished = true;
            this.loading = false;
        },
        async onRefresh() {
            // 清空列表数据
            this.finished = false;
            // 重新加载数据
            // 将 loading 设置为 true，表示处于加载状态
            this.loading = true;
            const data =  window.localStorage.getItem('WS-TOKEN')
            const wsToken = data ? JSON.parse(data) : {}
            console.log(wsToken)
            if (!wsToken || !wsToken.token) {
                console.log(wsToken)
                this.$router.push('/login')
            }
            if (wsToken && wsToken.token) {
                await this.getUserGroupList({userId: wsToken.userId, deviceType: 'PC'})
                this.loading = false;
                this.finished = true;
                this.refreshing = false;
            }
        },
        /**
         * 行点击
         * @param item
         */
        clickItem(item) {
            console.log(item)
            this.setTargetChartObj({type: 'GROUP', targetInfo: {...item, title: item.groupName, targetId: item.id}});
            this.$router.push('/groupRoom');

        }
    }
}
</script>

<style scoped lang="stylus">
    .van-cell__value
        font-size 12px
    .van-icon__image
        border-radius 50%
</style>
