<template lang="pug">
    div
        van-cell(title="用户信息" is-link to="userInfo")
        van-cell(title="我的请求" is-link to="myRequest")
            template(#extra)
                div(style="position: absolute;right: 36px;")
                    van-badge(:content="friendRequestData.noRespondTotal ? friendRequestData.noRespondTotal : ''" max="99")
        van-cell(title="好友请求" is-link to="friendRequest")
</template>

<script>
import {userCenterApi} from "../../utils/apiUrl";
import {mapState} from "vuex";

export default {
    name: "Setting",
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
            friendRequestData: {
                noRespondList: [],
                noRespondTotal: 0,

            }
        }
    },
    mounted() {
        this.getFriendRequestList()
    },
    methods:{
        async getFriendRequestList() {
            let list = []
            try {
                const res = await this.$post(userCenterApi.friendRequest.url, {userId: this.currentInfo.userId}, userCenterApi.friendRequest.server)
                console.log(res)
                list = res.data.data

            }catch (e) {
                console.log(e)
            }
            this.friendRequestData.noRespondList = list.filter((item) => {
                return item.callBackType === 1
            })
            this.friendRequestData.noRespondTotal = this.friendRequestData.noRespondList.length
        }
    }
}
</script>

<style scoped>

</style>
