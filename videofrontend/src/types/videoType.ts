
import { User } from "./userType";

export interface Video {
  id: number;
  title: string;
  description:string
  thumbnail?: string;
  url: string;
  views: number;
  createdAt: Date;
  duration: number;
  userId:number;
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