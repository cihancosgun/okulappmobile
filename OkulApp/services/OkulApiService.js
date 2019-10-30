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

    static serverProtocol = 'http://';
    static serverWSProtocol = 'ws://';
    // static serverIP = '192.168.2.2';
    // static serverIP = '172.16.121.31';
     //static serverIP = '192.168.134.36';
    static serverIP = 'app.bilgiyuvamanaokulu.com';
    // static serverPort = ':8080';
    static serverPort = '';

    // static apiURL = "http://172.16.121.31:8080/OkulApp-web/webresources/api/";
    // static wsURL = "http://172.16.121.31:8080/OkulApp-web/ws";
    static apiURL = this.serverProtocol + this.serverIP + this.serverPort + "/bilgiyuvam/webresources/api/";
    static wsURL = this.serverWSProtocol + this.serverIP + this.serverPort + "/bilgiyuvam/ws";

    static ws = null;

    static userName = "";
    static pass = "";
    static token = "";
    static tokenEndDate = new Date();
    static userRole = "";
    static unreadedBoard = 0;
    static unreadedMessages = 0;

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
                'Content-Type': 'application/x-www-form-urlencoded'
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
                    OkulApi.refreshUnreadedInfos();
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

    static refreshUnreadedInfos(){
        setTimeout(() => {
            OkulApi.getUnreadedBoard();
            OkulApi.getUnreadedMessages();
        }, 500);
    }

    static setPushToken(token) {
        this.refreshToken().then(() => {
            var record = {
                userName: OkulApi.userName,
                token: token
            };
            return fetch(this.apiURL + 'setPushToken', {
                method: 'POST',
                headers: {
                    Accept: 'application/json;charset=UTF-8',
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Authorization': OkulApi.token
                },
                body: JSON.stringify(record),
            });
        });
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

    static getStudentParentsOfClass(classId, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getStudentParentsOfClass?classId=' + classId.$oid, {
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

    static getDailyInspection(successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getDailyInspection', {
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


    static setInspectionStatusOfStudent(student, comeIn, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            var record = student;
            record.comeIn = comeIn;
            fetch(this.apiURL + 'setInspectionStatusOfStudent', {
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


    static getDailyActivity(classId, activityType, meal, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getDailyActivity?classId=' + classId.$oid + '&activityType=' + activityType + '&meal=' + meal, {
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


    static setMealStatusOfStudent(classId, activityType, meal, student, status, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            var record = student;
            record.meal = meal;
            record.status = status;
            record.class = classId;
            record.activityType = activityType;
            fetch(this.apiURL + 'setMealStatusOfStudent', {
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

    static setSleepStatusOfStudent(classId, activityType, student, status, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            var record = student;
            record.status = status;
            record.class = classId;
            record.activityType = activityType;
            fetch(this.apiURL + 'setSleepStatusOfStudent', {
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

    static setEmotionStatusOfStudent(classId, activityType, student, status, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            var record = student;
            record.status = status;
            record.class = classId;
            record.activityType = activityType;
            fetch(this.apiURL + 'setEmotionStatusOfStudent', {
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

    static getStudentsOfClass(classId, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getStudentsOfClass?classId=' + classId.$oid, {
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

    static getUnreadedMessages(successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getUnreadedMessages', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json;charset=UTF-8',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Authorization': OkulApi.token
                    }
                }).then((response) => response.json())
                .then((response) => {
                    OkulApi.unreadedMessages = response != null && response.list != null ? response.list.length : 0;
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

    static getUnreadedMessagesInChat(chatId, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getUnreadedMessagesInChat?chatId='+chatId, {
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
                    this.unreadedBoard = response.list != null ? response.list.length : 0;
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

    static setReadedAllBoard(successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'setReadedAllBoard', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json;charset=UTF-8',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Authorization': OkulApi.token
                    }
                }).then((response) => response.json())
                .then((response) => {
                    if (response.result && successCalback != null) {
                        OkulApi.unreadedBoard = 0;
                        successCalback(response.result);
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

    static async uploadImageFile(photo, Platform, successCalback, errroCallBack) {
        const token = await this.refreshToken();
        let xhr = new XMLHttpRequest();
        const prms = new Promise(function (resolve, reject) {
            let json = JSON.stringify({
                base64: photo.b64,
                mimeType: photo.mimeType
            });
            xhr.onreadystatechange = (e) => {
                if (xhr.readyState !== 4) {
                    return;
                }
                const jsonBody = JSON.parse(xhr.responseText);
                if (xhr.status === 200 && jsonBody != null && jsonBody.fileId != null) {
                    resolve(jsonBody);
                } else {
                    reject('ERROR : file upload is failed.');
                }
            };

            xhr.open("POST", OkulApi.apiURL + 'uploadImageFile');
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.setRequestHeader('Authorization', OkulApi.token);
            xhr.send(json);
        });
        return prms;
    }

    static insertNotifyMessage(notifyState, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            var record = {
                "messageType": notifyState.messageType,
                "receivers": notifyState.receiverUsers,
                "receiversNS": notifyState.receiverNS,
                "message": notifyState.message,
                "fileIds": notifyState.fileIds,
                "thumbFileIds": notifyState.thumbFileIds,
            };
            fetch(this.apiURL + 'insertNotifyMessage', {
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

    static getFoodCalendar(month, successCalback, errroCallBack) {
        this.refreshToken().then(() => {
            fetch(this.apiURL + 'getFoodCalendar?month=' + month, {
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
                    OkulApi.refreshUnreadedInfos();
                    if (jsonData.message == "updatechat" && OkulApi.currentChat != null && OkulApi.currentChat._id != null) {
                        OkulApi.refreshChat();
                    }
                    if (jsonData.message == "updatenotify") {
                        OkulApi.refreshUnreadedInfos();
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