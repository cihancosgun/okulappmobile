import React, {
    Component
} from 'react';
import {
    AsyncStorage
} from 'react-native';


export class OkulApi extends React.Component {

    constructor(props) {
        super(props);
    }

    // static apiURL = "http://172.16.121.31:8080/OkulApp-web/webresources/api/";
    // static wsURL = "http://172.16.121.31:8080/OkulApp-web/ws";
    static apiURL = "http:/192.168.134.36:8080/OkulApp-web/webresources/api/";
    static wsURL = "http://192.168.134.36:8080/OkulApp-web/ws";

    static ws = null;

    static userName = "";
    static pass = "";
    static token = "";
    static tokenEndDate = new Date();
    static userRole = "";

    static addMinutes(date, minutes) {
        return new Date(date.getTime() + minutes * 60000);
    }

    static imageGallery = [];
    static imageGalleryIndex = 0;

    static currentChat = {};

    static myChatView = null;

    static hello() {
        console.log('hello');
    }

    static getToken(user, pass, successCalback, errroCallBack) {
        this.userName = user;
        this.pass = pass;
        var userRecord = {
            "login": user,
            "password": pass
        };
        var formBody = [];
        for (var property in userRecord) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(userRecord[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        fetch(this.apiURL + 'login', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: formBody
        }).then((response) => {
            if (response.ok && response.headers.map.authorization != null && successCalback != null) {
                AsyncStorage.setItem('userToken', response.headers.map.authorization).then(() => {
                    this.token = response.headers.map.authorization;
                    this.tokenEndDate = this.addMinutes(new Date(), 14);
                    if (this.ws == null) {
                        this.initWS();
                    }
                    this.getUserRole((role) => {
                        this.userRole = role;
                        successCalback(response.headers.map.authorization);
                    });
                })
            } else {
                if (errroCallBack != null) {
                    errroCallBack(response);
                }
            }
        });
    }

    static refreshToken() {
        const prms = new Promise(function (resolve, reject) {
            if (OkulApi.tokenEndDate < new Date()) {
                console.log('token refreshed');
                OkulApi.getToken(OkulApi.userName, OkulApi.pass, (res) => {
                    resolve(res);
                }, (e) => {
                    console.log(e);
                    reject('ERROR to take token');
                });
            } else {
                console.log('token used');
                resolve(OkulApi.token);
            }
        })
        return prms;
    }

    static getUserRole(successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getUserRole', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json;charset=UTF-8',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Authorization': OkulApi.token
                    }
                }).then((response) => response.json())
                .then((response) => {
                    if (response.role && successCalback != null) {
                        successCalback(response.role);
                    } else {
                        if (errroCallBack != null) {
                            errroCallBack();
                        }
                    }
                });
        });
    }

    static getBoardOfUser(successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getBoardOfUser', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json;charset=UTF-8',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Authorization': OkulApi.token
                    }
                }).then((response) => response.json())
                .then((response) => {
                    if (response.list && successCalback != null) {
                        successCalback(response.list);
                    } else {
                        if (errroCallBack != null) {
                            errroCallBack();
                        }
                    }
                });
        });
    }

    static getTeachers(search, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getTeachers?searchText=' + search, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json;charset=UTF-8',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Authorization': OkulApi.token
                    }
                }).then((response) => response.json())
                .catch((res) => {
                    console.log(res)
                })
                .then((response) => {
                    if (response.result != null && successCalback != null) {
                        successCalback(response.result);
                    } else {
                        if (errroCallBack != null) {
                            errroCallBack();
                        }
                    }
                });
        });
    }

    static getStudentParents(search, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getStudentParents?searchText=' + search, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json;charset=UTF-8',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Authorization': OkulApi.token
                    }
                }).then((response) => response.json())
                .catch((res) => {
                    console.log(res)
                })
                .then((response) => {
                    if (response.result != null && successCalback != null) {
                        successCalback(response.result);
                    } else {
                        if (errroCallBack != null) {
                            errroCallBack();
                        }
                    }
                });
        });
    }

    static getStuffs(search, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getStuffs?searchText=' + search, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json;charset=UTF-8',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Authorization': OkulApi.token
                    }
                }).then((response) => response.json())
                .catch((res) => {
                    console.log(res)
                })
                .then((response) => {
                    if (response.result != null && successCalback != null) {
                        successCalback(response.result);
                    } else {
                        if (errroCallBack != null) {
                            errroCallBack();
                        }
                    }
                });
        });
    }

    static getClasses(search, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getClasses?searchText=' + search, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json;charset=UTF-8',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Authorization': OkulApi.token
                    }
                }).then((response) => response.json())
                .catch((res) => {
                    console.log(res)
                })
                .then((response) => {
                    if (response.result != null && successCalback != null) {
                        successCalback(response.result);
                    } else {
                        if (errroCallBack != null) {
                            errroCallBack();
                        }
                    }
                });
        });
    }

    static getConversations(search, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getConversations?searchText=' + search, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json;charset=UTF-8',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Authorization': OkulApi.token
                    }
                }).then((response) => response.json())
                .then((response) => {
                    if (response.list && successCalback != null) {
                        successCalback(response.list);
                    } else {
                        if (errroCallBack != null) {
                            errroCallBack();
                        }
                    }
                });
        });
    }

    static getChat(chatId, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getChat?chatId=' + chatId, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json;charset=UTF-8',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Authorization': OkulApi.token
                    }
                }).then((response) => response.json())
                .then((response) => {
                    if (response.result && successCalback != null) {
                        successCalback(response.result);
                    } else {
                        if (errroCallBack != null) {
                            errroCallBack();
                        }
                    }
                });
        });
    }


    static addMessageToChat(chatId, message, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            var record = {
                "chatId": chatId,
                "message": message
            };
            fetch(this.apiURL + 'addMessageToChat', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json;charset=UTF-8',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Authorization': OkulApi.token
                    },
                    body: JSON.stringify(record),
                }).then((response) => response.json())
                .then((response) => {
                    if (response.result && successCalback != null) {
                        successCalback(response.result);
                    } else {
                        if (errroCallBack != null) {
                            errroCallBack();
                        }
                    }
                });
        });
    }

    static startNewChat(receiverEmail, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            var record = {
                "receiverEmail": receiverEmail
            };
            fetch(this.apiURL + 'startNewChat', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json;charset=UTF-8',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Authorization': OkulApi.token
                    },
                    body: JSON.stringify(record),
                }).then((response) => response.json())
                .then((response) => {
                    if (response.result && successCalback != null) {
                        successCalback(response.result);
                    } else {
                        if (errroCallBack != null) {
                            errroCallBack();
                        }
                    }
                });
        });
    }


    static getUnreadedBoard(successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getUnreadedBoard', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json;charset=UTF-8',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Authorization': OkulApi.token
                    }
                }).then((response) => response.json())
                .then((response) => {
                    if (response.list && successCalback != null) {
                        successCalback(response.list);
                    } else {
                        if (errroCallBack != null) {
                            errroCallBack();
                        }
                    }
                });
        });
    }

    static refreshChat() {
        OkulApi.getChat(OkulApi.currentChat._id.$oid, (res) => {
            OkulApi.currentChat = res;
            if (OkulApi.myChatView != null) {
                OkulApi.myChatView.setState({
                    currentChat: OkulApi.currentChat
                });
            }
        });
    }

    static async getMessageTypeIcon(messageType) {
        userToken = await AsyncStorage.getItem('userToken');
        result = await fetch(this.apiURL + 'getMessageTypeIcon/?messageType' + messageType, {
            method: 'GET',
            headers: {
                Accept: 'image/png',
                'Content-Type': 'image/png',
                'Authorization': res
            }
        });
        return result;
    }

    static uploadImageFile(fileUri, fileName, type, successCalback, errroCallBack) {
        const form = new FormData();
        form.append('file', {
            uri: fileUri,
            type: type,
            name: fileName,
          });

        this.refreshToken().then(() => {
            fetch(this.apiURL + 'uploadImageFile', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json;charset=UTF-8',
                        'Content-Type': 'multipart/form-data;',
                        'Authorization': OkulApi.token
                    },
                    body: formBody
                }).then((response) => response.json())
                .then((response) => {
                    if (successCalback != null) {
                        successCalback(response);
                    } else {
                        if (errroCallBack != null) {
                            errroCallBack();
                        }
                    }
                });
        });
    }

    static initWS() {
        this.ws = new WebSocket(this.wsURL);
        this.ws.onopen = () => {
            // connection opened
            //ws.send('something'); // send a message
        }

        this.ws.onmessage = (e) => {
            var jsonData = JSON.parse(e.data);
            if (e.data != null && jsonData != null && jsonData.receivers != null) {
                if (jsonData.receivers.indexOf(OkulApi.userName) > -1) {
                    if (jsonData.message == "updatechat" && OkulApi.currentChat != null && OkulApi.currentChat._id != null) {
                        OkulApi.refreshChat();
                    }
                }
            }
        }

        this.ws.onerror = (e) => {
            // an error occurred
            console.log(e.message);
        };

        this.ws.onclose = (e) => {
            // connection closed
            console.log(e.code, e.reason);
        };
    }

    static wsSend(message) {
        OkulApi.ws.send(JSON.stringify(message));
    }

}
