<template lang="pug">
    div(id="app-main")
      router-view()
</template>
<script>
    import { mapActions, mapMutations, mapState } from 'vuex';
    import {PubEvent} from "./utils/PubEvent";
    import vueCustomScrollbar from 'vue-custom-scrollbar'
    import "vue-custom-scrollbar/dist/vueScrollbar.css"

    export default {
        name: "App",
        components: {
            vueCustomScrollbar
        },
        computed: {
            ...mapState('app', {
                socket: state => state.socket,
                friendList: state => state.friendList,
                mainContentComponent: state => state.mainContentComponent,
            }),

        },
        data() {
            return {
                settings: {
                    suppressScrollY: false,
                    suppressScrollX: false,
                    wheelPropagation: false
                }
            };
        },
        methods: {
            ...mapMutations('app', {
                setSocket: "setSocket",
                setCurrentInfo: "setCurrentInfo",
                setHomeMessageList:'setHomeMessageList'
            }),
            // 树数据
            ...mapActions('app', {
                connectSocket: "connectSocket",
                initRobotInfo: "initRobotInfo",
                getUserFriendList: "getUserFriendList",
                getUserGroupList: "getUserGroupList",
            }),
            async initData() {
                const data =  window.localStorage.getItem('WS-TOKEN')
                const wsToken = data ? JSON.parse(data) : {}
                console.log(wsToken)
                if (!wsToken || !wsToken.token) {
                    console.log(wsToken)
                    this.$router.push('/login')
                }
                if (wsToken && wsToken.token) {
                    this.setCurrentInfo(wsToken)
                    this.connectSocket({userId: wsToken.userId.toString(), deviceType: 'PC'})
                    Promise.all([
                        this.getUserFriendList({userId: wsToken.userId.toString(), deviceType: 'PC'}),
                        this.getUserGroupList({userId: wsToken.userId.toString(), deviceType: 'PC'}),
                        this.initRobotInfo({ userId: wsToken.userId.toString(), userName: wsToken.userName})
                    ]).then(res => {
                        console.log(res);
                    })
                }
            }
        },
        created() {
            window._globalEvent = new PubEvent();
            this.initData()
        }
    }
</script>
<style lang="stylus">
#app-main
  background-color: #f7f8fa;
  height 100%
#app-main ::-webkit-scrollbar { /*滚动条整体样式*/
        width: 7px; /*高宽分别对应横竖滚动条的尺寸*/
        height: 7px;
}
#app-main ::-webkit-scrollbar-thumb { /*滚动条里面小方块*/
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
    //background: rgba(222,222,222,1);
}
#app-main ::-webkit-scrollbar-track { /*滚动条里面轨道*/
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.0);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.1);
}
</style>
<style lang="stylus">
  html
  body
    height 100%

</style>
