module.exports = class ErrorHandler{
    sendError(e){
        console.error(e)
    }
    sendException(ex){
        console.error(ex);
        process.exit(1);
    }
};