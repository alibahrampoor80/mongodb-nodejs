const http = require('http')

const {MongoClient, ObjectId} = require('mongodb')
const url = require('url')
const DB_URL = 'mongodb://localhost:27017/nodejs'
let mongoClient, db;
(async () => {
    mongoClient = new MongoClient(DB_URL)
    await mongoClient.connect((err, client) => {
        db = mongoClient.db()

    })

})();


http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');



    const {url: path} = req
    let method = req.method.toLowerCase()
    let query = url.parse(path, true).query
    switch (path) {
        case "/users/insert":
            if (method == "post") {
                let data = []
                req.on("data", (chunk) => {
                    data.push(chunk.toString())
                })
                req.on('end', () => {
                    const {name, lastname, age} = JSON.parse(data)
                    db.collection('user').insertOne({name, lastname, age}, (err, result) => {
                        if (result.acknowledged) {
                            return res.end(JSON.stringify({_id: result.insertedId, name, lastname, age}))
                        }
                    })
                })
            }

            break
        case "/users/list":
            if (method == 'get') {
                db.collection("user").find({}).toArray((err, result) => {
                    if (!err) return res.end(JSON.stringify(result));
                    return res.end("Error")
                })

            }
            break
        default:
            if (method == "delete" && path.includes("/users?id=")) {
                const {id} = query;
                if (ObjectId.isValid(id)) {
                    db.collection('user').deleteOne({_id: ObjectId(id)}, (error, result) => {
                        if (!error) {
                            return res.end(JSON.stringify(result))
                        }
                        return res.end('Error in delete user')
                    })
                } else {
                    return res.end('objectId in not valid')
                }
            } else if (["patch", "put", "post"].includes(method) && path.includes("/users?id=")) {

                const {id,} = query;
                if (ObjectId.isValid(id)) {

                        let data = []
                    req.on('data', (chunk => {
                        data.push(chunk.toString())
                    }))
                    req.on('end', () => {
                        const result = JSON.parse(data)
                        // return res.end(JSON.stringify(result))
                        db.collection('user')
                            .updateOne({_id: ObjectId(id)}, {$set: {...result}}, (error, result) => {
                                if (!error) {
                                    return res.end(JSON.stringify(result))
                                }
                                return res.end('Error in delete user')
                            })
                    })
                } else {
                    return res.end('objectId in not valid')
                }
            }
            break;
    }

}).listen(4000, () => {
    console.log('server is run')
})