export interface User {
    id:number
    email:string
    password:string
    firstname:string
    lastname:string
    createdAt:Date
    _count:{
        subscribers:number
    }
}