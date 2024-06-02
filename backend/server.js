const app=require("./app")

const dotenv=require("dotenv")
const DB=require("./config/db")

const {Server}=require('socket.io')

process.on("uncaughtException",(err)=>{
    console.log(`Error:${err.message}`);
    console.log("Shutting down the server on unhandled rejection")
    process.exit(1);
})


dotenv.config({path:"config/config.env"})

// connecting to databse
DB();

const server=app.listen(process.env.PORT,()=>{
    console.log(`Server is waiting on http://localhost:${process.env.PORT}`)
})
const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
let adminsAndsubAdmins=[]
let adminData;
let customers={

}
let waitingCustomer=[]





  io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on("new-connection",(person)=>{
      console.log(
        person,"in person connection"
      )
      if(person.role=="admin"){
        console.log("in this")
        adminData=person
        adminsAndsubAdmins.push(person);
      }
      else if( person.role=="subadmin"){
          console.log(adminsAndsubAdmins)
            adminsAndsubAdmins.push(person);
            console.log(waitingCustomer)
            io.to(person.socketId).emit("waiting-customer",waitingCustomer);
        }
        else if(person.role=="customer"){
          console.log(person)
          console.log("joining room for cuistomer ",person.roomId)
          socket.join(person.roomId)
        }
        console.log("current admuins ",adminsAndsubAdmins)
    })
    socket.on("join-room:employee",({roomId})=>{
      socket.join(roomId);
      console.log("employee has jonied the room ",roomId);

    })
    // sending request to admin 
    socket.on("send-request:admin:subadmin",(data)=>{
      console.log("request from customer",adminsAndsubAdmins)
      socket.join(data.customerId)
        if(adminsAndsubAdmins.length==0){
          console.log("customer will be added in waiting customer ")
          waitingCustomer.push(data)
        }

        adminsAndsubAdmins.forEach((person)=>{
          io.to(person.socketId).emit("new-request:customer",data);
        })
    })
    socket.on("send-msg",(data)=>{
    const clientsInRoom = io.sockets.adapter.rooms.get(data.roomId);
    if (clientsInRoom) {
      const clientIds = Array.from(clientsInRoom);
      if(adminData){
        console.log("")
      clientIds.push(adminData.socketId)
      }
    console.log("we have clicnet of ",data.roomId, "clicents ",clientIds)

      clientIds.forEach(ids=>{
        if(socket.id!=ids)
          {
            console.log(ids)
          io.to(ids).emit("receive-msg",data);
          
          }
      })

      
      
    }

    })
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Remove the client from the clients array
      adminsAndsubAdmins = adminsAndsubAdmins.filter(client => client.socketId !== socket.id);
      console.log('Updated clients:', adminsAndsubAdmins);
    });
});


process.on("unhandledRejection",(err)=>{
    console.log(`Error:${err.message}`);
    console.log("Shutting down the server on unhandled rejection")
    server.close(()=>{
        process.exit(1);
    })
})