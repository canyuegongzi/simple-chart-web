<template lang="pug">
.container(style="height: 100%" ref="main")
    van-nav-bar(:title="tabBarName" ref="topNav")
        template(#right v-if="mainContentComponent === 'FriendList' || mainContentComponent === 'GroupList'")
            van-icon(name="plus" size="24" @click="openAdd" color="#ffffff")
    div(:style="{height: contentHeight + 'px'}")
        keep-alive
            component(:is="mainContentComponent")
    van-tabbar(:value="mainContentComponent" @change="onChange" ref="bottomTab")
        van-tabbar-item(icon="home-o" name="MessageList" :badge="unreadTotal ? unreadTotal : ''") 消息
        van-tabbar-item(icon="friends-o" name="FriendList") 联系人
        van-tabbar-item(icon="friends-o" name="GroupList") 群组
        van-tabbar-item(icon="setting-o" name="Setting") 我的
    van-popup(v-model="searchShow" round close-icon="close" position="bottom" @close="closeSearch" closeable  :style="{ height: '95%', width: '100%' }" style=" height: 90%")
        search(ref="searchRef" @add="addTargetItem" :type="mainContentComponent")
    van-dialog(v-model="addFormShow" title="添加好友" :closeOnClickOverlay="true" round close-icon="close" closeable  @close="cancelAdd" :show-confirm-button="false")
        van-form(@submit="onSubmit")
            van-field(v-model="note" name="备注" label="验证" placeholder="请输入验证消息" )
            div(style="margin: 16px;")
                van-button(round block type="info" size="small" native-type="submit") 提交
</template>

<script>
import MessageList from "../components/message/MessageList";
import FriendList from "../components/message/FriendList";
import GroupList from "../components/message/GroupList";
import Setting from "../components/message/Setting";
import "../style/navBar.styl"
import {mapMutations, mapState} from "vuex";
import Search from "../components/friend/Search";
import {userCenterApi} from "../utils/apiUrl";
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
    name: "Main",
    components: {MessageList, FriendList, GroupList, Setting, Search},
    data() {
        return {
            tabList: [
                {
                    icon: 'home-o',
                    label: '消息',
                    component: 'MessageList'
                },
                {
                    icon: 'friends-o',
                    label: '联系人',
                    component: 'FriendList'
                },
                {
                    icon: 'friends-o',
                    label: '群组',
                    component: 'GroupList'
                },
                {
                    icon: 'setting-o',
                    label: '我的',
                    component: 'Setting'
                }
            ],
            active: 'MessageList',
            tabBarName: '消息',
            contentHeight: 0,
            searchShow: false,
            addFormShow: false,
            note: '',
        };
    },
    watch: {
        mainContentComponent: {
            immediate: true,
            handler: function (val) {
                this.active = val
            }
        }
    },
    computed: {
        ...mapState('app', {
            socket: state => state.socket,
            currentInfo: state => state.currentInfo,
            mainContentComponent: state => state.mainContentComponent,
            friendList: state => state.friendList,
            homeMessageList: state => state.homeMessageList
        }),
        unreadTotal() {
            let num = 0;
            for (let i = 0; i < this.homeMessageList.length; i ++) {
                num = this.homeMessageList[i].message.unreadMessageTotal + num
            }
            return num;
        }
    },
    methods: {
        ...mapMutations('app', {
            setMainContentComponent: "setMainContentComponent",
        }),
        onChange(val) {
            const currentTab = this.tabList.find((item) => {
                return item.component === val;
            })
            this.tabBarName = currentTab.label;
            this.setMainContentComponent(val)
        },
        openAdd() {
            console.log(this.mainContentComponent);
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
            this.currentAddTargetInfo = item
        },
        async onSubmit() {
            console.log('提交');
            console.log(this.note)
            switch (this.mainContentComponent) {
                case 'FriendList':
                    return this.addFriend();
                case 'GroupList':
                    return this.addGroup();
            }
        },

        /**
         * 添加好友
         * @returns {Promise<void>}
         */
        async addFriend() {
            const info = {
                ...this.currentAddTargetInfo,
                message: this.note

            }
            try {
                const res = await this.$post(userCenterApi.request.url, {
                    targetId: info.id,
                    targetName: info.name,
                    targetIcon: "http://qiniu.canyuegongzi.xyz/person_timg.jpg",
                    formId: this.currentInfo.userId,
                    type: "FRIEND",
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

        /**
         * 添加群组
         * @returns {Promise<void>}
         */
        async addGroup() {
            const info = {
                ...this.currentAddTargetInfo,
                message: this.note

            }
            console.log(info);
        },
        cancelAdd() {
            this.note = ''
            this.currentAddTargetInfo = null
            this.addFormShow = false
        }
    },
    mounted() {
        try {
            const topNavHeight = this.$refs.topNav.$el.clientHeight;
            const bottomTabHeight = this.$refs.bottomTab.$el.clientHeight;
            const mainHeight = this.$refs.main.clientHeight;
            this.contentHeight = mainHeight - bottomTabHeight - topNavHeight;
        }catch (e) {

        }
    },
    created() {
    }
}
</script>

<style scoped lang="stylus">
</style>
