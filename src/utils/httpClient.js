import Vue from 'vue';
import Qs from 'query-string';
import config from '../config';

const axios = require('axios');

// axios.defaults.withCredentials = true;
axios.defaults.redirectURL = config.simpleIMCenterApi;

const CACHE = new Map();
const HEADER = { CACHE: 'X-Cache', QUIET: 'X-Quiet' };

let redirected = false;

axios.interceptors.request.use(config => {
    //请求路径
    let url = config.url;
    /*if (config.method === 'get' && config.params) {
        url += '?';
        let keys = Object.keys(config.params);
        for (let key of keys) {
            // 拼接参数，get参数中参数名存在特殊符号时，对参数名编码（如% [ ]...）
            url += `${encodeURIComponent(key)}=${config.params[key]}&`;
        }
        url = url.substring(0, url.length - 1);
        //清空请求参数
        config.params = {};
    }*/
    config.url = url;
    config.headers.token = localStorage.getItem('token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoicm9vdCIsImlhdCI6MTYwMjY4NzgzNSwiZXhwIjoxNjAyNjkxNDM1fQ.UXYjxZMmXjtPUlR0kIBUt47U2fFSDDwTpqZ_W5yZVCE';
    config.headers.ignoreToken = 'true'
    return config;
});

axios.interceptors.response.use(
    resp => {
        const { status, data, statusText } = resp;
        console.log(status)
        const { code } = resp.data;
        const quiet = resp.config.headers[HEADER.QUIET];
        if (code === 400) {
            //需要登录
            if (!redirected) {
                location.href = config.simpleIMCenterApi;
            }
            redirected = true;
        } else if (status === 200) {
            if (resp.config.method === 'get') {
                const cacheId = resp.config.headers[HEADER.CACHE];
                if (cacheId) {
                    CACHE.set(cacheId, data);
                }
            } else if (!quiet) {
                // Message.success({ message: '操作成功', duration: 2000 })
            }
            return data;
        } else if (status) {
            return data;
        } else {
            return Promise.resolve(data);
        }
        return Promise.resolve(data);
    },
    ({ response }) => {
        if (!response) {
            return null;
        }
        const { status, data } = response;
        if (typeof eval('handle_' + status) === 'function') {
        }
        return null;
    }
);

const parseReq = (path, method = 'get', params = {}) => {
    let headers = {};
    if (/^!/.test(path)) {
        if (method === 'get') {
            headers[HEADER.CACHE] = path + Qs.stringify(params);

        }
        //所有请求均添加静默请求
        headers[HEADER.QUIET] = true;
    }
    return [path.replace(/^!/, ''), headers];
};

/**
 * 设置api访问根路径
 * @param {*} apiType
 */
export let axiosDefaultsBaseURL = (apiType = 'IM') => {
    switch (apiType) {
        case 'user':
            axios.defaults.baseURL = config.simpleUserCenterApi;
            break;
        case 'IM':
            axios.defaults.baseURL = config.simpleIMCenterApi;
            break;
        case 'notice':
            axios.defaults.baseURL = config.simpleNoticeCenterApi;
            break;
        default:
            axios.defaults.baseURL = config.simpleIMCenterApi;
            break;
    }
};

/**
 * get请求
 * @param {*} path
 * @param {*} params
 * @param {*} apiType
 */
export const $get = (path, params = {}, apiType = 'user', headersConfig = {}) => {
    axiosDefaultsBaseURL(apiType);

    const [url, headers] = parseReq(path, 'get', params);
    const cacheId = headers[HEADER.CACHE];

    if (cacheId && CACHE.has(cacheId)) {
        return Promise.resolve(CACHE.get(cacheId));
    } else {
        return axios({ url, params, headers: {...headersConfig, ...headers} });
    }
};

/**
 *
 * @param {*} path
 * @param {*} data
 * @param {*} apiType
 */
export const $post = (path, data = {}, apiType = 'user') => {
    axiosDefaultsBaseURL(apiType);

    const [url, headers] = parseReq(path, 'post');
    return axios({ url, data: data, method: 'post', headers });
};

/**
 *
 * @param {*} path
 * @param {*} data
 * @param {*} apiType
 */
export const $put = (path, data = {}, apiType = 'user') => {
    axiosDefaultsBaseURL(apiType);

    const [url, headers] = parseReq(path, 'put');
    return axios({
        url,
        data: Qs.stringify(data),
        method: 'put',
        headers
    });
};

/**
 *
 * @param {*} path
 * @param {*} data
 * @param {*} apiType
 */
export const $delete = (path, data = {}, apiType = 'user') => {
    axiosDefaultsBaseURL(apiType);

    const [url, headers] = parseReq(path, 'delete');
    return axios({ url, data, method: 'delete', headers });
};

Vue.use({
    install(Vue) {
        Vue.prototype.$get = $get;

        Vue.prototype.$post = $post;

        Vue.prototype.$put = $put;

        Vue.prototype.$delete = $delete;
    }
});

function handle_401(data) {}
function handle_404(data) {}

function handle_403() {}

function handle_500(data) {}

function handle_502() {}
