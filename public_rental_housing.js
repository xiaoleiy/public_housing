/**
 * Created by xiaoleiyu on 15-11-5.
 */

(function () {
    'use strict';

    var fs = require('fs'),
        request = require('request'),
        _ = require('underscore'),
        $ = require('jquery'),
        urlRentalHousing = 'http://gzfa.xdz.com.cn/ModuleBook/PersonSelectRoom/GetRoomCountByRoomType/',
        MS_PER_MINUTE = 1000 * 60 * 5,
        FILE_PROXY_SETTINGS = 'proxy.json',
        logConsole = $('.logs-console');

    // 对Date的扩展，将 Date 转化为指定格式的String
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
    // 例子：
    // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
    // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
    Date.prototype.format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "h+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    var formProxySettings = $('.form-proxy-settings');
    formProxySettings.find('button[type="submit"]').click(function () {
        var proxy = {
            host: formProxySettings.find('input#host').val(),
            username: formProxySettings.find('input#username').val(),
            password: formProxySettings.find('input#password').val()
        };

        fs.writeSync(FILE_PROXY_SETTINGS, JSON.stringify(proxy));

        startSearch();
    });

    /**
     * The list of communities
     */
    var uuid = {
        /** The UUID of communities **/
        lanBoA: 'd0c18b09-39a0-4fde-adbb-a44f01276fa6',
        lanBoB: '3fec5392-a75a-43db-9dd0-a0970100a6d2',
        hanFeng: '19b0f030-53c2-49f2-b20a-a3cd00ee7aeb',

        /** The UUID of building No. and room No. **/
        jinYeBuildings: [{
            id: 'a14b374b-bb3b-4b78-b574-a3c600a44858',
            name: '1号楼',
            rooms: [{
                id: '9e6fed87-a185-4040-b4ff-a3c600a41758',
                name: '锦1号楼A'
            }]
        }, {
            id: '09833413-73af-4ae4-9e0b-a3c600a5d182',
            name: '2号楼',
            rooms: [
                {
                    id: '2ba8e032-907f-45f1-9a9a-a3c600a58dbe',
                    name: '锦2号楼A'
                }]
        }, {
            id: '7010a8ce-8fca-401d-a0d4-a3c601114e8c',
            name: '3号楼',
            rooms: [{
                id: '42e3462c-aab6-4237-a2de-a3c60108a329',
                name: '锦3号楼A'
            }, {
                id: '622de26b-e7c2-44c8-a37c-a3c60108d092',
                name: '锦3号楼B'
            }, {
                id: 'a5c842f0-edf4-4220-9c3a-a3c60109accf',
                name: '锦3号楼C'
            }, {
                id: '81067aaa-cc53-44f0-89fe-a3c60109c80e',
                name: '锦3号楼D'
            }, {
                id: '12223f6d-256e-4d3d-a467-a3c60109f743',
                name: '锦3号楼A1'
            }, {
                id: '28db79cb-d37f-4c80-ad71-a3c601090d8b',
                name: '锦3号楼B1'
            }]
        }, {
            id: 'bb88fc41-736e-49d4-964b-a3c60111b613',
            name: '4号楼',
            rooms: [{
                id: '193f32e1-5ad4-4e6a-adf8-a3c6010d406e',
                name: '锦4号楼A'
            }, {
                id: '1724fe64-1658-4188-b6f8-a3c6010dc676',
                name: '锦4号楼B'
            }, {
                id: 'c8c02138-0ad1-4157-ad95-a3c6010de4a3',
                name: '锦4号楼C'
            }, {
                id: '62407d64-15ed-4284-8ea0-a3c6010e18e1',
                name: '锦4号楼D'
            }, {
                id: '76d43803-b28f-4105-a189-a3c6010e97fd',
                name: '锦4号楼A1'
            }, {
                id: '268607f0-2921-496f-be79-a3c6010ed534',
                name: '锦4号楼B1'
            }]
        }, {
            id: 'd54adc0d-9a44-478e-84d0-a3c60111e21c',
            name: '5号楼',
            rooms: [{
                id: 'c959ca5a-fc88-4d18-ae2c-a3c6010f0fa6',
                name: '锦5号楼A'
            }, {
                id: 'fcc14689-29f9-4be6-8f63-a3c6010f27f3',
                name: '锦5号楼B'
            }, {
                id: '61cf44f3-8b25-4ef9-b502-a3c6010f688c',
                name: '锦5号楼C'
            }, {
                id: '216b5603-7903-4da0-a957-a3c6010f82ea',
                name: '锦5号楼D'
            }, {
                id: '5ff39954-fd3a-4df0-829b-a3c6010fca20',
                name: '锦5号楼A1'
            }, {
                id: '98f8b041-9543-4e86-866d-a3c6010fdfc9',
                name: '锦5号楼B1'
            }]
        }]
    };

    function startSearch() {
        searchAvailRooms(uuid.jinYeBuildings);
        setInterval(searchAvailRooms, MS_PER_MINUTE, uuid.jinYeBuildings);
    }

    /**
     * Search available rooms for the given community, with given proxy
     *
     * @param buildingsUUIDByComm The community to search, containing the array of UUIDs for all the rooms.
     * @param proxy The proxy string following the convention of "http://username:password@www.example.com:port"
     */
    function searchAvailRooms(buildingsUUIDByComm, proxy) {
        log('----------------------------------------------------------');
        log('[' + now() + '] 开始请求房屋预定数据....');

        var predefinedFormParam = {};
        if (fs.existsSync(FILE_PROXY_SETTINGS)) {
            var proxyString = fs.readFileSync(FILE_PROXY_SETTINGS);
            if (proxyString.length > 0) {
                var proxy = JSON.parse(proxyString);
                predefinedFormParam = {
                    proxy: ['http://', proxy.username, ':', proxy.password, '@', proxy.host].join('')
                };
            }
        }

        // iterate all the buildings and rooms
        _.each(buildingsUUIDByComm, function (building) {
            _.each(building.rooms, function (room) {
                request.post({
                    url: urlRentalHousing,
                    form: _.defaults({
                        buildid: building.id,
                        roomtypeid: room.id
                    }, predefinedFormParam)
                }, function (err, httpResponse, body) {
                    if (err) {
                        log('数据请求失败，请检查代理。');
                        return;
                    }

                    var resp = JSON.parse(body);
                    if (resp.result && resp.result > 0) {
                        log(['[' + now() + '] ',
                            '==============>>>>>>>>>>>>>>>>> [', now(), ']',
                            building.name, ' - ', room.name, '还有 ', resp.result, ' 间空房!',
                            '<<<<<<<<<<<<<<<<<<<<<<======================='].join(''),
                            'logs-success');
                        return;
                    }

                    log('[' + now() + '] 无空房: ' + building.name + ' - ' + room.name);
                });
            });
        });
    }

    function readProxySettings() {

    }

    function now() {
        return new Date().format('yyyy-MM-dd hh:mm:ss');
    }

    function log(msg, logClass) {
        if (logClass) {
            logConsole.append('<span class="' + logClass + '">' + msg + '</span><br />');
            return;
        }

        logConsole.append('<span>' + msg + '</span><br />');
    }

    startSearch();
})();