import { AppDataSource } from "../data-source";
import { Post } from "../entities/Post";
import { Users } from "../entities/User";
import { ForbiddenError, NotFoundError } from "../utils/errors";
import { validateEntity } from "../utils/validate";

const postRepository = AppDataSource.getRepository(Post);
const userRepository = AppDataSource.getRepository(Users);

export const getAllPostsService = async (userId: string) => {
  return await postRepository.find({
    where: { user: { user_id: Number(userId) } },
    relations: ["user"],
    order: { createdAt: "DESC" },
  });
};

export const getPostByIdService = async (id: number, userId: string) => {
  const post = await postRepository.findOne({
    where: { id },
    relations: ["user"],
  });

  if (!post) throw new NotFoundError("Post not found");
  if (post.user.user_id !== Number(userId)) throw new ForbiddenError("Not authorized to view this post");

  return post;
};

export const createPostService = async (userId: string, title: string, content: string) => {
  const user = await userRepository.findOneBy({ user_id: Number(userId) });
  if (!user) throw new NotFoundError("User not found");

  const post = new Post();
  post.title = title;
  post.content = content;
  post.user = user;

  await validateEntity(post);
  return await postRepository.save(post);
};

export const updatePostService = async (
  id: number,
  userId: string,
  title?: string,
  content?: string
) => {
  const post = await postRepository.findOne({ where: { id }, relations: ["user"] });
  if (!post) throw new NotFoundError("Post not found");
  if (post.user.user_id !== Number(userId)) throw new ForbiddenError("Not authorized");

  if (title) post.title = title;
  if (content) post.content = content;

  await validateEntity(post);
  return await postRepository.save(post);
};

export const deletePostService = async (id: number, userId: string) => {
  const post = await postRepository.findOne({ where: { id }, relations: ["user"] });
  if (!post) throw new NotFoundError("Post not found");
  if (post.user.user_id !== Number(userId)) throw new ForbiddenError("Not authorized");

  await postRepository.remove(post);
  return { message: "Post deleted successfully" };
};
