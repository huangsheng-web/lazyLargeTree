<template>
  <div class="tree-box">
    <hs-tree
        :data="tableData"
        ref="myTree"
        :props="defaultProps"
        @node-click="nodeTap"
        :filter-node-method="todoSome"
        :mathDelayTime="500"
    >
      <template v-slot="{ row }">
        <div v-if="row.isFather">{{row.label1}}</div>
        <div v-else>{{row.label1}} <i class="el-icon-user"></i></div>
      </template>
    </hs-tree>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        tableData: [],
        treeData: [],
        defaultProps: {
          label: 'label1',
          children: 'child'
        }
      }
    },
    mounted() {
      function randomData(arr) {
        let _r = 5;
        for (let i = 0; i < _r; i++) {
          let obj = {
            label1: '父级大幅度发送' + i,
            isFather: true,
            child: []
          }
          let _sR = 40;
          for (let j = 0; j < _sR; j++) {
            let sObj = {
              label1: '子级发斯蒂芬' + j,
              isFather: true,
              child: []
            }
            for (let z = 0; z < 100; z++) {
              let zObj = {
                label1: '孙级方式发顺丰' + z,
                child: []
              }
              sObj.child.push(zObj)
            }
            obj.child.push(sObj);
          }
          arr.push(obj)
        }
      }
      randomData(this.tableData);
//      setTimeout(() => {
//        this.tableData.splice(2)
//      }, 3000)
//      setTimeout(() =>{
//        this.$refs.myTree.filter('级')
//      }, 3000)
    },
    methods: {
      nodeTap(ev, data) {
        console.log('dd', ev, data)
      },
      todoSome(value, data) {
        if (!data.isFather) {
          return data.label1.indexOf(value) !== -1;
        } else {
          return false;
        }
      }
    },
    watch: {}
  }
</script>
<style scoped="scoped" lang="scss">
  .tree-box {
    width: 300px;
    height: 600px;
    border: 1px solid #999999;
    margin: 0 auto;
    svg {
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.2);
    }
  }
</style>
