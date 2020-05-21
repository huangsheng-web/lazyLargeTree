<template>
  <div class="hs-tree-node">
    <template v-if="treeData && treeData.length">
      <template v-for="(item, index) in treeData">
        <!--判断是否在可视范围-->
        <div class="hs-tree-main" v-if="item.isNeedShow" :key="'hs-tree-node' + index">
          <div class="hs-tree-label" @click="nodeClick($event, item)">
            <span
              :class="[
                'hs-tree-arrow',
                {'is-expand': item.isExpand, 'is-current': item.isFocus, 'el-icon-caret-right': item[props.children] && item[props.children].length}
              ]"
            >
            </span>
            <span>
              <slot :row="item">{{item[props.label]}}</slot>
            </span>
          </div>
          <div class="hs-tree-content" v-if="item.isExpand">
            <hs-tree-node
                    v-if="item[props.children] && item[props.children].length"
                    :data="item[props.children]"
                    :parent="parent"
                    :props="props"
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
      }
    },
    data() {
      return {
        treeData: [],
      }
    },
    watch: {
      data() {
        this.treeData = this.data;
      }
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
      }
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
      &:hover {
        background-color: #f5f7fa;
      }
    }
    .hs-tree-content {
      padding-left: 20px;
    }
  }
  .hs-tree-empty {
    color: #999999;
    white-space: nowrap;
  }
}
</style>
