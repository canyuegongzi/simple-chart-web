<template lang="pug">
.login.cell-box
    .container
        van-field.login-input(clearable v-model="form.userName"  label="用户名" requireShow textAlign="left" placeholder="请输入用戶名")
        van-field.login-input(clearable v-model="form.userPassword"  label="密码" requireShow textAlign="left" placeholder="请输入密码")
        van-button.login-button(block type="primary" size="small" @click="userLogin") 登录
</template>

<script>
import { mapActions, mapMutations } from 'vuex';
import {bspCenterApi} from "../../utils/apiUrl";

export default {
    name: 'Login',
    data() {
        return {
            form: {
                userName: '',
                userPassword: ''
            }
        };
    },
    methods: {
        ...mapMutations('app', {
            setSocket: 'setSocket',
            setCurrentInfo: 'setCurrentInfo'
        }),
        // 树数据
        ...mapActions('app', {
            connectSocket: 'connectSocket',
            getUserInfoByToken: 'getUserInfoByToken',
            getUserFriendList: "getUserFriendList"
        }),
        async login() {
            try {
                const res = {
                    token: 1515212512212131354165,
                    userId: this.form.userPassword,
                    name: this.form.userName,
                    headerIcon: 'https://img14.360buyimg.com/imagetools/jfs/t1/130112/36/5492/38449/5f1f964cEfd6f41bf/bec836b48b55bb00.jpg',
                    userName: this.form.userName
                };
                this.setCurrentInfo(res);
                window.localStorage.setItem('WS-TOKEN', JSON.stringify(res));
                this.connectSocket({ userId: res.userId, deviceType: 'PC' });
                this.$router.push('/');
            } catch (e) {
                console.log(e);
                this.$toast.fail('登录失败');
            }
        },
        async userLogin() {
            if (!this.form.userName) {
                this.$Toast({type: 'text', position: 'bottom', message: '用户名不能为空'})
                return
            }
            if (!this.form.userPassword) {
                this.$Toast({type: 'text', position: 'bottom', message: '密码不能为空'})
                return
            }
            const params = { name: this.form.userName, password: this.form.userPassword };
            const res = await this.$post(bspCenterApi.login.url, params, bspCenterApi.login.server);
            if (res.data.success) {
                console.log(res.data.data)
                const userInfo = await this.getUserInfoByToken(res.data.data.accessToken)
                console.log(userInfo)
                const newRes = {
                    ...userInfo.data.data,
                    token: res.data.data.accessToken,
                    userId: userInfo.data.data.id,
                    name: userInfo.data.data.name,
                    headerIcon: 'https://img14.360buyimg.com/imagetools/jfs/t1/130112/36/5492/38449/5f1f964cEfd6f41bf/bec836b48b55bb00.jpg',
                    userName: userInfo.data.data.name
                }
                this.$toast.success('登录成功');
                this.setCurrentInfo(newRes)
                window.localStorage.setItem('WS-TOKEN', JSON.stringify(newRes));
                this.connectSocket({ userId: newRes.userId, deviceType: 'PC' });
                const userList = await this.getUserFriendList({userId: newRes.userId, deviceType: 'PC'})
                this.$router.push('/');
            } else {
                this.$toast.fail('登录失败');
            }
        }
    }
};
</script>

<style scoped lang="stylus">
.nut-field
    .nut-field-label
        width 60px
.login
    width: 80vw;
    margin: 0 auto;
    height 100vw
    overflow hidden
    align-items: center;
    display: flex;
    .container
        width 100%
        .login-button
            background #5396ff !important
            color white !important
        .login-input
            width 100% !important
            .nut-field-core
                text-align: left !important
            .nut-field-label
                width 60px !important
</style>
