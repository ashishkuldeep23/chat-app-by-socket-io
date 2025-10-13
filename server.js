const express = require("express")
const http = require('http');
const router = require("./src/router")
const axios = require('axios')


const app = express()
const server = http.createServer(app);


const port = process.env.PORT || 3000
server.listen(port, () => { console.log(`${port} port is open 😂`) })


// app.use( express.static("/public") )
app.use(express.static('public'))


app.use("/", router)




// // // Error handler middle ware for page not found ------>
app.use((req, res) => {
  res.status(404).send(' <div> <img src="http://www.digitalmesh.com/blog/wp-content/uploads/2020/05/404-error.jpg" alt="page not found image" style="height:100vh; width:100vw;" /></div> ')
})


// // // Now here calling own backend --------->>


const MAKE_UP_AND_RUNNING = process.env.MAKE_UP_AND_RUNNING || '1'
const OWN_SERVER_URL = process.env.OWN_SERVER_URL || 'http://localhost:3000/alive'


if (MAKE_UP_AND_RUNNING === 'true' || MAKE_UP_AND_RUNNING === '1') {

  console.log("Working bypass render sleep mode.")

  const url = OWN_SERVER_URL;
  const interval = 30000;

  setInterval(() => {

    axios.get(url)
      .then((res) => {
        console.log(res.data)
      })
      .catch((err) => {
        console.log(err)
      })

  }, interval);
}







// // // // Server err handler code ------>
// // // Not using now use in jwt code --->
// app.use((err , req , res , next)=>{
//   console.log(err.stack)
//   res.status(500).send("Something broken on server please contect to owner.")
// })


// // // For send file code //

const path = require('path');
const fs = require('fs');



/// // // Socket IO code --------->>

const io = require("socket.io")(server, {
  rejectUnauthorized: false, // WARN: please do not do this in production
  reconnectionDelayMax: 10000,
  maxHttpBufferSize: 2 * 1e8,
  connectTimeout: 80000,

})


let countOfOnline = 0

let users = {}  // // Here i'm storing name of user But online in backend not storing anywhere like BD ------->

// // // This var hold name of topic --->
let newTopic = ""

// // // Below var hold the name of typer --->
let typing = ""


io.on("connection", (socket) => {
  console.log("a user Connected")
  countOfOnline++



  // // // I will update name by given frontend--->


  // // // By this way i can recive user name that he/she given on frontend --->
  socket.on("connected-new", (userDetails) => {
    // console.log(userDetails)

    // userName.push(userDetails["name"])


    users[socket.id] = userDetails.name;

    socket.broadcast.emit("oneUserPlus", { name: userDetails.name, online: countOfOnline })

    // console.log(users)
  })




  // console.log(userName)
  let sendFirst = { online: countOfOnline, topic: newTopic }
  // // // This will send first ------>
  socket.send(sendFirst)



  // // // This is for send msg ----->
  socket.on("message", (msgObj) => {
    // // // now sending new obj with how many online included ----->
    let sendObj = { online: countOfOnline, ...msgObj }

    // console.log(msgObj)
    socket.broadcast.emit("message", sendObj)

  })


  // // // This is for change topic ----->

  socket.on("topic_send", (topicObj) => {
    // console.log(topicObj.topic)
    newTopic = topicObj.topic

    socket.broadcast.emit("topic_recive", { topic: newTopic })

  })


  // // // This is for typing ----->

  socket.on("typing_send", (typingObj) => {

    // console.log(typingObj)

    typing = typingObj.user
    if (typingObj.len >= 1) {
      socket.broadcast.emit("typing_recive", { user: typing, len: typingObj.len })
    }

  })


  // // // Send File by user ----->


  socket.on("upload", (msgObj, callback) => {

    console.log(msgObj); // <Buffer 25 50 44 ...>

    // console.log(JSON.stringify(file))

    // save the content to the disk, for example
    // callback({ message: err ? "failure" : "success" });
    // console.log( typeof msgType.body )
    // console.log( Object.keys( msgObj ).length )

    // // // If upload msg send true to FE by callback fn , that how we can sent callback msg to FE of user.

    if (msgObj && Object.keys(msgObj).length > 0) {
      callback(true)
    } else {
      callback(false)
    }

    socket.broadcast.emit("file_show_to_users", msgObj)

  });




  // // // This is for dis connect user ----->
  socket.on('disconnect', (reason) => {

    console.log(reason)

    countOfOnline--
    console.log('user disconnected');
    socket.broadcast.emit("oneUserMinus", { online: countOfOnline })

  });

})






