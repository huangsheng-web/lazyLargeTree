<template>
  <div class="tree-box">
    <el-button size="mini" @click="setCheckKey">setCheckKey</el-button>
    <el-button size="mini" @click="getCheckKey">getCheckKey</el-button>
    <el-button size="mini" @click="gethalfCheckKey">gethalfCheckKey</el-button>
    <el-button size="mini" @click="getCheckData">getCheckData</el-button>
    <el-button size="mini" @click="gethalfCheckData">gethalfCheckData</el-button>
    <el-button size="mini" @click="filterMethod">filter</el-button>
    <el-button size="mini" @click="cancelFilter">cancel filter</el-button>
    <hs-tree
        :data="tableData"
        ref="myTree"
        :props="defaultProps"
        :filter-node-method="todoSome"
        icon-class="el-icon-arrow-right"
        :mathDelayTime="500"
        showCheckbox
        :node-key="defaultProps.label"
        :highlightConfig="highlightConfig"
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
        },
        highlightConfig: {
          bg: '#E0F2FF',
          color: '#0C70F8'
        }
      }
    },
    mounted() {
      function randomData(arr) {
        let _r = 4;
        for (let i = 0; i < _r; i++) {
          let obj = {
            label1: '父级大幅度发送' + i,
            isFather: true,
            child: []
          }
          let _sR = 50;
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
//        this.$refs.myTree.filter('0')
//      }, 3000)
    },
    methods: {
      filterMethod() {
        this.$refs.myTree.filter('0')
      },
      cancelFilter() {
        this.$refs.myTree.filter('')
      },
      setCheckKey() {
        this.$refs.myTree.setCheckedKeys(['子级发斯蒂芬0', '孙级方式发顺丰1', '孙级方式发顺丰2']);
      },
      getCheckKey() {
        console.log(this.$refs.myTree.getCheckedKeys())
      },
      gethalfCheckKey() {
        console.log(this.$refs.myTree.getHalfCheckedKeys())
      },
      getCheckData() {
        console.log(this.$refs.myTree.getCheckedNodes())
      },
      gethalfCheckData() {
        console.log(this.$refs.myTree.getHalfCheckedNodes())
      },
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
<style lang="scss">
  .tree-box {
    width: 300px;
    height: 400px;
    border: 1px solid #999999;
    margin: 0 auto;
    svg {
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.2);
    }
    /*.hs-tree-highlight-label {*/
      /*color: #0C70F8;*/
      /*background-color: #E0F2FF;*/
      /*.hs-tree-arrow {*/
        /*i {*/
          /*color: #0C70F8;*/
        /*}*/
      /*}*/
    /*}*/
  }
</style>
