//index.js
//获取应用实例
const app = getApp()
const apilist = require("../../utils/apilist.js")
import regeneratorRuntime, { async } from '../../lib/runtime/runtime';
const loginapi = require("../../utils/loginapi.js")

Page({
  data: {
    ishotlistfold: false,
    ispersonalizelistfold: false,
    personalizelist: [],
    lovelist: null,
    islogin: false,
    topList: [],
  },

  onLoad: function () {
    this._getRankData()
    // this.getsongsurl()
  },// 515453363 36990266 444269135

  // getsongsurl: async function () {
  //   let res = await apilist.song_url({ id: "515453363,36990266,444269135" })
  //   console.log(res)
  //   let albuminfo = await apilist.album({ id: "36682047,3406843,35023284" })
  //   console.log(albuminfo)
  //   // let lyric = await apilist.lyric({ id: "515453363,36990266,444269135" })
  //   // console.log(lyric)
  // },

  onShow: function () {
    this.getLoginStatus()
  },

  getLoginStatus: function () {
    const _this = this
    let islogin = app.globalData.islogin
    if (islogin) {
      _this.setData({
        islogin
      })
      _this.getlovelist()
    } else {
      let temp = null
      // let count = 0
      Object.defineProperty(app.globalData, 'islogin', {
        get: function () {
          return temp
        },
        set: function (e) {
          // console.log("islogin:", e)
          _this.setData({
            islogin: e
          })
          if (e == true) {
            _this.getlovelist()
            // count = 1
          }
          temp = e
        }
      })
    }

  },

  //对lovelist进行赋值
  getlovelist: function () {
    const _this = this
    // console.log(app.globalData.userInfo)
    if (app.globalData.userInfo.lovelist) {
      console.log("已获取")
      this.setData({
        lovelist: app.globalData.userInfo.lovelist
      })
    } else {
      console.log("未获取")
      let temp = null
      Object.defineProperty(app.globalData, 'userInfo', {
        get: function () {
          return temp
        },
        set: function (e) {
          // console.log(e)
          if (e.lovelist) {
            console.log("获取成功")
            _this.setData({
              lovelist: e.lovelist
            })
          }
          temp = e
        }
      })
    }
  },

  toSearch: function (e) {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '一个高颜值的音乐播放器。',
      path: 'pages/index/index',
      success: function (res) {
        // 转发成功
        console.log('分享成功')
      },
      fail: function (res) {
        // 转发失败
        console.log('分享失败')
      }
    }
  },

  toRankDetail: function (event) {
    let id = event.currentTarget.dataset.id
    // app.globalData.topId = data.id
    wx.navigateTo({
      url: '/pages/playlist/playlist?id=' + id
    })
  },

  _getRankData: async function () {
    let rankres = await apilist.toplist_detail({})
    // console.log(rankres)
    let toplist = []
    for (var i = 0; i < rankres.list.length; i++) {
      let rankinfo = {
        name: rankres.list[i].name,
        id: rankres.list[i].id,
        coverImgUrl: rankres.list[i].coverImgUrl,
        tracks: rankres.list[i].tracks,
        updateFrequency: rankres.list[i].updateFrequency,
      }
      toplist[i] = rankinfo
    }
    // console.log(toplist)
    this.setData({
      topList: toplist
    })
    let personalizeres = await apilist.personalized({})
    // console.log(personalizeres)
    let personalizelist = []
    for (var j = 0; j < personalizeres.result.length; j++) {
      let playlistinfo = {
        name: personalizeres.result[j].name,
        id: personalizeres.result[j].id,
        picUrl: personalizeres.result[j].picUrl,
        copywriter: personalizeres.result[j].copywriter,
      }
      personalizelist[j] = playlistinfo
    }
    // console.log(personalizelist)
    this.setData({
      personalizelist: personalizelist
    })
  },

  toArtistRank: async function (e) {
    let type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `../artist-rank/artist-rank?type=${type}`,
    })
  },

  foldordisplay: async function (e) {
    let type = e.currentTarget.dataset.type
    if (type == "toplist") {
      let ishotlistfold = this.data.ishotlistfold
      this.setData({
        ishotlistfold: !ishotlistfold
      })
    } else if (type == "playlist") {
      let ispersonalizelistfold = this.data.ispersonalizelistfold
      this.setData({
        ispersonalizelistfold: !ispersonalizelistfold
      })
    }
  },

  tolovelist: function () {
    if (app.globalData.islogin != true) {
      wx.showToast({
        title: '登录才能听自己的歌单噢~',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: "../lovelist/lovelist",
    })
  }
})
