
import { User } from "./userType";

export interface Video {
  id: number;
  title: string;
  description:string
  thumbnail?: string;
  url: string;
  views: number;
  createdAt: Date | string;
  duration: number;
  userId:number;
  user:{
    id:number;
    firstname:string;
    lastname:string;
    avatar?:string;
  }
  _count:{
    likes:number,
    comments:number
  }
}
export interface Comment {
  id:number
  commentText:string
  userId:number
  videoId:number
  createdAt:Date
  user:User
}

export interface CommentList {
  comments: Comment[]
}