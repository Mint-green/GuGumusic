const app = getApp()
const TEN_MINUTES = 600000
import regeneratorRuntime, {
  async
} from '../../lib/runtime/runtime';
import loginapi from "../../utils/loginapi.js";
const getopenid = require("../../utils/loginapi").getopenid

Page({
  data: {
    actionSheetsTime: ['关闭', '10分钟', '20分钟', '30分钟'], // 定时关闭选项
    actionSheetsWifi: ['开启', '关闭'],
    isAuthorize: false,
    userInfo: {}
  },

  onLoad: function () {
    this.getAuthorizeStatus()
  },

  goMyBlog: function(){
    if(!this.data.isAuthorize){
      wx.showToast({
        title: '登录了才能查看噢~',
        icon: 'none',
        duration: 1000
      })
      return
    }
    wx.navigateTo({
      url: '../bloglist/profile-bloglist'
    })
  },

  tolovelist: function () {
    wx.showToast({
      title: '此功能还在做噢~',
      icon: 'none'
    })
    return
    wx.navigateTo({
      url: "../lovelist/lovelist",
    })
  },

  torecentplay: function () {
    wx.showToast({
      title: '此功能还在做噢~',
      icon: 'none'
    })
    return
    wx.navigateTo({
      url: "../lovelist/lovelist",
    })
  },

  getInfo: async function (e) {
    // console.log(e)
    // console.log(e.detail.userInfo)
    if (e.detail.userInfo) {
      let openid = await getopenid()
      // console.log(openid)
      let userInfo = e.detail.userInfo
      userInfo.openid = openid
      // console.log(userInfo)
      this.setData({
        isAuthorize: true,
        userInfo
      })
      app.globalData.isAuthorize = true
      app.globalData.userInfo = userInfo
      let loginres = await loginapi.login(userInfo)
      // console.log(loginres.result)
      app.globalData.userInfo = loginres.result
      this.setData({
        userInfo: loginres.result
      })
    } else {
      this.setData({
        isAuthorize: false
      })
    }
    // this.getAuthSetting()
  },

  getAuthorizeStatus: function () {
    const _this = this
    let isAuthorize = app.globalData.isAuthorize
    // console.log(isAuthorize)
    this.setData({
      isAuthorize
    })
    if (isAuthorize) {
      _this.getUserInfo()
    } else {
      let temp = null
      // let count = 0
      Object.defineProperty(app.globalData, 'isAuthorize', {
        get: function () {
          return temp
        },
        set: function (e) {
          console.log("isAuthorize:", e)
          _this.setData({
            isAuthorize: e
          })
          if (e == true) {
            _this.getUserInfo()
            // count = 1
          }
          temp = e
        }
      })
    }

  },

  getUserInfo: function () {
    const _this = this
    console.log(app.globalData.userInfo)
    if (app.globalData.userInfo.lovelist) {
      console.log("已获取")
      this.setData({
        userInfo: app.globalData.userInfo
      })
    } else {
      console.log("未获取")
      let temp = null
      Object.defineProperty(app.globalData, 'userInfo', {
        get: function () {
          return temp
        },
        set: function (e) {
          console.log(e)
          // if (e.lovelist) {
          _this.setData({
            userInfo: e
          })
          // }
          temp = e
        }
      })
    }
  },

  getAuthSetting: async function () {
    let isAuthorize = app.globalData.isAuthorize
    console.log(isAuthorize)
    this.setData({
      isAuthorize
    })
    if (isAuthorize) {
      let userInfo = app.globalData.userInfo
      this.setData({
        userInfo
      })
    }
  },

  // 拒绝授权
  toAauthorize: function () {
    wx.showModal({
      title: '警告',
      content: '用户拒绝了授权，可能会导致某些功能无法正常使用!是否重新授权？',
      confirmText: '是',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          wx.openSetting({
            success: (res) => {
              console.log(res);
            }
          });
        }
      }
    })
  },

  showActionSheets: function (e) {
    console.log(e.currentTarget)
    const itemList = e.currentTarget.dataset.type
    const type = e.currentTarget.dataset.types
    const _this = this
    wx.showActionSheet({
      itemList: itemList,
      success: function (res) {
        if (type == 'time') {
          setTimeout(() => {
            wx.navigateBack({
              delta: 0
            })
          }, 5000)
        } else {
          _this.setData({
            test: !_this.data.test
          })
          console.log(_this.data.test)
        }

      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  }
})