const mysql = require('mysql');
const fs = require("fs");
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
let db1 = mysql.createConnection(config);
db1.connect(function(err) {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
});

module.exports = function(contact){
    this.contact = contact;
    this.element = function (element1){
        let sql = `UPDATE avatar SET ELEMENT = "${element1}" WHERE Tel = "${this.contact}" AND MORT_AVATAR = 0`;
        db.query(sql, ['true'], (err, rows) => {
            console.log('Mise à jour de l element effectuée');
        })
    };
    this.addClass = function (classe){
        let sql = `UPDATE avatar SET CLASSE_AVATAR = "${classe}" WHERE Tel = "${this.contact}" AND MORT_AVATAR = 0`;
        db.query(sql, ['true'], (err, rows) => {
            console.log('Mise à jour de la Classe effectuée');
        })
    };
    this.addTechnique = function (nom_technique, desc_technique){
        let sql = `SELECT * FROM avatar WHERE Tel = "${this.contact}" AND MORT_AVATAR = 0`;
        db.query(sql, ['true'], (err, rows) => {
            let sql1 = `INSERT INTO technique (ID_AVATAR, NOM_TECHNIQUE, DESCRIPTION_TECHNIQUE, ELEMENTAIRE)
                        VALUES('${rows[0].ID_AVATAR}', "${nom_technique}", "${desc_technique}", '1');`;
            db1.query(sql1, ['true'], (err, rows1) => {
                console.log(sql1);
                console.log('Nouvelle technique ajoutée');
            })
        })
    };
    this.addCarte = function (){
        let sql = `UPDATE avatar SET CARTE_AVATAR = 1 WHERE Tel = "${this.contact}" AND MORT_AVATAR = 0`;
        db.query(sql, ['true'], (err, rows) => {
            console.log('Mise à jour de la Carte effectuée');
        })
    };
    this.addJob = function (job){
        let sql = `SELECT * FROM avatar WHERE Tel = "${this.contact}" AND MORT_AVATAR = 0`;
        db.query(sql, ['true'], (err, rows) => {
            job = rows[0].JOB_AVATAR + '; ' + job;
            let sql1 = `UPDATE avatar SET JOB_AVATAR = '${job}' WHERE Tel = "${this.contact}" AND MORT_AVATAR = 0`;
            db1.query(sql1, ['true'], (err, rows1) => {
                console.log(sql1);
                console.log('Nouveau job ajouté');
            })
        })
    };
    this.addSalaire = function (salaire){
        let sql = `SELECT * FROM avatar WHERE Tel = "${this.contact}" AND MORT_AVATAR = 0`;
        db.query(sql, ['true'], (err, rows) => {
            salaire = rows[0].SALAIRE_AVATAR + '; ' + salaire;
            let sql1 = `UPDATE avatar SET SALAIRE_AVATAR = '${salaire}' WHERE Tel = "${this.contact}" AND MORT_AVATAR = 0`;
            db1.query(sql1, ['true'], (err, rows1) => {
                console.log(sql1);
                console.log('Nouveau salaire ajouté');
            })
        })
    };
    this.mortAvatar = function (){
        let sql = `UPDATE avatar SET MORT_AVATAR = 1 WHERE Tel = "${this.contact}" AND MORT_AVATAR = 0`;
        db.query(sql, ['true'], (err, rows) => {
            console.log('Mort de l avatar effectuée');
        })
    };
    this.vieAvatar = function (code){
        let sql = `UPDATE avatar SET MORT_AVATAR = 0 WHERE Tel = "${this.contact}" AND ID_AVATAR = "${code}"`;
        db.query(sql, ['true'], (err, rows) => {
            console.log('Resurrection de l avatar effectuée');
        })
    };
    this.addStory = function (story){
        let sql = `SELECT * FROM avatar WHERE Tel = "${this.contact}" AND MORT_AVATAR = 0`;
        db.query(sql, ['true'], (err, rows) => {
            if(rows[0].HISTOIRE_AVATAR == "Cet avatar n'a pas d'histoire"){
                story = story+'\n'
            }else{
                story = rows[0].HISTOIRE_AVATAR + story + '\n';
            }
            let sql1 = `UPDATE avatar SET HISTOIRE_AVATAR = "${story}" WHERE Tel = "${this.contact}" AND MORT_AVATAR = 0`;
            db1.query(sql1, ['true'], (err, rows1) => {
                console.log(sql1);
                console.log('Nouvelle histoire ajoutée');
            })
        })
    };
}
