import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from "./store";
import "./utils/httpClient";
import {NavBar, Popup, Tag} from 'vant';
import '@vant/touch-emulator';
import { Tab } from 'vant';
import { Tabbar } from 'vant';
import { TabbarItem } from 'vant';
import { List } from 'vant';
import { PullRefresh } from 'vant';
import { Popover } from 'vant';
import { Progress } from 'vant';
import { ImagePreview } from 'vant';
import { Empty } from 'vant';
import { SwipeCell } from 'vant';
import { Notify } from 'vant';
import { Loading } from 'vant';
import { DropdownMenu, DropdownItem } from 'vant';
import { Dialog } from 'vant';
import { Search } from 'vant';
import { ActionSheet } from 'vant';
import { Form } from 'vant';
import { Field } from 'vant';
import { Toast } from 'vant';
import { Icon } from 'vant';
import { Button } from 'vant';
import { Image as VanImage } from 'vant';
import { Cell, CellGroup, Badge } from 'vant';
Vue.config.productionTip = false;
Vue.use(NavBar);
Vue.use(Tab);
Vue.use(Tabbar);
Vue.use(TabbarItem);
Vue.use(Badge);
Vue.use(List);
Vue.use(PullRefresh);
Vue.use(Popover);
Vue.use(Progress);
Vue.use(ImagePreview);
Vue.use(Empty);
Vue.use(SwipeCell);
Vue.use(Loading);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(ActionSheet);
Vue.use(Search);
Vue.use(Form);
Vue.use(Field);
Vue.use(VanImage);
Vue.use(Icon);
Vue.use(Cell);
Vue.use(Tag);
Vue.use(CellGroup);
Vue.use(Button);
Vue.use(Popup);
Vue.use(Popover);
Vue.use(Dialog);
Vue.prototype.$Notify = Notify;
Vue.prototype.$Dialog = Dialog;
Vue.prototype.$Toast = Toast;


let routerConfig = null;
let instance = null;

function render({ data = {} , container } = {}) {
  console.log(container)
  instance = new Vue({
    router: router,
  store,
    render: h => h(App),
  }).$mount("#app");
}

if (!window.__POWERED_BY_QIANKUN__) {
  instance = new Vue({
    router: router,
    store,
    render: h => h(App),
  }).$mount("#app");
}

//测试全局变量污染
// @ts-ignore
console.log('window.a',window.a);

export async function bootstrap() {
  console.log('vue app bootstraped');
}

export async function mount(props) {
  console.log('props from main framework');
  render(props);
}

export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = "";
  instance = null;
  routerConfig = null;
}
