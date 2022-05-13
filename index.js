const fs = require('fs');
const { Client, Buttons, MessageMedia, LocalAuth, List} = require('whatsapp-web.js');
const mysql = require('mysql');
let config =({
    host: "localhost",
    user: "root",
    password: "",
    database : "bd_rp"
});
let db = mysql.createConnection(config);
let db1 = mysql.createConnection(config);
let db2 = mysql.createConnection(config);
let db3 = mysql.createConnection(config);
let db4 = mysql.createConnection(config);
db.connect(function(err) {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
});
db1.connect(function(err) {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
});
db2.connect(function(err) {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
});
db3.connect(function(err) {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
});
db4.connect(function(err) {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
});

const MiseAjour = require('./lib/mise_a_jour.js');
const Menu = require('./lib/menu.js');
const PNJ = require('./lib/pnj.js');
const Missions = require('./lib/mission.js');
const Training = require('./lib/training.js');
const Combat = require('./lib/combat.js');
const Pavé = require('./lib/pave.js');
const Groupe = require('./function/groupes.js');
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }
});

client.initialize();

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});

client.on('message', async msg => {

    //Groupes
    let chat = await msg.getChat();
    if((await chat).isGroup){
        const contact = await msg.getContact();
        let num = contact.id._serialized;
        let group = new Groupe();
        let admins = group.verifAdmin(num, chat);
        if(msg.body.startsWith('->add ')){
            if(admins === 1){
                let number = msg.body.split(' ')[1];
                if(parseInt(number)==number){
                    number = number.includes('@c.us') ? number : `${number}@c.us`;
                    console.log(await client.getContactById(number));
                    if((await client.getContactById(number)).pushname !== undefined){
                        let addUser = group.verifParticipant(number, chat);
                        if(addUser===1){
                            await msg.reply(`*Ce contact est déjà membre de ce groupe*`);
                        }else{
                            chat.addParticipants([number]);
                        }
                    }
                    else{
                        await msg.reply(`*Désolé mais ce contact n'a pas whatsapp*`);
                    }
                }
            }else{
                msg.reply(`_*Vous n'avez pas le droit d'utiliser cette commande*_`);
            }
        }
        if(msg.body.startsWith('->remove @')){
            if(admins === 1){
                let number = msg.body.split('@')[1];
                if(parseInt(number)==number){
                    number = number.includes('@c.us') ? number : `${number}@c.us`;
                    console.log(await client.getContactById(number));
                    if((await client.getContactById(number)).pushname !== undefined){
                        let removeUser = group.verifParticipant(number, chat);
                        let admin = group.verifAdmin(number, chat);
                        if(removeUser===0){
                            await msg.reply(`*Veuillez taguer un membre de ce groupe*`, msg.to);
                        }else{
                            if(admin === 1){
                                await msg.reply(`*Le membre que vous essayez de retirer est un _ADMINISTRATEUR_ du groupe! Je vous prie de le faire manuellement!*\n\n_*MERCI*_`);
                            }else {
                                chat.removeParticipants([number]);
                            }
                        }
                    }
                    else{
                        await msg.reply(`*Désolé mais ce contact n'a pas whatsapp*`);
                    }
                }
            }else{
                msg.reply(`_*Vous n'avez pas le droit d'utiliser cette commande*_`);
            }
        }
    }

    //boutique
    if (msg.body === "menu_boutique") {
        if (msg._getChatId() === "120363039802202010@g.us") {
            let contact = await msg.getContact();
            let num = (await msg.getContact()).number;
            let chat = await msg.getChat();
            let sql = `SELECT boutique.* FROM boutique JOIN
                    avatar WHERE boutique.LOCALISATION_BOUTIQUE
                    = avatar.LOC_AVATAR AND avatar.Tel = ${num} AND avatar.MORT_AVATAR = 0`;
            db.query(sql, ['true'], (err, rows) => {
                if (err) {
                    throw err; msg.reply(error);
                }
                if (!rows[0]){
                    msg.reply(`*Désolé, mais les seuls capables d'utiliser cette commande sont les aventuriers d'Arcadias et mon maitre qui m'a conçu!*\n\n_Je vous prie de vous rapprocher de lui afin de savoir si votre fiche est enregistrée_\n\n*Merci*`)
                }else if(rows[0]){
                    chat.sendMessage(`*_Bienvenue ${'@'.concat(num)} dans la boutique ${rows[0].NOM_BOUTIQUE}!*_\n\n_${rows[0].DESCRIPTION_BOUTIQUE}_\n\n *Bien vouloir sélectionner une catégorie*`, {
                        mentions: [contact]
                    });
                    let sql1 = `SELECT catégorie_de_boutique.* FROM CATÉGORIE_DE_BOUTIQUE JOIN
                        catégorie_et_boutique JOIN boutique WHERE boutique.ID_BOUTIQUE = ${rows[0].ID_BOUTIQUE}
                        AND catégorie_et_boutique.ID_CAT = catégorie_et_boutique.ID_BOUTIQUE`;
                    db1.query(sql1, ['true'], async (err, rows1) => {
                        if (err) throw err;
                        let tab = [];
                        rows1.forEach(element => {
                                tab.push({title: `_*${element.NOM_CAT}*_`, description: `_${element.DESC_CAT}_`});
                            }
                        );
                        msg.reply(`*Pour effectuer un achat, Je vous prie de réaliser avec exactitude ce processus :*
                                         \n\n-Achat >Nom de la Catégorie\n >Code du produit à acheter >nom du produit >Quantité du produit
                                         \n\n *Vous ne pouvez effectuer qu'un achat par article pour le moment sans aucune mise en forme je vous prie*
                                         \n\n_Merci_`);
                        let sections = [{title: 'Catégories Disponibles', rows: tab}];
                        let list = new List('_Liste des catégories disponibles pour cette boutique_', `Appuyer ici`, sections, `CATÉGORIES`, '1111');
                        await msg.reply(list);
                    });
                }
            })
        } else {
            await msg.reply(`*Veuillez utiliser cette commande dans la boutique 〽️ 🅰️R©️🅰️💰I🅰️S  CH🅾️PS 〽️ _d'ARCADIAS!*_\n`);
        }
    }

    if (msg.from === "120363039802202010@g.us") {
        let contact = await msg.getContact();
        let num = (await msg.getContact()).number;
        let chat = await msg.getChat();
        try {
            let sql = `SELECT boutique.*, avatar.ID_AVATAR, possession.COMPTE FROM boutique JOIN
                         avatar ON boutique.LOCALISATION_BOUTIQUE = avatar.LOC_AVATAR JOIN possession
                         ON possession.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.Tel = ${num} AND avatar.MORT_AVATAR = 0`;
            db.query(sql, ['true'], (err, rows) => {
                if (err) {
                    throw err; msg.reply(error);
                }
                if(!rows[0]){
                    console.log(contact.pushname + `n'est pas enregistré`);
                }else if(rows[0]){
                    let id_avatar = rows[0].ID_AVATAR;
                    let id_boutique = rows[0].ID_BOUTIQUE;
                    let compte = rows[0].COMPTE;
                    console.log(compte);
                    let sql1 = `SELECT catégorie_de_boutique.* FROM catégorie_de_boutique JOIN 
                                    catégorie_et_boutique WHERE catégorie_et_boutique.ID_BOUTIQUE
                                    = ${rows[0].ID_BOUTIQUE} AND catégorie_de_boutique.ID_CAT = catégorie_et_boutique.ID_CAT`;
                    db1.query(sql1, ['true'], (err, rows1) =>{
                        if (err) throw err;
                        let nom = [];
                        let desc = [];
                        rows1.forEach(elements => {
                            nom.push(elements.NOM_CAT);
                            desc.push(elements.DESC_CAT);
                        });
                        for(let i=0; i<rows1.length; i++){
                            console.log(nom[i],  desc[i]);
                            if (msg.body === `_*${nom[i]}*_\n_${desc[i]}_`){
                                let sql2 = `SELECT * FROM ${nom[i]} WHERE ID_BOUTIQUE <= ${id_boutique} ORDER BY NOM`;
                                db2.query(sql2, ['true'], async (err, rows2) => {
                                    let categorie = `*CATÉGORIE ${nom[i]}*\n\n\n\n|-------------------------|*CODE- _NOM_* (TYPE) : _DESCRIPTION_\n*PRIX*\n|-------------------------|\n\n\n\n`;
                                    rows2.forEach(elements => {
                                        console.log(elements);
                                        categorie += `*${elements.ID}- _${elements.NOM}_* (${elements.TYPE}) : _${elements.DESCRIPTION}_\n*${elements.PRIX} £*\n\n|------------------------|\n\n`;
                                    });
                                    await msg.reply(categorie);
                                })
                            }
                            if (msg.body.startsWith('-Achat >')){
                                let re = /\s*(>|$)\s*/;
                                let achat = msg.body.split(re);
                                if (achat[2] == nom[i]){
                                    console.log(achat[4],  nom[i],  achat.length);
                                    let sql2 = `SELECT * FROM ${achat[2]} WHERE ID = '${achat[4]}'`;
                                    console.log(sql2);
                                    db2.query(sql2, ['true'], (err, rows2) =>{
                                        if(err){console.log('Erreur sql 170 :' + err)}
                                        console.log(rows2[0])
                                        if(!rows2[0] || achat.length > 10){
                                            msg.reply(`*Je vous prie de revoir votre syntaxe s'il vous plaît*\n\n_Notez qu'un seul achat par article n'est possible pour le moment`);
                                        } else if(rows[0].ID_BOUTIQUE >= rows2[0].ID_BOUTIQUE && achat.length < 10){
                                            let id_produit = rows2[0].ID;
                                            let duree = rows2[0].DUREE;
                                            let sql3 = `SELECT * FROM catégorie_et_avatar WHERE ID_PRODUIT = '${id_produit}' AND ID_AVATAR = '${id_avatar}'`;
                                            let tariff = compte - parseInt(achat[8])*rows2[0].PRIX;
                                            db3.query(sql3, ['true'], (err, rows3) =>{
                                                console.log(tariff, id_produit, id_avatar, rows3);
                                                console.log(sql3);
                                                if(!rows3[0]){
                                                    console.log('On est à la ligne 202! La requête est donc bien passée');
                                                    if (tariff < 0){
                                                        msg.reply(`*Votre compte est de ${compte}£ ce qui est insuffisant pour réaliser cette transaction*`);
                                                    }else if (tariff >= 0) {
                                                        let sql4 =`INSERT INTO catégorie_et_avatar (ID_AVATAR, ID_PRODUIT, NOM_PRODUIT, NOM_CATEGORIE, QTE, DURE)
                                                                    VALUES('${id_avatar}', '${achat[4]}', "${achat[6]}", '${achat[2]}', ${parseInt(achat[8])}, ${duree});`;
                                                        console.log(sql4);
                                                        db4.query(sql4, ['true'], (err, rows4) =>{
                                                            console.log('On est à la ligne 211! La requête est donc bien passée')
                                                            msg.reply(`*Achat éffectué*`);
                                                        });
                                                        sql4 = `UPDATE possession SET COMPTE = ${tariff} WHERE possession.ID_AVATAR = "${id_avatar}"`;
                                                        db4.query(sql4, ['true'], (err, rows4) =>{
                                                            msg.reply(`*Fiche mise à jour*\n\n*Solde avant :* ${compte}\n*Solde après :* ${tariff}\n\n_Je vous prie de vérifier en pv si votre fiche n'a pas d'erreur_\n\n*Merci*`);
                                                        });
                                                    }else {
                                                        msg.reply(`*Veuillez verifier la quantité que vous avez entré*`);
                                                    }
                                                } else if(rows3[0]){
                                                    let qte = rows3[0].QTE + parseInt(achat[8]);
                                                    if (tariff < 0){
                                                        msg.reply(`*Votre compte est de ${compte}£ ce qui est insuffisant pour réaliser cette transaction*`);
                                                    }else if (tariff >= 0) {
                                                        let sql4 =`UPDATE catégorie_et_avatar SET QTE = ${qte} WHERE ID_PRODUIT = "${achat[4]}" AND ID_AVATAR = "${id_avatar}"`;
                                                        db4.query(sql4, ['true'], (err, rows4) =>{
                                                            if (err) console.log(err);
                                                            msg.reply(`*Achat éffectué*`);
                                                        });
                                                        sql4 = `UPDATE possession SET COMPTE = ${tariff} WHERE possession.ID_AVATAR = "${id_avatar}"`;
                                                        db4.query(sql4, ['true'], (err, rows4) =>{
                                                            msg.reply(`*Fiche mise à jour*\n\n*Solde avant :* ${compte}\n*Solde après :* ${tariff}\n\n_Je vous prie de vérifier en pv si votre fiche n'a pas d'erreur_\n\n*Merci*`);
                                                        });
                                                    }else {
                                                        msg.reply(`*Veuillez verifier la quantité que vous avez entré*`);
                                                    }
                                                }
                                            })
                                        } else {
                                            msg.reply(`*Éssayez encore de frauder et vous serez sévèrement sanctionné*`);
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            })
        } catch (e) {
            console.log(e);
        }
    }

    //Fiche
    if(msg.body.startsWith('->fiche @')){
        try{
            let num = (await msg.getContact()).number;
            console.log('MESSAGE DE', (await msg.getContact()).number, (await msg.getChat()).name, '\n CONTENU', msg.body);
        }catch (e) {
            console.log(e);
        }
        let chat = await msg.getChat();
        if(msg._getChatId() === "120363021597404602@g.us"){
            let number = msg.body.split(' @')[1];
            let contac = (await client.getContactById(number.includes('@c.us') ? number : `${number}@c.us`));
            let sql = `SELECT avatar.*, possession.* FROM avatar
    JOIN possession ON avatar.ID_AVATAR = possession.ID_AVATAR  WHERE avatar.Tel = ${number} AND avatar.MORT_AVATAR = 0`;
            if(number == parseInt(number)){
                try{
                    db.query(sql, ['true'], (err, rows) => {
                        if (err) {throw err; msg.reply(error);
                            msg.reply(`*Désolé mais cette fiche n'est pas enregistrée*`)}
                        try {
                            if(!rows[0]){
                                msg.reply(`*Désolé mais cette fiche n'est pas enregistrée*`)}else
                            if (rows[0]) {
                                console.log(rows[0]);
                                let sql2 = `SELECT * FROM catégorie_et_avatar
                                                WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'
                                                  AND QTE > 0`;
                                let armes = ``;
                                let possession = ``;
                                let artefact = ``;
                                let potion = ``;
                                msg.reply(`*La fiche de ${rows[0].NOM_AVATAR} est enregistrée*`);
                                db2.query(sql2, ['true'], (err, rows2) => {
                                    if (err) {
                                        throw err;
                                    }
                                    if (!rows2[0]) {
                                        possession = `~Ne possède rien pour l'instant~`;
                                        artefact = `~Ne possède rien pour l'instant~`;
                                        potion = `~Ne possède rien pour l'instant~`;
                                    } else if (rows2[0]) {
                                        let count = 0;
                                        let category = [];
                                        let id_produit = [];
                                        let qte = [];
                                        rows2.forEach(element => {
                                            if(element.QTE === 1){
                                                qte = ``;
                                            }else {
                                                qte = `${element.QTE}`;
                                            }
                                            switch (element.NOM_CATEGORIE){
                                                case 'ARTEFACTS' :
                                                    artefact += `${qte}${element.NOM_PRODUIT}; `;
                                                    break;
                                                case 'ARMES' :
                                                    armes += `${qte}${element.NOM_PRODUIT}; `;
                                                    break;
                                                case 'POTIONS' :
                                                    potion += `${qte}${element.NOM_PRODUIT}; `;
                                                    break;
                                                default :
                                                    possession += `${qte}${element.NOM_PRODUIT}; `;
                                                    break;
                                            }
                                        });
                                    }
                                    if(artefact === ``){
                                        artefact = `~Ne possède rien pour l'instant~`;
                                    }
                                    if(potion === ``){
                                        potion = `~Ne possède rien pour l'instant~`;
                                    }
                                    if(possession === ``){
                                        possession = `~Ne possède rien pour l'instant~`;
                                    }
                                    fiche = `═══════
*FICHE D'UN JOUEUR ET ACQUIS  _${rows[0].ID_AVATAR}_* 
═══════
*NIVEAU:* ${rows[0].NIV_AVATAR} / *XP:* .${rows[0].XP_AVATAR}.
*GRADE: E*
 *Klimb (£) = _Monnaie d'échange_*

♨️ ⁩  ( *.@${contac.number}.* )
▪️ *NOM  ET PRENOM* : ${rows[0].NOM_AVATAR}
▪️ *ÂGE* : ${rows[0].AGE_AVATAR} ans
▪️ *SEXE* : ${rows[0].SEXE_AVATAR}
▪️ *RACE* : ${rows[0].RACE_AVATAR}
▪️ *ELEMENT* : ${rows[0].ELEMENT}
▪️ *CLASSE* : ${rows[0].CLASSE_AVATAR}
▪️ *SOUS CLASSES* : ${rows[0].S_CLASS_AVATAR}     
▪️ *LOCALISATION* : ${rows[0].LOC_AVATAR}
▪️ *DESCRIPTION DU PERSONNAGE* : ${rows[0].DESC_AVATAR}

       *POSSESSION* 
▪️ *Compte Bancaire* : ${rows[0].COMPTE}£
▪️ *ÉQUIPEMENTS* : ${rows[0].ARME}; ${armes}
▪️ *POTIONS* : ${potion} 
▪️ *ARTEFACTS* : ${artefact} 
▪️ *APPARTENANCE A ( GROUPE ,GUILDE ,COMPAGNONS ...)*: ${rows[0].GUILDE}    
▪️ *POSSESSIONS* : ${possession}
              *AFFINITÉS*
▪   *FO* : ${rows[0].FORC}    ▪️ *INT* : ${rows[0].INTELLEC}
▪   *EN* : ${rows[0].ENDURANCE}    ▪️ *VI*  : ${rows[0].VITESSE} 
▪   *AG* : ${rows[0].AGILITE}    ▪️ *SA*  : ${rows[0].SAGESSE}     
▪   *MA* : ${rows[0].MAN}

  🌀️  *COMPÉTENCES PASSIVES OU TECHNIQUES PASSIVES*  ( 3 pour un début )`;
                                    let sql1 = `SELECT *
                                                FROM technique
                                                WHERE ID_AVATAR = '${rows[0].ID_AVATAR}' && ELEMENTAIRE = 0`;
                                    db1.query(sql1, ['true'], (err, rows1) => {
                                        if (err) throw err;
                                        let fiche2 = '';
                                        rows1.forEach(element =>

                                            fiche2 += ` 
                                    
 ▪️ *${element.NOM_TECHNIQUE}* : _${element.DESCRIPTION_TECHNIQUE}_`);
                                        let sql2 = `SELECT *
                                                FROM technique
                                                WHERE ID_AVATAR = '${rows[0].ID_AVATAR}' && ELEMENTAIRE = 1`;
                                        db2.query(sql2, ['true'], (err, rows2) => {
                                            if (err) throw err;
                                            let fiche3 = '';
                                            rows2.forEach(element =>

                                                fiche3 += `
 ▪️ *${element.NOM_TECHNIQUE}* : _${element.DESCRIPTION_TECHNIQUE}_`);


                                            fin = `
    
  🌀  *COMPÉTENCES ACTIVES OU TECHNIQUES ACTIVES*
  ${fiche3}
        

🌫️ HISTORIQUE 👁️‍🗨️:

*${rows[0].HISTOIRE_AVATAR}*

▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃\\`

                                            client.sendMessage(msg.from, fiche + fiche2 + fin, {
                                                mentions: [contac]
                                            })
                                        })
                                    })
                                });


                            }
                        }catch (e) {
                            console.log(e);
                        }
                    });

                }catch (e) {
                    console.log(e);
                    msg.reply(`Èrreur au niveau de la syntaxe`);
                }
            } else{
                msg.reply(`*Je vous prie de taguer un numero*\n \n _Merci_`)
            }
        }else {
            msg.reply(`*Cette commande n'est utilisable que dans la Base de données d'Arcadias!*\n\n_Par contre, si vous faites partie de l'univers d'Arcadias, vous pouvez consulter votre fiche en PV en utilisant la commande *->fiche me*_\n\nMERCI`)
        }
    }

    if(msg.body.startsWith('->fiche me')){
        try{
            let num = (await msg.getContact()).number;
            console.log('MESSAGE DE', (await msg.getContact()).number, (await msg.getChat()).name, '\n CONTENU', msg.body);
        }catch (e) {
            console.log(e);
        }
        let chat = await msg.getChat();
        if(!chat.isGroup){
            let contac = await msg.getContact();
            let sql = `SELECT avatar.*, possession.* FROM avatar
    JOIN possession ON avatar.ID_AVATAR = possession.ID_AVATAR  WHERE avatar.Tel = ${contac.number} AND avatar.MORT_AVATAR = 0`;
            try {
                db.query(sql, ['true'], (err, rows) => {
                    if (err) {
                        throw err;
                        msg.reply(error);
                        msg.reply(`*Désolé mais cette fiche n'est pas enregistrée*`)
                    }
                    try {
                        if (!rows[0]) {
                            msg.reply(`*Désolé mais cette fiche n'est pas enregistrée*`)
                        } else
                        if (rows[0]) {
                            console.log(rows[0]);
                            let sql2 = `SELECT * FROM catégorie_et_avatar
                                                WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'
                                                  AND QTE > 0`;
                            let armes = ``;
                            let possession = ``;
                            let artefact = ``;
                            let potion = ``;
                            msg.reply(`*La fiche de ${rows[0].NOM_AVATAR} est enregistrée*`);
                            db2.query(sql2, ['true'], (err, rows2) => {
                                if (err) {
                                    throw err;
                                }
                                if (!rows2[0]) {
                                    possession = `~Ne possède rien pour l'instant~`;
                                    artefact = `~Ne possède rien pour l'instant~`;
                                    potion = `~Ne possède rien pour l'instant~`;
                                } else if (rows2[0]) {
                                    rows2.forEach(element => {
                                        if(element.QTE === 1){
                                            qte = ``;
                                        }else {
                                            qte = `${element.QTE}`;
                                        }
                                        switch (element.NOM_CATEGORIE){
                                            case 'ARTEFACTS' :
                                                artefact += `${qte}${element.NOM_PRODUIT}; `;
                                                break;
                                            case 'ARMES' :
                                                armes += `${qte}${element.NOM_PRODUIT}; `;
                                                break;
                                            case 'POTIONS' :
                                                potion += `${qte}${element.NOM_PRODUIT}; `;
                                                break;
                                            default :
                                                possession += `${qte}${element.NOM_PRODUIT}; `;
                                                break;
                                        }
                                    });
                                }
                                if(artefact === ``){
                                    artefact = `~Ne possède rien pour l'instant~`;
                                }
                                if(potion === ``){
                                    potion = `~Ne possède rien pour l'instant~`;
                                }
                                if(possession === ``){
                                    possession = `~Ne possède rien pour l'instant~`;
                                }
                                fiche = `═══════
*FICHE D'UN JOUEUR ET ACQUIS  _${rows[0].ID_AVATAR}_* 
═══════
*NIVEAU:* ${rows[0].NIV_AVATAR} / *XP:* .${rows[0].XP_AVATAR}.
*GRADE: E*
 *Klimb (£) = _Monnaie d'échange_*

♨️ ⁩  ( *.@${contac.number}.* )
▪️ *NOM  ET PRENOM* : ${rows[0].NOM_AVATAR}
▪️ *ÂGE* : ${rows[0].AGE_AVATAR} ans
▪️ *SEXE* : ${rows[0].SEXE_AVATAR}
▪️ *RACE* : ${rows[0].RACE_AVATAR}
▪️ *ELEMENT* : ${rows[0].ELEMENT}
▪️ *CLASSE* : ${rows[0].CLASSE_AVATAR}
▪️ *SOUS CLASSES* : ${rows[0].S_CLASS_AVATAR}     
▪️ *LOCALISATION* : ${rows[0].LOC_AVATAR}
▪️ *DESCRIPTION DU PERSONNAGE* : ${rows[0].DESC_AVATAR}

       *POSSESSION* 
▪️ *Compte Bancaire* : ${rows[0].COMPTE}£
▪️ *ÉQUIPEMENTS* : ${rows[0].ARME}; ${armes}
▪️ *POTIONS* : ${potion} 
▪️ *ARTEFACTS* : ${artefact} 
▪️ *APPARTENANCE A ( GROUPE ,GUILDE ,COMPAGNONS ...)*: ${rows[0].GUILDE}    
▪️ *POSSESSIONS* : ${possession}
              *AFFINITÉS*
▪   *FO* : ${rows[0].FORC}    ▪️ *INT* : ${rows[0].INTELLEC}
▪   *EN* : ${rows[0].ENDURANCE}    ▪️ *VI*  : ${rows[0].VITESSE} 
▪   *AG* : ${rows[0].AGILITE}    ▪️ *SA*  : ${rows[0].SAGESSE}     
▪   *MA* : ${rows[0].MAN}

  🌀️  *COMPÉTENCES PASSIVES OU TECHNIQUES PASSIVES*  ( 3 pour un début )`;
                                let sql1 = `SELECT *
                                            FROM technique
                                            WHERE ID_AVATAR = '${rows[0].ID_AVATAR}' && ELEMENTAIRE = 0`;
                                db1.query(sql1, ['true'], (err, rows1) => {
                                    if (err) throw err;
                                    let fiche2 = '';
                                    rows1.forEach(element =>

                                        fiche2 += ` 
                                    
 ▪️ *${element.NOM_TECHNIQUE}* : _${element.DESCRIPTION_TECHNIQUE}_`);
                                    let sql2 = `SELECT *
                                                FROM technique
                                                WHERE ID_AVATAR = '${rows[0].ID_AVATAR}' && ELEMENTAIRE = 1`;
                                    db2.query(sql2, ['true'], (err, rows2) => {
                                        if (err) throw err;
                                        let fiche3 = '';
                                        rows2.forEach(element =>

                                            fiche3 += `
 ▪️ *${element.NOM_TECHNIQUE}* : _${element.DESCRIPTION_TECHNIQUE}_`);


                                        fin = `
    
  🌀  *COMPÉTENCES ACTIVES OU TECHNIQUES ACTIVES*
  ${fiche3}
        

🌫️ HISTORIQUE 👁️‍🗨️:

*${rows[0].HISTOIRE_AVATAR}*

▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃\\`

                                        client.sendMessage(msg.from, fiche + fiche2 + fin, {
                                            mentions: [contac]
                                        })
                                    })
                                })
                            });


                        }
                    } catch (e) {
                        console.log(e);
                    }
                });

            } catch (e) {
                console.log(e);
                msg.reply(`Èrreur au niveau de la syntaxe`);
            }
        }else {
            msg.reply(`*Cette commande n'est utilisable qu'en PV*`)
        }
    }

    if(msg.body === '->ajout help'){
        if(msg._getChatId() === "120363021597404602@g.us"){
            msg.reply(`*Bien vouloir suivre la syntaxe ci après pour enregistrer une fiche : *\n\n
            -Ajout >N°Fiche >Nom et Prenom de l'Avatar >Age de l'Avatar >Sexe de Avatar >@tag du joueur\n
            >Arme >FO >EN >AG >IN >VI >MA >SA\n
            >Nom_Technique >Description >Nom_Technique >Description >Nom_Technique >Description`);
        }else {
            msg.reply('*Désolé, mais vous ne pouvez utiliser cette comande que dans la Base De Données d\'Arcadias*\n\n_Merci_')
        }
    }

    if(msg.body.startsWith('-Ajout >')){
        if(msg._getChatId() === "120363021597404602@g.us"){
            //-Ajout >N°Fiche >Nom_Prenom_Avatar >Age_Avatar >Sexe_Avatar >Tel
            // >Arme >FO >EN >AG >IN >VI >MA >SA
            // >Nom_Technique >Description >Nom_Technique >Description >Nom_Technique >Description
            let re = /\s*(>|$)\s*/;
            let avatar = msg.body.split(re);
            let tel = avatar[10].split('@')[1];
            let sql = `SELECT * FROM avatar WHERE ID_AVATAR = '${avatar[2]}'`
            db.query(sql, ['true'], (err, rows) => {
                if (err) {
                    msg.reply(err);
                    console.log(err);
                }
                try {
                    if(rows[0]){
                        msg.reply('*Désolé, mais une fiche avec ce N° est déjà enregistrée, veuillez changer ce N°*\n\n_Merci_');
                    } else if(!rows[0]){
                        let sql1 = `INSERT INTO avatar (ID_AVATAR, NOM_AVATAR, AGE_AVATAR, SEXE_AVATAR, Tel)
                        VALUES('${avatar[2]}', "${avatar[4]}", "${avatar[6]}", "${avatar[8]}", ${tel});`;
                        db1.query(sql1, ['true'], (err, rows) => {
                            if(err){
                                msg.reply(err);
                                console.log(err);
                            }else{
                                console.log('Avatar enregistré');
                                msg.reply('Données du profil de l\'avatar enregistrées');
                            }
                        })
                        sql1 = `INSERT INTO possession (ID_AVATAR, ARME, FORC, ENDURANCE, AGILITE, INTELLEC, VITESSE, MAN, SAGESSE)
                        VALUES('${avatar[2]}', '${avatar[12]}', '${avatar[14]}', '${avatar[16]}', ${avatar[18]}, ${avatar[20]}, '${avatar[22]}', ${avatar[24]}, ${avatar[26]});`;
                        db1.query(sql1, ['true'], (err, rows) => {
                            if(err){
                                msg.reply(err);
                                console.log(err);
                            }else{
                                console.log('Compte enregistré');
                                msg.reply('Données de possession de l\'avatar enregistrées');
                            }
                        })
                        sql1 = `INSERT INTO technique (ID_AVATAR, NOM_TECHNIQUE, DESCRIPTION_TECHNIQUE)
                        VALUES('${avatar[2]}', "${avatar[28]}", "${avatar[30]}");`;
                        db1.query(sql1, ['true'], (err, rows) => {
                            if(err){
                                msg.reply(err);
                                console.log(err);
                            }else{
                                console.log('Technique 1 enregistrée');
                            }
                        })
                        sql1 = `INSERT INTO technique (ID_AVATAR, NOM_TECHNIQUE, DESCRIPTION_TECHNIQUE)
                        VALUES('${avatar[2]}', "${avatar[32]}", "${avatar[34]}");`;
                        db1.query(sql1, ['true'], (err, rows) => {
                            if(err){
                                msg.reply(err);
                                console.log(err);
                            }else{
                                console.log('Technique 2 enregistrée');
                            }
                        })
                        sql1 = `INSERT INTO technique (ID_AVATAR, NOM_TECHNIQUE, DESCRIPTION_TECHNIQUE)
                        VALUES('${avatar[2]}', "${avatar[36]}", "${avatar[38]}");`;
                        db1.query(sql1, ['true'], (err, rows) => {
                            if(err){
                                msg.reply(err);
                                console.log(err);
                            }else{
                                console.log('Technique 3 enregistrée');
                            }
                        })
                        msg.reply(`*Fiche enregistrée avec succès*\n\n*Prière d'entrer la commande ->fiche @tag pour vérifier que la fiche a bien été enregistrée*\n\n_Merci_`);
                    }
                }catch (e) {
                    console.log(e)
                }});
        }else {
            msg.reply('*Désolé, mais vous ne pouvez utiliser cette comande que dans la Base De Données d\'Arcadias*\n\n_Merci_')
        }
    }

    if(msg.body === '->update help'){
        if(msg._getChatId() === "120363021597404602@g.us"){
            await msg.reply(`*Avant de débuter, sachez que les items gagnés lors d'un évènement ne peuvent être mis à jour directement par maître mon dans la BD!*\n*Bien vouloir suivre la syntaxe ci après pour mettre à jour une fiche :*\n\n
                -Update >N°Fiche >Solde à ajouter >XP à ajouter >FO à ajouter >EN à ajouter >AG à ajouter >IN à ajouter >VI à ajouter >MA à ajouter >SA à ajouter`);
        }else {
            msg.reply('*Désolé, mais vous ne pouvez utiliser cette comande que dans la Base De Données d\'Arcadias*\n\n_Merci_')
        }
    }

    if(msg.body.startsWith('-Update >')){
        if(msg._getChatId() === "120363021597404602@g.us"){
            let re = /\s*(>|$)\s*/;
            let avatar = msg.body.split(re);
            if (avatar.length === 21){
                let id_avatar = avatar[2]
                let sql = `SELECT possession.*, avatar.XP_AVATAR, avatar.NIV_AVATAR FROM possession JOIN avatar ON 
                           possession.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.ID_AVATAR = '${id_avatar}'`;
                db.query(sql, ['true'], (err, rows) => {
                    if (err) {
                        msg.reply(err);
                        console.log(err);
                    }
                    try {
                        if(!rows[0]){
                            msg.reply('*Désolé, mais cette fiche n est pas enregistrée°*\n\n_Merci_');
                        } else if(rows[0]){
                            let XP = rows[0].XP_AVATAR;     let FO = rows[0].FORC + parseInt(avatar[8]);         let IN = rows[0].INTELLEC + parseInt(avatar[14]);
                            let Niv = rows[0].NIV_AVATAR;   let EN = rows[0].ENDURANCE + parseInt(avatar[10]);    let VI = rows[0].VITESSE + parseInt(avatar[16]);
                            let compte = rows[0].COMPTE;    let AG = rows[0].AGILITE + parseInt(avatar[12]);      let MA = rows[0].MAN + parseInt(avatar[18]);
                            let SA = rows[0].SAGESSE + parseInt(avatar[20]);   let tariff = compte + parseInt(avatar[4]);
                            if(XP + parseInt(avatar[6]) >= 100){
                                XP = XP + parseInt(avatar[6]) - 100;
                                Niv++;
                            }else if(XP + parseInt(avatar[6]) < 100 && XP + parseInt(avatar[6]) >= 0){
                                XP = XP + parseInt(avatar[6]);
                            }else if(XP + parseInt(avatar[6]) < 0){
                                XP = 100 + (XP + parseInt(avatar[6]));
                                Niv--;
                            }
                            let sql1 = `UPDATE avatar, possession SET avatar.XP_AVATAR = ${XP},
                                avatar.NIV_AVATAR = ${Niv}, possession.COMPTE = ${tariff}, possession.FORC = ${FO},
                                possession.ENDURANCE = ${EN}, possession.AGILITE = ${AG}, possession.INTELLEC = ${IN},
                                possession.VITESSE = ${VI}, possession.MAN = ${MA}, possession.SAGESSE = ${SA}
                                WHERE possession.ID_AVATAR = "${id_avatar}" AND avatar.ID_AVATAR = "${id_avatar}"`;
                            db1.query(sql1, ['true'], (err, rows) => {
                                if(err){
                                    msg.reply(err);
                                    console.log(err);
                                }else{
                                    msg.reply(`*Mise à jour éffectuée avec succès*`);
                                }
                            })
                        }
                    }catch (e) {
                        console.log(e)
                    }});
            }else {
                msg.reply(`*Je vous prie de revoir votre syntaxe*\n\n_Merci_`)
            }
        }else {
            msg.reply('*Désolé, mais vous ne pouvez utiliser cette comande que dans la Base De Données d\'Arcadias*\n\n_Merci_')
        }
    }

    //Carte d'identité

    if(msg.body.startsWith(`->carte me`)){
        let user = (await msg.getContact()).number;
        if(user){
            let sql = `SELECT * FROM avatar WHERE Tel = ${user} AND MORT_AVATAR = 0`;
            try {
                db.query(sql, ['true'], async (err, rows) => {
                    console.log(rows);
                    let contact = await client.getContactById(`${user}@c.us`);
                    if (err) {
                        console.log(err);
                    }
                    let carte = `*☀️CARTE AVENTURIER☀️*

 *---------------------------*
`;
                    try {
                        if (!rows[0]) {
                            msg.reply(`*Joueur Non Enregistré*`);
                        } else if (rows[0].CARTE_AVATAR === 1) {
                            let fin = ``;
                            let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'`;
                            db1.query(sql1, ['true'], async (err, rows1) => {
                                if (err) {
                                    console.log(err);
                                }
                                if(rows1[0]){
                                    console.log(rows1);
                                    let IN = rows1[0].INTELLEC;
                                    let VI = rows1[0].VITESSE; let AG = rows1[0].AGILITE; let MA = rows1[0].MAN;
                                    let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC; let SA = rows1[0].SAGESSE;
                                    let saut = AG/5; VI = VI/5; MA = MA/2; EN = 500/EN; let AS;
                                    if(FO>=0 && FO < 10){
                                        FO = (FO * 15)/9;
                                    }else if (FO>=10 && FO < 50){
                                        FO = (FO * 60)/49;
                                    }else if(FO >= 50 && FO <= 100){
                                        FO = FO;
                                    }
                                    if(SA >=0 && SA < 10){
                                        AS = 1;
                                    }else if(SA >=10 && SA < 30){
                                        AS = 2;
                                    }else if(SA >=30 && SA < 50){
                                        AS = 3;
                                    }else if(SA >=50 && SA < 80){
                                        AS = 5;
                                    }else if(SA >=80 && SA <= 100){
                                        AS = 10;
                                    }
                                    carte += `💳 *INFORMATIONS DE L'AVENTURIER ${rows[0].NOM_AVATAR}(@${contact.number})*
 *---------------------------*
 
*NIVEAU ⚜️:* _${rows[0].NIV_AVATAR}_
*XP 🔆:* _${rows[0].XP_AVATAR} XP_
*ELEMENT ⚛️:* _${rows[0].ELEMENT}_
*AGE 📔️:* _${rows[0].AGE_AVATAR} ans_
*CLASSE 💎:* _${rows[0].CLASSE_AVATAR}_
*JOB 💸:* _${rows[0].JOB_AVATAR}_
*SALAIRE 💰:* _${rows[0].SALAIRE_AVATAR}_
*COMPTE 💷:* _${rows1[0].COMPTE}£_

 *---------------------------*
*💠 AFFINITÉS*
 *---------------------------*
 
*Intelligence* : _${IN}_  *Saut* : _${Math.trunc(saut)}m_
*Portée* : _${Math.trunc(AG/3)}m_  *Actions Simultanées* : _${AS} Actions_
*Vitesse* : _${VI}m/s_  *Max Energie Consommée* : _${Math.trunc(EN)}PE_
*Gros Impact* : _-${Math.trunc(FO)}PH_  *Résistance* : _${Math.trunc(MA)}PH_
`;
                                    if(rows[0].IMAGE_AVATAR == ``){
                                        await msg.reply(carte, msg.from, {
                                            mentions : [contact]
                                        })
                                    }else {
                                        const img = await MessageMedia.fromFilePath(`${rows[0].IMAGE_AVATAR}`);
                                        await msg.reply(img, msg.from, {
                                            caption : carte,
                                            mentions : [contact]
                                        })
                                    }
                                }
                            });
                        } else if(rows[0].CARTE_AVATAR === 0){
                            await client.sendMessage(msg.from, `*L'utilisateur @${contact.number} n'a pas encore sa carte d'aventurier*\n\n_*Prière de vous rapprocher du modo suprême LINKID avec vos 2000£ afin de mettre sur pied votre carte d'aventurier, sans laquelle vous ne pourrez être considéré comme Aventurier*_\n\n_Merci_`, {
                                mentions: [contact]
                            })
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });
            }catch (e) {
                console.log(e);
            }
        }
    }


    //Monde Immersif
    if (msg._getChatId() === "120363039961384794@g.us" || msg._getChatId() === "120363039525322189@g.us") {
        let con = await msg.getContact();
        let number = con.number;
        let num = con.id._serialized;
        let group = new Groupe();
        let admins = group.verifAdmin(num, chat);
        let verdict = await msg.getQuotedMessage();
        let re = /\s*(>dep|$)\s*/;
        let re1 = /\s*(>item|$)\s*/;
        let dep = msg.body.split(re);
        let item = msg.body.split(re1);
        let ener = /\s*(>énergie|$)\s*/;
        let energie = msg.body.split(ener);
        if(energie.length > 1 && energie.length <= 3){
                let sql = `SELECT * FROM avatar WHERE Tel = '${number}' AND MORT_AVATAR = 0`;
                try {
                    db.query(sql, ['true'], async (err, rows) => {
                        if (err) {
                            console.log(err);
                        }
                        try {
                            if (!rows[0]) {
                                msg.reply(`*Le joueur n'est pas enregistré*`);
                            } else{
                                let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'`;
                                db1.query(sql1, ['true'], async (err, rows1) => {
                                    let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                    let combat = new Combat();
                                    let impact = combat.Impact(rows[0].NOM_AVATAR, parseInt(energie[2]), EN, FO);
                                    msg.reply(impact);
                                });
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    });
                }catch (e) {
                    console.log(e);
                };
        }else if(energie.length > 3){
            let j = 0;
            for(let i = 1; i < energie.length; i+=4){
                let sql = `SELECT * FROM avatar WHERE Tel = '${number}' AND MORT_AVATAR = 0`;
                try {
                    db.query(sql, ['true'], async (err, rows) => {
                        if (err) {
                            console.log(err);
                        }
                        try {
                            if (!rows[0]) {
                                msg.reply(`*Le joueur n'est pas enregistré*`);
                            } else{
                                let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'`;
                                db1.query(sql1, ['true'], async (err, rows1) => {
                                    let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                    let combat = new Combat();
                                    let impact = combat.Impact(rows[0].NOM_AVATAR, parseInt(energie[i+1]), EN, FO);
                                    j++;
                                    msg.reply(`*Action ${j}:* `+impact);
                                });
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    });
                }catch (e) {
                    console.log(e);
                };
            }
        }
        let energ = /\s*(>énergiElement|$)\s*/;
        let energiElement = msg.body.split(energ);
        if(energiElement.length > 1 && energiElement.length <= 3){
            let sql = `SELECT * FROM avatar WHERE Tel = '${number}' AND MORT_AVATAR = 0`;
            try {
                db.query(sql, ['true'], async (err, rows) => {
                    if (err) {
                        console.log(err);
                    }
                    try {
                        if (!rows[0]) {
                            msg.reply(`*Le joueur n'est pas enregistré*`);
                        } else if(rows[0].ELEMENT !== "N'en possède pas encore"){
                            let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'`;
                            db1.query(sql1, ['true'], async (err, rows1) => {
                                let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                let combat = new Combat();
                                let impact = combat.Impact(rows[0].NOM_AVATAR, parseInt(energie[2]), EN, FO);
                                msg.reply(impact);
                            });
                        }else{
                            msg.reply(`*${rows[0].NOM_AVATAR} ne dispose pas encore d'élément*`);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });
            }catch (e) {
                console.log(e);
            };
        }else if(energiElement.length > 3){
            let j = 0;
            for(let i = 1; i < energie.length; i+=4){
                let sql = `SELECT * FROM avatar WHERE Tel = '${number}' AND MORT_AVATAR = 0`;
                try {
                    db.query(sql, ['true'], async (err, rows) => {
                        if (err) {
                            console.log(err);
                        }
                        try {
                            if (!rows[0]) {
                                msg.reply(`*Le joueur n'est pas enregistré*`);
                            } else if(rows[0].ELEMENT !== "N'en possède pas encore"){
                                let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'`;
                                db1.query(sql1, ['true'], async (err, rows1) => {
                                    let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                    let combat = new Combat();
                                    let impact = combat.Impact(rows[0].NOM_AVATAR, parseInt(energie[i+1]), EN, FO);
                                    j++;
                                    msg.reply(`*Action ${j}:* `+impact);
                                });
                            }else{
                                msg.reply(`*${rows[0].NOM_AVATAR} ne dispose pas encore d'élément*`);
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    });
                }catch (e) {
                    console.log(e);
                };
            }
        }
        let energi = /\s*(>énergItem|$)\s*/;
        let energItem = msg.body.split(energi);
        if(energItem.length > 1 && energItem.length <= 7){
            console.log(energItem, energItem[2]);
            let sql = `SELECT catégorie_et_avatar.*, possession.FORC, possession.ENDURANCE, avatar.NOM_AVATAR FROM catégorie_et_avatar JOIN possession ON possession.ID_AVATAR = catégorie_et_avatar.ID_AVATAR JOIN avatar ON avatar.ID_AVATAR = catégorie_et_avatar.ID_AVATAR WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0 AND catégorie_et_avatar.NOM_PRODUIT = '${energItem[2]}' AND catégorie_et_avatar.QTE > 0`;
            try {
                db.query(sql, ['true'], (err, rows) => {
                    if (err) {
                        console.log(err);
                    }if(rows[0]){
                        let FO = rows[0].FORC; let EN = rows[0].ENDURANCE;
                        let categorie = rows[0].NOM_CATEGORIE; let id_produit = rows[0].ID_PRODUIT;
                        let id_avatar = rows[0].ID_AVATAR;  let produit = rows[0].NOM_PRODUIT;
                        let sql2 = `SELECT * FROM ${categorie} WHERE ID = '${id_produit}'`;
                        db2.query(sql2, ['true'], (err, rows2) => {
                            let impact = rows2[0].IMPACT;
                            if(impact){
                                let imp = parseInt(impact.substr(0, 2));
                                let signe = impact.substr(2, 1);
                                let affin = impact.substr(3);
                                console.log(impact, imp, signe, affin);
                                if(affin == 'FO'){
                                    if(signe == '*'){
                                        FO *= imp;
                                        if(FO>=0 && FO < 10){
                                            FO = (FO * 15)/9;
                                        }else if (FO>=10 && FO < 50){
                                            FO = (FO * 60)/49;
                                        }else if(FO >= 50 && FO <= 100){
                                            FO = FO;
                                        };
                                        let combat = new Combat();
                                        let impact = combat.ImpactItem(rows[0].NOM_AVATAR, parseInt(energItem[4]), EN, Math.trunc(FO));
                                        msg.reply(impact);
                                        console.log(impact);
                                    }
                                    if(signe == '+'){
                                        FO += imp;
                                        if(FO>=0 && FO < 10){
                                            FO = (FO * 15)/9;
                                        }else if (FO>=10 && FO < 50){
                                            FO = (FO * 60)/49;
                                        }else if(FO >= 50 && FO <= 100){
                                            FO = FO;
                                        };
                                        let combat = new Combat();
                                        let impact = combat.ImpactItem(rows[0].NOM_AVATAR, parseInt(energItem[4]), EN, Math.trunc(FO));
                                        msg.reply(impact);
                                        console.log(impact);
                                    }
                                }else{
                                    msg.reply(`*Cet item ne peut pas varier l'impact de vos attaques*`)
                                }
                            }else{
                                msg.reply(`*Cet item ne peut pas varier l'impact de vos attaques*`)
                            }
                        })
                    }else if(!rows[0]){
                        msg.reply(`*Cet arme ne fait pas partie de vos items*`)
                    }
                })
            }catch (e) {
                console.log(e);
            }
        }else if(energItem.length > 7){
            for(let i=1; i<energItem.length; i+=6){
                let sql = `SELECT catégorie_et_avatar.*, possession.FORC, possession.ENDURANCE, avatar.NOM_AVATAR FROM catégorie_et_avatar JOIN possession ON possession.ID_AVATAR = catégorie_et_avatar.ID_AVATAR JOIN avatar ON avatar.ID_AVATAR = catégorie_et_avatar.ID_AVATAR WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0 AND catégorie_et_avatar.NOM_PRODUIT = '${item[i+1]}' AND catégorie_et_avatar.QTE > 0`;
                try {
                    db.query(sql, ['true'], (err, rows) => {
                        if (err) {
                            console.log(err);
                        }if(rows[0]){
                            let FO = rows[0].FORC; let EN = rows[0].ENDURANCE;
                            let categorie = rows[0].NOM_CATEGORIE; let id_produit = rows[0].ID_PRODUIT;
                            let id_avatar = rows[0].ID_AVATAR;  let produit = rows[0].NOM_PRODUIT;
                            let qte = rows[0].QTE;  let duree = rows[0].DURE;
                            let sql2 = `SELECT * FROM ${categorie} WHERE ID = '${id_produit}'`;
                            console.log(sql2);
                            db2.query(sql2, ['true'], (err, rows2) => {
                                let impact = rows2[0].IMPACT;
                                if(impact){
                                    let imp = parseInt(impact.substr(0, 2));
                                    let signe = impact.substr(2, 1);
                                    let affin = impact.substr(3);
                                    console.log(impact, imp, signe, affin);
                                    if(affin == 'FO'){
                                        if(signe == '*'){
                                            FO *= imp;
                                            if(FO>=0 && FO < 10){
                                                FO = (FO * 15)/9;
                                            }else if (FO>=10 && FO < 50){
                                                FO = (FO * 60)/49;
                                            }else if(FO >= 50 && FO <= 100){
                                                FO = FO;
                                            };
                                            let combat = new Combat();
                                            let impact = combat.ImpactItem(rows[0].NOM_AVATAR, parseInt(energItem[i+3]), EN, Math.trunc(FO));
                                            msg.reply(impact);
                                        }
                                        if(signe == '+'){
                                            FO += imp;
                                            if(FO>=0 && FO < 10){
                                                FO = (FO * 15)/9;
                                            }else if (FO>=10 && FO < 50){
                                                FO = (FO * 60)/49;
                                            }else if(FO >= 50 && FO <= 100){
                                                FO = FO;
                                            };
                                            let combat = new Combat();
                                            let impact = combat.ImpactItem(rows[0].NOM_AVATAR, parseInt(energItem[i+3]), EN, Math.trunc(FO));
                                        }
                                    }else{
                                        msg.reply(`*Cet item ne peut pas varier l'impact de vos attaques*`)
                                    }
                                }else{
                                    msg.reply(`*Cet item ne peut pas varier l'impact de vos attaques*`)
                                }
                            })
                        }else if(!rows[0]){
                            msg.reply(`*Cet item ne fait pas partie de vos items*`)
                        }
                    })
                }catch (e) {
                    console.log(e);
                }
            }
        }

        if(verdict){
            if (verdict.fromMe){
                if(dep.length > 2){
                    let sql = `SELECT avatar.ID_AVATAR, possession.ENDURANCE, aventure.* FROM avatar JOIN possession ON avatar.ID_AVATAR = possession.ID_AVATAR JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0`;
                    try {
                        db.query(sql, ['true'], (err, rows) => {
                            if (err) {
                                console.log(err);
                            }if(rows[0]){
                                let PA = rows[0].P_ACTUELLE; let MD = dep[4];   let PE = rows[0].PE; let id_avatar = rows[0].ID_AVATAR;
                                let PS = dep[2]; let en = rows[0].ENDURANCE;    let dist = rows[0].DISTANCE;    let PS2 = rows[0].P_SUIVANTE;
                                let sql1 = `SELECT * FROM position WHERE NOM_POSITION = '${PA}' OR NOM_POSITION = '${PS}' ORDER BY DIST_CENTRE DESC`;
                                if (PE > 0){
                                    db1.query(sql1, ['true'], (err, rows1) => {
                                        console.log(rows1, rows1.length);
                                        if (err) {
                                            console.log(err);
                                        }
                                        if(rows1.length === 2){
                                            let DP1 = rows1[0].DIST_CENTRE; let CP1 = rows1[0].COTE_POSITION;
                                            let DP2 = rows1[1].DIST_CENTRE; let CP2 = rows1[1].COTE_POSITION;
                                            if (dist === 0){
                                                if (CP1 === CP2){
                                                    dist = DP1 - DP2;
                                                    if(MD == "Marchant" || MD == "Courant"){
                                                        switch (MD){
                                                            case `Marchant` :
                                                                dist = dist - en;
                                                                PE = PE - 1;
                                                                if(dist > 0){
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3);
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Déplacement de ${en}Km éffectué en direction de *${PS}* en marchant_
                                                            *Il te reste à présent ${dist}Km à parcourir avant l'arrivée*`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }else {
                                                                    PA = PS;
                                                                    PS = ``;
                                                                    dist = 0;
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', P_ACTUELLE = '${PA}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3)
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Vous êtes arrivés à *${PA}* en marchant_`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }
                                                                break
                                                            case `Courant` :
                                                                if (dist > en){
                                                                    PE = PE - 4;
                                                                }else {
                                                                    PE = PE - 2;
                                                                }
                                                                dist = dist - 2 * en;
                                                                if(dist > 0){
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Déplacement de ${2 * en}Km éffectué en direction de *${PS}* en courant_
                                                            *Il te reste à présent ${dist}Km à parcourir avant l'arrivée*`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }else {
                                                                    PA = PS;
                                                                    PS = ``;
                                                                    dist = 0;
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', P_ACTUELLE = '${PA}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows1) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else{
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Vous êtes arrivés à *${PA}* en courant_`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }
                                                        }
                                                    }else {
                                                        let sql2 = `SELECT transport.*, catégorie_et_avatar.ID_PRODUIT FROM transport JOIN catégorie_et_avatar ON catégorie_et_avatar.ID_PRODUIT = transport.ID WHERE catégorie_et_avatar.ID_AVATAR = '${id_avatar}' AND catégorie_et_avatar.NOM_PRODUIT = '${MD}'`;
                                                        db2.query(sql2, ['true'], (err, rows2) => {
                                                            console.log(rows2);
                                                            if (err) {
                                                                console.log(err);
                                                                msg.reply(`*Bien vouloir revoir la sysntaxe je vous prie*\n\n>dep DESTINATION >dep MOYEN DE DEPLACEMENT >dep`);
                                                            }else if (rows2[0]){
                                                                dist = dist - rows2[0].DIST * en;
                                                                PE = PE - rows2[0].IMP;
                                                                if(dist > 0){
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3);
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Déplacement de ${rows2[0].DIST * en}Km éffectué en direction de *${PS}* en ${MD}_
                                                            *Il te reste à présent ${dist}Km à parcourir avant l'arrivée*`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }else {
                                                                    PA = PS;
                                                                    PS = ``;
                                                                    dist = 0;
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', P_ACTUELLE = '${PA}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3)
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Vous êtes arrivés à *${PA}* en ${MD}_`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                        });
                                                    }
                                                }else if (CP1 !== CP2){
                                                    dist = DP1 + DP2;
                                                    if(MD == "Marchant" || MD == "Courant"){
                                                        switch (MD){
                                                            case `Marchant` :
                                                                dist = dist - en;
                                                                PE = PE - 1;
                                                                if(dist > 0){
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3);
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Déplacement de ${en}Km éffectué en direction de *${PS}* en marchant_
                                                            *Il te reste à présent ${dist}Km à parcourir avant l'arrivée*`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }else {
                                                                    PA = PS;
                                                                    PS = ``;
                                                                    dist = 0;
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', P_ACTUELLE = '${PA}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3)
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Vous êtes arrivés à *${PA}* en marchant_`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }
                                                                break
                                                            case `Courant` :
                                                                if (dist > en){
                                                                    PE = PE - 4;
                                                                }else {
                                                                    PE = PE - 2;
                                                                }
                                                                dist = dist - 2 * en;
                                                                if(dist > 0){
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Déplacement de ${2 * en}Km éffectué en direction de *${PS}* en courant_
                                                            *Il te reste à présent ${dist}Km à parcourir avant l'arrivée*`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }else {
                                                                    PA = PS;
                                                                    PS = ``;
                                                                    dist = 0;
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', P_ACTUELLE = '${PA}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows1) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else{
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Vous êtes arrivés à *${PA}* en courant_`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }
                                                                break;
                                                        }
                                                    }else {
                                                        let sql2 = `SELECT transport.*, catégorie_et_avatar.ID_PRODUIT FROM transport JOIN catégorie_et_avatar ON catégorie_et_avatar.ID_PRODUIT = transport.ID WHERE catégorie_et_avatar.ID_AVATAR = '${id_avatar}' AND catégorie_et_avatar.NOM_PRODUIT = '${MD}'`;
                                                        db2.query(sql2, ['true'], (err, rows2) => {
                                                            console.log(rows2);
                                                            if (err) {
                                                                console.log(err);
                                                                msg.reply(`*Bien vouloir revoir la sysntaxe je vous prie*\n\n>dep DESTINATION >dep MOYEN DE DEPLACEMENT >dep`);
                                                            }else if (rows2[0]){
                                                                dist = dist - rows2[0].DIST * en;
                                                                PE = PE - rows2[0].IMP;
                                                                if(dist > 0){
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3);
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Déplacement de ${rows2[0].DIST * en}Km éffectué en direction de *${PS}* en ${MD}_
                                                            *Il te reste à présent ${dist}Km à parcourir avant l'arrivée*`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }else {
                                                                    PA = PS;
                                                                    PS = ``;
                                                                    dist = 0;
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', P_ACTUELLE = '${PA}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3)
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Vous êtes arrivés à *${PA}* en ${MD}_`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            }else if(PS === PS2){
                                                if (CP1 === CP2){
                                                    dist = dist - en;
                                                    if(MD == "Marchant" || MD == "Courant"){
                                                        switch (MD){
                                                            case `Marchant` :
                                                                PE = PE - 1;
                                                                if(dist > 0){
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3);
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Déplacement de ${en}Km éffectué en direction de *${PS}* en marchant_
                                                            *Il te reste à présent ${dist}Km à parcourir avant l'arrivée*`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }else {
                                                                    PA = PS;
                                                                    PS = ``;
                                                                    dist = 0;
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', P_ACTUELLE = '${PA}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3)
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Vous êtes arrivés à *${PA}* en marchant_`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }
                                                                break
                                                            case `Courant` :
                                                                if (dist > en){
                                                                    PE = PE - 4;
                                                                }else {
                                                                    PE = PE - 2;
                                                                }
                                                                dist = dist - 2 * en;
                                                                if(dist > 0){
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Déplacement de ${2 * en}Km éffectué en direction de *${PS}* en courant_
                                                            *Il te reste à présent ${dist}Km à parcourir avant l'arrivée*`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }else {
                                                                    PA = PS;
                                                                    PS = ``;
                                                                    dist = 0;
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', P_ACTUELLE = '${PA}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows1) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else{
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Vous êtes arrivés à *${PA}* en courant_`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }
                                                                break;
                                                        }
                                                    }else {
                                                        let sql2 = `SELECT transport.*, catégorie_et_avatar.ID_PRODUIT FROM transport JOIN catégorie_et_avatar ON catégorie_et_avatar.ID_PRODUIT = transport.ID WHERE catégorie_et_avatar.ID_AVATAR = '${id_avatar}' AND catégorie_et_avatar.NOM_PRODUIT = '${MD}'`;
                                                        db2.query(sql2, ['true'], (err, rows2) => {
                                                            console.log(rows2);
                                                            if (err) {
                                                                console.log(err);
                                                                msg.reply(`*Bien vouloir revoir la sysntaxe je vous prie*\n\n>dep DESTINATION >dep MOYEN DE DEPLACEMENT >dep`);
                                                            }else if (rows2[0]){
                                                                dist = dist - rows2[0].DIST * en;
                                                                PE = PE - rows2[0].IMP;
                                                                console.log(dist);
                                                                if(dist > 0){
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = "${PS}", PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}";`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3);
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Déplacement de ${rows2[0].DIST * en}Km éffectué en direction de *${PS}* en ${MD}_
                                                            *Il te reste à présent ${dist}Km à parcourir avant l'arrivée*`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }else {
                                                                    PA = PS;
                                                                    PS = ``;
                                                                    dist = 0;
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', P_ACTUELLE = '${PA}', PE = ${PE} WHERE aventure.ID_AVATAR = '${id_avatar}'`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3)
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Vous êtes arrivés à *${PA}* en ${MD}_`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                        });
                                                    }
                                                }else if (CP1 !== CP2){
                                                    if(MD == "Marchant" || MD == "Courant"){
                                                        switch (MD){
                                                            case `Marchant` :
                                                                dist = dist - en;
                                                                PE = PE - 1;
                                                                if(dist > 0){
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3);
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Déplacement de ${en}Km éffectué en direction de *${PS}* en marchant_
                                                            *Il te reste à présent ${dist}Km à parcourir avant l'arrivée*`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }else {
                                                                    PA = PS;
                                                                    PS = ``;
                                                                    dist = 0;
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', P_ACTUELLE = '${PA}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3)
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Vous êtes arrivés à *${PA}* en marchant_`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }
                                                                break
                                                            case `Courant` :
                                                                if (dist > en){
                                                                    PE = PE - 4;
                                                                }else {
                                                                    PE = PE - 2;
                                                                }
                                                                dist = dist - 2 * en;
                                                                if(dist > 0){
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Déplacement de ${2 * en}Km éffectué en direction de *${PS}* en courant_
                                                            *Il te reste à présent ${dist}Km à parcourir avant l'arrivée*`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }else {
                                                                    PA = PS;
                                                                    PS = ``;
                                                                    dist = 0;
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', P_ACTUELLE = '${PA}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows1) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else{
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Vous êtes arrivés à *${PA}* en courant_`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }
                                                                break;
                                                        }
                                                    }else {
                                                        let sql2 = `SELECT transport.*, catégorie_et_avatar.ID_PRODUIT FROM transport JOIN catégorie_et_avatar ON catégorie_et_avatar.ID_PRODUIT = transport.ID WHERE catégorie_et_avatar.ID_AVATAR = '${id_avatar}' AND catégorie_et_avatar.NOM_PRODUIT = '${MD}'`;
                                                        db2.query(sql2, ['true'], (err, rows2) => {
                                                            console.log(rows2);
                                                            if (err) {
                                                                console.log(err);
                                                                msg.reply(`*Bien vouloir revoir la sysntaxe je vous prie*\n\n>dep DESTINATION >dep MOYEN DE DEPLACEMENT >dep`);
                                                            }else if (rows2[0]){
                                                                dist = dist - rows2[0].DIST * en;
                                                                PE = PE - rows2[0].IMP;
                                                                if(dist > 0){
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3);
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Déplacement de ${rows2[0].DIST * en}Km éffectué en direction de *${PS}* en ${MD}_
                                                            *Il te reste à présent ${dist}Km à parcourir avant l'arrivée*`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }else {
                                                                    PA = PS;
                                                                    PS = ``;
                                                                    dist = 0;
                                                                    let deplacement = ``
                                                                    let sql3 = `UPDATE aventure SET DISTANCE = ${dist}, P_SUIVANTE = '${PS}', P_ACTUELLE = '${PA}', PE = ${PE} WHERE aventure.ID_AVATAR = "${id_avatar}"`;
                                                                    db3.query(sql3, ['true'], (err, rows3) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            msg.reply(err)
                                                                        }else {
                                                                            console.log(rows3)
                                                                            deplacement = `*DÉPLACEMENT ÉFFECTUÉ*
                                                            _Vous êtes arrivés à *${PA}* en ${MD}_`;
                                                                            msg.reply(deplacement);
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            }else{
                                                msg.reply(`*Votre déplacement vers ${PS2} n'est pas encore terminé!*\n\n_*Prière de le terminer avant de changer de direction*_`);
                                            }
                                        }else {
                                            msg.reply(`*Distance voulue introuvable*`);
                                        }
                                    });
                                } else {
                                    msg.reply('*Désolé, vous n avez plus assez d energie et vous écroulez de fatigue*');                                }
                            }else if(!rows[0]){
                                msg.reply(`*Utilisateur non enregistré en tant qu'aventurier*`)
                            }
                        })
                    }catch (e) {
                        console.log(e);
                    }
                };

                if(item.length > 1 && item.length <= 3){
                    let sql = `SELECT catégorie_et_avatar.*, aventure.HP, aventure.PE, possession.FORC, possession.VITESSE FROM catégorie_et_avatar JOIN possession ON possession.ID_AVATAR = catégorie_et_avatar.ID_AVATAR JOIN aventure ON aventure.ID_AVATAR = catégorie_et_avatar.ID_AVATAR JOIN avatar ON avatar.ID_AVATAR = catégorie_et_avatar.ID_AVATAR WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0 AND catégorie_et_avatar.NOM_PRODUIT = '${item[2]}' AND catégorie_et_avatar.QTE > 0`;
                    try {
                        db.query(sql, ['true'], (err, rows) => {
                            if (err) {
                                console.log(err);
                            }if(rows[0]){
                                let HP = rows[0].HP; let PE = rows[0].PE;
                                let FO = rows[0].FORC; let VI = rows[0].VITESSE;
                                let categorie = rows[0].NOM_CATEGORIE; let id_produit = rows[0].ID_PRODUIT;
                                let id_avatar = rows[0].ID_AVATAR;  let produit = rows[0].NOM_PRODUIT;
                                let qte = rows[0].QTE;  let duree = rows[0].DURE;
                                if(duree === -1){
                                    let sql2 = `SELECT * FROM ${categorie} WHERE ID = '${id_produit}'`;
                                    console.log(sql2);
                                    db2.query(sql2, ['true'], (err, rows2) => {
                                        let impact = rows2[0].IMPACT;
                                        if(impact){
                                            let imp = parseInt(impact.substr(0, 2));
                                            let signe = impact.substr(2, 1);
                                            let affin = impact.substr(3);
                                            console.log(impact, imp, signe, affin);
                                            if(affin == 'HP'){
                                                let sql1 = `UPDATE aventure SET HP = ${HP + imp} WHERE ID_AVATAR = '${id_avatar}'`;
                                                db1.query(sql1, ['true'], (err, rows1) => {
                                                    msg.reply(`*Vos ${affin} ont augmenté de ${imp}*`)
                                                });
                                            }
                                            if(affin == 'PE'){
                                                let sql1 = `UPDATE aventure SET PE = ${HP + imp} WHERE ID_AVATAR = '${id_avatar}'`;
                                                db1.query(sql1, ['true'], (err, rows1) => {
                                                    msg.reply(`*Vos ${affin} ont augmenté de ${imp}*`)
                                                });
                                            }
                                            if(affin == 'FO'){
                                                if(signe == '*'){
                                                    FO *= imp;
                                                    if(FO>=0 && FO < 10){
                                                        FO = (FO * 15)/9;
                                                    }else if (FO>=10 && FO < 50){
                                                        FO = (FO * 60)/49;
                                                    }else if(FO >= 50 && FO <= 100){
                                                        FO = FO;
                                                    };
                                                    msg.reply(`*Votre gros impact après utilisation de cet item est de ${Math.trunc(FO)} PH durant ce tour uniquement...*`)
                                                }
                                                if(signe == '+'){
                                                    FO += imp;
                                                    if(FO>=0 && FO < 10){
                                                        FO = (FO * 15)/9;
                                                    }else if (FO>=10 && FO < 50){
                                                        FO = (FO * 60)/49;
                                                    }else if(FO >= 50 && FO <= 100){
                                                        FO = FO;
                                                    };
                                                    msg.reply(`*Le gros impact de cette arme lorsque vous l'utilisez est de ${Math.trunc(FO)} PH durant ce tour uniquement...*`)
                                                }
                                            }
                                            if(affin == 'VI'){
                                                if(signe == '*'){
                                                    VI *= imp;
                                                }
                                                VI = VI/5;
                                                msg.reply(`*Votre vitesse max après utilisation de cet item est de ${VI}m/s durant ce tour uniquement...*`)
                                            }
                                            if(affin == 'PH'){
                                                if(signe == '-'){
                                                    msg.reply(`*Votre adversaire reçoit un impact de ${imp} après utilisation de cet item durant ce tour uniquement...*`);
                                                }
                                            }
                                        }
                                        msg.reply(`*${produit} utilisé!*\n\n*Description du produit :* _${rows2[0].DESCRIPTION}_`)
                                    })
                                }else if (duree === 1){
                                    qte--;
                                    let sql2 = `SELECT * FROM ${categorie} WHERE ID = '${id_produit}'`;
                                    console.log(sql2);
                                    db2.query(sql2, ['true'], (err, rows2) => {
                                        let impact = rows2[0].IMPACT;
                                        if(impact){
                                            let imp = parseInt(impact.substr(0, 2));
                                            let signe = impact.substr(2, 1);
                                            let affin = impact.substr(3);
                                            console.log(impact, imp, signe, affin);
                                            if(affin == 'HP'){
                                                let sql1 = `UPDATE aventure SET HP = ${HP + imp} WHERE ID_AVATAR = '${id_avatar}'`;
                                                db1.query(sql1, ['true'], (err, rows1) => {
                                                    msg.reply(`*Vos ${affin} ont augmenté de ${imp}*`)
                                                });
                                            }
                                            if(affin == 'PE'){
                                                let sql1 = `UPDATE aventure SET PE = ${HP + imp} WHERE ID_AVATAR = '${id_avatar}'`;
                                                db1.query(sql1, ['true'], (err, rows1) => {
                                                    msg.reply(`*Vos ${affin} ont augmenté de ${imp}*`)
                                                });
                                            }
                                            if(affin == 'FO'){
                                                if(signe == '*'){
                                                    FO *= imp;
                                                    if(FO>=0 && FO < 10){
                                                        FO = (FO * 15)/9;
                                                    }else if (FO>=10 && FO < 50){
                                                        FO = (FO * 60)/49;
                                                    }else if(FO >= 50 && FO <= 100){
                                                        FO = FO;
                                                    };
                                                    msg.reply(`*Votre gros impact après utilisation de cet item est de ${Math.trunc(FO)} PH durant ce tour uniquement...*`)
                                                }
                                                if(signe == '+'){
                                                    FO += imp;
                                                    if(FO>=0 && FO < 10){
                                                        FO = (FO * 15)/9;
                                                    }else if (FO>=10 && FO < 50){
                                                        FO = (FO * 60)/49;
                                                    }else if(FO >= 50 && FO <= 100){
                                                        FO = FO;
                                                    };
                                                    msg.reply(`*Le gros impact de cette arme lorsque vous l'utilisez est de ${Math.trunc(FO)} PH durant ce tour uniquement...*`)
                                                }
                                            }
                                            if(affin == 'VI'){
                                                if(signe == '*'){
                                                    VI *= imp;
                                                }
                                                VI = VI/5;
                                                msg.reply(`*Votre vitesse max après utilisation de cet item est de ${VI}m/s durant ce tour uniquement...*`)
                                            }
                                            if(affin == 'PH'){
                                                if(signe == '-'){
                                                    msg.reply(`*Votre adversaire reçoit un impact de ${imp} après utilisation de cet item durant ce tour uniquement...*`);
                                                }
                                            }
                                        }
                                        console.log(rows2);
                                        let sql1 = `UPDATE catégorie_et_avatar SET QTE = ${qte}, DURE = ${rows2[0].DUREE} WHERE ID_AVATAR = '${id_avatar}' AND NOM_PRODUIT = '${produit}'`;
                                        db1.query(sql1, ['true'], (err, rows1) => {
                                            msg.reply(`*${produit} utilisé!*\n\n*Il vous en reste _${qte}_*\n\n*Description du produit :* _${rows2[0].DESCRIPTION}_`)
                                        });
                                    })
                                }else if (duree > 1){
                                    duree--
                                    let sql1 = `UPDATE catégorie_et_avatar SET DURE = ${duree} WHERE ID_AVATAR = '${id_avatar}' AND NOM_PRODUIT = '${produit}'`;
                                    db1.query(sql1, ['true'], (err, rows1) => {
                                        let sql2 = `SELECT * FROM ${categorie} WHERE ID = '${id_produit}'`;
                                        console.log(sql2);
                                        db2.query(sql2, ['true'], (err, rows2) => {
                                            let impact = rows2[0].IMPACT;
                                            if(impact){
                                                let imp = parseInt(impact.substr(0, 2));
                                                let signe = impact.substr(2, 1);
                                                let affin = impact.substr(3);
                                                console.log(impact, imp, signe, affin);
                                                if(affin == 'HP'){
                                                    let sql1 = `UPDATE aventure SET HP = ${HP + imp} WHERE ID_AVATAR = '${id_avatar}'`;
                                                    db1.query(sql1, ['true'], (err, rows1) => {
                                                        msg.reply(`*Vos ${affin} ont augmenté de ${imp}*`)
                                                    });
                                                }
                                                if(affin == 'PE'){
                                                    let sql1 = `UPDATE aventure SET PE = ${HP + imp} WHERE ID_AVATAR = '${id_avatar}'`;
                                                    db1.query(sql1, ['true'], (err, rows1) => {
                                                        msg.reply(`*Vos ${affin} ont augmenté de ${imp}*`)
                                                    });
                                                }
                                                if(affin == 'FO'){
                                                    if(signe == '*'){
                                                        FO *= imp;
                                                        if(FO>=0 && FO < 10){
                                                            FO = (FO * 15)/9;
                                                        }else if (FO>=10 && FO < 50){
                                                            FO = (FO * 60)/49;
                                                        }else if(FO >= 50 && FO <= 100){
                                                            FO = FO;
                                                        };
                                                        msg.reply(`*Votre gros impact après utilisation de cet item est de ${Math.trunc(FO)} PH durant ce tour uniquement...*`)
                                                    }
                                                    if(signe == '+'){
                                                        FO += imp;
                                                        if(FO>=0 && FO < 10){
                                                            FO = (FO * 15)/9;
                                                        }else if (FO>=10 && FO < 50){
                                                            FO = (FO * 60)/49;
                                                        }else if(FO >= 50 && FO <= 100){
                                                            FO = FO;
                                                        };
                                                        msg.reply(`*Le gros impact de cette arme lorsque vous l'utilisez est de ${Math.trunc(FO)} PH durant ce tour uniquement...*`)
                                                    }
                                                }
                                                if(affin == 'VI'){
                                                    if(signe == '*'){
                                                        VI *= imp;
                                                    }
                                                    VI = VI/5;
                                                    msg.reply(`*Votre vitesse max après utilisation de cet item est de ${VI}m/s durant ce tour uniquement...*`)
                                                }
                                                if(affin == 'PH'){
                                                    if(signe == '-'){
                                                        msg.reply(`*Votre adversaire reçoit un impact de ${imp} après utilisation de cet item durant ce tour uniquement...*`);
                                                    }
                                                }
                                            }
                                            msg.reply(`*${produit} utilisé!*\n\n_Nombre de tours restant avant l'expiration de ce produit : ${duree}_\n\n*Quantité en stock : _${qte}_*\n\n*Description du produit :* _${rows2[0].DESCRIPTION}_`)
                                        })
                                    });
                                }
                            }else if(!rows[0]){
                                msg.reply(`*Cet item ne fait pas partie de vos items*`)
                            }
                        })
                    }catch (e) {
                        console.log(e);
                    }
                }else if(item.length > 3){
                    for(let i=1; i<item.length; i+=4){
                        let sql = `SELECT catégorie_et_avatar.*, aventure.HP, aventure.PE, possession.FORC, possession.VITESSE FROM catégorie_et_avatar JOIN possession ON possession.ID_AVATAR = catégorie_et_avatar.ID_AVATAR JOIN aventure ON aventure.ID_AVATAR = catégorie_et_avatar.ID_AVATAR JOIN avatar ON avatar.ID_AVATAR = catégorie_et_avatar.ID_AVATAR WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0 AND catégorie_et_avatar.NOM_PRODUIT = '${item[i+1]}' AND catégorie_et_avatar.QTE > 0`;
                        try {
                            db.query(sql, ['true'], (err, rows) => {
                                if (err) {
                                    console.log(err);
                                }if(rows[0]){
                                    let HP = rows[0].HP; let PE = rows[0].PE;
                                    let FO = rows[0].FORC; let VI = rows[0].VITESSE;
                                    let categorie = rows[0].NOM_CATEGORIE; let id_produit = rows[0].ID_PRODUIT;
                                    let id_avatar = rows[0].ID_AVATAR;  let produit = rows[0].NOM_PRODUIT;
                                    let qte = rows[0].QTE;  let duree = rows[0].DURE;
                                    if(duree === -1){
                                        let sql2 = `SELECT * FROM ${categorie} WHERE ID = '${id_produit}'`;
                                        console.log(sql2);
                                        db2.query(sql2, ['true'], (err, rows2) => {
                                            let impact = rows2[0].IMPACT;
                                            if(impact){
                                                let imp = parseInt(impact.substr(0, 2));
                                                let signe = impact.substr(2, 1);
                                                let affin = impact.substr(3);
                                                console.log(impact, imp, signe, affin);
                                                if(affin == 'HP'){
                                                    let sql1 = `UPDATE aventure SET HP = ${HP + imp} WHERE ID_AVATAR = '${id_avatar}'`;
                                                    db1.query(sql1, ['true'], (err, rows1) => {
                                                        msg.reply(`*Vos ${affin} ont augmenté de ${imp}*`)
                                                    });
                                                }
                                                if(affin == 'PE'){
                                                    let sql1 = `UPDATE aventure SET PE = ${HP + imp} WHERE ID_AVATAR = '${id_avatar}'`;
                                                    db1.query(sql1, ['true'], (err, rows1) => {
                                                        msg.reply(`*Vos ${affin} ont augmenté de ${imp}*`)
                                                    });
                                                }
                                                if(affin == 'FO'){
                                                    if(signe == '*'){
                                                        FO *= imp;
                                                        if(FO>=0 && FO < 10){
                                                            FO = (FO * 15)/9;
                                                        }else if (FO>=10 && FO < 50){
                                                            FO = (FO * 60)/49;
                                                        }else if(FO >= 50 && FO <= 100){
                                                            FO = FO;
                                                        };
                                                        msg.reply(`*Votre gros impact après utilisation de cet item est de ${Math.trunc(FO)} PH durant ce tour uniquement...*`)
                                                    }
                                                    if(signe == '+'){
                                                        FO += imp;
                                                        if(FO>=0 && FO < 10){
                                                            FO = (FO * 15)/9;
                                                        }else if (FO>=10 && FO < 50){
                                                            FO = (FO * 60)/49;
                                                        }else if(FO >= 50 && FO <= 100){
                                                            FO = FO;
                                                        };
                                                        msg.reply(`*Le gros impact de cette arme lorsque vous l'utilisez est de ${Math.trunc(FO)} PH durant ce tour uniquement...*`)
                                                    }
                                                }
                                                if(affin == 'VI'){
                                                    if(signe == '*'){
                                                        VI *= imp;
                                                    }
                                                    VI = VI/5;
                                                    msg.reply(`*Votre vitesse max après utilisation de cet item est de ${VI}m/s durant ce tour uniquement...*`)
                                                }
                                                if(affin == 'PH'){
                                                    if(signe == '-'){
                                                        msg.reply(`*Votre adversaire reçoit un impact de ${imp} après utilisation de cet item durant ce tour uniquement...*`);
                                                    }
                                                }
                                            }
                                            msg.reply(`*${produit} utilisé!*\n\n*Description du produit :* _${rows2[0].DESCRIPTION}_`)
                                        })
                                    }else if (duree === 1){
                                        qte--;
                                        let sql2 = `SELECT * FROM ${categorie} WHERE ID = '${id_produit}'`;
                                        console.log(sql2);
                                        db2.query(sql2, ['true'], (err, rows2) => {
                                            let impact = rows2[0].IMPACT;
                                            if(impact){
                                                let imp = parseInt(impact.substr(0, 2));
                                                let signe = impact.substr(2, 1);
                                                let affin = impact.substr(3);
                                                console.log(impact, imp, signe, affin);
                                                if(affin == 'HP'){
                                                    let sql1 = `UPDATE aventure SET HP = ${HP + imp} WHERE ID_AVATAR = '${id_avatar}'`;
                                                    db1.query(sql1, ['true'], (err, rows1) => {
                                                        msg.reply(`*Vos ${affin} ont augmenté de ${imp}*`)
                                                    });
                                                }
                                                if(affin == 'PE'){
                                                    let sql1 = `UPDATE aventure SET PE = ${HP + imp} WHERE ID_AVATAR = '${id_avatar}'`;
                                                    db1.query(sql1, ['true'], (err, rows1) => {
                                                        msg.reply(`*Vos ${affin} ont augmenté de ${imp}*`)
                                                    });
                                                }
                                                if(affin == 'FO'){
                                                    if(signe == '*'){
                                                        FO *= imp;
                                                        if(FO>=0 && FO < 10){
                                                            FO = (FO * 15)/9;
                                                        }else if (FO>=10 && FO < 50){
                                                            FO = (FO * 60)/49;
                                                        }else if(FO >= 50 && FO <= 100){
                                                            FO = FO;
                                                        };
                                                        msg.reply(`*Votre gros impact après utilisation de cet item est de ${Math.trunc(FO)} PH durant ce tour uniquement...*`)
                                                    }
                                                    if(signe == '+'){
                                                        FO += imp;
                                                        if(FO>=0 && FO < 10){
                                                            FO = (FO * 15)/9;
                                                        }else if (FO>=10 && FO < 50){
                                                            FO = (FO * 60)/49;
                                                        }else if(FO >= 50 && FO <= 100){
                                                            FO = FO;
                                                        };
                                                        msg.reply(`*Le gros impact de cette arme lorsque vous l'utilisez est de ${Math.trunc(FO)} PH durant ce tour uniquement...*`)
                                                    }
                                                }
                                                if(affin == 'VI'){
                                                    if(signe == '*'){
                                                        VI *= imp;
                                                    }
                                                    VI = VI/5;
                                                    msg.reply(`*Votre vitesse max après utilisation de cet item est de ${VI}m/s durant ce tour uniquement...*`)
                                                }
                                                if(affin == 'PH'){
                                                    if(signe == '-'){
                                                        msg.reply(`*Votre adversaire reçoit un impact de ${imp} après utilisation de cet item durant ce tour uniquement...*`);
                                                    }
                                                }
                                            }
                                            console.log(rows2);
                                            let sql1 = `UPDATE catégorie_et_avatar SET QTE = ${qte}, DURE = ${rows2[0].DUREE} WHERE ID_AVATAR = '${id_avatar}' AND NOM_PRODUIT = '${produit}'`;
                                            db1.query(sql1, ['true'], (err, rows1) => {
                                                msg.reply(`*${produit} utilisé!*\n\n*Il vous en reste _${qte}_*\n\n*Description du produit :* _${rows2[0].DESCRIPTION}_`)
                                            });
                                        })
                                    }else if (duree > 1){
                                        duree--
                                        let sql1 = `UPDATE catégorie_et_avatar SET DURE = ${duree} WHERE ID_AVATAR = '${id_avatar}' AND NOM_PRODUIT = '${produit}'`;
                                        db1.query(sql1, ['true'], (err, rows1) => {
                                            let sql2 = `SELECT * FROM ${categorie} WHERE ID = '${id_produit}'`;
                                            console.log(sql2);
                                            db2.query(sql2, ['true'], (err, rows2) => {
                                                let impact = rows2[0].IMPACT;
                                                if(impact){
                                                    let imp = parseInt(impact.substr(0, 2));
                                                    let signe = impact.substr(2, 1);
                                                    let affin = impact.substr(3);
                                                    console.log(impact, imp, signe, affin);
                                                    if(affin == 'HP'){
                                                        let sql1 = `UPDATE aventure SET HP = ${HP + imp} WHERE ID_AVATAR = '${id_avatar}'`;
                                                        db1.query(sql1, ['true'], (err, rows1) => {
                                                            msg.reply(`*Vos ${affin} ont augmenté de ${imp}*`)
                                                        });
                                                    }
                                                    if(affin == 'PE'){
                                                        let sql1 = `UPDATE aventure SET PE = ${HP + imp} WHERE ID_AVATAR = '${id_avatar}'`;
                                                        db1.query(sql1, ['true'], (err, rows1) => {
                                                            msg.reply(`*Vos ${affin} ont augmenté de ${imp}*`)
                                                        });
                                                    }
                                                    if(affin == 'FO'){
                                                        if(signe == '*'){
                                                            FO *= imp;
                                                            if(FO>=0 && FO < 10){
                                                                FO = (FO * 15)/9;
                                                            }else if (FO>=10 && FO < 50){
                                                                FO = (FO * 60)/49;
                                                            }else if(FO >= 50 && FO <= 100){
                                                                FO = FO;
                                                            };
                                                            msg.reply(`*Votre gros impact après utilisation de cet item est de ${Math.trunc(FO)} PH durant ce tour uniquement...*`)
                                                        }
                                                        if(signe == '+'){
                                                            FO += imp;
                                                            if(FO>=0 && FO < 10){
                                                                FO = (FO * 15)/9;
                                                            }else if (FO>=10 && FO < 50){
                                                                FO = (FO * 60)/49;
                                                            }else if(FO >= 50 && FO <= 100){
                                                                FO = FO;
                                                            };
                                                            msg.reply(`*Le gros impact de cette arme lorsque vous l'utilisez est de ${Math.trunc(FO)} PH durant ce tour uniquement...*`)
                                                        }
                                                    }
                                                    if(affin == 'VI'){
                                                        if(signe == '*'){
                                                            VI *= imp;
                                                        }
                                                        VI = VI/5;
                                                        msg.reply(`*Votre vitesse max après utilisation de cet item est de ${VI}m/s durant ce tour uniquement...*`)
                                                    }
                                                    if(affin == 'PH'){
                                                        if(signe == '-'){
                                                            msg.reply(`*Votre adversaire reçoit un impact de ${imp} après utilisation de cet item durant ce tour uniquement...*`);
                                                        }
                                                    }
                                                }
                                                msg.reply(`*${produit} utilisé!*\n\n_Nombre de tours restant avant l'expiration de ce produit : ${duree}_\n\n*Quantité en stock : _${qte}_*\n\n*Description du produit :* _${rows2[0].DESCRIPTION}_`)
                                            })
                                        });
                                    }
                                }else if(!rows[0]){
                                    msg.reply(`*Cet item ne fait pas partie de vos items*`)
                                }
                            })
                        }catch (e) {
                            console.log(e);
                        }
                    }
                }


                //MISSIONS
                let list_mission = msg.body.split('->liste_missions')[1];
                if(list_mission){
                    let sql1 = `SELECT avatar.*, aventure.* FROM avatar JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0`;
                    try {
                        db1.query(sql1, ['true'], async (err, rows1) => {
                            if(rows1[0].P_ACTUELLE == 'BAR' && rows1[0].P_SUIVANTE === ''){
                                let sql = `SELECT * FROM missions WHERE STATUT_MISSION = 0 AND VILLAGE_MISSION = '${rows1[0].LOC_AVATAR}' ORDER BY RANG_MISSION DESC`;
                                try {
                                    db.query(sql, ['true'], async (err, rows) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        try {
                                            if (!rows[0]) {
                                                msg.reply(`*Aucune Mission disponible*`);
                                            } else if (rows[0]) {
                                                let missions = new Missions();
                                                let liste_missions = missions.listMission(rows);
                                                await msg.reply(liste_missions);
                                            }
                                        } catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }catch (e) {
                                    console.log(e);
                                }
                            }else {
                                await msg.reply(`*Vous devez vous trouver au _BAR_ pour consulter le tableau des missions*`);
                            }
                        })
                    } catch (e) {
                        console.log(e);
                    }
                };

                let numMission = parseInt(msg.body.split('->info Mission')[1]);
                if (numMission){
                    let sql1 = `SELECT avatar.*, aventure.* FROM avatar JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0`;
                    try {
                        db1.query(sql1, ['true'], async (err, rows1) => {
                            if(rows1[0].P_ACTUELLE == 'BAR' && rows1[0].P_SUIVANTE === ''){
                                let sql = `SELECT * FROM missions WHERE STATUT_MISSION = 0 AND VILLAGE_MISSION = '${rows1[0].LOC_AVATAR}' ORDER BY RANG_MISSION DESC`;
                                try {
                                    db.query(sql, ['true'], async (err, rows) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        try {
                                            if (rows[0]) {
                                                let missions = new Missions();
                                                let liste_missions = missions.listMission(rows);
                                                if(verdict.body === liste_missions){
                                                    for(let i=0; i<rows.length; i++){
                                                        if(numMission === i+1){
                                                            let sql2 = `SELECT * FROM missions WHERE STATUT_MISSION = 0 AND ID_MISSION = ${rows[i].ID_MISSION}`;
                                                            db2.query(sql2, ['true'], async (err, rows2) => {
                                                                let infoMission = missions.infoMissionJoueur(rows2[0], numMission, rows1[0].NOM_AVATAR);
                                                                await msg.reply(infoMission);
                                                            })
                                                        }
                                                    }
                                                    if(numMission > rows.length || numMission <= 0){
                                                        await msg.reply(`*Cette mission est inexistante*`);
                                                    }
                                                }
                                            }
                                        } catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }catch (e) {
                                    console.log(e);
                                }
                            }else {
                                await msg.reply(`*Vous devez vous trouver au _BAR_ pour consulter le tableau des missions*`);
                            }
                        })
                    } catch (e) {
                        console.log(e);
                    }
                };

                if(msg.body === '❌'){
                    //MISSION
                    let sql1 = `SELECT avatar.*, aventure.* FROM avatar JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0`;
                    try {
                        db1.query(sql1, ['true'], async (err, rows1) => {
                            if(rows1[0].P_ACTUELLE == 'BAR' && rows1[0].P_SUIVANTE === ''){
                                let sql = `SELECT * FROM missions WHERE STATUT_MISSION = 0 AND VILLAGE_MISSION = '${rows1[0].LOC_AVATAR}' ORDER BY RANG_MISSION DESC`;
                                try {
                                    db.query(sql, ['true'], async (err, rows) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        try {
                                            if (rows[0]) {
                                                let missions = new Missions();
                                                for(let i=0; i<rows.length; i++){
                                                    let sql2 = `SELECT * FROM missions WHERE STATUT_MISSION = 0 AND ID_MISSION = ${rows[i].ID_MISSION}`;
                                                    db2.query(sql2, ['true'], async (err, rows2) => {
                                                        let infoMission = missions.infoMissionJoueur(rows2[0], i+1, rows1[0].NOM_AVATAR);
                                                        if(verdict.body === infoMission){
                                                            await msg.reply(missions.refuserMission(rows1[0].NOM_AVATAR));
                                                        }
                                                    })
                                                }
                                            }
                                        } catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }catch (e) {
                                    console.log(e);
                                }
                            }
                        })
                    } catch (e) {
                        console.log(e);
                    }

                    //TRAINING
                    let sql2 = `SELECT avatar.*, aventure.*, position.TRAINING FROM avatar JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR JOIN position ON position.NOM_POSITION = aventure.P_ACTUELLE WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0`;
                    try {
                        db1.query(sql2, ['true'], async (err, rows1) => {
                            if(rows1[0].P_SUIVANTE === ''){
                                let sql = `SELECT training.*, pnj.* FROM training JOIN pnj ON pnj.NOM_AVATAR = PNJ_TRAINING WHERE training.NIVEAU_TRAINING <= ${rows1[0].NIV_AVATAR} AND (pnj.ELEMENT = "${rows1[0].ELEMENT}" OR pnj.CLASSE_PNJ = "${rows1[0].CLASSE_AVATAR}")`;
                                try {
                                    db.query(sql, ['true'], async (err, rows) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        try {
                                            if (rows[0]) {
                                                let training = new Training();
                                                for(let i=0; i<rows.length; i++){
                                                    let sql1 = `SELECT * FROM training WHERE ID_TRAINING = ${rows[i].ID_TRAINING}`;
                                                    db2.query(sql1, ['true'], async (err, rows2) => {
                                                        let infoTraining = training.infoTrainingJoueur(rows2[0], i+1, rows1[0].NOM_AVATAR);
                                                        if(verdict.body === infoTraining){
                                                            console.log(`refus : ${infoTraining}`);
                                                            await msg.reply(training.refuserTraining(rows1[0].NOM_AVATAR));
                                                            console.log(`refus : ${training.refuserTraining(rows1[0].NOM_AVATAR)}`);
                                                        }
                                                    })
                                                }
                                            }
                                        } catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }catch (e) {
                                    console.log(e);
                                }
                            }
                        })
                    } catch (e) {
                        console.log(e);
                    }
                };
                if(msg.body === '✅'){
                    //MISSION
                    let sql1 = `SELECT avatar.*, aventure.* FROM avatar JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0`;
                    try {
                        db1.query(sql1, ['true'], async (err, rows1) => {
                            if(rows1[0].P_ACTUELLE == 'BAR' && rows1[0].P_SUIVANTE === ''){
                                let sql = `SELECT * FROM missions WHERE STATUT_MISSION = 0 AND VILLAGE_MISSION = '${rows1[0].LOC_AVATAR}' ORDER BY RANG_MISSION DESC`;
                                try {
                                    db.query(sql, ['true'], async (err, rows) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        try {
                                            if (rows[0]) {
                                                let missions = new Missions();
                                                for(let i=0; i<rows.length; i++){
                                                    let sql2 = `SELECT * FROM missions WHERE STATUT_MISSION = 0 AND ID_MISSION = ${rows[i].ID_MISSION}`;
                                                    db2.query(sql2, ['true'], async (err, rows2) => {
                                                        let infoMission = missions.infoMissionJoueur(rows2[0], i+1, rows1[0].NOM_AVATAR);
                                                        if(verdict.body === infoMission){
                                                            if (rows1[0].MISSION === 1){
                                                                await msg.reply(`*_${rows1[0].NOM_AVATAR}_, Vous avez déjà une mission en cours*\n\n_Veuillez la terminer je vous prie_`);
                                                            }else{
                                                                let sql3 = `SELECT * FROM avatar_et_mission WHERE ID_AVATAR = '${rows1[0].ID_AVATAR}' AND ID_MISSION = ${rows2[0].ID_MISSION}`;
                                                                db3.query(sql3, ['true'], async (err, rows3) => {
                                                                    if(rows3[0]){
                                                                        let acceptMission = missions.updateMissionJoueur(rows1[0].ID_AVATAR, rows2[0].ID_MISSION, rows3[0].REALISATION - 1, rows3[0].DATE);
                                                                        if(acceptMission === `*Désolé mais vous avez atteint la limite de réalisation de cette mission pour la journéé*`){
                                                                            await msg.reply(acceptMission);
                                                                        }else {
                                                                            missions.updateStatutMissionJoueur(rows1[0].ID_AVATAR, 1, rows2[0].ID_MISSION);
                                                                            await msg.reply(acceptMission);
                                                                        }
                                                                    }else {
                                                                        let acceptMission = missions.addMissionJoueur(rows1[0].ID_AVATAR, rows2[0].ID_MISSION);
                                                                        missions.updateStatutMissionJoueur(rows1[0].ID_AVATAR, 1, rows2[0].ID_MISSION);
                                                                        await msg.reply(acceptMission);
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        } catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }catch (e) {
                                    console.log(e);
                                }
                            }
                        })
                    } catch (e) {
                        console.log(e);
                    }

                    //TRAINING
                    let sql2 = `SELECT avatar.*, aventure.*, position.TRAINING FROM avatar JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR JOIN position ON position.NOM_POSITION = aventure.P_ACTUELLE WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0`;
                    try {
                        db1.query(sql2, ['true'], async (err, rows1) => {
                            if(rows1[0].P_SUIVANTE === ''){
                                let sql = `SELECT training.*, pnj.* FROM training JOIN pnj ON pnj.NOM_AVATAR = PNJ_TRAINING WHERE training.NIVEAU_TRAINING <= ${rows1[0].NIV_AVATAR} AND (pnj.ELEMENT = "${rows1[0].ELEMENT}" OR pnj.CLASSE_PNJ = "${rows1[0].CLASSE_AVATAR}")`;
                                try {
                                    db.query(sql, ['true'], async (err, rows) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        try {
                                            if (rows[0]) {
                                                let training = new Training();
                                                for(let i=0; i<rows.length; i++){
                                                    let sql2 = `SELECT * FROM training WHERE ID_TRAINING = ${rows[i].ID_TRAINING}`;
                                                    db2.query(sql2, ['true'], async (err, rows2) => {
                                                        let infoTraining = training.infoTrainingJoueur(rows2[0], i+1, rows1[0].NOM_AVATAR);
                                                        if(verdict.body === infoTraining){
                                                            if (rows1[0].REALISATION === 1){
                                                                await msg.reply(`*_${rows1[0].NOM_AVATAR}_, Vous avez déjà un entrainement en cours*\n\n_Veuillez le terminer je vous prie_`);
                                                            }else{
                                                                let sql3 = `SELECT * FROM avatar_et_training WHERE ID_AVATAR = '${rows1[0].ID_AVATAR}'`;
                                                                db3.query(sql3, ['true'], async (err, rows3) => {
                                                                    if(rows3[0]){
                                                                        let acceptTraining = training.updateTrainingJoueur(rows1[0].ID_AVATAR, rows2[0].ID_TRAINING, rows3[0].TRAINING - 1, rows3[0].DATE);
                                                                        await msg.reply(acceptTraining);
                                                                    }else {
                                                                        let acceptTraining = training.addTrainingJoueur(rows1[0].ID_AVATAR, rows2[0].ID_TRAINING);
                                                                        await msg.reply(acceptTraining);
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        } catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }catch (e) {
                                    console.log(e);
                                }
                            }
                        })
                    } catch (e) {
                        console.log(e);
                    }
                };

                //TRAINING
                let list_training = msg.body.split('->liste_training')[1];
                if(list_training){
                    let sql1 = `SELECT avatar.*, aventure.*, position.TRAINING FROM avatar JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR JOIN position ON position.NOM_POSITION = aventure.P_ACTUELLE WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0`;
                    try {
                        db1.query(sql1, ['true'], async (err, rows1) => {
                            if(rows1[0].P_SUIVANTE === ''){
                                let niv = rows1[0].NIV_AVATAR;
                                let sql = `SELECT training.*, pnj.* FROM training JOIN pnj ON pnj.NOM_AVATAR = PNJ_TRAINING WHERE training.NIVEAU_TRAINING <= ${rows1[0].NIV_AVATAR} AND (pnj.ELEMENT = "${rows1[0].ELEMENT}" OR pnj.CLASSE_PNJ = "${rows1[0].CLASSE_AVATAR}")`;
                                try {
                                    db.query(sql, ['true'], async (err, rows) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        try {
                                            if (!rows[0]) {
                                                msg.reply(`*Aucun Entrainement ne vous correspond pour l'instant*`);
                                            } else if (rows[0]) {
                                                let training = new Training();
                                                if(niv % 5 === 0 && niv != 5){
                                                    let typeTraining = training.typeTraining(rows1[0].NOM_AVATAR, rows1[0].TRAINING, niv);
                                                    await msg.reply(typeTraining);
                                                }else{
                                                    let liste_training = training.listTraining(rows1[0].NOM_AVATAR, 0, rows1[0].TRAINING, rows);
                                                    await msg.reply(liste_training);
                                                }
                                            }
                                        } catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }catch (e) {
                                    console.log(e);
                                }
                            }else {
                                await msg.reply(`*Vous devez terminer votre déplacement jusqu'au lieu où vous vous dirigez*`);
                            }
                        })
                    } catch (e) {
                        console.log(e);
                    }
                };

                if(msg.body === '->Type 1'){
                    let sql1 = `SELECT avatar.*, aventure.*, position.TRAINING FROM avatar JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR JOIN position ON position.NOM_POSITION = aventure.P_ACTUELLE WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0`;
                    try {
                        db1.query(sql1, ['true'], async (err, rows1) => {
                            if(rows1[0].P_SUIVANTE === ''){
                                let niv = rows1[0].NIV_AVATAR;
                                let sql = `SELECT training.*, pnj.* FROM training JOIN pnj ON pnj.NOM_AVATAR = PNJ_TRAINING WHERE training.NIVEAU_TRAINING <= ${rows1[0].NIV_AVATAR} AND (pnj.ELEMENT = "${rows1[0].ELEMENT}" OR pnj.CLASSE_PNJ = "${rows1[0].CLASSE_AVATAR}")`;
                                try {
                                    db.query(sql, ['true'], async (err, rows) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        try {
                                            if (!rows[0]) {
                                                msg.reply(`*Aucun Entrainement ne vous correspond pour l'instant*`);
                                            } else if (rows[0]) {
                                                let training = new Training();
                                                if(niv % 5 === 0 && niv != 5){
                                                    let typeTraining = training.typeTraining(rows1[0].NOM_AVATAR, rows1[0].TRAINING, niv);
                                                    if(verdict.body === typeTraining){
                                                        let liste_training = training.listTraining(rows1[0].NOM_AVATAR, 0, rows1[0].TRAINING, rows);
                                                        console.log('2449 ', liste_training);
                                                        await msg.reply(liste_training);
                                                    }
                                                }
                                            }
                                        } catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }catch (e) {
                                    console.log(e);
                                }
                            }else {
                                await msg.reply(`*Vous devez terminer votre déplacement jusqu'au lieu où vous vous dirigez*`);
                            }
                        })
                    } catch (e) {
                        console.log(e);
                    }
                }
                if(msg.body === '->Type 2'){
                    let sql1 = `SELECT avatar.*, aventure.*, position.TRAINING FROM avatar JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR JOIN position ON position.NOM_POSITION = aventure.P_ACTUELLE WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0`;
                    try {
                        db1.query(sql1, ['true'], async (err, rows1) => {
                            if(rows1[0].P_SUIVANTE === ''){
                                let niv = rows1[0].NIV_AVATAR;
                                let sql = `SELECT training.*, pnj.* FROM training JOIN pnj ON pnj.NOM_AVATAR = PNJ_TRAINING WHERE training.NIVEAU_TRAINING <= ${rows1[0].NIV_AVATAR} AND (pnj.ELEMENT = "${rows1[0].ELEMENT}" OR pnj.CLASSE_PNJ = "${rows1[0].CLASSE_AVATAR}")`;
                                try {
                                    db.query(sql, ['true'], async (err, rows) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        try {
                                            if (!rows[0]) {
                                                msg.reply(`*Aucun Entrainement ne vous correspond pour l'instant*`);
                                            } else if (rows[0]) {
                                                let training = new Training();
                                                if(niv % 5 === 0 && niv != 5){
                                                    let typeTraining = training.typeTraining(rows1[0].NOM_AVATAR, rows1[0].TRAINING, niv);
                                                    if(verdict.body === typeTraining){
                                                        let liste_training = training.listTraining(rows1[0].NOM_AVATAR, 1, rows1[0].TRAINING, rows);
                                                        await msg.reply(liste_training);
                                                    }
                                                }
                                            }
                                        } catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }catch (e) {
                                    console.log(e);
                                }
                            }else {
                                await msg.reply(`*Vous devez terminer votre déplacement jusqu'au lieu où vous vous dirigez*`);
                            }
                        })
                    } catch (e) {
                        console.log(e);
                    }
                }

                let numTraining = parseInt(msg.body.split('->info Training')[1]);
                if(numTraining){
                    let sql1 = `SELECT avatar.*, aventure.*, position.TRAINING FROM avatar JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR JOIN position ON position.NOM_POSITION = aventure.P_ACTUELLE WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0`;
                    try {
                        db1.query(sql1, ['true'], async (err, rows1) => {
                            if(rows1[0].P_SUIVANTE === ''){
                                let sql = `SELECT training.*, pnj.* FROM training JOIN pnj ON pnj.NOM_AVATAR = PNJ_TRAINING WHERE training.NIVEAU_TRAINING <= ${rows1[0].NIV_AVATAR} AND (pnj.ELEMENT = "${rows1[0].ELEMENT}" OR pnj.CLASSE_PNJ = "${rows1[0].CLASSE_AVATAR}")`;
                                try {
                                    db.query(sql, ['true'], async (err, rows) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        try {
                                            if (!rows[0]) {
                                                msg.reply(`*Aucun Entrainement ne vous correspond pour l'instant*`);
                                            } else if (rows[0]) {
                                                let training = new Training();
                                                let liste_training = training.listTraining(rows1[0].NOM_AVATAR, 0, rows1[0].TRAINING, rows);
                                                let liste_training1 = training.listTraining(rows1[0].NOM_AVATAR, 1, rows1[0].TRAINING, rows);
                                                if(verdict.body === liste_training || verdict.body === liste_training1){
                                                    for(let i=0; i<rows.length; i++){
                                                        if(numTraining === i+1){
                                                            let sql2 = `SELECT * FROM training WHERE ID_TRAINING = ${rows[i].ID_TRAINING}`;
                                                            db2.query(sql2, ['true'], async (err, rows2) => {
                                                                let infoTraining = training.infoTrainingJoueur(rows2[0], numTraining, rows1[0].NOM_AVATAR);
                                                                await msg.reply(infoTraining);
                                                            })
                                                        }
                                                    }
                                                    if(numTraining > rows.length || numTraining <= 0){
                                                        await msg.reply(`*Cet entrainement est inexistant*`);
                                                    }
                                                }
                                            }
                                        } catch (e) {
                                            console.log(e);
                                        }
                                    });
                                }catch (e) {
                                    console.log(e);
                                }
                            }else {
                                await msg.reply(`*Vous devez terminer votre déplacement jusqu'au lieu où vous vous dirigez*`);
                            }
                        })
                    } catch (e) {
                        console.log(e);
                    }
                };
            }
        }

        if(msg.body.startsWith('->statut me')){
            let sql = `SELECT avatar.*, possession.*, aventure.* FROM avatar JOIN possession ON avatar.ID_AVATAR = possession.ID_AVATAR JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0`;
            try {
                db.query(sql, ['true'], (err, rows) => {
                    if (err) {
                        console.log(err);
                    }
                    let aventure = ``;
                    try {
                        if (!rows[0]) {
                            let sql1 = `SELECT * FROM avatar WHERE avatar.Tel = ${number} AND MORT_AVATAR = 0 `;
                            db1.query(sql1, ['true'], (err, rows1) => {
                                if (!rows1[0]){
                                    msg.reply('*Ce perso n est pas enregistré dans la Base de Données*')
                                }else if(rows1[0]){
                                    let id_avatar = rows1[0].ID_AVATAR;
                                    let sql2 = `INSERT INTO aventure (ID_AVATAR) VALUES('${id_avatar}');`;
                                    db2.query(sql2, ['true'], (err, rows2) => {
                                        console.log(rows2 + `Éffectué`);
                                        msg.reply(`*Le joueur n'était pas encore enregistré en tant qu'aventurier d'Arcadias*\n\n*Veuillez retaper la commande je vous prie*\n\n_Merci_`);
                                    })
                                }
                            });
                        } else if(rows[0]){
                            let sql2 = `SELECT * FROM catégorie_et_avatar WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'
                                                  AND QTE > 0`;
                            db2.query(sql2, ['true'], (err, rows2) => {
                                let items = ``;
                                let qte;
                                if (rows2[0]){
                                    rows2.forEach(elements => {
                                        if(elements.QTE == 1){
                                            qte = ``;
                                        } else {
                                            qte = elements.QTE;
                                        }
                                        items += ` ${qte}${elements.NOM_PRODUIT};`
                                    });
                                }
                                aventure = ` *STATUT D’AVENTURIER*

 *Monnaie (£)=klimb*

 *${rows[0].LOC_AVATAR}*

 ♨️ *${rows[0].NOM_AVATAR}* :(@${con.number})
▪️ *Compte bancaire :* ${rows[0].COMPTE}£
▪️ *Niveau:* ${rows[0].NIV_AVATAR}
▪️ *HP:* ${rows[0].HP}
▪️ *PE:* ${rows[0].PE}
▪️ *Position Actuelle:* ${rows[0].P_ACTUELLE}
▪️ *Position Suivante:* ${rows[0].P_SUIVANTE}
▪️ *Distance:* ${rows[0].DISTANCE} Km
▪️ *Items:* ${rows[0].ARME};${items}`;
                                msg.reply(aventure, msg.from, {
                                    mentions: [con]
                                })
                            })
                        }
                    }catch (e) {
                        console.log(e);
                    }
                });
            }catch (e) {
                console.log(e);
            }
        }

        if(msg.body.startsWith('-plan >')){
            let img = msg.body.split('>')[1]
            let contact = await msg.getContact();
            let menus = new Menu(contact.number);
            let menu = menus.img(img);
            try{
                const imag = await MessageMedia.fromFilePath(`${menu}`);
                await msg.reply(imag, msg.to, {
                    caption : '*Carte de _' + img +'_*'
                })
            }catch (e) {
                msg.reply(`_Ce plan n'existe pas..._\n\nListe des plans enregistrés pour le moment: \n*-Arcadias*\n*-Arcadias_CENTRE*\n*-BASTIA*`);
            }
        }

        if(admins===1){
            if(msg.body.startsWith(`->combat`)){
                let J1 = parseInt(msg.body.split(`@`)[1]);
                let J2 = parseInt(msg.body.split(`@`)[2]);
                if(J1 && J2){
                    let terrain = parseInt(msg.body.split(`>terrain`)[1]);
                    let heure = msg.body.split(`>heure`)[1];
                    let climat = msg.body.split(`>climat`)[1];
                    let distance = msg.body.split(`>distance`)[1];
                    console.log(terrain, climat, heure);
                    let sql = `SELECT * FROM avatar WHERE (Tel = ${J1} OR Tel = ${J2}) AND MORT_AVATAR = 0`;
                    try {
                        db.query(sql, ['true'], async (err, rows) => {
                            console.log(rows);
                            if (err) {
                                console.log(err);
                            }
                            let combat = `*⚜️ 🌀 FICHE DE COMBAT 🌀⚜️*

 *---------------------------*
`;
                            try {
                                if (!rows[0]) {
                                    msg.reply(`Avatars Non Enregistrés`);
                                } else if (rows[0]) {
                                    let combat1 = `\nJOUEUR 1\n`;
                                    let combat2 = `\nJOUEUR 2\n`;
                                    let VS = `\n         🆚         \n`;
                                    let fin = ``;
                                    let con = [];
                                    if(terrain){
                                        let sql2 = `SELECT * FROM terrain WHERE ID = ${terrain}`;
                                        db2.query(sql2, ['true'], async (err, rows2) => {
                                            console.log(rows2);
                                            if(rows2){
                                                fin = `
\n*-----TERRAIN-----*\n\n
*Nom du terrain:* _${rows2[0].NOM_TERRAIN}_
*Localisation du terrain:* _${rows2[0].LOC_TERRAIN}_
*Description du terrain:* _${rows2[0].DESC_TERRAIN}_
*Heure :* _${heure}_
*Climat :* _${climat}_
*Distance Initiale :* _${distance}m_
*Distance Parcourue par pavé :* _10m par course normale, 15m par technique de boost_
*Récompenses* 
_✅ : 20XP + 2PA + 2000£_
_❌ : 5XP -500£_
                                             
*COMBAT EN COURS...*`;
                                                for (const element of rows) {
                                                    let sql1 =`SELECT avatar.*, possession.*, aventure.HP, aventure.PE FROM avatar JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR JOIN possession ON possession.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.ID_AVATAR = '${element.ID_AVATAR}'`
                                                    db1.query(sql1, ['true'], async (err, rows1) => {
                                                        if (err) {
                                                            console.log(err);
                                                        }
                                                        if(rows1[0]){
                                                            console.log(rows1);
                                                            let number = element.Tel;
                                                            con[rows.indexOf(element)] = await client.getContactById(number.includes('@c.us') ? number : `${number}@c.us`);
                                                            let PH = rows1[0].HP; let PE = rows1[0].PE; let IN = rows1[0].INTELLEC;
                                                            let VI = rows1[0].VITESSE; let AG = rows1[0].AGILITE; let MA = rows1[0].MAN;
                                                            let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC; let SA = rows1[0].SAGESSE;
                                                            let saut = AG/ 5; VI = VI/5; MA = MA/2; EN = 500/EN; let AS;
                                                            if(FO>=0 && FO < 10){
                                                                FO = (FO * 15)/9;
                                                            }else if (FO>=10 && FO < 50){
                                                                FO = (FO * 60)/49;
                                                            }else if(FO >= 50 && FO <= 100){
                                                                FO = FO;
                                                            }
                                                            if(SA >=0 && SA < 10){
                                                                AS = 1;
                                                            }else if(SA >=10 && SA < 30){
                                                                AS = 2;
                                                            }else if(SA >=30 && SA < 50){
                                                                AS = 3;
                                                            }else if(SA >=50 && SA < 80){
                                                                AS = 5;
                                                            }else if(SA >=80 && SA <= 100){
                                                                AS = 10;
                                                            }
                                                            if(element.Tel === J1.toString() ){
                                                                combat1 += `
💠 *${rows1[0].NOM_AVATAR}(@${number})*
 *PH* : _${PH}_  *Intelligence* : _${IN}_
 *PE* : _${PE}_  *Saut* : _${Math.trunc(saut)}m_
 *Portée*: _${Math.trunc(AG/3)}m_  *Actions Simultanées* : _${AS} Actions_
 *Vitesse* : _${VI}m/s_  *Max Energie Consommée* : _${Math.trunc(EN)}PE_
 *Gros Impact* : _-${Math.trunc(FO)}PH_  *Résistance* : _${Math.trunc(MA)}PH_
`;
                                                                const img = await MessageMedia.fromFilePath(`${rows2[0].IMG_TERRAIN}`);
                                                                console.log(img);
                                                                if(rows.indexOf(element) + 1 === rows.length){
                                                                    await client.sendMessage(msg.from, img, {
                                                                        caption : `${combat+combat1+VS+combat2+fin}`,
                                                                        mentions : con
                                                                    })
                                                                }
                                                            }else if (element.Tel === J2.toString()){
                                                                combat2 += `
💠 *${rows1[0].NOM_AVATAR}(@${number})*
 *PH* : _${PH}_  *Intelligence* : _${IN}_
 *PE* : _${PE}_  *Saut* : _${Math.trunc(saut)}m_
 *Portée*: _${Math.trunc(AG/3)}m_  *Actions Simultanées* : _${AS} Actions_
 *Vitesse* : _${VI}m/s_  *Max Energie Consommée* : _${Math.trunc(EN)}PE_
 *Gros Impact* : _-${Math.trunc(FO)}PH_  *Résistance* : _${Math.trunc(MA)}PH_
`;
                                                                const img = await MessageMedia.fromFilePath(`${rows2[0].IMG_TERRAIN}`);
                                                                console.log(img);
                                                                if(rows.indexOf(element) + 1 === rows.length){
                                                                    await client.sendMessage(msg.from, img, {
                                                                        caption : `${combat+combat1+VS+combat2+fin}`,
                                                                        mentions : con
                                                                    })
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                            }else{
                                                msg.reply(`Je vous prie d'entrer un numéro de terrain existant`)
                                            }
                                            console.log(combat1+VS+combat2+fin);
                                        })
                                    }
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        });
                    }catch (e) {
                        console.log(e);
                    }
                }
                console.log(J1, J2);
            }
        }

    }

    //Menus
    if(msg.body === '->menu_arcadias'){
        let contact = await msg.getContact();
        let menus = new Menu(contact.number);
        let menu = menus.menuBot();
        await msg.reply(menu, msg.from, {
            mentions: [contact]
        })
    }
    if(msg.body === '->introduction_arcadias'){
        let contact = await msg.getContact();
        let menus = new Menu(contact.number);
        let menu = menus.introductionArcadias();
        await msg.reply(menu);
    }
    if(msg.body === '->story_arcadias'){
        let contact = await msg.getContact();
        let menus = new Menu(contact.number);
        let menu = menus.storyArcadias();
        await msg.reply(menu);
    }
    if(msg.body === '->help_fiche1'){
        let contact = await msg.getContact();
        let menus = new Menu(contact.number);
        let menu = menus.helpFiche1();
        await msg.reply(menu);
    }
    if(msg.body === '->help_fiche2'){
        let contact = await msg.getContact();
        let menus = new Menu(contact.number);
        let menu = menus.helpFiche2();
        await msg.reply(menu);
    }
    if(msg.body === '->new_fiche'){
        let contact = await msg.getContact();
        let menus = new Menu(contact.number);
        let sql = `SELECT * FROM avatar ORDER BY ID_AVATAR DESC LIMIT 1`;
        db.query(sql, ['True'], async (err, rows) => {
            let menu = menus.newFiche(rows[0].ID_AVATAR);
            await msg.reply(menu, msg.from, {
                mentions: [contact]
            })
        })
    }
    if(msg.body === '->liste_classe'){
        let contact = await msg.getContact();
        let menus = new Menu(contact.number);
        let menu = menus.listClass();
        await msg.reply(menu);
    }
    if(msg.body === '->règles_combat'){
        let contact = await msg.getContact();
        let menus = new Menu(contact.number);
        let menu = menus.règlesCombat();
        await msg.reply(menu);
    }
    if(msg.body === '->pavé_training'){
        let user = (await msg.getContact()).number;
        if(user){
            let sql = `SELECT * FROM avatar WHERE Tel = ${user} AND MORT_AVATAR = 0`;
            try {
                let pave = new Pavé();
                db.query(sql, ['true'], async (err, rows) => {
                    console.log(rows);
                    let contact = await client.getContactById(`${user}@c.us`);
                    if (err) {
                        console.log(err);
                    }
                    let carte = `*☀️CARTE AVENTURIER☀️*

 *---------------------------*
`;
                    try {
                        if (!rows[0]) {
                            msg.reply(pave.structure('TRAINING', 1));
                        } else{
                            let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'`;
                            db1.query(sql1, ['true'], async (err, rows1) => {
                                if (err) {
                                    console.log(err);
                                }
                                if(rows1[0]){
                                    let SA = rows1[0].SAGESSE; let AS;
                                    if(SA >=0 && SA < 10){
                                        AS = 1;
                                    }else if(SA >=10 && SA < 30){
                                        AS = 2;
                                    }else if(SA >=30 && SA < 50){
                                        AS = 3;
                                    }else if(SA >=50 && SA < 80){
                                        AS = 5;
                                    }else if(SA >=80 && SA <= 100){
                                        AS = 10;
                                    }
                                    msg.reply(pave.structure('TRAINING', AS));
                                }
                            });
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });
            }catch (e) {
                console.log(e);
            }
        }
    }
});



//mes messages
client.on('message_create', async (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        const chat = await msg.getChat();
        console.log(msg.body, await msg._getChatId());

        //boutique
        if (msg.to === "120363039802202010@g.us") {
            try {
                let sql = `SELECT * FROM boutique`;
                db.query(sql, ['true'], (err, rows) => {
                    if (err) throw err;
                    let button0;
                    let nom;
                    let desc;
                    let id;
                    let count = 0;
                    rows.forEach(element =>{
                        nom = [element.NOM_BOUTIQUE];
                        desc = [element.DESCRIPTION_BOUTIQUE];
                        id = [element.ID_BOUTIQUE];
                        count ++}
                    )
                    for (i=0; i<count; i++){
                        if (msg.body === `_*${nom[i]}*_\n_${desc[i]}_`){
                            client.sendMessage(msg.to, `_Bienvenue *Maitre* dans *${nom[i]}* ! Veuillez selectionner une catégorie_`);
                            sql1 = `SELECT catégorie_de_boutique.* FROM catégorie_et_boutique JOIN
                                   catégorie_et_boutique JOIN boutique WHERE boutique.ID_BOUTIQUE = ${id}
                                   AND catégorie_et_boutique.ID_CAT = catégorie_et_boutique.ID_BOUTIQUE`;
                            db1.query(sql1, ['true'], async (err, rows) => {
                                if(err) throw err;
                                let tab = [];
                                rows.forEach(element => {
                                    tab.push({title:`_*${element.NOM_CAT}*_`, description: `_${element.DESC_CAT}_`});
                                    }
                                );
                                let sections = [{title:'Catégories Disponibles',rows:tab}];
                                let list = new List('_Liste des catégories disponibles pour cette boutique_',`Appuyer ici`,sections,`CATÉGORIES`,'1111');
                                await client.sendMessage(msg.to, list);
                            });
                        }
                    }
                });
                sql = `SELECT * FROM catégorie_de_boutique `;
                db.query(sql, ['true'], (err, rows) =>{
                    if (err) throw err;
                    let nom = [];
                    let desc = [];
                    rows.forEach(elements => {
                        nom.push(elements.NOM_CAT);
                        desc.push(elements.DESC_CAT);
                    });
                    for(let i=0; i<rows.length; i++){
                        //console.log(typeof tab[i],  tab[i]);
                        if (msg.body === `_*${nom[i]}*_\n_${desc[i]}_`){
                            console.log(nom[i], i);
                            let sql1 = `SELECT * FROM ${nom[i]} ORDER BY NOM`;
                            db1.query(sql1, ['true'], (err, rows1) =>{
                                let categorie = `*CATÉGORIE ${nom[i]}*\n\n\n\n|-------------------------|*CODE- _NOM_* (TYPE) : _DESCRIPTION_\n*PRIX*\n|-------------------------|\n\n\n\n`;
                                rows1.forEach(elements => {
                                    console.log(elements);
                                    categorie += `*${elements.ID}- _${elements.NOM}_* (${elements.TYPE}) : _${elements.DESCRIPTION}_\n*${elements.PRIX} £*\n\n|------------------------|\n\n`;
                                });
                                console.log(categorie);
                                client.sendMessage(msg.to, categorie);
                            })
                        }
                    }
                });
            }catch (e) {
                console.log(e);
            }
        }

        if (msg.body === "menu_boutique") {
            if (msg.to === "120363039802202010@g.us") {
                try {
                    await client.sendMessage(msg.to, `*_Bienvenue Maitre!*_\n *Quelle boutique vous intéresserait?*`);
                } catch (e) {
                    console.log(e);
                }
                let sql = `SELECT * FROM boutique`;
                try {
                    db.query(sql, ['true'], async (err, rows) => {
                        if (err) throw err;
                        let tab = [];
                        rows.forEach(element => {
                            tab.push({title:`_*${element.NOM_BOUTIQUE}*_`, description: `_${element.DESCRIPTION_BOUTIQUE}_`});
                            }
                        )
                        let sections = [{title:'Boutiques Disponibles',rows:tab}];
                        let list = new List('_Liste de boutiques présentes à ARCADIAS_',`Appuyer ici`,sections,`Boutiques d'ARCADIAS`,'0000');
                        await client.sendMessage(msg.to, list);
                    })
                } catch (e) {
                    console.log(e);
                }
            } else {
                await client.sendMessage(msg.to, `*Veuillez utiliser cette commande dans la boutique 〽️ 🅰️R©️🅰️💰I🅰️S  CH🅾️PS 〽️ d'ARCADIAS!*_\n`);
            }
        }

        //Fiches
        if (msg.body.startsWith('->fiche @')) {
            try {
                console.log('MESSAGE DE', client.info.me.user, '\n CONTENU', msg.body);
            } catch (e) {
                console.log(e);
            }
            if (msg._getChatId() === "237658272582-1593625541@g.us" || msg._getChatId() === "120363039961384794@g.us" || msg._getChatId() === "120363021597404602@g.us") {
                let number = msg.body.split(' @')[1];
                let con = await client.getContactById(number.includes('@c.us') ? number : `${number}@c.us`);
                let sql = `SELECT avatar.*, possession.*
                           FROM avatar
                                    JOIN possession ON avatar.ID_AVATAR = possession.ID_AVATAR
                           WHERE avatar.Tel = ${number} AND avatar.MORT_AVATAR = 0`
                if(number == parseInt(number)){
                    let fiche = ``;
                    try {
                        db.query(sql, ['true'], (err, rows) => {
                            if (err) {
                                throw err;
                                msg.reply(error);
                                msg.reply(`*Désolé mais cette fiche n'est pas enregistrée*`)
                            }
                            try {
                                if (!rows[0]) {
                                    msg.reply(`*Désolé mais cette fiche n'est pas enregistrée*`)
                                }
                                if (rows[0]) {
                                    console.log(rows[0]);
                                    let sql2 = `SELECT * FROM catégorie_et_avatar
                                                WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'
                                                  AND QTE > 0`;
                                    let armes = ``;
                                    let possession = ``;
                                    let artefact = ``;
                                    let potion = ``;
                                    msg.reply(`*La fiche de ${rows[0].NOM_AVATAR} est enregistrée*`);
                                    db2.query(sql2, ['true'], (err, rows2) => {
                                        if (err) {
                                            throw err;
                                        }
                                        if (!rows2[0]) {
                                            possession = `~Ne possède rien pour l'instant~`;
                                            artefact = `~Ne possède rien pour l'instant~`;
                                            potion = `~Ne possède rien pour l'instant~`;
                                        } else if (rows2[0]) {
                                            let count = 0;
                                            let category = [];
                                            let id_produit = [];
                                            let qte = [];
                                            rows2.forEach(element => {
                                                if(element.QTE === 1){
                                                    qte = ``;
                                                }else {
                                                    qte = `${element.QTE}`;
                                                }
                                                switch (element.NOM_CATEGORIE){
                                                    case 'ARTEFACTS' :
                                                        artefact += `${qte}${element.NOM_PRODUIT}; `;
                                                        break;
                                                    case 'ARMES' :
                                                        armes += `${qte}${element.NOM_PRODUIT}; `;
                                                        break;
                                                    case 'POTIONS' :
                                                        potion += `${qte}${element.NOM_PRODUIT}; `;
                                                        break;
                                                    default :
                                                        possession += `${qte}${element.NOM_PRODUIT}; `;
                                                        break;
                                                }
                                            });
                                        }
                                        if(artefact === ``){
                                            artefact = `~Ne possède rien pour l'instant~`;
                                        }
                                        if(potion === ``){
                                            potion = `~Ne possède rien pour l'instant~`;
                                        }
                                        if(possession === ``){
                                            possession = `~Ne possède rien pour l'instant~`;
                                        }
                                        fiche = `═══════
*FICHE D'UN JOUEUR ET ACQUIS  _${rows[0].ID_AVATAR}_* 
═══════
*NIVEAU:* ${rows[0].NIV_AVATAR} / *XP:* .${rows[0].XP_AVATAR}.
*GRADE: E*
 *Klimb (£) = _Monnaie d'échange_*

♨️ ⁩  ( *.@${con.number}.* )
▪️ *NOM  ET PRENOM* : ${rows[0].NOM_AVATAR}
▪️ *ÂGE* : ${rows[0].AGE_AVATAR} ans
▪️ *SEXE* : ${rows[0].SEXE_AVATAR}
▪️ *RACE* : ${rows[0].RACE_AVATAR}
▪️ *ELEMENT* : ${rows[0].ELEMENT}
▪️ *CLASSE* : ${rows[0].CLASSE_AVATAR}
▪️ *SOUS CLASSES* : ${rows[0].S_CLASS_AVATAR}     
▪️ *LOCALISATION* : ${rows[0].LOC_AVATAR}
▪️ *DESCRIPTION DU PERSONNAGE* : ${rows[0].DESC_AVATAR}

       *POSSESSION* 
▪️ *Compte Bancaire* : ${rows[0].COMPTE}£
▪️ *ÉQUIPEMENTS* : ${rows[0].ARME}; ${armes}
▪️ *POTIONS* : ${potion} 
▪️ *ARTEFACTS* : ${artefact} 
▪️ *APPARTENANCE A ( GROUPE ,GUILDE ,COMPAGNONS ...)*: ${rows[0].GUILDE}    
▪️ *POSSESSIONS* : ${possession}
              *AFFINITÉS*
▪   *FO* : ${rows[0].FORC}    ▪️ *INT* : ${rows[0].INTELLEC}
▪   *EN* : ${rows[0].ENDURANCE}    ▪️ *VI*  : ${rows[0].VITESSE} 
▪   *AG* : ${rows[0].AGILITE}    ▪️ *SA*  : ${rows[0].SAGESSE}     
▪   *MA* : ${rows[0].MAN}

  🌀️  *COMPÉTENCES PASSIVES OU TECHNIQUES PASSIVES*  ( 3 pour un début )`;
                                        let sql1 = `SELECT *
                                                    FROM technique
                                                    WHERE ID_AVATAR = '${rows[0].ID_AVATAR}' && ELEMENTAIRE = 0`;
                                        db1.query(sql1, ['true'], (err, rows1) => {
                                            if (err) throw err;
                                            let fiche2 = '';
                                            rows1.forEach(element =>

                                                fiche2 += ` 
                                    
 ▪️ *${element.NOM_TECHNIQUE}* : _${element.DESCRIPTION_TECHNIQUE}_`);
                                            let sql2 = `SELECT *
                                                FROM technique
                                                WHERE ID_AVATAR = '${rows[0].ID_AVATAR}' && ELEMENTAIRE = 1`;
                                            db2.query(sql2, ['true'], (err, rows2) => {
                                                if (err) throw err;
                                                let fiche3 = '';
                                                rows2.forEach(element =>

                                                    fiche3 += ` 
 ▪️ *${element.NOM_TECHNIQUE}* : _${element.DESCRIPTION_TECHNIQUE}_`);


                                                fin = `
    
  🌀  *COMPÉTENCES ACTIVES OU TECHNIQUES ACTIVES*
  ${fiche3}
        

🌫️ HISTORIQUE 👁️‍🗨️:

*${rows[0].HISTOIRE_AVATAR}*

▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃\\`

                                                client.sendMessage(msg.to, fiche + fiche2 + fin, {
                                                    mentions: [con]
                                                })
                                            })
                                        })
                                    });


                                }
                            } catch (e) {
                                console.log(e);
                            }
                        });

                    } catch (e) {
                        console.log(e);
                        msg.reply(`Èrreur au niveau de la syntaxe`);
                    }
                }else {
                    msg.reply(`Veuillez s'il vous plait taguer un contact`);
                }
            } else {
                msg.reply(`_*Maitre! Je vous prie d'utiliser cette commande dans les differents groupes d'Arcadias*_\n\n\n_Veuillez m'excuser pour ce désagrement_`)
            }
        }

        //Ajout fiche
        if(msg.body === '->ajout help'){
            if(msg._getChatId() === "120363021597404602@g.us"){
                await msg.reply(`*Bien vouloir suivre la syntaxe ci après pour enregistrer une fiche : *\n\n
            -Ajout >N°Fiche >Nom et Prenom de l'Avatar >Age de l'Avatar >Sexe de Avatar >@tag du joueur\n
            >Arme >FO >EN >AG >IN >VI >MA >SA\n
            >Nom_Technique >Description >Nom_Technique >Description >Nom_Technique >Description`);
            }else {
                msg.reply('*Désolé, mais vous ne pouvez utiliser cette comande que dans la Base De Données d\'Arcadias*\n\n_Merci_')
            }
        }

        if(msg.body.startsWith('-Ajout >')){
            if(msg._getChatId() === "120363021597404602@g.us"){
                //-Ajout >N°Fiche >Nom_Prenom_Avatar >Age_Avatar >Sexe_Avatar >Tel
                // >Arme >FO >EN >AG >IN >VI >MA >SA
                // >Nom_Technique >Description >Nom_Technique >Description >Nom_Technique >Description
                let re = /\s*(>|$)\s*/;
                let avatar = msg.body.split(re);
                let tel = avatar[10].split('@')[1];
                let sql = `SELECT * FROM avatar WHERE ID_AVATAR = '${avatar[2]}'`
                db.query(sql, ['true'], (err, rows) => {
                    if (err) {
                        msg.reply(err);
                        console.log(err);
                    }
                    try {
                        if(rows[0]){
                            msg.reply('*Désolé, mais une fiche avec ce N° est déjà enregistrée, veuillez changer ce N°*\n\n_Merci_');
                        } else if(!rows[0]){
                            let sql1 = `INSERT INTO avatar (ID_AVATAR, NOM_AVATAR, AGE_AVATAR, SEXE_AVATAR, Tel)
                        VALUES('${avatar[2]}', '${avatar[4]}', '${avatar[6]}', '${avatar[8]}', ${tel});`;
                            db1.query(sql1, ['true'], (err, rows) => {
                                if(err){
                                    msg.reply(err);
                                    console.log(err);
                                }else{
                                    console.log('Avatar enregistré');
                                    msg.reply('Données du profil de l\'avatar enregistrées');
                                }
                            })
                            sql1 = `INSERT INTO possession (ID_AVATAR, ARME, FORC, ENDURANCE, AGILITE, INTELLEC, VITESSE, MAN, SAGESSE)
                        VALUES('${avatar[2]}', '${avatar[12]}', '${avatar[14]}', '${avatar[16]}', ${avatar[18]}, ${avatar[20]}, '${avatar[22]}', ${avatar[24]}, ${avatar[26]});`;
                            db1.query(sql1, ['true'], (err, rows) => {
                                if(err){
                                    msg.reply(err);
                                    console.log(err);
                                }else{
                                    console.log('Compte enregistré');
                                    msg.reply('Données de possession de l\'avatar enregistrées');
                                }
                            })
                            sql1 = `INSERT INTO technique (ID_AVATAR, NOM_TECHNIQUE, DESCRIPTION_TECHNIQUE)
                        VALUES('${avatar[2]}', "${avatar[28]}", "${avatar[30]}");`;
                            db1.query(sql1, ['true'], (err, rows) => {
                                if(err){
                                    msg.reply(err);
                                    console.log(err);
                                }else{
                                    console.log('Technique 1 enregistrée');
                                }
                            })
                            sql1 = `INSERT INTO technique (ID_AVATAR, NOM_TECHNIQUE, DESCRIPTION_TECHNIQUE)
                        VALUES('${avatar[2]}', "${avatar[32]}", "${avatar[34]}");`;
                            db1.query(sql1, ['true'], (err, rows) => {
                                if(err){
                                    msg.reply(err);
                                    console.log(err);
                                }else{
                                    console.log('Technique 2 enregistrée');
                                }
                            })
                            sql1 = `INSERT INTO technique (ID_AVATAR, NOM_TECHNIQUE, DESCRIPTION_TECHNIQUE)
                        VALUES('${avatar[2]}', "${avatar[36]}", "${avatar[38]}");`;
                            db1.query(sql1, ['true'], (err, rows) => {
                                if(err){
                                    msg.reply(err);
                                    console.log(err);
                                }else{
                                    console.log('Technique 3 enregistrée');
                                }
                            })
                            msg.reply(`*Fiche enregistrée avec succès*\n\n*Prière d'entrer la commande ->fiche @tag pour vérifier que la fiche a bien été enregistrée*\n\n_Merci_`);
                        }
                    }catch (e) {
                        console.log(e)
                    }});
            }else {
                msg.reply('*Désolé, mais vous ne pouvez utiliser cette comande que dans la Base De Données d\'Arcadias*\n\n_Merci_')
            }
        }

        //Mise à jour fiche
        if(msg.body === '->update help'){
            if(msg._getChatId() === "120363021597404602@g.us"){
                await msg.reply(`*Avant de débuter, sachez que les items gagnés lors d'un évènement ne peuvent être mis à jour directement par maître mon dans la BD!*\n*Bien vouloir suivre la syntaxe ci après pour mettre à jour une fiche :*\n\n
                -Update >N°Fiche >Solde à ajouter >XP à ajouter >FO à ajouter >EN à ajouter >AG à ajouter >IN à ajouter >VI à ajouter >MA à ajouter >SA à ajouter`);
            }else {
                msg.reply('*Désolé, mais vous ne pouvez utiliser cette comande que dans la Base De Données d\'Arcadias*\n\n_Merci_')
            }
        }

        if(msg.body.startsWith('-Update >')){
            if(msg._getChatId() === "120363021597404602@g.us"){
                let re = /\s*(>|$)\s*/;
                let avatar = msg.body.split(re);
                if (avatar.length === 21){
                    let id_avatar = avatar[2]
                    let sql = `SELECT possession.*, avatar.XP_AVATAR, avatar.NIV_AVATAR FROM possession JOIN avatar ON 
                           possession.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.ID_AVATAR = '${id_avatar}'`;
                    db.query(sql, ['true'], (err, rows) => {
                        if (err) {
                            msg.reply(err);
                            console.log(err);
                        }
                        try {
                            if(!rows[0]){
                                msg.reply('*Désolé, mais cette fiche n est pas enregistrée°*\n\n_Merci_');
                            } else if(rows[0]){
                                let XP = rows[0].XP_AVATAR;     let FO = rows[0].FORC + parseInt(avatar[8]);         let IN = rows[0].INTELLEC + parseInt(avatar[14]);
                                let Niv = rows[0].NIV_AVATAR;   let EN = rows[0].ENDURANCE + parseInt(avatar[10]);    let VI = rows[0].VITESSE + parseInt(avatar[16]);
                                let compte = rows[0].COMPTE;    let AG = rows[0].AGILITE + parseInt(avatar[12]);      let MA = rows[0].MAN + parseInt(avatar[18]);
                                let SA = rows[0].SAGESSE + parseInt(avatar[20]);   let tariff = compte + parseInt(avatar[4]);
                                if(XP + parseInt(avatar[6]) >= 100){
                                    XP = XP + parseInt(avatar[6]) - 100;
                                    Niv++;
                                }else if(XP + parseInt(avatar[6]) < 100 && XP + parseInt(avatar[6]) >= 0){
                                    XP = XP + parseInt(avatar[6]);
                                }else if(XP + parseInt(avatar[6]) < 0){
                                    XP = 100 + (XP + parseInt(avatar[6]));
                                    Niv--;
                                }
                                let sql1 = `UPDATE avatar, possession SET avatar.XP_AVATAR = ${XP},
                                avatar.NIV_AVATAR = ${Niv}, possession.COMPTE = ${tariff}, possession.FORC = ${FO},
                                possession.ENDURANCE = ${EN}, possession.AGILITE = ${AG}, possession.INTELLEC = ${IN},
                                possession.VITESSE = ${VI}, possession.MAN = ${MA}, possession.SAGESSE = ${SA}
                                WHERE possession.ID_AVATAR = "${id_avatar}" AND avatar.ID_AVATAR = "${id_avatar}"`;
                                db1.query(sql1, ['true'], (err, rows) => {
                                    if(err){
                                        msg.reply(err);
                                        console.log(err);
                                    }else{
                                        msg.reply(`*Mise à jour éffectuée avec succès*`);
                                    }
                                })
                            }
                        }catch (e) {
                            console.log(e)
                        }});
                }else {
                    msg.reply(`*Je vous prie de revoir votre syntaxe*\n\n_Merci_`)
                }
            }else {
                msg.reply('*Désolé, mais vous ne pouvez utiliser cette comande que dans la Base De Données d\'Arcadias*\n\n_Merci_')
            }
        }

        if(!chat.isGroup){
            let con = (await chat.getContact()).number
            if(msg.body.startsWith('-NewElement')){
                let re = /\s*(>|$)\s*/;
                let element = msg.body.split(re);
                console.log(con, element[2]);
                let misejour = new MiseAjour(con);
                misejour.element(element[2]);
                await client.sendMessage(msg.to, '*Élément ajouté, Je vous prie de vérifier votre fiche*');
            }
            if(msg.body.startsWith('-NewTechnique')){
                let re = /\s*(>|$)\s*/;
                let technique = msg.body.split(re);
                console.log(con, technique[2], technique[4]);
                let misejour = new MiseAjour(con);
                misejour.addTechnique(technique[2], technique[4]);
                await client.sendMessage(msg.to, '*Technique élémentaire ajoutée*');
            }
            if(msg.body.startsWith('-NewClass')){
                let re = /\s*(>|$)\s*/;
                let classe = msg.body.split(re);
                console.log(con, classe[2]);
                let misejour = new MiseAjour(con);
                misejour.addClass(classe[2]);
                await client.sendMessage(msg.to, '*Classe ajoutée*');
            }
            if(msg.body.startsWith('-NewCarte')){
                let misejour = new MiseAjour(con);
                misejour.addCarte();
                await client.sendMessage(msg.to, '*Carte créée*');
            }
            if(msg.body.startsWith('-NewJob')){
                let re = /\s*(>|$)\s*/;
                let job = msg.body.split(re);
                console.log(con, job[2]);
                let misejour = new MiseAjour(con);
                misejour.addJob(job[2]);
                await client.sendMessage(msg.to, '*Job ajouté*');
            }
            if(msg.body.startsWith('-NewStory')){
                let re = /\s*(>|$)\s*/;
                let story = msg.body.split(re);
                console.log(con, story[2]);
                let misejour = new MiseAjour(con);
                misejour.addStory(story[2]);
                await client.sendMessage(msg.to, '*Histoire mise à jour*');
            }
            if(msg.body.startsWith('-NewSalaire')){
                let re = /\s*(>|$)\s*/;
                let salaire = msg.body.split(re);
                console.log(con, salaire[2]);
                let misejour = new MiseAjour(con);
                misejour.addSalaire(salaire[2]);
                await client.sendMessage(msg.to, '*Salaire ajouté*');
            }
            if(msg.body.startsWith('-NewImage')){
                let quoted = await msg.getQuotedMessage();
                try {
                    if(msg.hasQuotedMsg && quoted.type === 'image'){
                        const image = await quoted.downloadMedia();
                        let sql = `SELECT * FROM avatar WHERE Tel = "${con}" AND MORT_AVATAR = 0`;
                        db.query(sql, ['true'], (err, rows) => {
                            if(rows[0].IMAGE_AVATAR == ``){
                                image.filename = `${rows[0].NOM_AVATAR}.jpeg`
                                console.log(
                                    image.mimetype,
                                    image.filename,
                                    image.data.length
                                );
                                fs.writeFile(
                                    "./avatars/" + image.filename,
                                    image.data,
                                    "base64",
                                    function (err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    }
                                );
                                let sql1 = `UPDATE avatar SET IMAGE_AVATAR = './avatars/${image.filename}' WHERE Tel = "${con}"`;
                                db1.query(sql1, ['true'], (err, rows1) => {
                                    console.log(sql1);
                                    console.log('Nouvelle image ajoutée');
                                    msg.reply(`*Image mise à jour*`);
                                })
                            }else{
                                image.filename = `${rows[0].NOM_AVATAR}.jpeg`
                                console.log(
                                    image.mimetype,
                                    image.filename,
                                    image.data.length
                                );
                                fs.unlink("./avatars/" + image.filename,(err) => {
                                    if (err) throw err;
                                    console.log('Fichier supprimé !');
                                });
                                fs.writeFile(
                                    "./avatars/" + image.filename,
                                    image.data,
                                    "base64",
                                    function (err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    }
                                );
                                msg.reply(`*Nouvelle image mise à jour*`)
                            }
                        })
                    }else {
                        msg.reply(`*Veuillez utiliser cette syntaxe en taguant un fichier image*`);
                    }
                }catch (e) {
                    msg.reply(`Erreur : ` + e);
                }
            }
        }

        if(chat.isGroup){
            if(msg.body === '->call') {

                let text = "";
                let mentions = [];

                for(let participant of chat.participants) {
                    const contact = await client.getContactById(participant.id._serialized);

                    mentions.push(contact);
                    text += `@${participant.id.user} `;
                }

                await chat.sendMessage(text, { mentions });
            }
            if(msg.body.startsWith('->add ')){
                let number = msg.body.split(' ')[1];
                if(parseInt(number)==number){
                    number = number.includes('@c.us') ? number : `${number}@c.us`;
                    console.log(await client.getContactById(number));
                    if((await client.getContactById(number)).pushname !== undefined){
                        let group = new Groupe();
                        let addUser = group.verifParticipant(number, chat);
                        if(addUser===1){
                            await msg.reply(`*Ce contact est déjà membre de ce groupe*`, msg.to);
                        }else{
                            chat.addParticipants([number]);
                        }
                    }
                    else{
                        await msg.reply(`*Désolé mais ce contact n'a pas whatsapp*`, msg.to);
                    }
                }``
            }
            if(msg.body.startsWith('->remove @')){
                let number = msg.body.split('@')[1];
                if(parseInt(number)==number){
                    number = number.includes('@c.us') ? number : `${number}@c.us`;
                    console.log(await client.getContactById(number));
                    if((await client.getContactById(number)).pushname !== undefined){
                        let group = new Groupe();
                        let removeUser = group.verifParticipant(number, chat);
                        let admin = group.verifAdmin(number, chat);
                        if(removeUser===0){
                            await msg.reply(`*Veuillez taguer un membre de ce groupe*`, msg.to);
                        }else{
                            if(admin = 1){
                                await msg.reply(`*Le membre que vous essayez de retirer est un _ADMINISTRATEUR_ du groupe! Je vous prie de le faire manuellement!*\n\n_*MERCI*_`, msg.to);
                            }else {
                                chat.removeParticipants([number]);
                            }
                        }
                    }
                    else{
                        await msg.reply(`*Désolé mais ce contact n'a pas whatsapp*`, msg.to);
                    }
                }``
            }
        }

        //Carte d'identité

        if(msg.body.startsWith(`->carte`)){
            let user = parseInt(msg.body.split(`@`)[1]);
            if(user){
                let sql = `SELECT * FROM avatar WHERE Tel = ${user} AND MORT_AVATAR = 0`;
                try {
                    db.query(sql, ['true'], async (err, rows) => {
                        console.log(rows);
                        let contact = await client.getContactById(`${user}@c.us`);
                        if (err) {
                            console.log(err);
                        }
                        let carte = `*☀️CARTE AVENTURIER☀️*

 *---------------------------*
`;
                        try {
                            if (!rows[0]) {
                                msg.reply(`*Joueur Non Enregistré*`);
                            } else if (rows[0].CARTE_AVATAR === 1) {
                                let fin = ``;
                                let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'`;
                                db1.query(sql1, ['true'], async (err, rows1) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    if(rows1[0]){
                                        console.log(rows1);
                                        let IN = rows1[0].INTELLEC;
                                        let VI = rows1[0].VITESSE; let AG = rows1[0].AGILITE; let MA = rows1[0].MAN;
                                        let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC; let SA = rows1[0].SAGESSE;
                                        let saut = AG/5; VI = VI/5; MA = MA/2; EN = 500/EN; let AS;
                                        if(FO>=0 && FO < 10){
                                            FO = (FO * 15)/9;
                                        }else if (FO>=10 && FO < 50){
                                            FO = (FO * 60)/49;
                                        }else if(FO >= 50 && FO <= 100){
                                            FO = FO;
                                        }
                                        if(SA >=0 && SA < 10){
                                            AS = 1;
                                        }else if(SA >=10 && SA < 30){
                                            AS = 2;
                                        }else if(SA >=30 && SA < 50){
                                            AS = 3;
                                        }else if(SA >=50 && SA < 80){
                                            AS = 5;
                                        }else if(SA >=80 && SA <= 100){
                                            AS = 10;
                                        }
                                        carte += `💳 *INFORMATIONS DE L'AVENTURIER ${rows[0].NOM_AVATAR}(@${contact.number})*
 *---------------------------*
 
*NIVEAU ⚜️:* _${rows[0].NIV_AVATAR}_
*XP 🔆:* _${rows[0].XP_AVATAR} XP_
*ELEMENT ⚛️:* _${rows[0].ELEMENT}_
*AGE 📔️:* _${rows[0].AGE_AVATAR} ans_
*CLASSE 💎:* _${rows[0].CLASSE_AVATAR}_
*JOB 💸:* _${rows[0].JOB_AVATAR}_
*SALAIRE 💰:* _${rows[0].SALAIRE_AVATAR}_
*COMPTE 💷:* _${rows1[0].COMPTE}£_

 *---------------------------*
*💠 AFFINITÉS*
 *---------------------------*
 
*Intelligence* : _${IN}_  *Saut* : _${Math.trunc(saut)}m_
*Portée* : _${Math.trunc(AG/3)}m_  *Actions Simultanées* : _${AS} Actions_
*Vitesse* : _${VI}m/s_  *Max Energie Consommée* : _${Math.trunc(EN)}PE_
*Gros Impact* : _-${Math.trunc(FO)}PH_  *Résistance* : _${Math.trunc(MA)}PH_
`;
                                        if(rows[0].IMAGE_AVATAR == ``){
                                            await msg.reply(carte, msg.to, {
                                                mentions : [contact]
                                            })
                                        }else {
                                            const img = await MessageMedia.fromFilePath(`${rows[0].IMAGE_AVATAR}`);
                                            await msg.reply(img, msg.to, {
                                                caption : carte,
                                                mentions : [contact]
                                            })
                                        }
                                    }
                                });
                            } else if(rows[0].CARTE_AVATAR === 0){
                                await client.sendMessage(msg.to, `*L'utilisateur @${contact.number} n'a pas encore sa carte d'aventurier*\n\n_*Prière de vous rapprocher du modo suprême LINKID avec vos 2000£ afin de mettre sur pied votre carte d'aventurier, sans laquelle vous ne pourrez être considéré comme Aventurier*_\n\n_Merci_`, {
                                    mentions: [contact]
                                })
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    });
                }catch (e) {
                    console.log(e);
                }
            }
        }

        //Monde Immersif

        if(msg.body.startsWith(`->combat`)){
            let J1 = parseInt(msg.body.split(`@`)[1]);
            let J2 = parseInt(msg.body.split(`@`)[2]);
            let EQ1 = parseInt(msg.body.split(`>EQ1`)[1]);
            let EQ2 = parseInt(msg.body.split(`>EQ2`)[1]);
            let sql = `SELECT * FROM tournoi WHERE EQ_JOUEUR = ${EQ1} OR EQ_JOUEUR = ${EQ2} ORDER BY EQ_JOUEUR`;
            if(EQ1 && EQ2){
                try {
                    db.query(sql, ['true'], async (err, rows) => {
                        if (err) {
                            console.log(err);
                        }
                        let combat = `*⚜️ 🌀 FICHE DE COMBAT 🌀⚜️*

 *---------------------------*
`;
                        try {
                            if (!rows[0]) {
                                msg.reply(`Aucun PNJ enregistré`);
                            } else if (rows[0]) {
                                let combat1 = `\nÉQUIPE ${EQ1}\n`;
                                let combat2 = `\nÉQUIPE ${EQ2}\n`;
                                let VS = `\n         🆚         \n`;
                                let con = [];
                                for (const element of rows) {
                                    let sql1 =`SELECT avatar.*, possession.*, aventure.HP, aventure.PE FROM avatar JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR JOIN possession ON possession.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.ID_AVATAR = '${element.ID_JOUEUR}'`
                                    db1.query(sql1, ['true'], async (err, rows1) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        if(rows1[0]){
                                            console.log(rows1);
                                            let number = rows1[0].Tel;
                                            con[rows.indexOf(element)] = await client.getContactById(number.includes('@c.us') ? number : `${number}@c.us`);
                                            let PH = rows1[0].HP; let PE = rows1[0].PE; let IN = rows1[0].INTELLEC;
                                            let VI = rows1[0].VITESSE; let AG = rows1[0].AGILITE; let MA = rows1[0].MAN;
                                            let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC; let SA = rows1[0].SAGESSE;
                                            let saut = AG/ 5; VI = VI/5; MA = MA/2; EN = 500/EN; let AS;
                                            if(FO>=0 && FO < 10){
                                                FO = (FO * 15)/9;
                                            }else if (FO>=10 && FO < 50){
                                                FO = (FO * 60)/49;
                                            }else if(FO >= 50 && FO <= 100){
                                                FO = FO;
                                            }
                                            if(SA >=0 && SA < 10){
                                                AS = 1;
                                            }else if(SA >=10 && SA < 30){
                                                AS = 2;
                                            }else if(SA >=30 && SA < 50){
                                                AS = 3;
                                            }else if(SA >=50 && SA < 80){
                                                AS = 5;
                                            }else if(SA >=80 && SA <= 100){
                                                AS = 10;
                                            }
                                            if(element.EQ_JOUEUR === EQ1){
                                                combat1 += `
💠 *${rows1[0].NOM_AVATAR}(@${number})*
 *PH* : _${PH}_  *Intelligence* : _${IN}_
 *PE* : _${PE}_  *Saut* : _${Math.trunc(saut)}m_
 *Portée*: _${Math.trunc(AG/3)}m_  *Actions Simultanées* : _${AS} Actions_
 *Vitesse* : _${VI}m/s_  *Max Energie Consommée* : _${Math.trunc(EN)}PE_
 *Gros Impact* : _-${Math.trunc(FO)}PH_  *Résistance* : _${Math.trunc(MA)}PH_
`;
                                                if (rows.indexOf(element) + 1 === rows.length){
                                                    await client.sendMessage(msg.to, combat+combat1+VS+combat2, {
                                                        mentions : con
                                                    })
                                                }
                                            }else if (element.EQ_JOUEUR === EQ2){
                                                combat2 += `
💠 *${rows1[0].NOM_AVATAR}(@${number})*
 *PH* : _${PH}_  *Intelligence* : _${IN}_
 *PE* : _${PE}_  *Saut* : _${Math.trunc(saut)}m_
 *Portée*: _${Math.trunc(AG/3)}m_  *Actions Simultanées* : _${AS} Actions_
 *Vitesse* : _${VI}m/s_  *Max Energie Consommée* : _${Math.trunc(EN)}PE_
 *Gros Impact* : _-${Math.trunc(FO)}PH_  *Résistance* : _${Math.trunc(MA)}PH_
`;
                                                if (rows.indexOf(element) + 1 === rows.length){
                                                    await client.sendMessage(msg.to, combat+combat1+VS+combat2), {
                                                        mentions : con
                                                    }
                                                }
                                            }
                                        }
                                    });
                                    let sql2 =`SELECT pnj.*, possession.* FROM pnj JOIN possession ON possession.ID_AVATAR = pnj.ID_PNJ WHERE pnj.ID_PNJ = '${element.ID_JOUEUR}'`
                                    db2.query(sql2, ['true'], async (err, rows2) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        if(rows2[0]){
                                            console.log(rows2);
                                            let IN = rows2[0].INTELLEC;
                                            let VI = rows2[0].VITESSE; let AG = rows2[0].AGILITE; let MA = rows2[0].MAN;
                                            let EN = rows2[0].ENDURANCE; let FO = rows2[0].FORC; let SA = rows2[0].SAGESSE;
                                            let saut = (AG * 2)/ 5; VI = (VI * 3)/5; MA = MA/2; EN = 200/EN; let AS;
                                            if(FO>=0 && FO < 10){
                                                FO = (FO * 15)/9;
                                            }else if (FO>=10 && FO < 50){
                                                FO = (FO * 60)/49;
                                            }else if(FO >= 50 && FO <= 100){
                                                FO = FO;
                                            }
                                            if(SA >=0 && SA < 10){
                                                AS = 1;
                                            }else if(SA >=10 && SA < 30){
                                                AS = 2;
                                            }else if(SA >=30 && SA < 50){
                                                AS = 3;
                                            }else if(SA >=50 && SA < 80){
                                                AS = 5;
                                            }else if(SA >=80 && SA <= 100){
                                                AS = 10;
                                            }
                                            if(element.EQ_JOUEUR === EQ1){
                                                combat1 += `
💠 *${rows2[0].NOM_AVATAR}(${element.ID_JOUEUR})*
 *PH* : _100_  *Intelligence* : ${IN}
 *PE* : _100_  *Saut* : _${Math.trunc(saut)}m_
 *Portée*: _${Math.trunc(AG/3)}m_  *Actions Simultanées* : _${AS} Actions_
 *Vitesse* : _${VI}m/s_  *Max Energie Consommée* : _${Math.trunc(EN)}PE_
 *Gros Impact* : _-${Math.trunc(FO)}PH_  *Résistance* : _${Math.trunc(MA)}PH_
`;
                                                if (rows.indexOf(element) + 1 === rows.length){
                                                    await client.sendMessage(msg.to, combat+combat1+VS+combat2, {
                                                        mentions : con,
                                                    })
                                                }
                                            }else if (element.EQ_JOUEUR === EQ2){
                                                combat2 += `
💠 *${rows2[0].NOM_AVATAR}(${element.ID_JOUEUR})*
 *PH* : _100_  *Intelligence* : _${IN}_
 *PE* : _100_  *Saut* : _${Math.trunc(saut)}m_
 *Portée*: _${Math.trunc(AG/3)}m_  *Actions Simultanées* : _${AS} Actions_
 *Vitesse* : _${VI}m/s_  *Max Energie Consommée* : _${Math.trunc(EN)}PE_
 *Gros Impact* : _-${Math.trunc(FO)}PH_  *Résistance* : _${Math.trunc(MA)}PH_
`;
                                                if (rows.indexOf(element) + 1 === rows.length){
                                                    await client.sendMessage(msg.to, combat+combat1+VS+combat2, {
                                                        mentions : con,
                                                    })
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    });
                }catch (e) {
                    console.log(e);
                }
            } else
            if(J1 && J2){
                let terrain = parseInt(msg.body.split(`>terrain`)[1]);
                let heure = msg.body.split(`>heure`)[1];
                let climat = msg.body.split(`>climat`)[1];
                let distance = msg.body.split(`>distance`)[1];
                console.log(terrain, climat, heure);
                let sql = `SELECT * FROM avatar WHERE (Tel = ${J1} OR Tel = ${J2}) AND MORT_AVATAR = 0`;
                try {
                    db.query(sql, ['true'], async (err, rows) => {
                        console.log(rows);
                        if (err) {
                            console.log(err);
                        }
                        let combat = `*⚜️ 🌀 FICHE DE COMBAT 🌀⚜️*

 *---------------------------*
`;
                        try {
                            if (!rows[0]) {
                                msg.reply(`Avatars Non Enregistrés`);
                            } else if (rows[0]) {
                                let combat1 = `\nJOUEUR 1\n`;
                                let combat2 = `\nJOUEUR 2\n`;
                                let VS = `\n         🆚         \n`;
                                let fin = ``;
                                let con = [];
                                if(terrain){
                                    let sql2 = `SELECT * FROM terrain WHERE ID = ${terrain}`;
                                    db2.query(sql2, ['true'], async (err, rows2) => {
                                        console.log(rows2);
                                        if(rows2){
                                            fin = `
\n*-----TERRAIN-----*\n\n
*Nom du terrain:* _${rows2[0].NOM_TERRAIN}_
*Localisation du terrain:* _${rows2[0].LOC_TERRAIN}_
*Description du terrain:* _${rows2[0].DESC_TERRAIN}_
*Heure :* _${heure}_
*Climat :* _${climat}_
*Distance Initiale :* _${distance}m_
*Distance Parcourue par pavé :* _10m par course normale, 15m par technique de boost_
*Récompenses* 
_✅ : 20XP + 2PA + 2000£_
_❌ : 5XP -500£_
                                             
*COMBAT EN COURS...*`;
                                            for (const element of rows) {
                                                let sql1 =`SELECT avatar.*, possession.*, aventure.HP, aventure.PE FROM avatar JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR JOIN possession ON possession.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.ID_AVATAR = '${element.ID_AVATAR}'`
                                                db1.query(sql1, ['true'], async (err, rows1) => {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    if(rows1[0]){
                                                        console.log(rows1);
                                                        let number = element.Tel;
                                                        con[rows.indexOf(element)] = await client.getContactById(number.includes('@c.us') ? number : `${number}@c.us`);
                                                        let PH = rows1[0].HP; let PE = rows1[0].PE; let IN = rows1[0].INTELLEC;
                                                        let VI = rows1[0].VITESSE; let AG = rows1[0].AGILITE; let MA = rows1[0].MAN;
                                                        let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC; let SA = rows1[0].SAGESSE;
                                                        let saut = AG/ 5; VI = VI/5; MA = MA/2; EN = 500/EN; let AS;
                                                        if(FO>=0 && FO < 10){
                                                            FO = (FO * 15)/9;
                                                        }else if (FO>=10 && FO < 50){
                                                            FO = (FO * 60)/49;
                                                        }else if(FO >= 50 && FO <= 100){
                                                            FO = FO;
                                                        }
                                                        if(SA >=0 && SA < 10){
                                                            AS = 1;
                                                        }else if(SA >=10 && SA < 30){
                                                            AS = 2;
                                                        }else if(SA >=30 && SA < 50){
                                                            AS = 3;
                                                        }else if(SA >=50 && SA < 80){
                                                            AS = 5;
                                                        }else if(SA >=80 && SA <= 100){
                                                            AS = 10;
                                                        }
                                                        if(element.Tel === J1.toString() ){
                                                            combat1 += `
💠 *${rows1[0].NOM_AVATAR}(@${number})*
 *PH* : _${PH}_  *Intelligence* : _${IN}_
 *PE* : _${PE}_  *Saut* : _${Math.trunc(saut)}m_
 *Portée*: _${Math.trunc(AG/3)}m_  *Actions Simultanées* : _${AS} Actions_
 *Vitesse* : _${VI}m/s_  *Max Energie Consommée* : _${Math.trunc(EN)}PE_
 *Gros Impact* : _-${Math.trunc(FO)}PH_  *Résistance* : _${Math.trunc(MA)}PH_
`;
                                                            const img = await MessageMedia.fromFilePath(`${rows2[0].IMG_TERRAIN}`);
                                                            console.log(img);
                                                            if(rows.indexOf(element) + 1 === rows.length){
                                                                await client.sendMessage(msg.to, img, {
                                                                    caption : `${combat+combat1+VS+combat2+fin}`,
                                                                    mentions : con
                                                                })
                                                            }
                                                        }else if (element.Tel === J2.toString()){
                                                            combat2 += `
💠 *${rows1[0].NOM_AVATAR}(@${number})*
 *PH* : _${PH}_  *Intelligence* : _${IN}_
 *PE* : _${PE}_  *Saut* : _${Math.trunc(saut)}m_
 *Portée*: _${Math.trunc(AG/3)}m_  *Actions Simultanées* : _${AS} Actions_
 *Vitesse* : _${VI}m/s_  *Max Energie Consommée* : _${Math.trunc(EN)}PE_
 *Gros Impact* : _-${Math.trunc(FO)}PH_  *Résistance* : _${Math.trunc(MA)}PH_
`;
                                                            const img = await MessageMedia.fromFilePath(`${rows2[0].IMG_TERRAIN}`);
                                                            console.log(img);
                                                            if(rows.indexOf(element) + 1 === rows.length){
                                                                await client.sendMessage(msg.to, img, {
                                                                    caption : `${combat+combat1+VS+combat2+fin}`,
                                                                    mentions : con
                                                                })
                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                        }else{
                                            msg.reply(`Je vous prie d'entrer un numéro de terrain existant`)
                                        }
                                        console.log(combat1+VS+combat2+fin);
                                    })
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    });
                }catch (e) {
                    console.log(e);
                }
            }
            console.log(J1, J2);
        }

        if(msg.body === `->equipe tournoi`){
            let sql = `SELECT * FROM tournoi ORDER BY EQ_JOUEUR`;
            try {
                db.query(sql, ['true'], async (err, rows) => {
                    if (err) {
                        console.log(err);
                    }
                    let classement = `*ÉQUIPES DU TOURNOI*

 *---------------------------*
`;
                    try {
                        if (!rows[0]) {
                            msg.reply(`Aucun PNJ enregistré`);
                        } else if (rows[0]) {
                            for (const element of rows) {
                                let sql1 =`SELECT * FROM avatar WHERE ID_AVATAR = '${element.ID_JOUEUR}'`
                                db1.query(sql1, ['true'], async (err, rows1) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    if(rows1[0]){
                                        classement += ` 
*${rows1[0].NOM_AVATAR} :* _ÉQUIPE ${element.EQ_JOUEUR}_   
`;
                                        if (rows.indexOf(element) + 1 === rows.length){
                                            await client.sendMessage(msg.to, classement);
                                        }
                                    }
                                });
                                sql1 =`SELECT * FROM pnj WHERE ID_PNJ = '${element.ID_JOUEUR}'`
                                db1.query(sql1, ['true'], async (err, rows1) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    if(rows1[0]){
                                        classement += ` 
*${rows1[0].NOM_AVATAR} :* _ÉQUIPE ${element.EQ_JOUEUR}_   
`;
                                        if (rows.indexOf(element) + 1 === rows.length){
                                            await client.sendMessage(msg.to, classement);
                                        }
                                    }
                                });
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });
            }catch (e) {
                console.log(e);
            }
        }

        if(msg.body === `->classement tournoi`){
            let sql = `SELECT * FROM tournoi ORDER BY tournoi.PTS_JOUEUR DESC`;
            try {
                db.query(sql, ['true'], async (err, rows) => {
                    if (err) {
                        console.log(err);
                    }
                    let classement = `*CLASSEMENT DU TOURNOI*

 *---------------------------*
`;
                    try {
                        if (!rows[0]) {
                            msg.reply(`Aucun PNJ enregistré`);
                        } else if (rows[0]) {
                            for (const element of rows) {
                                let sql1 =`SELECT * FROM avatar WHERE ID_AVATAR = '${element.ID_JOUEUR}'`
                                db1.query(sql1, ['true'], async (err, rows1) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    if(rows1[0]){
                                        classement += ` 
♨*${rows.indexOf(element) + 1})${rows1[0].NOM_AVATAR} :* _${element.PTS_JOUEUR}%_   
`;
                                        if (rows.indexOf(element) + 1 === rows.length){
                                            await client.sendMessage(msg.to, classement);
                                        }
                                    }
                                });
                                sql1 =`SELECT * FROM pnj WHERE ID_PNJ = '${element.ID_JOUEUR}'`
                                db1.query(sql1, ['true'], async (err, rows1) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    if(rows1[0]){
                                        classement += ` 
♨*${rows.indexOf(element) + 1})${rows1[0].NOM_AVATAR} :* _${element.PTS_JOUEUR}%_   
`;
                                        if (rows.indexOf(element) + 1 === rows.length){
                                            await client.sendMessage(msg.to, classement);
                                        }
                                    }
                                });
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });
            }catch (e) {
                console.log(e);
            }
        }

        if (msg._getChatId() === "120363039961384794@g.us" || msg.to === "120363039802202010@g.us" || msg.to === "120363039525322189@g.us") {
            if(msg.body.startsWith('->statut @')){
                let number = msg.body.split(' @')[1];
                let con = await client.getContactById(number.includes('@c.us') ? number : `${number}@c.us`);
                let sql = `SELECT avatar.*, possession.*, aventure.* FROM avatar JOIN possession ON avatar.ID_AVATAR = possession.ID_AVATAR JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.Tel = '${number}' AND avatar.MORT_AVATAR = 0`;
                if (number == parseInt(number)) {
                    try {
                        db.query(sql, ['true'], (err, rows) => {
                            if (err) {
                                console.log(err);
                            }
                            let aventure = ``;
                            try {
                                if (!rows[0]) {
                                    let sql1 = `SELECT * FROM avatar WHERE avatar.Tel = ${number} AND MORT_AVATAR = 0`;
                                    db1.query(sql1, ['true'], (err, rows1) => {
                                        if (!rows1[0]){
                                            msg.reply('*Ce perso n est pas enregistré dans la Base de Données*')
                                        }else if(rows1[0]){
                                            let id_avatar = rows1[0].ID_AVATAR;
                                            let sql2 = `INSERT INTO aventure (ID_AVATAR) VALUES('${id_avatar}');`;
                                            db2.query(sql2, ['true'], (err, rows2) => {
                                                console.log(rows2 + `Éffectué`);
                                                msg.reply(`*Le joueur n'était pas encore enregistré en tant qu'aventurier d'Arcadias*\n\n*Veuillez retaper la commande je vous prie*\n\n_Merci_`);
                                            })
                                        }
                                    });
                                } else if(rows[0]){
                                    let sql2 = `SELECT * FROM catégorie_et_avatar WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'
                                                  AND QTE > 0`;
                                    db2.query(sql2, ['true'], (err, rows2) => {
                                        let items = ``;
                                        let qte;
                                        if (rows2[0]){
                                            rows2.forEach(elements => {
                                                if(elements.QTE == 1){
                                                    qte = ``;
                                                } else {
                                                    qte = elements.QTE;
                                                }
                                                items += ` ${qte}${elements.NOM_PRODUIT};`
                                            });
                                        }
                                        aventure = ` *STATUT D’AVENTURIER*

 *Monnaie (£)=klimb*

 *${rows[0].LOC_AVATAR}*

 ♨️ *${rows[0].NOM_AVATAR}* :(@${con.number})
▪️ *Compte bancaire :* ${rows[0].COMPTE}£
▪️ *Niveau:* ${rows[0].NIV_AVATAR}
▪️ *HP:* ${rows[0].HP}
▪️ *PE:* ${rows[0].PE}
▪️ *Position Actuelle:* ${rows[0].P_ACTUELLE}
▪️ *Position Suivante:* ${rows[0].P_SUIVANTE}
▪️ *Distance:* ${rows[0].DISTANCE} Km
▪️ *Items:* ${rows[0].ARME};${items}`;
                                        client.sendMessage(msg.to, aventure, {
                                            mentions: [con]
                                        })
                                    })
                                }
                            }catch (e) {
                                console.log(e);
                            }
                        });
                    }catch (e) {
                        console.log(e);
                    }
                }else {
                    msg.reply(`Veuillez s'il vous plait taguer un contact`);
                }
            }

            if(msg.body === `->fiche aventure`){
                let sql = `SELECT avatar.*, possession.*, aventure.* FROM avatar JOIN possession ON avatar.ID_AVATAR = possession.ID_AVATAR JOIN aventure ON aventure.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.MORT_AVATAR = 0 ORDER BY avatar.NIV_AVATAR DESC`;
                try {
                    db.query(sql, ['true'], async (err, rows) => {
                        if (err) {
                            console.log(err);
                        }
                        let aventure = `*FICHE D'AVENTURE*

 *Monnaie (£)=klimb*
`;
                        try {
                            let number;
                            let con = [];
                            if (!rows[0]) {
                                msg.reply(`Aucun aventurier enregistré`);
                            } else if (rows[0]) {
                                for (const element of rows) {
                                    let sql2 = `SELECT *
                                                    FROM catégorie_et_avatar
                                                    WHERE ID_AVATAR = '${element.ID_AVATAR}'
                                                      AND QTE > 0`;
                                    number = element.Tel;
                                    con[rows.indexOf(element)] = await client.getContactById(number.includes('@c.us') ? number : `${number}@c.us`);
                                    db2.query(sql2, ['true'], (err, rows2) => {
                                        let items = ``;
                                        let qte;
                                        if (rows2[0]) {
                                            rows2.forEach(elements => {
                                                if (elements.QTE == 1) {
                                                    qte = ``;
                                                } else {
                                                    qte = elements.QTE;
                                                }
                                                items += ` ${qte}${elements.NOM_PRODUIT};`
                                            });
                                        }
                                        aventure += ` 
    ♨️ *${element.NOM_AVATAR}* :(@${con[rows.indexOf(element)].number})
▪️ *Niveau:* ${element.NIV_AVATAR}
▪️ *HP:* ${element.HP}
▪️ *PE:* ${element.PE}
▪️ *Position Actuelle:* ${element.P_ACTUELLE}
`;
                                    })
                                }
                                console.log(con);
                                await client.sendMessage(msg.to, aventure, {
                                    mentions: con
                                })
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    });
                }catch (e) {
                    console.log(e);
                }
            }

            if(msg.body.startsWith('-plan >')){
                let img = msg.body.split('>')[1]
                let contact = await msg.getContact();
                let menus = new Menu(contact.number);
                let menu = menus.img(img);
                try{
                    const imag = await MessageMedia.fromFilePath(`${menu}`);
                    await msg.reply(imag, msg.to, {
                        caption : '*Carte de _' + img +'_*'
                    })
                }catch (e) {
                    msg.reply(`_Ce plan n'existe pas..._\n\nListe des plans enregistrés pour le moment: \n*-Arcadias*\n*-Arcadias_CENTRE*\n*-BASTIA*`);
                }
            }

            //calcul d'impact de PNJ
            let ener = /\s*(>énergie|$)\s*/;
            let energie = msg.body.split(ener);
            if(energie.length >= 2 && energie.length <= 3){
                let pn = /\s*(>PNJ|$)\s*/;
                let pnj = msg.body.split(pn);
                if(pnj.length > 1){
                    let sql = `SELECT * FROM pnj WHERE ID_PNJ = '${pnj[2]}' OR NOM_AVATAR = '${pnj[2]}'`;
                    console.log(pnj);
                    try {
                        db.query(sql, ['true'], async (err, rows) => {
                            if (err) {
                                console.log(err);
                            }
                            try {
                                if (!rows[0]) {
                                    msg.reply(`*PNJ non existant*`);
                                } else{
                                    let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_PNJ}'`;
                                    db1.query(sql1, ['true'], async (err, rows1) => {
                                        let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                        let combat = new Combat();
                                        let impact = combat.Impact(rows[0].NOM_AVATAR, parseInt(pnj[4]), EN, FO);
                                        msg.reply(impact, msg.to);
                                    });
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        });
                    }catch (e) {
                        console.log(e);
                    }
                };
                let use = /\s*(>@|$)\s*/;
                let user = msg.body.split(`@`);
                if(user.length === 3){
                    let sql = `SELECT * FROM avatar WHERE Tel = '${parseInt(user[1])}' AND MORT_AVATAR = 0`;
                    try {
                        db.query(sql, ['true'], async (err, rows) => {
                            if (err) {
                                console.log(err);
                            }
                            try {
                                if (!rows[0]) {
                                    msg.reply(`*Le joueur n'est pas enregistré*`);
                                } else{
                                    let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'`;
                                    db1.query(sql1, ['true'], async (err, rows1) => {
                                        let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                        let combat = new Combat();
                                        let impact = combat.Impact(rows[0].NOM_AVATAR, parseInt(user[2]), EN, FO);
                                        msg.reply(impact, msg.to);
                                    });
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        });
                    }catch (e) {
                        console.log(e);
                    }
                };
            }
            if(energie.length > 3){
                let pn = /\s*(>PNJ|$)\s*/;
                let pnj = msg.body.split(pn);
                if(pnj.length <= 5 && pnj.length > 1){
                    let sql = `SELECT * FROM pnj WHERE ID_PNJ = '${pnj[2]}' OR NOM_AVATAR = '${pnj[2]}'`;
                    console.log(pnj);
                    try {
                        db.query(sql, ['true'], async (err, rows) => {
                            if (err) {
                                console.log(err);
                            }
                            try {
                                if (!rows[0]) {
                                    msg.reply(`*PNJ non existant*`);
                                } else{
                                    let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_PNJ}'`;
                                    db1.query(sql1, ['true'], async (err, rows1) => {
                                        let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                        let combat = new Combat();
                                        let impact = combat.Impact(rows[0].NOM_AVATAR, parseInt(pnj[4]), EN, FO);
                                        msg.reply(impact, msg.to);
                                    });
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        });
                    }catch (e) {
                        console.log(e);
                    }
                }else if(pnj.length > 5){
                    let j = 0;
                    for(let i=1; i<pnj.length; i = i+6){
                        let sql = `SELECT * FROM pnj WHERE ID_PNJ = '${pnj[i+1]}' OR NOM_AVATAR = '${pnj[i+1]}'`;
                        console.log(pnj);
                        try {
                            db.query(sql, ['true'], async (err, rows) => {
                                if (err) {
                                    console.log(err);
                                }
                                try {
                                    if (!rows[0]) {
                                        msg.reply(`*PNJ non existant*`);
                                    } else{
                                        let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_PNJ}'`;
                                        db1.query(sql1, ['true'], async (err, rows1) => {
                                            let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                            let combat = new Combat();
                                            let impact = combat.Impact(rows[0].NOM_AVATAR, parseInt(pnj[i+3]), EN, FO);
                                            j++;
                                            msg.reply(`*Action ${j} :* `+impact, msg.to);
                                        });
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                            });
                        }catch (e) {
                            console.log(e);
                        }
                    }
                };
                let use = /\s*(>@|$)\s*/;
                let user = msg.body.split(`@`);
                if(user.length === 3){
                    let sql = `SELECT * FROM avatar WHERE Tel = '${parseInt(user[1])}' AND MORT_AVATAR = 0`;
                    try {
                        db.query(sql, ['true'], async (err, rows) => {
                            if (err) {
                                console.log(err);
                            }
                            try {
                                if (!rows[0]) {
                                    msg.reply(`*Le joueur n'est pas enregistré*`);
                                } else{
                                    let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'`;
                                    db1.query(sql1, ['true'], async (err, rows1) => {
                                        let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                        let combat = new Combat();
                                        let impact = combat.Impact(rows[0].NOM_AVATAR, parseInt(user[2]), EN, FO);
                                        msg.reply(impact, msg.to);
                                    });
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        });
                    }catch (e) {
                        console.log(e);
                    }
                }else if(user.length > 3){
                    let j = 0;
                    for(let i = 1; i < user.length; i = i+2){
                        let sql = `SELECT * FROM avatar WHERE Tel = '${parseInt(user[i])}' AND MORT_AVATAR = 0`;
                        try {
                            db.query(sql, ['true'], async (err, rows) => {
                                if (err) {
                                    console.log(err);
                                }
                                try {
                                    if (!rows[0]) {
                                        msg.reply(`*Le joueur n'est pas enregistré*`);
                                    } else{
                                        let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'`;
                                        db1.query(sql1, ['true'], async (err, rows1) => {
                                            let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                            let combat = new Combat();
                                            let impact = combat.Impact(rows[0].NOM_AVATAR, parseInt(user[i+1]), EN, FO);
                                            j++;
                                            msg.reply(`*Action ${j} :* `+impact, msg.to);
                                        });
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                            });
                        }catch (e) {
                            console.log(e);
                        }
                    }
                }
            }

            let energ = /\s*(>énergiElement|$)\s*/;
            let energiElement = msg.body.split(energ);
            if(energiElement.length > 1 && energiElement.length <= 3){
                let pn = /\s*(>PNJ|$)\s*/;
                let pnj = msg.body.split(pn);
                if(pnj.length <= 5 && pnj.length > 1){
                    let sql = `SELECT * FROM pnj WHERE ID_PNJ = '${pnj[2]}' OR NOM_AVATAR = '${pnj[2]}'`;
                    console.log(pnj);
                    try {
                        db.query(sql, ['true'], async (err, rows) => {
                            if (err) {
                                console.log(err);
                            }
                            try {
                                if (!rows[0]) {
                                    msg.reply(`*PNJ non existant*`);
                                } else if(rows[0].ELEMENT !== "N'en possède pas encore"){
                                    let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_PNJ}'`;
                                    db1.query(sql1, ['true'], async (err, rows1) => {
                                        let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                        let combat = new Combat();
                                        let impact = combat.ImpactElement(rows[0].NOM_AVATAR, parseInt(pnj[4]), EN, FO);
                                        msg.reply(impact, msg.to);
                                    });
                                }else{
                                    msg.reply(`*${rows[0].NOM_AVATAR} ne dispose pas encore d'élément*`, msg.to);
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        });
                    }catch (e) {
                        console.log(e);
                    }
                };
                let use = /\s*(>@|$)\s*/;
                let user = msg.body.split(`@`);
                if(user.length === 3){
                    let sql = `SELECT * FROM avatar WHERE Tel = '${parseInt(user[1])}' AND MORT_AVATAR = 0`;
                    try {
                        db.query(sql, ['true'], async (err, rows) => {
                            if (err) {
                                console.log(err);
                            }
                            try {
                                if (!rows[0]) {
                                    msg.reply(`*Le joueur n'est pas enregistré*`);
                                } else if(rows[0].ELEMENT !== "N'en possède pas encore"){
                                    let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'`;
                                    db1.query(sql1, ['true'], async (err, rows1) => {
                                        let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                        let combat = new Combat();
                                        let impact = combat.ImpactElement(rows[0].NOM_AVATAR, parseInt(user[2]), EN, FO);
                                        msg.reply(impact, msg.to);
                                    });
                                }else{
                                    msg.reply(`*${rows[0].NOM_AVATAR} ne dispose pas encore d'élément*`, msg.to);
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        });
                    }catch (e) {
                        console.log(e);
                    }
                };
            }
            if(energiElement.length > 3){
                let pn = /\s*(>PNJ|$)\s*/;
                let pnj = msg.body.split(pn);
                if(pnj.length <= 5 && pnj.length > 1){
                    let sql = `SELECT * FROM pnj WHERE ID_PNJ = '${pnj[2]}' OR NOM_AVATAR = '${pnj[2]}'`;
                    console.log(pnj);
                    try {
                        db.query(sql, ['true'], async (err, rows) => {
                            if (err) {
                                console.log(err);
                            }
                            try {
                                if (!rows[0]) {
                                    msg.reply(`*PNJ non existant*`);
                                } else if(rows[0].ELEMENT !== "N'en possède pas encore"){
                                    let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_PNJ}'`;
                                    db1.query(sql1, ['true'], async (err, rows1) => {
                                        let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                        let combat = new Combat();
                                        let impact = combat.ImpactElement(rows[0].NOM_AVATAR, parseInt(pnj[4]), EN, FO);
                                        msg.reply(impact, msg.to);
                                    });
                                }else{
                                    msg.reply(`*${rows[0].NOM_AVATAR} ne dispose pas encore d'élément*`, msg.to);
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        });
                    }catch (e) {
                        console.log(e);
                    }
                }else if(pnj.length > 5){
                    let j = 0;
                    for(let i=1; i<pnj.length; i = i+6){
                        let sql = `SELECT * FROM pnj WHERE ID_PNJ = '${pnj[i+1]}' OR NOM_AVATAR = '${pnj[i+1]}'`;
                        console.log(pnj);
                        try {
                            db.query(sql, ['true'], async (err, rows) => {
                                if (err) {
                                    console.log(err);
                                }
                                try {
                                    if (!rows[0]) {
                                        msg.reply(`*PNJ non existant*`);
                                    } else if(rows[0].ELEMENT !== "N'en possède pas encore"){
                                        let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_PNJ}'`;
                                        db1.query(sql1, ['true'], async (err, rows1) => {
                                            let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                            let combat = new Combat();
                                            let impact = combat.ImpactElement(rows[0].NOM_AVATAR, parseInt(pnj[i+3]), EN, FO);
                                            j++;
                                            msg.reply(`*Action ${j} :* `+impact, msg.to);
                                        });
                                    }else{
                                        msg.reply(`*${rows[0].NOM_AVATAR} ne dispose pas encore d'élément*`, msg.to);
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                            });
                        }catch (e) {
                            console.log(e);
                        }
                    }
                };
                let use = /\s*(>@|$)\s*/;
                let user = msg.body.split(`@`);
                if(user.length === 3){
                    let sql = `SELECT * FROM avatar WHERE Tel = '${parseInt(user[1])}' AND MORT_AVATAR = 0`;
                    try {
                        db.query(sql, ['true'], async (err, rows) => {
                            if (err) {
                                console.log(err);
                            }
                            try {
                                if (!rows[0]) {
                                    msg.reply(`*Le joueur n'est pas enregistré*`);
                                } else if(rows[0].ELEMENT !== "N'en possède pas encore"){
                                    let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'`;
                                    db1.query(sql1, ['true'], async (err, rows1) => {
                                        let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                        let combat = new Combat();
                                        let impact = combat.ImpactElement(rows[0].NOM_AVATAR, parseInt(user[2]), EN, FO);
                                        msg.reply(impact, msg.to);
                                    });
                                }else{
                                    msg.reply(`*${rows[0].NOM_AVATAR} ne dispose pas encore d'élément*`, msg.to);
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        });
                    }catch (e) {
                        console.log(e);
                    }
                }else if(user.length > 3){
                    let j = 0;
                    for(let i = 1; i < user.length; i = i+2){
                        let sql = `SELECT * FROM avatar WHERE Tel = '${parseInt(user[i])}' AND MORT_AVATAR = 0`;
                        try {
                            db.query(sql, ['true'], async (err, rows) => {
                                if (err) {
                                    console.log(err);
                                }
                                try {
                                    if (!rows[0]) {
                                        msg.reply(`*Le joueur n'est pas enregistré*`);
                                    } else if(rows[0].ELEMENT !== "N'en possède pas encore"){
                                        let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_AVATAR}'`;
                                        db1.query(sql1, ['true'], async (err, rows1) => {
                                            let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC;
                                            let combat = new Combat();
                                            let impact = combat.ImpactElement(rows[0].NOM_AVATAR, parseInt(user[i+1]), EN, FO);
                                            j++;
                                            msg.reply(`*Action ${j} :* `+impact, msg.to);
                                        });
                                    }else{
                                        msg.reply(`*${rows[0].NOM_AVATAR} ne dispose pas encore d'élément*`, msg.to);
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                            });
                        }catch (e) {
                            console.log(e);
                        }
                    }
                }
            }

            //Mise à jour fiche

            if(msg.body.startsWith('-Update >')){
                if(msg._getChatId() === "120363021597404602@g.us"){
                    let re = /\s*(>|$)\s*/;
                    let avatar = msg.body.split(re);
                    if (avatar.length === 21){
                        let id_avatar = avatar[2]
                        let sql = `SELECT possession.*, avatar.XP_AVATAR, avatar.NIV_AVATAR FROM possession JOIN avatar ON 
                           possession.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.ID_AVATAR = '${id_avatar}'`;
                        db.query(sql, ['true'], (err, rows) => {
                            if (err) {
                                msg.reply(err);
                                console.log(err);
                            }
                            try {
                                if(!rows[0]){
                                    msg.reply('*Désolé, mais cette fiche n est pas enregistrée°*\n\n_Merci_');
                                } else if(rows[0]){
                                    let XP = rows[0].XP_AVATAR;     let FO = rows[0].FORC + parseInt(avatar[8]);         let IN = rows[0].INTELLEC + parseInt(avatar[14]);
                                    let Niv = rows[0].NIV_AVATAR;   let EN = rows[0].ENDURANCE + parseInt(avatar[10]);    let VI = rows[0].VITESSE + parseInt(avatar[16]);
                                    let compte = rows[0].COMPTE;    let AG = rows[0].AGILITE + parseInt(avatar[12]);      let MA = rows[0].MAN + parseInt(avatar[18]);
                                    let SA = rows[0].SAGESSE + parseInt(avatar[20]);   let tariff = compte + parseInt(avatar[4]);
                                    if(XP + parseInt(avatar[6]) >= 100){
                                        XP = XP + parseInt(avatar[6]) - 100;
                                        Niv++;
                                    }else if(XP + parseInt(avatar[6]) < 100 && XP + parseInt(avatar[6]) >= 0){
                                        XP = XP + parseInt(avatar[6]);
                                    }else if(XP + parseInt(avatar[6]) < 0){
                                        XP = 100 + (XP + parseInt(avatar[6]));
                                        Niv--;
                                    }
                                    let sql1 = `UPDATE avatar, possession SET avatar.XP_AVATAR = ${XP},
                                avatar.NIV_AVATAR = ${Niv}, possession.COMPTE = ${tariff}, possession.FORC = ${FO},
                                possession.ENDURANCE = ${EN}, possession.AGILITE = ${AG}, possession.INTELLEC = ${IN},
                                possession.VITESSE = ${VI}, possession.MAN = ${MA}, possession.SAGESSE = ${SA}
                                WHERE possession.ID_AVATAR = "${id_avatar}" AND avatar.ID_AVATAR = "${id_avatar}"`;
                                    db1.query(sql1, ['true'], (err, rows) => {
                                        if(err){
                                            msg.reply(err);
                                            console.log(err);
                                        }else{
                                            msg.reply(`*Mise à jour éffectuée avec succès*`);
                                        }
                                    })
                                }
                            }catch (e) {
                                console.log(e)
                            }});
                    }else {
                        msg.reply(`*Je vous prie de revoir votre syntaxe*\n\n_Merci_`)
                    }
                }else {
                    msg.reply('*Désolé, mais vous ne pouvez utiliser cette comande que dans la Base De Données d\'Arcadias*\n\n_Merci_')
                }
            }

            if(msg.hasQuotedMsg){
                const quotedMsg = await msg.getQuotedMessage();
                if(quotedMsg.fromMe === false){
                    let con = await quotedMsg.getContact();
                    let number = con.number;
                    let resur = msg.body.split('>ressuscite ')[1];
                    let meur = msg.body.split('>meurt')[1];
                    let finMission = msg.body.split('>fin_mission')[1];
                    let finTraining = msg.body.split('>fin_training')[1];
                    if(resur){
                        console.log(resur);
                        let misejour = new MiseAjour(number);
                        try{
                            let vie = misejour.vieAvatar(resur);
                            await msg.reply(`*Avatar ressuscité*`);
                        }catch (e) {
                            await msg.reply(e);
                        }
                    }
                    if(meur){
                        console.log(resur);
                        let misejour = new MiseAjour(number);
                        try{
                            let mort = misejour.mortAvatar();
                            await msg.reply(`*Avatar Mort*`);
                        }catch (e) {
                            await msg.reply(e);
                        }
                    }
                    let PA = msg.body.split('>PA')[1];  let AF = msg.body.split('>Af')[1];
                    let PS = msg.body.split('>PS')[1];  if (!PS){PS = ''};
                    let HP = parseInt(msg.body.split('>PH')[1]);    let DIS = parseInt(msg.body.split('>DIS')[1]);
                    let PE = parseInt(msg.body.split('>PE')[1]);    if(!DIS){DIS = 0};
                    let compte = parseInt(msg.body.split('>compte')[1]);
                    let XP = parseInt(msg.body.split('>XP')[1]);    let FO = parseInt(msg.body.split('>FO')[1]);    let IN = parseInt(msg.body.split('>IN')[1]);
                    let EN = parseInt(msg.body.split('>EN')[1]);    let VI = parseInt(msg.body.split('>VI')[1]);    let SA = parseInt(msg.body.split('>SA')[1]);
                    let AG = parseInt(msg.body.split('>AG')[1]);    let MA = parseInt(msg.body.split('>MA')[1]);
                    if(!FO){FO = 0;}; if(!EN){EN = 0;}; if(!AG){AG = 0;}; if(!VI){VI = 0;}; if(!MA){MA = 0;}; if(!IN){IN = 0;}; if(!SA){SA = 0;};
                    let sql = `SELECT aventure.*, avatar.NOM_AVATAR, avatar.ID_AVATAR, avatar.NIV_AVATAR, avatar.XP_AVATAR, possession.* FROM aventure JOIN avatar ON aventure.ID_AVATAR = avatar.ID_AVATAR JOIN possession ON aventure.ID_AVATAR = possession.ID_AVATAR WHERE avatar.Tel = ${number} AND avatar.MORT_AVATAR = 0 `;
                    try {
                        db.query(sql, ['true'], async (err, rows) => {
                            if (err) {
                                console.log(err);
                            }
                            try {
                                if (rows[0]) {
                                    if(finMission){
                                        let mission = new Missions();
                                        mission.updateStatutMissionJoueur(rows[0].ID_AVATAR,  0, 0);
                                        msg.reply(`*MISSION TERMINÉE POUR @${number}*`, msg.to, {
                                            mentions: [con]
                                        })
                                        console.log('Mission terminée');
                                    }
                                    if(finTraining){
                                        let training = new Training();
                                        training.updateStatutTraining(rows[0].ID_AVATAR,  0);
                                        msg.reply(`*ENTRAINEMENT TERMINÉ POUR @${number}*`, msg.to, {
                                            mentions: [con]
                                        })
                                        console.log('Entrainement terminé');
                                    }
                                    let Niv = rows[0].NIV_AVATAR;
                                    XP += rows[0].XP_AVATAR;
                                    let i = Math.trunc(XP/100);
                                    let j;
                                    if(Niv < 5){
                                        if(XP >= 100){
                                            for(j=0; j<i; j++){
                                                XP = XP - 100;
                                                Niv++;
                                                HP = 100;
                                                PE = 100;
                                            }
                                        }else if(XP < 0){
                                            console.log(i);
                                            if(i===0){
                                                XP = 100 + XP;
                                                Niv--;
                                            }
                                            for(j=0; j>i; j--){
                                                console.log(i, j);
                                                XP = 100 + XP;
                                                Niv--;
                                            }
                                        }
                                    }else if(Niv >= 5 && Niv < 10){
                                        if(XP >= 200){
                                            for(j=0; j<i; j = j+2){
                                                XP = XP - 200;
                                                Niv++;
                                                HP = 100;
                                                PE = 100;
                                            }
                                        }else if(XP < 0){
                                            if(i<=2){
                                                XP += 200;
                                                Niv--;
                                            }else{
                                                for(j=0; j>i; j = j-2){
                                                    console.log(i, j);
                                                    XP += 200;
                                                    Niv--;
                                                }
                                            }
                                        }
                                    }else if(Niv >= 10 && Niv < 30){
                                        if(XP >= 300){
                                            for(j=0; j<i; j = j+3){
                                                XP = XP - 300;
                                                Niv++;
                                                HP = 100;
                                                PE = 100;
                                            }
                                        }else if(XP < 0){
                                            console.log(i);
                                            if(i<=3){
                                                XP = 300 + XP;
                                                Niv--;
                                            }
                                            for(j=0; j>i; j = j-3){
                                                console.log(i, j);
                                                XP = 300 + XP;
                                                Niv--;
                                            }
                                        }
                                    }else if(Niv >= 30 && Niv < 100){
                                        if(XP >= 500){
                                            for(j=0; j<i; j = j+5){
                                                XP = XP - 500;
                                                Niv++;
                                                HP = 100;
                                                PE = 100;
                                            }
                                        }else if(XP < 0){
                                            console.log(i);
                                            if(i<=5){
                                                XP = 500 + XP;
                                                Niv--;
                                            }
                                            for(j=0; j>i; j = j-5){
                                                console.log(i, j);
                                                XP = 500 + XP;
                                                Niv--;
                                            }
                                        }
                                    }
                                    console.log(XP);
                                    HP += rows[0].HP;     FO += rows[0].FORC;         IN += rows[0].INTELLEC;
                                    EN += rows[0].ENDURANCE;    VI += rows[0].VITESSE;
                                    compte += rows[0].COMPTE;    AG += rows[0].AGILITE;      MA += rows[0].MAN;
                                    PE += rows[0].PE;       SA += rows[0].SAGESSE;
                                    let id_avatar = rows[0].ID_AVATAR;
                                    if (PE > 100){
                                        PE = 100;
                                    }
                                    if (HP > 100){
                                        HP = 100;
                                    }
                                    if (PE > 0) {
                                        let sql1 = `UPDATE aventure
                                                    SET PE = ${PE}
                                                    WHERE aventure.ID_AVATAR = "${id_avatar}";`
                                        db1.query(sql1, ['true'], (err, rows1) => {
                                            console.log('Mise à jour des PE éffectuée');
                                            client.sendMessage(msg.to, '*Mise à jour des PE éffectuée*');
                                        })
                                    }else if (PE <= 0) {
                                        PE = 0;
                                        await msg.reply(`Cet aventurier est en manque de PE`);
                                        let sql1 = `UPDATE aventure
                                                    SET PE = ${PE}
                                                    WHERE aventure.ID_AVATAR = "${id_avatar}";`
                                        db1.query(sql1, ['true'], (err, rows1) => {
                                            console.log('Mise à jour des PE éffectuée');
                                            client.sendMessage(msg.to, '*Mise à jour des PE éffectuée*');
                                        })
                                    }
                                    if (HP > 0){
                                        let sql1 = `UPDATE aventure
                                                    SET HP = ${HP}
                                                    WHERE aventure.ID_AVATAR = "${id_avatar}";`
                                        db1.query(sql1, ['true'], (err, rows1) => {
                                            console.log('Mise à jour des PH éffectuée');
                                            client.sendMessage(msg.to, '*Mise à jour des PH éffectuée*');
                                        })
                                    } else if (HP <= 0){
                                        HP = 0;
                                        await msg.reply(`*Cet aventurier est mort d'un manque de HP*`);
                                        let sql1 = `UPDATE aventure
                                                    SET HP = ${HP}
                                                    WHERE aventure.ID_AVATAR = "${id_avatar}";`
                                        db1.query(sql1, ['true'], (err, rows1) => {
                                            console.log('Mise à jour des PH éffectuée');
                                            client.sendMessage(msg.to, '*Mise à jour des HP éffectuée*');
                                            let miseJour = new MiseAjour(number);
                                            let mort = miseJour.mortAvatar();
                                            mort;
                                        })
                                    }
                                    if(PA){
                                        let sql1 = `UPDATE aventure SET P_ACTUELLE = "${PA}", P_SUIVANTE = "${PS}",
                                                    DISTANCE = ${DIS} WHERE ID_AVATAR = "${id_avatar}";`
                                        db1.query(sql1, ['true'], (err, rows1) => {
                                            console.log('Mise à jour de la Position éffectuée');
                                            client.sendMessage(msg.to, '*Mise à jour de la position de l aventurier éffectuée*');
                                        })
                                    }
                                    if(compte){
                                        if(compte < 0){
                                            msg.reply(`Cette transaction ne peut être réalisée à cause du montant présent dans le compte de l'utilisateur`);
                                        }else if(compte >= 0){
                                            let sql1 = `UPDATE possession SET COMPTE = ${compte} WHERE ID_AVATAR = "${id_avatar}"`;
                                            db1.query(sql1, ['true'], (err, rows1) => {
                                                console.log('Mise à jour du compte éffectuée');
                                                client.sendMessage(msg.to, '*Mise à jour du compte effectuée*');
                                            })
                                        }
                                    }
                                    if(AF){
                                        if(FO){
                                            let sql1 = `UPDATE possession SET FORC = ${FO}, ENDURANCE = ${EN}, AGILITE = ${AG}, INTELLEC = ${IN},
                                VITESSE = ${VI}, MAN = ${MA}, SAGESSE = ${SA} WHERE ID_AVATAR = "${id_avatar}"`;
                                            db1.query(sql1, ['true'], (err, rows1) => {
                                                console.log('Mise à jour des affinités effectuée');
                                            })
                                        }
                                        await client.sendMessage(msg.to, '*Mise à jour des affinités effectuée*');
                                    }
                                    if(XP >= 0){
                                        let sql1 = `UPDATE avatar SET XP_AVATAR = ${XP}, NIV_AVATAR = ${Niv} WHERE ID_AVATAR = "${id_avatar}"`;
                                        db1.query(sql1, ['true'], (err, rows1) => {
                                            console.log(XP, Niv);
                                            console.log('Mise à jour des XP effectuée');
                                            client.sendMessage(msg.to, '*Mise à jour des XP éffectuée*');
                                        })
                                    }
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        });
                    }catch (e) {
                        console.log(e);
                    }
                } else if(quotedMsg.fromMe){
                    console.log(quotedMsg.body);
                }
            }
        }

        //Menus
        if(msg.body === '->menu_arcadias'){
            let contact = await msg.getContact();
            let menus = new Menu(contact.number);
            let menu = menus.menuBot();
            await msg.reply(menu, msg.to, {
                mentions: [contact]
            })
        }
        if(msg.body === '->introduction_arcadias'){
            let contact = await msg.getContact();
            let menus = new Menu(contact.number);
            let menu = menus.introductionArcadias();
            await msg.reply(menu, msg.to);
        }
        if(msg.body === '->story_arcadias'){
            let contact = await msg.getContact();
            let menus = new Menu(contact.number);
            let menu = menus.storyArcadias();
            await msg.reply(menu, msg.to);
        }
        if(msg.body === '->help_fiche1'){
            let contact = await msg.getContact();
            let menus = new Menu(contact.number);
            let menu = menus.helpFiche1();
            await msg.reply(menu);
        }
        if(msg.body === '->help_fiche2'){
            let contact = await msg.getContact();
            let menus = new Menu(contact.number);
            let menu = menus.helpFiche2();
            await msg.reply(menu);
        }
        if(msg.body === '->new_fiche'){
            let contact = await msg.getContact();
            let menus = new Menu(contact.number);
            let sql = `SELECT * FROM avatar ORDER BY ID_AVATAR DESC LIMIT 1`;
            db.query(sql, ['True'], async (err, rows) => {
                let menu = menus.newFiche(rows[0].ID_AVATAR);
                await msg.reply(menu, msg.to, {
                    mentions: [contact]
                })
            })
        }
        if(msg.body === '->liste_classe'){
            let contact = await msg.getContact();
            let menus = new Menu(contact.number);
            let menu = menus.listClass();
            await msg.reply(menu);
        }
        if(msg.body === '->règles_combat'){
            let contact = await msg.getContact();
            let menus = new Menu(contact.number);
            let menu = menus.règlesCombat();
            await msg.reply(menu);
        }
        if(msg.body === '->TestClass'){
            let contact = await msg.getContact();
            let menus = new Menu(contact.number);
            let menu = menus.testClass();
            await msg.reply(menu);
        }
        if(msg.body === '->pavé_training'){
            let pave = new Pavé();
            msg.reply(pave.structure('TRAINING', 1), msg.to);
        }

        //PNJ
        if(msg.body.startsWith(`->list_pnj`)){
            let sql = `SELECT * FROM pnj ORDER BY NOM_AVATAR`;
            try {
                db.query(sql, ['true'], async (err, rows) => {
                    if (err) {
                        console.log(err);
                    }
                    let pnj = `*LISTE DES PNJ ENREGISTRÉS*

 *---------------------------*
`;
                    try {
                        if (!rows[0]) {
                            msg.reply(`Aucun PNJ enregistré`);
                        } else if (rows[0]) {
                            for (const element of rows) {
                                pnj += ` 
    ♨️ *${element.NOM_AVATAR}* :(${element.ID_PNJ})
▪️ *TYPE :* ${element.TYPE_PNJ}
▪️ *AGE :* ${element.AGE_PNJ}
▪️ *SEXE :* ${element.SEXE_PNJ}
▪️ *DESCRIPTION:* ${element.DESC_PNJ}
`;
                            }
                            await client.sendMessage(msg.to, pnj)
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });
            }catch (e) {
                console.log(e);
            }
        }
        if(msg.body.startsWith(`-pnj >`)){
            let pnj = msg.body.split('>')[1];
            if(pnj){
                let sql = `SELECT * FROM pnj WHERE ID_PNJ = '${pnj}' OR NOM_AVATAR = '${pnj}'`;
                try {
                    db.query(sql, ['true'], async (err, rows) => {
                        if (err) {
                            console.log(err);
                        }
                        try {
                            if (!rows[0]) {
                                msg.reply(`*PNJ non existant*`);
                            } else if (rows[0]) {
                                let Pnj = new PNJ(rows[0].ID_PNJ);
                                let fiche = Pnj.fichePNJ(rows[0].NOM_AVATAR, rows[0].AGE_PNJ, rows[0].SEXE_PNJ, rows[0].DESC_PNJ, rows[0].HIST_PNJ, rows[0].ELEMENT, rows[0].CLASSE_PNJ);

                                if(rows[0].IMG_PNJ == ``){
                                    await msg.reply(fiche)
                                }else {
                                    const img = await MessageMedia.fromFilePath(`${rows[0].IMG_PNJ}`);
                                    await msg.reply(img, msg.to, {
                                        caption : fiche
                                    })
                                }                            }
                        } catch (e) {
                            console.log(e);
                        }
                    });
                }catch (e) {
                    console.log(e);
                }
            }
        }
        if(msg.body.startsWith(`-pnjArme >`)){
            let pnj = msg.body.split('>')[1];
            if(pnj){
                let sql = `SELECT * FROM pnj WHERE ID_PNJ = '${pnj}' OR NOM_AVATAR = '${pnj}'`;
                try {
                    db.query(sql, ['true'], async (err, rows) => {
                        if (err) {
                            console.log(err);
                        }
                        try {
                            if (!rows[0]) {
                                msg.reply(`*PNJ non existant*`);
                            } else if (rows[0]) {
                                let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_PNJ}'`;
                                db1.query(sql1, ['true'], async (err, rows1) => {
                                    let arme = './images/armes/' + rows1[0].ARME + '.jpeg';
                                    try {
                                        const img = await MessageMedia.fromFilePath(`${arme}`);
                                        await msg.reply(img, msg.to, {
                                            caption : `*Arme _${rows1[0].ARME}_ appartenant à ${rows[0].NOM_AVATAR}*`
                                        })
                                    }catch (e) {
                                        await msg.reply(`*${rows[0].NOM_AVATAR} n'a pas de photo de son arme*`)
                                    }
                                });                         }
                        } catch (e) {
                            console.log(e);
                        }
                    });
                }catch (e) {
                    console.log(e);
                }
            }
        }
        if(msg.body.startsWith(`-pnjCarte >`)){
            let pnj = msg.body.split('>')[1];
            if(pnj){
                let sql = `SELECT * FROM pnj WHERE ID_PNJ = '${pnj}' OR NOM_AVATAR = '${pnj}'`;
                try {
                    db.query(sql, ['true'], async (err, rows) => {
                        if (err) {
                            console.log(err);
                        }
                        try {
                            if (!rows[0]) {
                                msg.reply(`*PNJ non existant*`);
                            } else if (rows[0].CARTE === 1) {
                                let sql1 =`SELECT * FROM possession WHERE ID_AVATAR = '${rows[0].ID_PNJ}'`;
                                db1.query(sql1, ['true'], async (err, rows1) => {
                                    let IN = rows1[0].INTELLEC;
                                    let VI = rows1[0].VITESSE; let AG = rows1[0].AGILITE; let MA = rows1[0].MAN;
                                    let EN = rows1[0].ENDURANCE; let FO = rows1[0].FORC; let SA = rows1[0].SAGESSE;
                                    let saut = AG/5; VI = VI/5; MA = MA/2; EN = 500/EN; let AS;
                                    if(FO>=0 && FO < 10){
                                        FO = (FO * 15)/9;
                                    }else if (FO>=10 && FO < 50){
                                        FO = (FO * 60)/49;
                                    }else if(FO >= 50 && FO <= 100){
                                        FO = FO;
                                    }
                                    if(SA >=0 && SA < 10){
                                        AS = 1;
                                    }else if(SA >=10 && SA < 30){
                                        AS = 2;
                                    }else if(SA >=30 && SA < 50){
                                        AS = 3;
                                    }else if(SA >=50 && SA < 80){
                                        AS = 5;
                                    }else if(SA >=80 && SA <= 100){
                                        AS = 10;
                                    }
                                    let Pnj = new PNJ(rows[0].ID_PNJ);
                                    let carte = Pnj.cartePNJ(rows[0].NOM_AVATAR, rows[0].AGE_PNJ, rows[0].SEXE_PNJ, rows[0].TYPE_PNJ, rows1[0].COMPTE, rows[0].ELEMENT, rows[0].CLASSE_PNJ, IN, saut, AG, AS, VI, EN, FO, MA);
                                    if(rows[0].IMG_PNJ == ``){
                                        await msg.reply(carte)
                                    }else {
                                        const img = await MessageMedia.fromFilePath(`${rows[0].IMG_PNJ}`);
                                        await msg.reply(img, msg.to, {
                                            caption : carte
                                        })
                                    }
                                });
                            }else if (rows[0].CARTE !== 1){
                                await msg.reply(`*Ce PNJ n'a pas encore de carte*`)
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    });
                }catch (e) {
                    console.log(e);
                }
            }
        }

        //MISSIONS
        let list_mission = msg.body.startsWith('->liste_missions');
        if(list_mission){
            let sql = `SELECT * FROM missions WHERE STATUT_MISSION = 0 ORDER BY RANG_MISSION DESC`;
            try {
                db.query(sql, ['true'], async (err, rows) => {
                    if (err) {
                        console.log(err);
                    }
                    try {
                        if (!rows[0]) {
                            msg.reply(`*Aucune Mission disponible*`);
                        } else if (rows[0]) {
                            let missions = new Missions();
                            let liste_missions = missions.listMission(rows);
                            await msg.reply(liste_missions);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });
            }catch (e) {
                console.log(e);
            }
        }
        if(msg.hasQuotedMsg){
            let numMission = parseInt(msg.body.split('->info Mission')[1]);
            const quotedMsg = await msg.getQuotedMessage();
            if (numMission){
                let sql = `SELECT * FROM missions WHERE STATUT_MISSION = 0 ORDER BY RANG_MISSION DESC`;
                try {
                    db.query(sql, ['true'], async (err, rows) => {
                        if (err) {
                            console.log(err);
                        }
                        try {
                            if (rows[0]) {
                                let missions = new Missions();
                                let liste_missions = missions.listMission(rows);
                                if(quotedMsg.body === liste_missions){
                                    for(let i=0; i<rows.length; i++){
                                        if(numMission === i+1){
                                            let sql1 = `SELECT * FROM missions WHERE STATUT_MISSION = 0 AND ID_MISSION = ${rows[i].ID_MISSION}`;
                                            db1.query(sql1, ['true'], async (err, rows1) => {
                                                let infoMission = missions.infoMission(rows1[0], numMission);
                                                await msg.reply(infoMission);
                                            })
                                        }
                                    }if(numMission > rows.length || numMission === 0){
                                        await msg.reply(`*Cette mission est inexistante*`);
                                    }
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    });
                }catch (e) {
                    console.log(e);
                }
            }
        }
        let fiche_mission = msg.body.startsWith('->fiche_mission');
        if(fiche_mission){
            let sql = `SELECT missions.*, avatar_et_mission.*, aventure.*, avatar.ID_AVATAR, avatar.Tel, avatar.NOM_AVATAR FROM avatar_et_mission JOIN missions ON avatar_et_mission.ID_MISSION = missions.ID_MISSION JOIN aventure ON avatar_et_mission.ID_AVATAR = aventure.ID_AVATAR AND avatar_et_mission.ID_MISSION = aventure.ID_MISSION JOIN avatar ON avatar_et_mission.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.MORT_AVATAR = 0 AND aventure.MISSION = 1 ORDER BY RANG_MISSION DESC`;
            try {
                db.query(sql, ['true'], async (err, rows) => {
                    try{
                        if (!rows[0]) {
                            await msg.reply(`*Aucune Mission n'est en cours de réalisation*`);
                        } else if (rows[0]) {
                            let sql1 = `SELECT * FROM missions WHERE STATUT_MISSION = 0 ORDER BY RANG_MISSION DESC`;
                            try {
                                db1.query(sql1, ['true'], async (err, rows1) => {
                                    let contact = [];
                                    for(const element of rows){
                                        contact[rows.indexOf(element)] = await client.getContactById(element.Tel.includes('@c.us') ? element.Tel : `${element.Tel}@c.us`);
                                    }
                                    let missions = new Missions();
                                    let fiche_missions = missions.ficheMissionAll(rows, rows1);
                                    await msg.reply(fiche_missions, msg.to, {
                                        mentions : contact
                                    });
                                });
                            }catch (e) {
                                console.log(e);
                            }
                        }
                    }catch (e) {
                        console.log(e);
                    }
                    if (err) {
                        console.log(err);
                    }
                });
            }catch (e) {
                console.log(e);
            }
        }

        //TRAINING
        let fiche_training = msg.body.startsWith('->fiche_training');
        if(fiche_training){
            let sql = `SELECT training.*, avatar_et_training.*, aventure.*, avatar.ID_AVATAR, avatar.Tel, avatar.NOM_AVATAR FROM avatar_et_training JOIN training ON avatar_et_training.ID_TRAINING = training.ID_TRAINING JOIN aventure ON avatar_et_training.ID_AVATAR = aventure.ID_AVATAR JOIN avatar ON avatar_et_training.ID_AVATAR = avatar.ID_AVATAR WHERE avatar.MORT_AVATAR = 0 AND avatar_et_training.REALISATION = 1`;
            try {
                db.query(sql, ['true'], async (err, rows) => {
                    try{
                        if (!rows[0]) {
                            await msg.reply(`*Aucun entrainement n'est en cours de réalisation*`);
                        } else if (rows[0]) {
                            let sql1 = `SELECT * FROM training`;
                            try {
                                db1.query(sql1, ['true'], async (err, rows1) => {
                                    let contact = [];
                                    for(const element of rows){
                                        contact[rows.indexOf(element)] = await client.getContactById(element.Tel.includes('@c.us') ? element.Tel : `${element.Tel}@c.us`);
                                    }
                                    let training = new Training();
                                    let fiche_missions = training.ficheTrainingAll(rows, rows1);
                                    await msg.reply(fiche_missions, msg.to, {
                                        mentions : contact
                                    });
                                });
                            }catch (e) {
                                console.log(e);
                            }
                        }
                    }catch (e) {
                        console.log(e);
                    }
                    if (err) {
                        console.log(err);
                    }
                });
            }catch (e) {
                console.log(e);
            }
        }
    }
});