module.exports = function () {
    this.verifParticipant = function(number, chat){
        let i = 0;
        for(let element of chat.participants){
            if(number == element.id._serialized){
                i = 1;
            }
        }
        return i;
    }
    this.verifAdmin = function(number, chat){
        let i = 0;
        for(let element of chat.participants){
            if(number == element.id._serialized && element.isAdmin || element.isSuperAdmin){
                i = 1;
            }
        }
        return i;
    }
}