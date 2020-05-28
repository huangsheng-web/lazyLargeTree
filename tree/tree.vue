<template>
  <div class="hs-tree" :id="treeId">
    <hs-tree-node
      v-show="!filterable"
      @node-click="nodeTap"
      :props="props"
      :node-key="nodeKey"
      :data="store.data"
      :showCheckbox="showCheckbox"
      :highlightConfig="highlightConfig"
      :parent="this">
         <template v-slot="{row}"><slot :row="row"></slot></template>
    </hs-tree-node>
    <div class="hs-tree-filter" v-show="filterable">
      <template v-if="store.filterData && store.filterData.length">
        <p @click="nodeTap($event, item)" :style="{'--bg': highlightConfig.bg, '--color': highlightConfig.color}" :class="{'hs-tree-highlight-label': item === focusItem}" v-for="(item, index) in store.filterData" :key="'hs-tree-filter' + index">
          <span v-show="showCheckbox" class="hs-tree-checkbox">
            <el-checkbox v-model="item.checked"></el-checkbox>
          </span>
          <span>
            <slot :row="item">{{item[props.label]}}</slot>
          </span>
        </p>
      </template>
      <div class="hs-tree-empty" style="padding: 10px 0;" v-else>暂无数据</div>
    </div>
  </div>
</template>
<script>
  /**
   * props 传参 {
   *        node-click 是节点被点击的事件，包含来个参数，event, data
   *        filter-node-method 查找过滤方法，使用$ref.tree.filter(),之后回调，
   *        如果没有传入过滤method，默认只匹配最底层节点数据
   *        :props="defaultPorps" 默认的label,跟children字段
   *        mathDelayTime 滚动事件的节流延时时间.默认为1000ms，时间越短，计算负荷越大
   *        highlightConfig对高亮节点的色彩配置，bg背景颜色,color字体颜色
   *    }
   *  attribute传参 {
   *        icon-class 自定义树节点的图标 默认为el-icon-caret-right
   *        showCheckbox 是否展示checkbox，默认为false
   *        node-key	每个树节点用来作为唯一标识的属性，整棵树应该是唯一的
   *   }
   *  模板插入 {
   *        <template v-slot="{ row }"></template>插入自定义模板，row为当前节点data
   *  }
   *  methods {
   *      setCheckedKeys 通过 keys 设置目前勾选的节点，使用此方法必须设置 node-key 属性
   *      getHalfCheckedKeys 返回目前半选中的节点的 key 所组成的数组，使用此方法必须设置 node-key 属性
   *      getCheckedKeys 返回目前被选中的节点的 key 所组成的数组，使用此方法必须设置 node-key 属性
   *      getHalfCheckedDatas 返回目前半选中的节点的 data 所组成的数组，使用此方法必须设置 node-key 属性
   *      getCheckedDatas 返回目前被选中的节点的 data 所组成的数组，使用此方法必须设置 node-key 属性
   *  }
   *
   *
   *
   * 说明：
   * 传入的原始数据，组件会自动给加入某些字段例：（isExpand, isNeedShow...）
   * 并没有对原始数据进行封装重构，降低性能消耗
  * */
  import HsTreeNode from './tree-node.vue';
  export default {
    components: {HsTreeNode},
    name: 'HsTree',
    props: {
      data: {
        default () {
          return []
        },
        type: Array
      },
      props: {
        default() {
          return {
            children: 'children',
            label: 'label',
          };
        }
      },
      mathDelayTime: {
        type: Number,
        default() {
          return 1000;
        }
      },
      filterNodeMethod: Function,
      iconClass: String,
      showCheckbox: {
        type: Boolean,
        default: false
      },
      // 高亮的配置，默认为文档自身颜色
      highlightConfig: {
        default() {
          return {
            bg: '#FFFFFF',
            color: '#606266'
          }
        }
      },
      nodeKey: String
    },
    data() {
      return {
        store: {
          data: [], // 通过计算后给内部数传递的数据
          filterData: [], // 过滤后的数据
        },
        filterAllData: [], // 符合过滤的所有数据
        filterable: false, // 当前结果是否为过滤的
        treeId: 'hsTree' + Math.ceil(Math.random() * 100000000),
        startIndex: 0, // 开始渲染的索引，
        indexRange: 0, // 渲染的范围
        focusItem: null, // 当前高亮的节点
      }
    },
    watch: {
      data() {
        this.todoMath();
      }
    },
    mounted() {
      // 根据当前盒子高度计算indexRange,
      // 预留当前盒子的2倍高度来加载数据
      this.indexRange = Math.ceil(document.getElementById(this.treeId).clientHeight / 26 * 1.4);
      this.scrollEventListen();
      this.todoMath();
    },
    methods: {
      /**
      * 滚动事件，动态加载可视区域内的数据
      * rules {
      *  节点未展开，直接拉进来因为子集不会渲染
      *  节点展开了的，按照当前indexRange来判断是否应该加载全部子集
      *  不应该加载的isNeedShow为false
      * }
      * */
      scrollEventListen() {
        let _this = this;
        // 连续滚动使用节流，
        // 默认每隔1秒计算一次
        function todoScoll() {
          let oldTime = new Date().getTime();
          return function () {
            let nowTime = new Date().getTime();
            // 当滚动隐藏的高度(scrollTop) + 容器自身高度(clientHeight) = 真实高度(scrollHeight)
            // 也需要执行todoMath,因为下一步无法往下滚动，无法触发滚动计算事件
            if ((nowTime - oldTime) >= _this.mathDelayTime ||
                document.getElementById(_this.treeId).scrollTop +
                document.getElementById(_this.treeId).clientHeight ===
                document.getElementById(_this.treeId).scrollHeight) {
                  _this.todoMath();
                  oldTime = nowTime;
            }
          }
        }
        document.getElementById(this.treeId).addEventListener('scroll', todoScoll(), false)
      },
      /**
     * 对节点进行计算，
     * 得到现在需要展示的数据,
     * 如果isExpand = true,则把子节点数算上
     * */
      todoMath() {
        // 计算当前scrollTop，隐藏了几个节点
        // 往下拖动头顶溢出的不处理，只处理底部溢出的做懒加载
        let hideNum = Math.ceil(document.getElementById(this.treeId).scrollTop / 26);
        let max = 0;
        let res = [];
        let _this = this;
        function todoFor(arr, isChild = false) {
          for (let i = 0; i < arr.length; i++) {
            if (max >= (hideNum + _this.indexRange)) break;
            // 说明该节点是展开的，需要递归他的子集
            // 但当前节点不管是否展开，只要循环没有跳出，
            // 就必须得展示，所以设置isNeedShow = true;
            // 但子集需要先全部设置isNeedShow为false,
            arr[i]['isNeedShow'] = true;
            if (arr[i].isExpand && arr[i][_this.props['children']] && arr[i][_this.props['children']].length) {
              arr[i][_this.props['children']].forEach(x => x['isNeedShow'] = false);
              todoFor(arr[i][_this.props['children']], true);
            }
            if (!isChild) {
              res.push(arr[i])
            }
            max++;
          }
        }
        // 判断是否为搜索结果计算
        if (this.filterable) {
          todoFor(this.filterAllData);
          this.store.filterData = res;
        } else {
          todoFor(this.data);
          this.store.data = res;
        }
        max = null;
        hideNum = null;
      },
      /**
      * 节点点击事件，ev事件源，data节点数据
      * */
      nodeTap(ev, data) {
        this.$emit('node-click', ev, data);
        this.focusItem = data;
        // 只有点击的节点存在子集并不为空的时候才需要执行计算
        if (data[this.props['children']] && data[this.props['children']].length) {
          this.todoMath();
        }
      },
      /**
      * 过滤事件
      * 如果用户有自定义传filter-method,那么使用该方法过滤，
      * 否则默认匹配节点的label
      * val不存在的时候，取消过滤这时应该判断，如果有showCheckbox
      * 那么应该进行setCheckedKeys操作，响应到父级和子级
      * */
      filter(val) {
        if (val) {
          this.filterable = true;
          this.filterAllData = [];
          this.filterNodeChildren(this.data, val);
          this.todoMath();
        } else {
          this.filterable = false;
          // 找出store下filterData下checked节点
          let fArr = [];
           this.filterAllData.forEach(x => {
            if (x.checked) fArr.push(x[this.nodeKey])
          })
          this.setCheckedKeys(fArr);
          fArr = null;
        }
      },
      /**
      * 递归所有节点children，留下匹配的
      * 默认对比所有children，因为children里面有可能有树节点，也有可能有最终的源数据
      * 可以通过filterMethod去判断过滤
      * */
      filterNodeChildren(arr, keywords) {
        arr.forEach(x => {
          /**
          * 判断如果当前节点children存在数据，
          * 那么肯定不是最终节点，并且也不会是当前层级的可用数据
          * */
          if (this.filterNodeMethod) {
            if (this.filterNodeMethod(keywords, x)) {
              this.filterAllData.push(x)
            }
          } else {
            if (!x[this.props['children']] ||
                !x[this.props['children']].length &&
                x[this.props['label']].indexOf(keywords) !== -1)
            {
              this.filterAllData.push(x)
            }
          }
          if (x[this.props['children']] && x[this.props['children']].length) {
            this.filterNodeChildren(x[this.props['children']], keywords)
          }
        })
      },
      /**
       * 设置checkedKey的方法
       * */
      setCheckedKeys(data) {
        if (!this.nodeKey) this.nodeKeyError();
        let isArray = data instanceof Array;
        if (!isArray) this.nodeKeyError("arguments should be Array but accepted " + `${typeof data}`);
        /**
         * setCheckedKeys方法里抽离的$set方法
         * */
        const setAttr = (obj, attr, boolean) => {
          typeof obj[attr] !== 'undefined' ?
              obj[attr] = boolean :
              this.$set(obj, attr, boolean);
        }
        // 类型跟node-key对了，接下来设置自定义选中的节点
        const todoEach = (arr, parent) => {
          arr.forEach(x => {
            if (data.includes(x[this.nodeKey])) {
              setAttr(x, 'checked', true);
              if (x[this.props['children']] && x[this.props['children']].length) {
                x[this.props['children']].forEach(y => setAttr(y, 'checked', true))
              }
            }
            if (x[this.props['children']] && x[this.props['children']].length) {
              todoEach(x[this.props['children']], x)
            }
          })
          // 设置完所有选中的节点，还需要进行indeterminate计算
          if (arr.length && arr.findIndex(x => !x.checked) === -1) {
            // 所有子节点都为选中
            if (parent) setAttr(parent, 'checked', true)
          } else if (arr.length && arr.findIndex(x => x.checked || x.indeterminate) !== -1) {
            // 子节点有选中的或者有半选的
            if (parent) setAttr(parent, 'indeterminate', true)
          }
        }
        todoEach(this.data);
      },
      /**
       * 获取keys,或者node
       * 公共抽离方法
       * */
      getItemToArray(type) {
        let res = {halfKeys: [], keys: [], halfNodes: [], nodes: []}
        const todoFor = (arr) => {
          arr.forEach(x => {
            if (x['checked']) {
              res.nodes.push(x);
              res.keys.push(x[this.nodeKey])
            }
            if (x['indeterminate']) {
              res.halfNodes.push(x);
              res.halfKeys.push(x[this.nodeKey])
            }
            if (x[this.props['children']] && x[this.props['children']].length) {
              todoFor(x[this.props['children']])
            }
          })
        }
        todoFor(this.data);
        return res[type]
      },
      /**
       * 获取半选状态的节点key集合
       * */
      getHalfCheckedKeys() {
        if (!this.nodeKey) this.nodeKeyError();
        return this.getItemToArray('halfKeys');
      },
      /**
       * 获取选中状态的节点key集合
       * */
      getCheckedKeys() {
        if (!this.nodeKey) this.nodeKeyError();
        return this.getItemToArray('keys');
      },
      /**
       * 获取半选状态的节点data集合
       * */
      getHalfCheckedNodes() {
        if (!this.nodeKey) this.nodeKeyError();
        return this.getItemToArray('halfNodes');
      },
      /**
       * 获取选中状态的节点data集合
       * */
      getCheckedNodes() {
        if (!this.nodeKey) this.nodeKeyError();
        return this.getItemToArray('nodes');
      },
      /**
       * 没有设置node-key，调用跟node-key相关方法抛异常
       * */
      nodeKeyError(str) {
        throw new Error(str ? str : "you must set node-key in props")
      }
    },
  }
</script>
<style lang="scss">
  .hs-tree {
    width: 100%;
    height: 100%;
    overflow: auto;
    background: var(--bg-color);
    /*overflow-x: hidden;*/
    position: relative;
    &::-webkit-scrollbar {/*滚动条整体样式*/
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
      background-color:rgb(204, 204, 204);
      border:solid 1px rgb(204, 204, 204);
      border-radius:6px;
    }
    &::-webkit-scrollbar-track {/*滚动条里面轨道*/
      -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
      border-radius: 2px;
    }
    .hs-tree-empty {
      color: #999999;
      white-space: nowrap;
      text-align: center;
    }
    .hs-tree-filter {
      color: #606266;
      p {
        padding-left: 18px;
        height: 26px;
        line-height: 26px;
        cursor: pointer;
        display: flex;
        align-items: flex-end;
        > span {
          padding: 0 3px;
        }
      }
    }
    .hs-tree-highlight-label {
      background-color: var(--bg);
      color: var(--color);
    }
  }
</style>
