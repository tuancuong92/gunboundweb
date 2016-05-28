'use strict';

let express = require('express');
let router = express.Router();
let async = require('async');
let mysql = require('mysql');

/**
 * 
 * UTILITIES
 */



/**
 * 
 */

let connectOptions = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: ''
};

function databaseConnect(option, callback){
    let connection = mysql.createConnection(option);

    connection.connect((err) => {
        if (err) return callback(err.stack);

        callback(null, connection);
    });
}

let appHome = function(req, res) {
    res.send('respond with a resource');
};

let appRegister = function (req, res) {
    let id = req.body.id;
    let password = req.body.password;
    let email = req.body.email;
    let gender = req.body.gender;
    let country = req.body.country;
    let adminCode = req.body.adminCode;
    
    //validate data
    if (!id || !password || !email || !country) {
        return res.json({status: false, error: "Nhập đầy đủ nội dung hộ cái ông ơi!"})
    }
    
    //registration default
    const admin = (adminCode && adminCode === '12369874'); // :))
    const superuser = 0;
    const superuseritem = 204801;
    let rank = 19;
    const gp = 1000;
    const gold = 999999999;
    const cash = 999999999;
    let auth = 1; //default 1, GM 99, admin 100

    const db_name = 'gunbound';
    connectOptions.database = db_name;

    if (admin) {
        auth = 100;
        rank = 20;
    }

    let reguser = `INSERT INTO ${db_name}.user (` +
        `Id ,user ,Gender ,NickName ,Password ,Status ,MuteTime ,RestrictTime ,Authority ,E_Mail ,Country ,User_Level ,Authority2)` +
        ` VALUES (` +
        `'${id}', '${id}', '${gender}', '${id}', '${password}', '1', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '${auth}', '${email}', '${country}', '1', '${auth}');`;

    let reggunwcuser = `INSERT INTO ${db_name}.gunwcuser (` +
        `Id ,user ,Gender ,NickName ,Password ,Status ,MuteTime ,RestrictTime ,Authority ,E_Mail ,Country ,User_Level ,Authority2,AuthorityBackup)` +
        ` VALUES (` +
        `'${id}', '${id}', '${gender}', '${id}', '${password}', '1', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '${auth}', '${email}', '${country}', '1', '${auth}', '${auth}');`;

    let reggame = `INSERT INTO ${db_name}.game (` +
        `Id ,Nickname ,Guild ,MemberCount ,GuildRank ,Money ,EventScore0 ,EventScore1 ,EventScore2 ,EventScore3 ,AvatarWear ,Prop1 ,Prop2 ,AdminGift ,TotalScore ,SeasonScore ,TotalGrade ,SeasonGrade ,TotalRank ,SeasonRank ,AccumShot ,AccumDamage ,StageRecords ,MobileRecords ,LastUpdateTime ,NoRankUpdate ,ClientData ,Country ,CountryGrade ,CountryRank ,GiftProhibitTime)` +
        ` VALUES ('${id}', '${id}', '', '0', '0', '${gold}', '0', '0', '0', '0', '0', '0', '0', '0', '${gp}', '${gp}', '${rank}', '${rank}', '0', '0', '0', '0', '0', '0', '0000-00-00 00:00:00', '0', '0', '${country}', '${rank}', '0', '0000-00-00 00:00:00'` +
        `)`;

    let regcash = `INSERT INTO ${db_name}.cash (Id,Cash) VALUES ('${id}','${cash}')`;

    let regsuperuser = `INSERT INTO ${db_name}.chest (Item,Wearing,Acquisition,Volume,Owner,ExpireType) VALUES ('${superuseritem}','1','C','1','${id}','I')`;
    
    function checkIdExists(id, connection, callback) {
        let checkQuery = `SELECT * FROM user WHERE id='${id}';`;
        
        connection.query(checkQuery, (err, results) => {
            if (err) {
                return callback(err);
            }
            
            if (!results || results.length === 0) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        });
    }
    
    function register(connection, callback){
        async.series([
            function (cb) {
                console.log(reguser);
                connection.query(reguser, cb);
            },
            function (cb) {
                console.log(reggunwcuser);
                connection.query(reggunwcuser, cb);
            },
            function (cb) {
                console.log(reggame);
                connection.query(reggame, cb);
            },
            function (cb) {
                console.log(regcash);
                connection.query(regcash, cb);
            },
            function (cb) {
                if (!superuser) {
                    return cb();
                }
                
                connection.query(regsuperuser, cb);
            }
        ], callback);
    }
    
    databaseConnect(connectOptions, (err, connection) => {
        if (err) return res.send('connect error');
        
        checkIdExists(id, connection, (err, status) => {
            if (err) return res.json({status: false, message: 'SQL error'});
            
            if (!status) return res.json({status: false, message: 'Id này đã có thằng khác xài rồi, xin vui lòng chọn cái khác!'});

            register(connection, (err) => {
                if (err) return res.json({status: false, error:'Lỗi cmnr!'});

                res.json({status: true, message: 'Done!'});
            });
        });
    });
};

router.get('/', appHome);
router.post('/register', appRegister);

module.exports = router;
