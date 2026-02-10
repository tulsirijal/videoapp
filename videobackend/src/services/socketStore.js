let io;

export const setIo = (ioInstance)=>{
    io = ioInstance;
}

export const getIo = ()=>{
    if(!io){
        throw new Error("Socket.io instance not initialized");
    }
    return io;
}