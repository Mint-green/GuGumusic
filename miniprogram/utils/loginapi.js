const getopenid = (data) => {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "getopenid",
            data,
            success: function (res) {
                resolve(res.result.openid)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

const login1 = (data) => {
    return new Promise((resolve, reject) => {
        wx.cloud.database().collection("user")
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
                    data.lastlogin = new Date()
                    wx.cloud.database().collection("user")
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
                    res.data[0].lastlogin
                    let data1 = data
                    data1.lastlogin = new Date()
                    wx.cloud.database().collection("user")
                        .where({
                            openid: data.openid
                        })
                        .update({
                            data: data1
                        })
                        .then(res2 => {
                            console.log(res2)
                            data1.lovelist = res.data[0].lovelist
                            data1.follower = res.data[0].follower
                            data1.following = res.data[0].following
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
}

const login=(data)=>{
    let time=new Date()
    data.lastlogin={
        date:time.getTime(),
        localeString: time.toLocaleString()
    }
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "login_register",
            data:{
                data
            },
            success: function (res) {
                resolve(res)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

module.exports = {
    getopenid: getopenid,
    login: login,
}