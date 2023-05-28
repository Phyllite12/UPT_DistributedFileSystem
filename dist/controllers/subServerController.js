"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const subGroup_1 = require("../src/subGroup");
const dbPardal_json_1 = __importDefault(require("../config/dbPardal.json"));
const axios_1 = __importDefault(require("axios"));
/**
 * Receives the serverId of another server making the request and his server object, if the id of that server is bigger
 * than the response will send to that server that he is the lader of the group, if it's not bigger,
 * it will send to that server that he is not the leader
 *
 * @param req Received request object that has the server that sent the request and the ID that it has
 * @param res Response to be sent to that server
 */
const receiveId = async (req, res) => {
    try {
        const port = process.env.PORT || 8080;
        const { serverId } = req.params;
        const { server } = req.data.server;
        // Check if the serverId received is bigger than mine
        if (parseInt(serverId) > dbPardal_json_1.default.serverId) {
            // Find my server
            const myServer = subGroup_1.mySubServers.find((s) => s.serverAdress.includes(port.toString()));
            //if it has already communicated and is smaller
            if (!myServer?.response) {
                res
                    .status(204)
                    .send("this node is smaller and already talked to someone bigger");
                return;
            }
            subGroup_1.mySubServers.forEach((element) => {
                if (element.serverAdress.search(server.serverAdress) >= 0) {
                    element.isLeader = true;
                }
                else if (element.serverAdress.search(port.toString()) >= 0) {
                    element.response = true;
                }
                element.isLeader = false;
            });
            // Send that the other server is the leader by having a bigger id
            res.status(200).send({
                message: "ServerId received",
                myServer: myServer,
                becomeLeader: true,
            });
        }
        else {
            // Find my server
            const myServer = subGroup_1.mySubServers.find((s) => s.serverAdress.includes(port.toString()));
            // if the serverId received is smaller than mine and i have communicated
            if (myServer?.response) {
                res.status(200).send({
                    message: "ServerId received",
                    myServer: myServer,
                    becomeLeader: false,
                });
                return;
            }
            // If the serverId received is smaller than mine, I'm the leader
            subGroup_1.mySubServers.forEach((element) => {
                if (element.serverAdress.search(port.toString()) < 0) {
                    element.isLeader = false;
                }
                element.isLeader = true;
            });
            // Send that the other server is not the leader by having a smaller id
            res.status(200).send({
                message: "ServerId received",
                myServer: myServer,
                becomeLeader: false,
            });
            // Stablish the leader in the proxy
            axios_1.default.post("http://localhost:3000/api/init/1b02d8d2476", {
                server: `http://localhost:${port}/`,
            });
        }
    }
    catch (err) {
        res.status(500).send("Error receiving id");
    }
};
/*
//Receive if is leader or not
const election = async (req: Request, res: Response) => {
  try {
    const port = process.env.PORT || 8080;
    let becomeLeader = req.body.becomeLeader;
    //myServer == The other server from receivedId (ou seja o que mandou o request)
    let myServer = req.body.myServer;
    //find my server
    let myServerIndex = mySubServers.findIndex((s) => {
      return s.serverAdress.search(port.toString()) >= 0;
    });
    //atualiza o servidor do request
    mySubServers[myServerIndex] = myServer;
    //if The other server says i'm not the leader i will change my state in the list and and do nothing
    if (!becomeLeader) {
      //find my server
      let myServer = mySubServers.find((s) => {
        return s.serverAdress.search(port.toString()) >= 0;
      });
      if (myServer) myServer.isLeader = false;
    } else { //If the other server says i'm the leader i will change my state and i will make a request to the proxy to become the receiver
      //find my server
      let myServer = mySubServers.find((s) => {
        return s.serverAdress.search(port.toString()) >= 0;
      });
      if (myServer) myServer.isLeader = true;
      //Stablish the leader in the proxy
      axios({
        method: "post",
        url: "http://localhost:3000/api/init/1b02d8d2476",
      });
    }
    res.status(200).json({
      message: "ServerId received",
      becomeLeader: becomeLeader,
    });
  } catch (err) {
      res.status(500).send("Error receiving id");
    }
};
*/
exports.default = { receiveId };