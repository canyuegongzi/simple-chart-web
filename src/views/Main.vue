<template lang="pug">
.container(style="height: 100%" ref="main")
    van-nav-bar(:title="tabBarName" ref="topNav")
    div(:style="{height: contentHeight + 'px'}")
        keep-alive
            component(:is="mainContentComponent")
    van-tabbar(:value="mainContentComponent" @change="onChange" ref="bottomTab")
        van-tabbar-item(icon="home-o" name="MessageList" :badge="unreadTotal ? unreadTotal : ''") 消息
        van-tabbar-item(icon="friends-o" name="FriendList") 联系人
        van-tabbar-item(icon="setting-o" name="Setting") 我的
</template>

<script>
import MessageList from "../components/message/MessageList";
import FriendList from "../components/message/FriendList";
import GroupList from "../components/message/GroupList";
import Setting from "../components/message/Setting";
import "../style/navBar.styl"
import {mapMutations, mapState} from "vuex";

export default {
    name: "Main",
    components: {MessageList, FriendList, GroupList, Setting},
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
                    icon: 'setting-o',
                    label: '我的',
                    component: 'Setting'
                }
            ],
            active: 'MessageList',
            tabBarName: '消息',
            contentHeight: 0
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
