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
    this.structure = function (type, Sous_Actions) {
        let fiche = `*PAVÉ ${type}* >ID l'id fourni après validation du type >ID
        \n*>TOUR 1*(si et seulement si c'est le premier tour! Pour le reste, inutile d'ajouter cette commande)
        \n*Nom du perso*\n\n*>R_P _(vous utilisez cette commande pour entrer le resumé de votre pavé)_ >R_P*\n\n`;
        let S_A = ``;
        for(let i=1; i<=Sous_Actions; i++){
            S_A += `\n*>S_A ${i}*(Pour débuter une Sous Action)
            \n>dep_sa _distance à parcourir_ >dep_sa _vitesse de déplacement_ >dep_sa _description du déplacement_ >dep_sa(Syntaxe à utiliser dans le cas d'un déplacement)
            \n>att_sa _énergie de l'attaque_ >att_sa _description de l'attaque_
            \n>tech_sa _Nom de la technique utilisée_ (exactement comme c'est enregistré sur la fiche) >tech_sa
            \n*>S_A FIN*(Pour terminer une Sous Action)\n`;
        }
        let Action = ``;
        for(let i = 1; i<=3; i++){
            Action += `*>ACTION ${i}*(Pour débuter l'action ${i})\n>ACTION _resumé de l'action_ >ACTION
            \n${S_A}\n>ACTION FIN\n\n`;
        }
        fiche += Action +  `*FIN*`;
        return fiche;
    }
}