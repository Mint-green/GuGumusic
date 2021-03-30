const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    const _this = this
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        },
        fail: function (e) {
          if (e.errMsg == 'getUserInfo:fail auth deny') {
            _this.toAauthorize()
          }
        }
      })
    }
  },
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
})