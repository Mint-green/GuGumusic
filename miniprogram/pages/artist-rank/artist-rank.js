// pages/artist-rank/artist-rank.js
import regeneratorRuntime from '../../lib/runtime/runtime';
const apilist = require('../../utils/apilist.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 0,
    artistlist: [],
    typename: "",
  },
  ranktype: ["华语", "欧美", "韩国", "日本"],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1]
    let options = currentPage.options
    let type = options.type
    this.setData({
      type,
      typename: this.ranktype[type - 1]
    })
    this.getartistRank()
  },

  getartistRank: async function () {
    let { type } = this.data
    let rankres = await apilist.toplist_artist({ type })
    console.log(rankres)
    let ranklist = rankres.list.artists
    let artistlist = []
    for (var i = 0; i < ranklist.length; i++) {
      let lastRank = ranklist[i].lastRank
      let change = 0
      let rankchange = 0
      if (!lastRank && lastRank != 0) {
        change = 1
        rankchange = ""
      } else if (lastRank == i) {
        change = 0
        rankchange = 0
      } else if (lastRank > i) {
        change = 1
        rankchange = lastRank - i
      } else if (lastRank < i) {
        change = -1
        rankchange = i - lastRank
      }
      let artistinfo = {
        id: ranklist[i].id,
        name: ranklist[i].name,
        img1v1Url: ranklist[i].img1v1Url,
        albumSize: ranklist[i].albumSize,
        musicSize: ranklist[i].musicSize,
        change,
        rankchange,
      }
      artistlist[i] = artistinfo
    }
    console.log(artistlist)
    this.setData({ artistlist })
  },

  toArtistpage: function(e){
    let index=e.currentTarget.dataset.index
    let artistlist=this.data.artistlist
    wx.navigateTo({
      url: '../artist-detail/artist-detail?id=' + artistlist[index].id,
    })
  },

  // 图片加载错误的处理，即替换成默认图片
  loadimgerror: function(e){
    let index=e.currentTarget.dataset.index
    let artistlist=this.data.artistlist
    console.log(artistlist[index].img1v1Url)
    artistlist[index].img1v1Url="https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg"
    this.setData({
      artistlist
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})