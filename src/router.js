
const router = require("express").Router()



router.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/index.html")
})

router.get('/alive', (req, res) => {
    res.send("I'm alive.😁😁😁🎉🎉🎉")
})


module.exports = router