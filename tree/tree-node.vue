<template>
  <div class="hs-tree-node">
    <template v-if="treeData && treeData.length">
      <template v-for="(item, index) in treeData">
        <!--判断是否在可视范围-->
        <div class="hs-tree-main" v-if="item.isNeedShow" :key="'hs-tree-node' + index">
          <div
              class="hs-tree-label"
              :style="{'--bg': highlightConfig.bg, '--color': highlightConfig.color}"
              :class="{'hs-tree-highlight-label': item === parent.focusItem}"
          >
            <span
              :class="[
                'hs-tree-arrow',
                {'is-expand': item.isExpand}
              ]"
              @click.stop="nodeClick($event, item)"
            >
              <i v-show="item[props.children] && item[props.children].length" :class="parent.iconClass ? parent.iconClass : 'el-icon-caret-right'"></i>
            </span>
            <span v-show="showCheckbox" class="hs-tree-checkbox">
              <el-checkbox @change="handleChange($event, item, checkboxParent)" v-model="item.checked" :indeterminate="item.indeterminate"></el-checkbox>
            </span>
            <span  @click.stop="nodeClick($event, item)">
              <slot :row="item">{{item[props.label]}}</slot>
            </span>
          </div>
          <div class="hs-tree-content" v-if="item.isExpand">
            <hs-tree-node
                    v-if="item[props.children] && item[props.children].length"
                    :data="item[props.children]"
                    :parent="parent"
                    :props="props"
                    :highlightConfig="highlightConfig"
                    :showCheckbox="showCheckbox"
                    :checkboxParent="item"
                    @handleChange="handleChange"
            >
              <template v-slot="{row}"><slot :row="row"></slot></template>
            </hs-tree-node>
            <!--<div class="hs-tree-empty" v-else>暂无</div>-->
          </div>
        </div>
      </template>
    </template>
    <div class="hs-tree-empty" style="padding: 10px 0;text-align: center;" v-else>暂无数据</div>
  </div>
</template>
<script>
  export default {
    name: 'HsTreeNode',
    props: {
      data: {
        default () {
          return {
            data: []
          }
        },
      },
      parent: '',
      props: {
        default() {
          return {
            children: 'children',
            label: 'label',
          };
        }
      },
      highlightConfig: {
        default() {
          return {
            bg: '#FFFFFF',
            color: '#606266'
          }
        }
      },
      showCheckbox: {
        type: Boolean,
        default: false
      },
      checkboxParent: null,
    },
    data() {
      return {
        treeData: [],
      }
    },
    watch: {
      data() {
        this.treeData = this.data;
      },
    },
    created() {
      this.treeData = this.data;
    },
    mounted() {
    },
    methods: {
      nodeClick(ev, data) {
        // 只有点击的节点存在子集并不为空的时候才
        if (data[this.props['children']] && data[this.props['children']].length) {
          typeof data['isExpand'] !== 'undefined' ? data['isExpand'] = !data['isExpand'] : this.$set(data, 'isExpand', true);
        }
        this.parent._self.nodeTap(ev, data);
      },
      /**
       * 当前节点checkbox状态变化
       * 如果当前组件checkboxParent不存在，说明为最顶级菜单
       * 否则往上延伸改变父级checked状态
       * 这样只会计算受影响的节点，降低计算量
       * 存在子节点是，只延伸设置子节点checked
       * 不会重复计算影响父节点。
       * */
      handleChange(ev, data, checkboxParent) {
        /**
         * handleChange方法里抽离的$set方法
         * */
        const setAttr = (obj, attr, boolean) => {
          typeof obj[attr] !== 'undefined' ?
              obj[attr] = boolean :
              this.$set(obj, attr, boolean);
        }
        /**
         * 处理当前节点，当前节点被触发了，indeterminate必定为false
         * */
        setAttr(data, 'indeterminate', false);
        /**
         * 处理父级数据
         * */
        if (checkboxParent) {
          let parentBool = false;
          // 如果子集全选，则自身全选为true，半选为false;
          if (checkboxParent[this.props['children']].findIndex(x => !x.checked) === -1) {
            parentBool = true;
            setAttr(checkboxParent, 'indeterminate', false)
          } else {
            parentBool = false;
            // 说明有存在半选的子集，
            if (
                checkboxParent[this.props['children']].findIndex(x => x.indeterminate || x.checked) !== -1
            ) {
              setAttr(checkboxParent, 'indeterminate', true)
            } else {
              setAttr(checkboxParent, 'indeterminate', false)
            }
          }
          setAttr(checkboxParent, 'checked', parentBool);
          // 说明存在还存在父级，需要继续向上延伸执行handleChange
          this.$emit('handleChange', false, {}, this.checkboxParent)
        }
        /**
         * 处理子集数据
         * */
        if (data && data[this.props['children']]) {
         data[this.props['children']].forEach(x => {
           typeof x['checked'] !== 'undefined' ? x['checked'] = ev : this.$set(x, 'checked', ev);
           // 如果子节点还存在子节点，那么向下延伸执行handleChange
           if (x[this.props['children']] && x[this.props['children']].length) {
             this.handleChange(ev, x)
           }
         })
        }
      },
    },
  }
</script>
<style scoped="scoped" lang="scss">
.hs-tree-node {
  color: #606266;
  .hs-tree-main {
    .hs-tree-label {
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      -ms-text-overflow: ellipsis;
      text-overflow: ellipsis;
      display: flex;
      height: 26px;
      line-height: 26px;
      align-items: flex-end;
      .hs-tree-arrow {
        width: 20px;
        height: 26px;
        line-height: 26px;
        color: #c0c4cc;
        -webkit-transition: all .3s;
        -moz-transition: all .3s;
        -ms-transition: all .3s;
        -o-transition: all .3s;
        transition: all .3s;
        &.is-expand {
          -webkit-transform: rotate(90deg);
          -moz-transform: rotate(90deg);
          -ms-transform: rotate(90deg);
          -o-transform: rotate(90deg);
          transform: rotate(90deg);
        }
      }
      .hs-tree-checkbox {
        width: 20px;
        text-align: center;
      }
      &:hover {
        background-color: #f5f7fa;
      }
    }

    .hs-tree-content {
      padding-left: 18px;
    }
  }
  .hs-tree-empty {
    color: #999999;
    white-space: nowrap;
  }
}
</style>
