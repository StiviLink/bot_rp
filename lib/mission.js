const mysql = require('mysql');
let config =({
    host: "localhost",
    user: "root",
    password: "",
    database : "bd_rp"
});
let db = mysql.createConnection(config);
db.connect(function(err) {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
});
module.exports = function () {
    this.listMission = function (mission) {
        let i;
        let liste = [];
        let fiche = `_*LISTE DES MISSIONS*_\n\n`;
        for (i = 0; i < mission.length; i++) {
            liste[mission[i].ID_MISSION - 1] = `*[-----------------------]*\n\n*MISSION ${i + 1} :* _${mission[i].NOM_MISSION}_
*RANG :* _${mission[i].RANG_MISSION}_
*LIEU :* _${mission[i].LIEU_MISSION}_
*EMPLOYEUR :* _${mission[i].PNJ_MISSION}_
*RECOMPENSES :* _${mission[i].RECOMPENSES_MISSION}_\n\n`;
            fiche += liste[mission[i].ID_MISSION - 1];
        }
        fiche += `*[-----------------------]*`;
        return fiche;
    };
    this.ficheMissionAll = function (mission, mission1) {
        let i;
        let participants = [];
        let liste = [];
        let fiche = `_*MISSIONS EN COURS*_\n\n`;
        for (i = 0; i < mission1.length; i++) {
            participants[i] = ``;
            for(let j = 0; j<mission.length; j++){
                if(mission1[i].ID_MISSION===mission[j].ID_MISSION){
                    participants[i] += `_${mission[j].NOM_AVATAR}(@${mission[j].Tel})_\n`
                }
            }
            if(participants[i] !== ``) {
                liste[mission1[i].ID_MISSION - 1] = `*[-----------------------]*\n\n*MISSION ${i + 1} :* _${mission1[i].NOM_MISSION}_
*RANG :* _${mission1[i].RANG_MISSION}_
*LIEU :* _${mission1[i].LIEU_MISSION}_
*EMPLOYEUR :* _${mission1[i].PNJ_MISSION}_
*PARTICIPANTS :* ${participants[i]}
*RECOMPENSES :* _${mission1[i].RECOMPENSES_MISSION}_\n\n`;
                fiche += liste[mission1[i].ID_MISSION - 1];
            }else{
                liste[mission1[i].ID_MISSION - 1] = ``;
            }
        }
        fiche += `*[-----------------------]*`;
        return fiche;
    };
    this.infoMission = function (mission, i) {
        let fiche = `_*INFORMATIONS SUR LA MISSION ${i}*_\n
*[-----------------------]*\n*MISSION ${i} :* _${mission.NOM_MISSION}_
*RANG :* _${mission.RANG_MISSION}_
*VILLAGE :* _${mission.VILLAGE_MISSION}_
*LIEU :* _${mission.LIEU_MISSION}_
*EMPLOYEUR :* _${mission.PNJ_MISSION}_
*DESCRIPTION :* _${mission.DESC_MISSION}_
*RECOMPENSES :* _${mission.RECOMPENSES_MISSION}_
*ACCEPTER ✅:* _Repondez à ce message avec ✅ pour accepter cette mission_
*REFUSER ❌:* _Repondez à ce message avec ❌ pour refuser cette mission_\n*[-----------------------]*`;
        return fiche;
    };
    this.infoMissionJoueur = function (mission, i, user) {
        let fiche = `_*INFORMATIONS SUR LA MISSION ${i}*_\n
*[-----------------------]*\n*MISSION ${i} :* _${mission.NOM_MISSION}_
*RANG :* _${mission.RANG_MISSION}_
*VILLAGE :* _${mission.VILLAGE_MISSION}_
*LIEU :* _${mission.LIEU_MISSION}_
*EMPLOYEUR :* _${mission.PNJ_MISSION}_
*DESCRIPTION :* _${mission.DESC_MISSION}_
*RECOMPENSES :* _${mission.RECOMPENSES_MISSION}_
*ACCEPTER :* _*${user}*, Repondez à ce message avec ✅ pour accepter cette mission_
*REFUSER :* _*${user}*, Repondez à ce message avec ❌ pour refuser cette mission_\n*[-----------------------]*`;
        return fiche;
    };
    this.refuserMission = function (user) {
        let refus = `*_${user}_ Vous avez refusé cette mission*`
        return refus;
    };
    this.updateStatutMissionJoueur = function (idUser, statut, mission) {
        let sql = `UPDATE aventure SET MISSION = ${statut}, ID_MISSION = ${mission} WHERE ID_AVATAR = "${idUser}"`;
        db.query(sql, ['true'], (err, rows) => {
            console.log('Mise à jour du statut de la mission effectuée');
        })
    };
    this.addMissionJoueur = function (idUser, idMission) {
        let ladate = new Date();
        let date = ladate.getDate()+`/`+ladate.getMonth()+`/`+ladate.getFullYear();
        let sql = `INSERT INTO avatar_et_mission (ID_AVATAR, ID_MISSION, DATE)
                        VALUES('${idUser}', '${idMission}', '${date}');`;
        db.query(sql, ['true'], (err, rows) => {
            if (err) {
                msg.reply(err);
                console.log(err);
            } else {
                console.log('Mission d avatar enregistré');
            }
        })
        let result = `*Vous venez de debuter une nouvelle mission*`;
        return result;
    };
    this.updateMissionJoueur = function (idUser, mission, realisation, date) {
        let ladate = new Date();
        if (date === ladate.getDate()+`/`+ladate.getMonth()+`/`+ladate.getFullYear()) {
            if (realisation < 0){
                let result = `*Désolé mais vous avez atteint la limite de réalisation de cette mission pour la journéé*`;
                return result;
            }else {
                let sql = `UPDATE avatar_et_mission SET REALISATION = ${realisation} WHERE ID_AVATAR = "${idUser}" AND ID_MISSION = "${mission}"`;
                db.query(sql, ['true'], (err, rows) => {
                    console.log('Mise à jour du statut de la mission effectuée');
                })
                let result = `*Vous venez de debuter une nouvelle mission*`;
                return result;
            }
        } else {
            let sql = `UPDATE avatar_et_mission SET REALISATION = 2, DATE = '${ladate.getDate()+`/`+ladate.getMonth()+`/`+ladate.getFullYear()}' WHERE ID_AVATAR = "${idUser}" AND ID_MISSION = "${mission}"`;
            db.query(sql, ['true'], (err, rows) => {
                console.log('Mise à jour du statut de la mission effectuée');
            })
            let result = `*Vous venez de debuter une nouvelle mission*`;
            return result;
        }
    };
}