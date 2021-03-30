// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log(event)
  return new Promise((resolve, reject) => {
    cloud.database().collection("user")
      .where({
        openid: wxContext.OPENID
      })
      .update({
        data: {
          lovelist: event.lovelist
        }
      })
      .then(res1 => {
        console.log(res1)
        resolve(res1)
      })
      .catch(err1 => {
        console.error(err1)
        reject(err1)
      })
  })
}