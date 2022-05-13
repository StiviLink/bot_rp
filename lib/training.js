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
module.exports = function(){
    this.typeTraining = function(nom, lieu, niveau){
        let fiche = `*${nom}, vous devez vous trouver dans un lieu d'entrainement pour pouvoir vous entrainer*`
        if(lieu===1){
            fiche = `*_${nom}_ vous êtes au niveau _${niveau}_!*\n\nVous avez le droit choisir un type d'entrainement.
            \n*->Type 1 :* _Pour le mode évolution et ainsi vous entrainer pour évoluer en gagnant des XP_
            \n*->Type 2 :*_Pour le mode technique! Ici vous vous entrainez 03 fois d'affilée et ne gagnez pas de XP mais apprendrez une nouvelle technique à la fin._`
        }
        return fiche;
    }
    this.listTraining = function(nom, type, lieu, training){
        let fiche = `*${nom}, vous devez vous trouver dans un lieu d'entrainement pour pouvoir vous entrainer*`
        if(lieu === 1){
            if(type === 1){
                let i;
                let liste = [];
                fiche = `*_${nom}_, BIENVENUE DANS LE TRAINING MODE🕯️*\n\n_LISTE DES ENTRAINEMENTS DISPONIBLES_\n\n`;
                let corp = ``;
                for (i = 0; i < training.length; i++) {
                    if(training[i].TYPE_TRAINING === 1){
                        type = `*TYPE :* _${training[i].NOM_TRAINING}_\n\n`
                        liste[i] = `*[-----------------------]*\n*==>ENTRAINEMENT N°${i+1} DE* _${training[i].PNJ_TRAINING}_
*NIVEAU REQUIS:* _${training[i].NIVEAU_TRAINING}_
*RECOMPENSES :* _${training[i].RECOMPENSES_TRAINING}_\n`;
                        corp += liste[i];
                    }else {
                        type = ``;
                        corp = `*[-----------------------]*\n*Aucun entrainement de ce type n'est disponible pour le moment...*\n`;
                    }
                }
                fiche += `${type} ${corp} *[-----------------------]*`;
            }else{
                let i;
                let liste = [];
                fiche = `*_${nom}_, BIENVENUE DANS LE TRAINING MODE🕯️*\n\n_LISTE DES ENTRAINEMENTS DISPONIBLES_\n\n`;
                let corp = ``;
                for (i = 0; i < training.length; i++) {
                    if(training[i].TYPE_TRAINING === 0){
                        type = `*TYPE :* _${training[i].NOM_TRAINING}_\n\n`
                        liste[i] = `*[-----------------------]*\n*==>ENTRAINEMENT N°${i+1} DE* _${training[i].PNJ_TRAINING}_
*NIVEAU REQUIS:* _${training[i].NIVEAU_TRAINING}_
*RECOMPENSES :* _${training[i].RECOMPENSES_TRAINING}_\n`;
                        corp += liste[i];
                    }
                }
                fiche += `${type} ${corp} *[-----------------------]*`;
            }
        }
        return fiche;
    };
    this.infoTrainingJoueur = function (training, i, nom) {
        let fiche = `*INFORMATIONS SUR L'ENTRAINEMENT N°${i} DE * _${training.PNJ_TRAINING}_\n
*[-----------------------]*\n*DESCRIPTION :* _${training.DESC_TRAINING}_
*NIVEAU REQUIS :* _${training.NIVEAU_TRAINING}_
*RECOMPENSES :* _${training.RECOMPENSES_TRAINING}_
*ACCEPTER :* _*${nom}*, Repondez à ce message avec ✅ pour accepter cette mission_
*REFUSER :* _*${nom}*, Repondez à ce message avec ❌ pour refuser cette mission_\n*[-----------------------]*`;
        return fiche;
    };
    this.ficheTrainingAll = function (training, training1) {
        let i;
        let participants = [];
        let liste = [];
        let fiche = `_*ENTRAINEMENT EN COURS*_\n\n`;
        for (i = 0; i < training1.length; i++) {
            participants[i] = ``;
            for(let j = 0; j<training.length; j++){
                if(training1[i].ID_TRAINING===training[j].ID_TRAINING){
                    participants[i] += `_${training[j].NOM_AVATAR}(@${training[j].Tel})_\n`
                }
            }
            if(participants[i] !== ``) {
                liste[training1[i].ID_TRAINING - 1] = `*[-----------------------]*\n\n*ENTRAINEMENT ${i + 1}*
*TYPE :* _${training1[i].NOM_TRAINING}_ 
*NIVEAU RECQUIS :* _${training1[i].NIVEAU_TRAINING}_
*ENTRAINEUR :* _${training1[i].PNJ_TRAINING}_
*PARTICIPANTS :* ${participants[i]}
*RECOMPENSES :* _${training1[i].RECOMPENSES_TRAINING}_\n\n`;
                fiche += liste[training1[i].ID_TRAINING - 1];
            }else{
                liste[training1[i].ID_TRAINING - 1] = ``;
            }
        }
        fiche += `*[-----------------------]*`;
        return fiche;
    };
    this.refuserTraining = function (user) {
        let refus = `*_${user}_ Vous avez refusé cet entrainement*`
        return refus;
    };
    this.updateStatutTraining = function (idUser, statut) {
        let sql = `UPDATE avatar_et_training SET REALISATION = ${statut} WHERE ID_AVATAR = "${idUser}"`;
        db.query(sql, ['true'], (err, rows) => {
            console.log('Mise à jour training effectuée');
        })
    };
    this.addTrainingJoueur = function (idUser, idTraining) {
        let ladate = new Date();
        let date = ladate.getDate()+`/`+ladate.getMonth()+`/`+ladate.getFullYear();
        let sql = `INSERT INTO avatar_et_training (ID_AVATAR, ID_TRAINING, DATE)
                        VALUES('${idUser}', '${idTraining}', '${date}');`;
        db.query(sql, ['true'], (err, rows) => {
            if (err) {
                msg.reply(err);
                console.log(err);
            } else {
                console.log('Mission d avatar enregistré');
            }
        })
        sql = `UPDATE aventure SET TRAINING = 2 WHERE ID_AVATAR = "${idUser}"`;
        db.query(sql, ['true'], (err, rows) => {
            console.log('Mise à jour du statut de training effectuée');
        })
        let result = `*Vous venez de debuter une nouvel entrainement*`;
        return result;
    };
    this.updateTrainingJoueur = function (idUser, idTraining, realisation, date) {
        let ladate = new Date();
        if (date === ladate.getDate()+`/`+ladate.getMonth()+`/`+ladate.getFullYear()) {
            if (realisation < 0){
                let sql = `UPDATE avatar_et_training SET REALISATION = 0 WHERE ID_AVATAR = "${idUser}"`;
                db.query(sql, ['true'], (err, rows) => {
                    console.log('Mise à jour du statut de la mission effectuée');
                })
                let result = `*Désolé mais vous avez atteint la limite d'entrainement de la journéé*`;
                return result;
            }else {
                let sql = `UPDATE aventure SET TRAINING = ${realisation} WHERE ID_AVATAR = "${idUser}"`;
                db.query(sql, ['true'], (err, rows) => {
                    console.log('Mise à jour du statut de training effectuée');
                })
                sql = `UPDATE avatar_et_training SET ID_TRAINING = ${idTraining}, DATE = '${ladate.getDate()+`/`+ladate.getMonth()+`/`+ladate.getFullYear()}', REALISATION = 1 WHERE ID_AVATAR = "${idUser}"`;
                db.query(sql, ['true'], (err, rows) => {
                    console.log('Mise à jour du statut de training effectuée');
                })
                let result = `*Vous venez de debuter un nouvel entrainement*`;
                return result;
            }
        } else {
            let sql = `UPDATE aventure SET TRAINING = 2 WHERE ID_AVATAR = "${idUser}"`;
            db.query(sql, ['true'], (err, rows) => {
                console.log('Mise à jour du statut de training effectuée');
            })
            sql = `UPDATE avatar_et_training SET ID_TRAINING = ${idTraining}, DATE = '${ladate.getDate()+`/`+ladate.getMonth()+`/`+ladate.getFullYear()}', REALISATION = 1 WHERE ID_AVATAR = "${idUser}"`;
            db.query(sql, ['true'], (err, rows) => {
                console.log('Mise à jour du statut de training effectuée');
            })
            let result = `*Vous venez de debuter un nouvel entrainement*`;
            return result;
        }
    };
}