const WebSocket = require('ws');
const webSocketServer = new WebSocket.Server({port: 8080});

const fs = require('fs');
const path = require('path');
const http = require('http');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync');
const uuidv1 = require('uuid/v1');

const adapter = new FileSync('db.json');
const db = low(adapter);

// расскоментировать для удаления очистки БД при запуске сервера
// db.setState({});
db.defaults({ users: [] }).write();

const connections = new Map();

/**
 * Чтение body при запросах
 * @param req запрос
 */
function readBody(req) {
    return new Promise((resolve, reject) => {
        let dataRaw = '';

        req.on('data', (chunk) => (dataRaw += chunk));
        req.on('error', reject);
        req.on('end', () => resolve(JSON.parse(dataRaw)));
    });
}


// поднятие http сервера, для загрузки изображений
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader("Content-Type", "application/json");

    try {
        if (req.url.includes('upload-avatar')) {
            const body = await readBody(req);
            const [, content] = body.image.match(/data:image\/.+?;base64,(.+)/) || [];
            const filePath = path.resolve(__dirname, 'app/assets/avatars', `${body.id}.png`);

            if (body.id && content) {
                fs.writeFileSync(filePath, content, 'base64');
                db.get('users')
                    .find({id: body.id})
                    .assign({hasAvatar: true})
                    .write()

                broadcast( {type: 'avatarChanged', data: { userId: body.id }});
            } else {
                return res.end('fail');
            }
        }

        res.end('ok');
    } catch (e) {
        console.error(e);
        res.end('fail');
    }
});

webSocketServer.on('connection', function (socket) {
    console.log('connect');
    socket.on('message', function (clientData) {
        clientData = JSON.parse(clientData);
        const {type, data} = clientData;

        switch (type) {
            case 'login':
                console.log('login', data.nick);
                onLogin(socket, data);
                break;
            case 'enterToChat':
                console.log('enterToChat', data.user.nick);
                broadcast({type: 'enterToChat', data}, data.user.id);
                break;
            case 'message':
                broadcast({type: 'message', data});
                break;
        }
    });

    socket.on('close', function (code) {
        console.warn('closed', code);
        const userId = [...connections.entries()].find(([key, value]) => value === socket)[0];
        onLeaveFromChat(userId);
        connections.delete(userId);
    });

    socket.on('error', function (data) {
        console.error('error', data);
    });
});

server.listen(8081);

/**
 * Получение юзера из БД
 * @param nick ник юзера
 */
function getUser(nick) {
    return db
        .get('users')
        .find({nick: nick})
        .value();
}

/** Получение всех онлайн юзеров */
function getOnlineUsers(id) {
    return db
        .get('users')
        .filter(user => user.id !== id && user.online)
        .value()
}

/**
 * Обработка логина
 * @param data данные с клиента
 * @param socket соединение
 */
function onLogin(socket, data) {
    let user = getUser(data.nick);

    if (user) {
        user.online = true;
        const avatarExist = checkUserAvatar(user.id);
        db.get('users')
            .find({nick: data.nick})
            .assign({online: true, hasAvatar: avatarExist})
            .write()
    } else {
        db.get('users')
            .push({id: uuidv1(), nick: data.nick, online: true, hasAvatar: false})
            .write();
        user = getUser(data.nick);
    }

    connections.set(user.id, socket);

    const otherUsers = getOnlineUsers(user.id);

    const resp = {type: 'login', data: Object.assign({}, {user}, {otherUsers})};
    socket.send(JSON.stringify(resp));
}

/**
 * Проверяет наличие аватара у юзера
 * @param userId идентификатор юзера
 */
function checkUserAvatar(userId) {
    const imageName = `${userId}.png`;
    const filePath = path.resolve(__dirname, 'app/assets/avatars', imageName);

    return fs.existsSync(filePath);
}

/**
 * Обработка выхода юзера из чата
 * @param userId идентификатор юзера покинувшего чат
 */
function onLeaveFromChat(userId) {
    db.get('users')
        .find({id: userId})
        .assign({online: false})
        .write()

    broadcast({type: 'leaveFromChat', data: {user: {id: userId}}}, userId);
}

/**
 * Рассылка сообщений по всем соединениям
 * @param data данные
 * @param from от кого идёт рассылка
 */
function broadcast(data, from = null) {
    for (const [id, socket] of connections.entries()) {
        if (id === from) {
            continue;
        }
        socket.send(JSON.stringify(data));
    }
}
