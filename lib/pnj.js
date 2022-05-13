const mysql = require('mysql');
const fs = require("fs");

module.exports = function (pnj){
    this.pnj = pnj;
    this.fichePNJ = function (nom, age, sexe, desc, hist, elt, classe){
        let fiche = `_*FICHE DE PNJ ${this.pnj}*_
        
*<------------------>* 
♨️ _*${nom}*_
▪️ *AGE :* _${age} ans_
▪️ *SEXE :* _${sexe}_
▪️ *DESCRIPTION:* _${desc}_
▪️ *HISTOIRE:* _${hist}_
▪️ *ELEMENT:* _${elt}_
▪️ *CLASSE:* _${classe}_
*<------------------>*`;
        return fiche;
    }
    this.cartePNJ = function(nom, age, sexe, type, compte, elt, classe, IN, saut, AG, AS, VI, EN, FO, MA){
        let carte = `*☀️CARTE DE PNJ ${pnj}☀️*

 *---------------------------*
💳 *INFORMATIONS DU PNJ ${nom}*
 *---------------------------*
 
*SEXE 🔆:* _${sexe}_
*ELEMENT ⚛️:* _${elt}_
*AGE 📔️:* _${age} ans_
*CLASSE 💎:* _${classe}_
*JOB 💸:* _${type}_
*COMPTE 💷:* _${compte}£_

 *---------------------------*
*💠 AFFINITÉS*
 *---------------------------*
 
*Intelligence* : _${IN}_  *Saut* : _${Math.trunc(saut)}m_
*Portée* : _${Math.trunc(AG/3)}m_  *Actions Simultanées* : _${AS} Actions_
*Vitesse* : _${VI}m/s_  *Max Energie Consommée* : _${Math.trunc(EN)}PE_
*Gros Impact* : _-${Math.trunc(FO)}PH_  *Résistance* : _${Math.trunc(MA)}PH_
`;
        return carte;
    }
}