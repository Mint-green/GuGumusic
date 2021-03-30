//app.js
import regeneratorRuntime from '/lib/runtime/runtime';
import {
  getSetting,
  getUserInfo
} from "/utils/asyncWx.js"
const getopenid = require("utils/loginapi").getopenid
const loginapi = require("utils/loginapi.js")

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: '',
        traceUser: true,
      })
    }

    wx.onNetworkStatusChange(function (res) {
      //alert(res.isConnected)
      console.log(res.networkType)
    })
  },
  onShow: async function () {
    //检测用户是否微信版本是否支持自定义组件
    this.checkVersion()
    // this.getOpenid()
    // await this.getAuthSetting()
    this.login()
  },

  checkVersion: function () {
    const version = Number(wx.getSystemInfoSync().SDKVersion.split('.').join(''))
    const canUseComponent = 163
    if (version < canUseComponent) {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
        success: function (res) {
          if (res.confirm || res.cancel) {
            // 关闭小程序
            wx.navigateBack({
              delta: 0
            })
          }
        }
      })
    }
    return;
  },

  globalData: {
    userInfo: {}, //用户信息
    currentIndex: 0, //当前播放歌曲的索引或当前播放的优先队列所挂的索引
    fullScreen: false,
    songlist: [], //播放列表
    playing: false,
    innerAudioContext: null,
    openid: '', //  用户的openid （用户使用同一个小程序openid不变）
    musicOpenid: '', // 用户喜欢歌曲列表openid
    blogOpenid: '', // 用户喜欢的博客列表openid
    isBtnType: 0,
    isAuthorize: false, //是否授权获取用户信息
    currentSong: {}, //当前播放的歌曲信息
    playMod: 1, //播放模式
    priorityQueue: [], //优先队列
    timeout: 5000, //超时时间
    playHistory: [],
    isPlayingLovelist: true, //是否在播放我喜欢歌单(默认为是)
  },

  getAuthSetting: async function () {
    const _this = this
    let res = await getSetting()
    if (res.authSetting["scope.userInfo"]) {
      console.log("I can get userinfo, good.")
      let infoResult = await getUserInfo()
      // console.log(infoResult)
      let openid = await getopenid()
      // console.log(openid)
      let userInfo = infoResult.userInfo
      userInfo.openid = openid
      // console.log(userInfo)
      this.globalData.isAuthorize = true
      this.globalData.userInfo = userInfo
      // wx.setStorageSync('userInfo', userInfo)
      // console.log(this.globalData.userInfo)
      return true
    } else {
      console.log("I can't get your userinfo!")
      console.log("Please, let me get you Info.")
      this.globalData.isAuthorize = false
      return false
    }
  },

  login: async function () {
    let settingres = await this.getAuthSetting()
    if (!settingres) { 
      this.initplayinfo(false)
      return
     }
    let userInfo = this.globalData.userInfo
    // console.log(userInfo)
    let res = await loginapi.login(userInfo)
    // console.log(res)
    this.globalData.userInfo = res.result
    // console.log(new Date().toLocaleString())
    // console.log(res.result.lastlogin)
    this.initplayinfo(true)
  },

  initplayinfo: function (islogin) {
    let playHistory = wx.getStorageSync('playHistory')
    let playMod = wx.getStorageSync('playMod')
    let songlist = wx.getStorageSync('songlist')
    if (!playHistory || playHistory.toString() == "") { playHistory = [] }
    if (!playMod || playMod == "") { playMod = 1 }
    if (!songlist || songlist.toString() == "") {
      if(islogin){
        songlist=this.globalData.userInfo.lovelist
      }else{
        songlist = []
      }
    }
    this.globalData.playHistory = playHistory
    this.globalData.playMod = playMod
    this.globalData.songlist = songlist
  },

  // 获取和设置发布或者展示的资源类型（图片和视频）
  getResourceType: function () {
    return this.globalData.isBtnType
  },

  setResourceType(sign) {
    this.globalData.isBtnType = sign
  },

  // 获取用户的openid并储存在storage中
  getOpenid: function () {
    wx.cloud.callFunction({
      name: "login"
    }).then((res) => {
      // console.log(res);

      let openid = res.result.openid
      let musicOpenid = openid + "loveList"
      let blogOpenid = openid + "blogList"

      this.globalData.openid = openid
      this.globalData.musicOpenid = musicOpenid
      this.globalData.blogOpenid = blogOpenid

      // 将openid存储到storage中（用户最近播放列表）
      if (wx.getStorageSync(openid) == '') {
        wx.setStorageSync(openid, [])
      }

      // 用户我的喜爱歌曲列表
      if (wx.getStorageSync(musicOpenid) == '') {
        wx.setStorageSync(musicOpenid, [])
      }

      // 用户我的喜欢博客列表
      if (wx.getStorageSync(blogOpenid) == '') {
        wx.setStorageSync(blogOpenid, [])
      }
      return openid

    })
  },
})