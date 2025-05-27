import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Post } from "../entities/Post";
import { Users } from "../entities/User";
import { validateEntity } from "../utils/validate";

const postRepository = AppDataSource.getRepository(Post);
const userRepository = AppDataSource.getRepository(Users);

export const getAllPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await postRepository.find({ relations: ["user"], order: { createdAt: "DESC" } });
    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await postRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ["user"],
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findOneBy({ user_id: req.userId! });
    if (!user) return res.status(401).json({ message: "User not found" });

    const { title, content } = req.body;

    const post = new Post();
    post.title = title;
    post.content = content;
    post.user = user;

    await validateEntity(post);

    await postRepository.save(post);
    res.status(201).json(post);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const post = await postRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ["user"],
    });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.user_id !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, content } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;

    await validateEntity(post);

    await postRepository.save(post);
    res.json(post);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const post = await postRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ["user"],
    });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.user_id !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await postRepository.remove(post);
    res.json({ message: "Post deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
