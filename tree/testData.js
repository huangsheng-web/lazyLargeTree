let res = [];

(function todo() {
  for (let i = 0; i < 5; i++) {
    let obj = {
      label: '一级' + Math.random().toString().slice(0, 7),
      children: []
    }
    for (let z = 0; z < 50; z++) {
      let zObj = {
        label: '二级' + Math.random().toString().slice(0, 7),
        children: []
      }
      for (let j = 0; j < 2000; j++) {
        let sObj = {
          label: '三级' + Math.random().toString().slice(0, 7),
          children: []
        }
        zObj.children.push(sObj)
      }
      obj.children.push(zObj);
    }
    res.push(obj)
  }
})()
export default res;