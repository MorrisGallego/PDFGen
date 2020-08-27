function onInit(){ }

function onPreGenerate(req, res, data){
    return data
}

function onPostGenerate(req, res, pdf){
    return pdf
}

function onError(req, res, err){
    res.status(500).send(err.toString())
}

export {onPreGenerate, onPostGenerate, onError, onInit}