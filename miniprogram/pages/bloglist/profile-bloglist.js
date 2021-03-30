const MAX_LIMIT_NUM = 10  // 博客展示数量

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bloglist: [],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMyBloglist()
  },
  // 调用云函数获取我发布的博客
  getMyBloglist() {
    let _this = this
    wx.showLoading({
      title: '博客加载中',
    })
    wx.cloud.callFunction({
      name: "blog",
      data: {
        $url: "getMyBloglist",
        start: this.data.bloglist.length,
        count: MAX_LIMIT_NUM
      }
    }).then((res) => {
      console.log(res)
      _this.setData({
        bloglist: this.data.bloglist.concat(res.result.data)
      })
      wx.hideLoading()
    }).catch(err => {
      console.log(err)
    })
  },

  delete: function (e) {
    wx.showLoading({
      title: '删除博客中',
    })
    let index = e.currentTarget.dataset.index
    console.log(index)
    let bloglist = this.data.bloglist
    // console.log(bloglist)
    let thisblog = bloglist[index]
    console.log(thisblog)
    let id = thisblog._id
    let _this = this
    wx.cloud.callFunction({
      name: "blog",
      data: {
        $url: "deleteMyBlog",
        id: id
      }
    }).then((res) => {
      console.log(res)
      if (res.result.stats.removed > 0) {
        console.log("删除成功！")
        wx.showToast({
          title: "删除成功",
          icon: "none",
          duration: 500,
        })
        bloglist.splice(index, 1)
        // console.log(bloglist)
        _this.setData({ bloglist })
      }
    }).catch(err => {
      console.log(err)
    })
    wx.hideLoading()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getMyBloglist()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    const blog = event.target.dataset.blog
    const len = this.data.shareImage.length
    let random = Math.floor(Math.random() * len)
    return {
      title: blog.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blog._id}`,
      imageUrl: this.data.shareImage[random]
    }
  }
})