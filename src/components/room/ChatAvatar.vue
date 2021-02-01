<template lang="pug">
.container
    .current-user(v-if="userInfo.userId+'' === currentInfo.userId+''")
        van-icon(:name="userInfo.headerIcon" size="32" style="margin-right: 4px;")
        span(class="avatar-name") {{currentInfo.friendName }}
        span(class="avatar-time") {{ _formatTime(time) }}
    .other-user(v-else)
        van-icon(:name="currentInfo.headerIcon" size="32" style="margin-right: 4px;")
        span(class="avatar-name") {{currentInfo.friendName }}
        span(class="avatar-time") {{ _formatTime(time) }}
</template>

<script lang="ts">
import Vue from 'vue';
import moment from "moment"
export default {
    name: 'ChatAvatar',
    props: {
        msg: String,
        currentInfo: {
            type: Object,
            default: () => {
                return {
                    headerIcon: 'https://img14.360buyimg.com/imagetools/jfs/t1/130112/36/5492/38449/5f1f964cEfd6f41bf/bec836b48b55bb00.jpg',
                    userId: null,
                    userName: '--',
                    time: '--'
                };
            }
        },
        userInfo: {
            type: Object,
            default: () => {
                return {
                    headerIcon: 'https://img14.360buyimg.com/imagetools/jfs/t1/130112/36/5492/38449/5f1f964cEfd6f41bf/bec836b48b55bb00.jpg',
                    userId: null,
                    userName: '--'
                };
            }
        },
        time: {
            type: [Number, String]
        }
    },
    methods: {
        _formatTime(time) {
            // 大于昨天
            if (
                moment()
                    .add(-1, 'days')
                    .startOf('day') > time
            ) {
                return moment(time).format('M/D HH:mm');
            }
            // 昨天
            if (moment().startOf('day') > time) {
                return '昨天 ' + moment(time).format('HH:mm');
            }
            // 大于五分钟不显示秒
            if (new Date().valueOf() > time + 300000) {
                return moment(time).format('HH:mm');
            }
            return moment(time).format('HH:mm:ss');
        }
    }
};
</script>
<style lang="stylus" scoped>
.container
    .current-user
        display flex
        align-items center
        height 37px
        justify-content: flex-end
    .other-user
        display flex
        align-items center
        height 37px
    .avatar-time
        font-size: 14px;
        margin-left: 5px;
    .van-icon__image
        border-radius 50%
</style>
