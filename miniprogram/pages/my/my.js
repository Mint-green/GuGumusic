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
    islogin: false,
    userInfo: {}
  },

  onLoad: function () {
    let islogin = app.globalData.islogin
    if (islogin) {
      let userInfo = app.globalData.userInfo
      this.setData({
        userInfo
      })
    }
    this.setData({ islogin })
  },

  goMyBlog: function () {
    if (!this.data.islogin) {
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

  getProfile: function () {
    let _this = this
    wx.getUserProfile({
      desc: '用于完善用户信息',
      success: (res) => {
        console.log(res)
        let userInfo = res.userInfo
        app.globalData.userInfo = userInfo
        let userInfoCache = userInfo
        userInfoCache.lastAuthorize = new Date().getTime()
        wx.setStorageSync('userInfoCache', userInfoCache)
        _this.setData({
          userInfo
        })
        _this.getUserInfo(userInfo)

      },
      fail: (err) => {
        console.log(err)
      },
    })
  },

  getUserInfo: async function (userInfo) {
    let loginres = await loginapi.login(userInfo)
    console.log(loginres)
    this.setData({
      userInfo: loginres.result,
      islogin: true,
    })
    app.globalData.userInfo = loginres.result
    app.globalData.islogin = true
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
  },

  getInfo1: async function (e) {  //由于微信更改了wx.getUserInfo()接口权限，该函数废弃
    // console.log(e)
    console.log(e.detail.userInfo)
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
  },

  getAuthorizeStatus1: function () {  //由于微信更改了wx.getUserInfo()接口权限，该函数废弃
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

  getUserInfo1: function () {  //由于微信更改了wx.getUserInfo()接口权限，该函数废弃
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
})