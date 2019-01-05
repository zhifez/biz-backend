;(function(global) {
    var services = {
        'douban': 'http://shuo.douban.com/!service/share?name={{title}}&href={{url}}&image={{pic}}',
        'facebook': 'http://www.facebook.com/sharer.php?t={{title}}&u={{url}}',
        'kaixin': 'http://www.kaixin001.com/repaste/bshare.php?rtitle={{title}}&rurl={{url}}',
        'netease': 'http://t.163.com/article/user/checkLogin.do?info={{title}}',
        'tencent-weibo': 'http://v.t.qq.com/share/share.php?title={{title}}&url={{url}}&pic={{pic}}',
        'q-zone': 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?title={{title}}&url={{url}}&pics={{pic}}',
        'renren': 'http://share.renren.com/share/buttonshare.do?title={{title}}&link={{url}}',
        'sina-weibo': 'http://v.t.sina.com.cn/share/share.php?title={{title}}&url={{url}}&pic={{pic}}',
        'twitter': 'https://twitter.com/intent/tweet?text={{title}}&url={{url}}',
        'sohu': 'http://t.sohu.com/third/post.jsp?title={{title}}&url={{url}}&content=utf-8',
        'google-plus': 'http://plus.google.com/share?title={{title}}&url={{url}}',
        'whatsapp': 'https://api.whatsapp.com/send?text={{url}}',
        'telegram': 'https://telegram.me/share/url?url={{url}}&text={{title}}'
    };

    function parser(serviceId, option) {
        var service = services[serviceId];

        option || (option = {});

        // Should specify serviceId
        if (!serviceId) {
            throw new Error('Should specify serviceId');
        }

        // ServiceId should exist
        if (!service) {
            throw new Error('"' + serviceId + '" do not exist');
        }

        // replace template
        return service.replace(/{{(.*?)}}/g, function(a, m) {
            return option[m] ?
                encodeURIComponent(option[m]) : '';
        });
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = parser;
    }

    if (global.Share) {
        global.Share.parser = parser;
    }
})(this);
