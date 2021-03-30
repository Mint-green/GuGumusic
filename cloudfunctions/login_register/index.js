// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let data = event.data

  return new Promise((resolve, reject) => {
    cloud.database().collection("user")
      .where({
        openid: data.openid
      })
      .get()
      .then(res => {
        console.log(res.data)
        if (!res.data[0]) {  //若未注册过，则新建记录
          console.log("未注册过")
          data.lovelist = []
          data.follower = []
          data.following = []
          data.bloglist = []
          data.blogcommentlist= []
          cloud.database().collection("user")
            .add({
              data
            })
            .then(res1 => {
              console.log(res1)
              resolve(data)
            })
            .catch(err1 => {
              console.error(err1)
              reject(err1)
            })
        } else {  //若已注册过，则更新用户信息及登录时间
          let data1 = data
          cloud.database().collection("user")
            .where({
              openid: data.openid
            })
            .update({
              data
            })
            .then(res2 => {
              console.log(res2)
              data1.lovelist = res.data[0].lovelist
              data1.follower = res.data[0].follower
              data1.following = res.data[0].following
              data1.bloglist = res.data[0].bloglist
              data1.blogcommentlist = res.data[0].blogcommentlist
              console.log(data1)
              resolve(data1)
            })
            .catch(err2 => {
              console.error(err2)
              reject(err2)
            })
        }
        // resolve(res)
      })
      .catch(err => {
        console.error(err)
        reject(err)
      })
  })


  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}