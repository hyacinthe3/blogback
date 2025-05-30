import { Request, Response } from "express";
import {
  getAllPostsService,
  getPostByIdService,
  createPostService,
  updatePostService,
  deletePostService,
} from "../services/ServicesPosts";
import { asyncHandler } from "../middlewares/errorHandler";

export const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new Error("Unauthorized");

  const posts = await getAllPostsService(userId);
  res.json(posts);
});

export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const postId = parseInt(req.params.id);
  const userId = req.userId;
  if (!userId) throw new Error("Unauthorized");

  const post = await getPostByIdService(postId, userId);
  res.json(post);
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const { title, content } = req.body;
  const userId = req.userId;
  if (!userId) throw new Error("Unauthorized");

  const post = await createPostService(userId, title, content);
  res.status(201).json(post);
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const postId = parseInt(req.params.id);
  const userId = req.userId;
  if (!userId) throw new Error("Unauthorized");

  const { title, content } = req.body;
  const updatedPost = await updatePostService(postId, userId, title, content);
  res.json(updatedPost);
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const postId = parseInt(req.params.id);
  const userId = req.userId;
  if (!userId) throw new Error("Unauthorized");

  const result = await deletePostService(postId, userId);
  res.json(result);
});
