<template lang="pug">
.chart-container
    van-search(v-model="value" left-icon="chat-o" show-action label="" placeholder="" @search="emitSearch")
       template(#action)
            div(@click="emitSearch") 发送
</template>

<script>
import {mapState} from "vuex";

export default {
    name: "ChartInput",
    computed: {
        ...mapState('app', {
            socket: state => state.socket,
            currentInfo: state => state.currentInfo,
            targetChartObj: state => state.targetChartObj,
        })
    },
    data() {
        return {
            value: ''

        }
    },
    methods: {
        /**
         * 发送消息
         */
        emitSearch() {
            this.$emit('get:message', this.value)
            this.value = ''
        }

    },
    props: {

    }
}
</script>

<style scoped lang="stylus">
    .chart-container
        height 46px

</style>
